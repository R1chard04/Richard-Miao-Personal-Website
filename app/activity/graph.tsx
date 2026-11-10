"use client";
import { useState } from "react";
import type { Activity, Source } from "./sources";

// A year of activity as a GitHub-style grid: one column per week, one square
// per day, shaded by the day's total across all sources, with month names along
// the top. Hovering (or tapping) a day spells out that day underneath. Phones
// show the last half year so the squares stay a usable size.

const MOBILE_WEEKS = 26;
const dayName = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const monthName = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });
const utc = (d: string) => new Date(`${d}T00:00:00Z`);

const phrase = (n: number, s: Source) => `${n.toLocaleString("en")} ${s.label} ${n === 1 ? s.unit[0] : s.unit[1]}`;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
// "a", "a and b", "a, b and c"
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

// Shade 1-4 by which quarter of the active days a total falls in, like GitHub.
function shader(totals: number[]) {
  const active = totals.filter((n) => n > 0).sort((a, b) => a - b);
  const q = [0.25, 0.5, 0.75].map((p) => active[Math.floor(p * (active.length - 1))] ?? 0);
  return (n: number) => (n === 0 ? 0 : n <= q[0] ? 1 : n <= q[1] ? 2 : n <= q[2] ? 3 : 4);
}

export function ActivityGraph({ days, sources }: Activity) {
  const [focus, setFocus] = useState<number | null>(null);

  const totals = days.map((_, i) => sum(sources.map((s) => s.counts[i])));
  const shade = shader(totals);
  const summary = `${list(sources.map((s) => phrase(sum(s.counts), s)))} in the last year`;

  const caption =
    focus === null
      ? summary
      : `${dayName.format(utc(days[focus]))} · ${
          sources.filter((s) => s.counts[focus] > 0).map((s) => phrase(s.counts[focus], s)).join(" · ") || "Nothing logged"
        }`;

  const weeks = Math.ceil(days.length / 7);
  const firstOnPhones = weeks - MOBILE_WEEKS;
  const cells: React.ReactNode[] = [];
  for (let w = 0; w < weeks; w++) {
    const old = w < firstOnPhones ? " old" : "";

    // A month's name goes over the first week that starts in it, and over the
    // first column (phones' too) when that's early enough in the month to leave
    // room before the next name: three columns, or two on phones' wider columns.
    const sunday = utc(days[w * 7]);
    const newMonth = w === 0 ? sunday.getUTCDate() <= 14 : sunday.getUTCMonth() !== utc(days[(w - 1) * 7]).getUTCMonth();
    const phonesFirst = !newMonth && w === firstOnPhones && sunday.getUTCDate() <= 17;
    cells.push(
      <span key={`m${w}`} className={`m${old}`}>
        {(newMonth || phonesFirst) && <span className={phonesFirst ? "cont" : undefined}>{monthName.format(sunday)}</span>}
      </span>
    );

    for (let d = 0; d < 7; d++) {
      const i = w * 7 + d;
      cells.push(
        i < days.length ? (
          <span key={i} className={`d${old}${i === focus ? " sel" : ""}`} data-i={i} data-l={shade(totals[i])} />
        ) : (
          <span key={i} className={`d pad${old}`} />
        )
      );
    }
  }

  return (
    <div className="activity">
      <div
        className="cal"
        role="img"
        aria-label={summary}
        onPointerOver={(e) => {
          const i = (e.target as HTMLElement).dataset.i;
          if (i) setFocus(Number(i));
        }}
        onPointerLeave={(e) => e.pointerType === "mouse" && setFocus(null)}
      >
        {cells}
      </div>
      <p className="activity-caption">{caption}</p>
    </div>
  );
}
