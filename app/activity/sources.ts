import { activityAccounts } from "../data";

// Pulls the last year of daily activity from each account in activityAccounts.
// Runs on the server when the page is built, then again at most every
// REVALIDATE seconds (page.tsx sets the same interval). A source that fails is
// left out of that render instead of failing the page.

export const REVALIDATE = 6 * 60 * 60;
const UA = "richardmiao-site (+https://github.com/R1chard04/Richard-Miao-Personal-Website)";
const DAY = 86_400_000;

type Counts = Record<string, number>; // "YYYY-MM-DD" -> count that day
export type Source = { id: string; label: string; unit: [string, string]; counts: number[] };
export type Activity = { days: string[]; sources: Source[] };

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

async function get(url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { "User-Agent": UA, ...init.headers },
    signal: AbortSignal.timeout(10_000),
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res;
}

const GITHUB_QUERY = `query($user: String!) {
  user(login: $user) { contributionsCollection { contributionCalendar {
    weeks { contributionDays { date contributionCount } }
  } } }
}`;

// With GITHUB_TOKEN set (a token with no scopes is enough), uses the official
// GraphQL API. Without one, reads the public contributions page instead: each
// day is a <td data-date id>, and its count is in a <tool-tip for=id>
// ("3 contributions on November 9th." or "No contributions on …").
async function github(user: string): Promise<Counts> {
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    const res = await get("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: GITHUB_QUERY, variables: { user } }),
    });
    const { data } = await res.json();
    const weeks: { contributionDays: { date: string; contributionCount: number }[] }[] =
      data.user.contributionsCollection.contributionCalendar.weeks;
    return Object.fromEntries(weeks.flatMap((w) => w.contributionDays).map((d) => [d.date, d.contributionCount]));
  }
  const html = await (await get(`https://github.com/users/${encodeURIComponent(user)}/contributions`)).text();
  const dates = new Map([...html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"\s+id="([^"]+)"/g)].map((m) => [m[2], m[1]]));
  if (!dates.size) throw new Error("the GitHub contributions page has changed shape");
  const counts: Counts = {};
  for (const [, id, text] of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const date = dates.get(id);
    if (date) counts[date] = parseInt(text.replace(/,/g, ""), 10) || 0;
  }
  return counts;
}

// Takes a profile URL (https://gitlab.com/name, or a self-hosted server). With
// GITLAB_TOKEN set (a token for that server with the read_user scope), counts
// the user's events through the API, which is what the GitLab profile calendar
// counts. Without one, reads the profile's calendar data, which only works when
// the server shows profiles publicly (gitlab.com does; git.uwaterloo.ca doesn't).
async function gitlab(profile: string, days: string[]): Promise<Counts> {
  const { origin, pathname } = new URL(profile);
  const user = pathname.split("/").filter(Boolean)[0];
  const token = process.env.GITLAB_TOKEN;
  if (!token) {
    const res = await get(`${origin}/users/${encodeURIComponent(user)}/calendar.json`);
    if (!res.headers.get("content-type")?.includes("json")) {
      throw new Error(`${origin} doesn't show profiles publicly; set GITLAB_TOKEN`);
    }
    return res.json();
  }
  const headers = { "PRIVATE-TOKEN": token };
  const [found]: { id: number }[] = await (await get(`${origin}/api/v4/users?username=${encodeURIComponent(user)}`, { headers })).json();
  if (!found) throw new Error(`no GitLab user ${user} on ${origin}`);
  // `after` is exclusive, so start from the day before the window.
  const after = iso(Date.parse(days[0]) - DAY);
  const counts: Counts = {};
  for (let page = "1"; page; ) {
    const res = await get(`${origin}/api/v4/users/${found.id}/events?after=${after}&per_page=100&page=${page}`, { headers });
    for (const e of (await res.json()) as { created_at: string }[]) {
      const d = e.created_at.slice(0, 10);
      counts[d] = (counts[d] ?? 0) + 1;
    }
    page = res.headers.get("x-next-page") ?? "";
  }
  return counts;
}

// The submission calendar on a public LeetCode profile, keyed by Unix seconds at UTC midnight.
async function leetcode(user: string): Promise<Counts> {
  const res = await get("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
    body: JSON.stringify({
      query: "query($u: String!) { matchedUser(username: $u) { userCalendar { submissionCalendar } } }",
      variables: { u: user },
    }),
  });
  const { data } = await res.json();
  const calendar: Record<string, number> = JSON.parse(data.matchedUser.userCalendar.submissionCalendar);
  return Object.fromEntries(Object.entries(calendar).map(([s, n]) => [iso(Number(s) * 1000), n]));
}

// Games finished per day, from chess.com's monthly game archives. Only months
// in the window are fetched, one at a time (chess.com limits parallel requests).
async function chesscom(user: string, days: string[]): Promise<Counts> {
  const base = `https://api.chess.com/pub/player/${encodeURIComponent(user.toLowerCase())}/games`;
  const { archives }: { archives: string[] } = await (await get(`${base}/archives`)).json();
  const months = new Set(days.map((d) => d.slice(0, 7).replace("-", "/")));
  const counts: Counts = {};
  for (const url of archives.filter((u) => months.has(u.slice(-7)))) {
    const { games }: { games: { end_time: number }[] } = await (await get(url)).json();
    for (const g of games) {
      const d = iso(g.end_time * 1000);
      counts[d] = (counts[d] ?? 0) + 1;
    }
  }
  return counts;
}

const SOURCES: {
  id: keyof typeof activityAccounts;
  label: string;
  unit: [string, string];
  load: (user: string, days: string[]) => Promise<Counts>;
}[] = [
  { id: "github", label: "GitHub", unit: ["contribution", "contributions"], load: github },
  { id: "gitlab", label: "GitLab", unit: ["contribution", "contributions"], load: gitlab },
  { id: "leetcode", label: "LeetCode", unit: ["submission", "submissions"], load: leetcode },
  { id: "chesscom", label: "chess.com", unit: ["game", "games"], load: chesscom },
];

// Every day from the Sunday 52 weeks before this week's Sunday through today
// (UTC), so the days fall into 53 week columns like GitHub's graph.
function lastYear(now: Date) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const start = today - (52 * 7 + new Date(today).getUTCDay()) * DAY;
  const days: string[] = [];
  for (let t = start; t <= today; t += DAY) days.push(iso(t));
  return days;
}

export async function getActivity(now = new Date()): Promise<Activity> {
  const days = lastYear(now);
  const loaded = await Promise.all(
    SOURCES.map(async ({ id, label, unit, load }): Promise<Source | null> => {
      const user = activityAccounts[id];
      if (!user) return null;
      try {
        const counts = await load(user, days);
        return { id, label, unit, counts: days.map((d) => counts[d] ?? 0) };
      } catch (e) {
        console.warn(`Activity: left out ${label} (${user}): ${e instanceof Error ? e.message : e}`);
        return null;
      }
    })
  );
  // A source with nothing in the window (say, no chess games this year) is left
  // out rather than shown as an empty row in the legend.
  return { days, sources: loaded.filter((s): s is Source => s !== null && s.counts.some((n) => n > 0)) };
}
