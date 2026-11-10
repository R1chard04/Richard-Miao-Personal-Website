"use client";
import { useEffect, useRef, useState } from "react";
import { COLO_CITIES } from "./colos";

// The line above my name. It starts as "Hello there" and, once the lookups
// finish, greets the visitor with where they are and how they got here:
//   Hello, Toronto · Rogers (AS812) · 21 ms away
// Hovering (or tapping) it shows the full route: the network's owner, its
// address block and RPKI status, and the nearest Cloudflare data centre.
//
// Everything is looked up in the visitor's browser. Cloudflare's trace
// endpoint gives their IP and nearest data centre (whose city stands in for
// theirs), and RIPEstat turns the IP into the network that announces it. Both
// allow cross-origin requests, so this works on any host. Nothing is stored or
// sent to this site.

const TRACE = "https://one.one.one.one/cdn-cgi/trace";
const RIPESTAT = "https://stat.ripe.net/data";
const TIMEOUT_MS = 5000;
// Don't swap the greeting in before the name has finished settling.
const MIN_DELAY_MS = 700;

type Network = { asn: string; name: string; short: string; prefix: string; rpki?: { status: string; roa?: string } };
type Route = { colo: string; city?: string; rtt?: number; net?: Network };

const request = (url: string) => fetch(url, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });

async function trace() {
  const res = await request(TRACE);
  if (!res.ok) throw new Error(`trace ${res.status}`);
  const fields = Object.fromEntries(
    (await res.text()).split("\n").map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)])
  );
  if (!fields.ip || !fields.colo) throw new Error("trace incomplete");
  return fields as { ip: string; colo: string; loc?: string };
}

async function ripe<T>(call: string, params: Record<string, string>): Promise<T> {
  const q = new URLSearchParams({ ...params, sourceapp: "richardmiao-site" });
  const res = await request(`${RIPESTAT}/${call}/data.json?${q}`);
  if (!res.ok) throw new Error(`${call} ${res.status}`);
  return (await res.json()).data;
}

// The best of a few requests over the already-open connection to Cloudflare,
// which is close to one network round trip.
async function ping() {
  let best = Infinity;
  for (let i = 0; i < 3; i++) {
    const t = performance.now();
    await (await request(TRACE)).text();
    best = Math.min(best, performance.now() - t);
  }
  return Math.max(1, Math.round(best));
}

function country(code?: string) {
  try {
    return code ? new Intl.DisplayNames(["en"], { type: "region" }).of(code) : undefined;
  } catch {
    return undefined;
  }
}

// "ROGERS-COMMUNICATIONS - Rogers Communications Canada Inc., CA" -> "Rogers Communications Canada Inc."
function owner(holder?: string) {
  if (!holder) return "";
  const name = holder.includes(" - ") ? holder.slice(holder.indexOf(" - ") + 3) : holder;
  return name.replace(/,\s*[A-Z]{2}$/, "");
}

// The everyday name of a network, for the one-line greeting: drops trailing
// generic words, so "Rogers Communications Canada Inc." -> "Rogers" and
// "Comcast Cable Communications, LLC" -> "Comcast", but "University of Waterloo" stays.
const GENERIC = new Set([
  "inc", "llc", "ltd", "ltee", "ltée", "limited", "corp", "corporation", "co", "company", "gmbh", "ag", "sa", "bv",
  "plc", "pty", "holdings", "group", "communications", "telecommunications", "telecom", "networks", "network",
  "cable", "services", "broadband", "internet", "wireless", "canada", "usa",
]);
function short(name: string) {
  const dba = name.match(/\bd\/?b\/?a\s+(.+)$/i);
  const words = (dba ? dba[1] : name).split(/\s+/);
  while (words.length > 1 && GENERIC.has(words[words.length - 1].toLowerCase().replace(/[.,]/g, ""))) words.pop();
  return words.join(" ").replace(/[.,]$/, "");
}

async function network(ip: string): Promise<Network> {
  const info = await ripe<{ asns: string[]; prefix: string }>("network-info", { resource: ip });
  const asn = info.asns[0];
  if (!asn) throw new Error("not announced");
  const [overview, rpki] = await Promise.allSettled([
    ripe<{ holder?: string }>("as-overview", { resource: `AS${asn}` }),
    ripe<{ status: string; validating_roas?: { prefix: string; origin: string }[] }>("rpki-validation", {
      resource: `AS${asn}`,
      prefix: info.prefix,
    }),
  ]);
  const name = (overview.status === "fulfilled" && owner(overview.value.holder)) || `AS${asn}`;
  const roa = rpki.status === "fulfilled" ? rpki.value.validating_roas?.find((r) => r.origin === asn) : undefined;
  return {
    asn,
    name,
    short: short(name),
    prefix: info.prefix,
    rpki: rpki.status === "fulfilled" ? { status: rpki.value.status, roa: roa?.prefix } : undefined,
  };
}

async function lookup(): Promise<Route> {
  const t = await trace();
  const [net, rtt] = await Promise.all([network(t.ip).catch(() => undefined), ping().catch(() => undefined)]);
  return { colo: t.colo, city: COLO_CITIES[t.colo] ?? country(t.loc), rtt, net };
}

const RPKI_TEXT: Record<string, string> = { valid: "RPKI valid", unknown: "RPKI not found" };

export function Greeting() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pause = calm ? Promise.resolve() : new Promise((r) => setTimeout(r, MIN_DELAY_MS));
    // If the lookup fails (offline, or blocked by an extension), "Hello there" stays.
    Promise.all([lookup(), pause])
      .then(([r]) => !cancelled && setRoute(r))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // A tap or click opens the route; Escape or a click elsewhere closes it.
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  if (!route) {
    return (
      <p className="hello">
        <span className="hi">Hello there</span>
      </p>
    );
  }

  const { colo, city, rtt, net } = route;
  return (
    <p className="hello" ref={ref}>
      <button type="button" aria-expanded={open} aria-controls="route" onClick={() => setOpen((o) => !o)}>
        <span className="hi">{city ? `Hello, ${city}` : "Hello there"}</span>
        {net && ` · ${net.short} (AS${net.asn})`}
        {rtt && ` · ${rtt} ms away`}
      </button>
      <span id="route" className={open ? "route open" : "route"}>
        {net && (
          <>
            <span className="name">{net.name}</span>
            <span>
              AS{net.asn} · {net.prefix}
              {net.rpki && (
                <>
                  {" · "}
                  <span
                    className={net.rpki.status === "valid" ? "ok" : undefined}
                    title={net.rpki.roa && `Signed by a ROA for ${net.rpki.roa}, origin AS${net.asn}`}
                  >
                    {RPKI_TEXT[net.rpki.status] ?? "RPKI invalid"}
                  </span>
                </>
              )}
            </span>
          </>
        )}
        <span>
          Cloudflare {city ? `${city} (${colo})` : colo}
          {rtt && ` · ${rtt} ms`}
        </span>
        <span className="note">Looked up just now, in your browser.</span>
      </span>
    </p>
  );
}
