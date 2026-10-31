#!/usr/bin/env node
// What is left before the window resets, and whether the next unit of work fits in it.
//
// Usage: node credit.mjs [--need <minutes>] [--json]
//
// The answer is the clock's (2026-10-08, E-04). Burn is measured and printed, but nothing on disk
// publishes the account's limit, and a ceiling derived from past limit hits read 8.7M, 5.3M and
// about 804k: a number that spread is not one to park a run on. So:
//
//   RESET    exact while a limit hit is in flight (`resetsAt` is an epoch), projected otherwise.
//   VERDICT  PARK while a limit is in flight, the weekly one included (2026-10-29: a `seven_day`
//            429 four days before its reset, after this said GO); otherwise GO when the window has the work's minutes
//            times 1.5 left, PARK until the reset when it does not.
import { pathToFileURL } from "node:url";

import { scan } from "./ledger.claude-code.mjs";

const WINDOW_HOURS = 5; // `rateLimitType: "five_hour"`, read from a real 429
const MS = 1000;
const WINDOW_MS = WINDOW_HOURS * 3600 * MS;
const MARGIN = 1.5;

/**
 * Where the current window opened.
 *
 * **A rolling window is not "the last five hours".** It opens on the first turn after an idle gap
 * of a full window and runs five hours from there, then advances in whole windows (why: E-02).
 * @param {{ at: number }[]} turns
 * @param {number} now
 * @returns {number}
 */
function blockStart(turns, now) {
  const recent = turns.filter((t) => t.at > now - 48 * 3600 * MS);
  if (recent.length === 0) return now;
  let start = recent[0].at;
  for (let i = 1; i < recent.length; i += 1) {
    if (recent[i].at - recent[i - 1].at >= WINDOW_MS) start = recent[i].at;
  }
  while (start + WINDOW_MS <= now) start += WINDOW_MS;
  return start;
}

/** @param {number} ms */
const hhmm = (ms) =>
  new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
/** @param {number} ms */
const dur = (ms) => {
  const m = Math.max(0, Math.round(ms / 60000));
  return m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : `${m}m`;
};
/** @param {number} n */
const k = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1000)}k`);

/**
 * The decision, as a pure function of the clock. Lanes do not change it: they share one window.
 * @param {{ needMinutes?: number, headroomMs: number, resetAt: number, limited?: string | boolean, agents?: number, now?: number }} input
 * @returns {{ verdict: string, because: string }}
 */
export function decide({
  needMinutes = 0,
  headroomMs,
  resetAt,
  limited = false,
  now = Date.now(),
}) {
  if (limited) {
    const day =
      resetAt - now > 20 * 3600 * MS ? `${new Date(resetAt).toDateString().slice(0, 10)} ` : "";
    const which = limited === "seven_day" ? "the weekly limit" : "a limit";
    return { verdict: "PARK", because: `${which} was hit; it lifts ${day}at ${hhmm(resetAt)}` };
  }
  if (!needMinutes) {
    return { verdict: "GO", because: "nothing to size against; pass --need <minutes>" };
  }
  const needMs = needMinutes * MARGIN * 60 * MS;
  if (headroomMs >= needMs) {
    return { verdict: "GO", because: `${dur(headroomMs)} of window against ${dur(needMs)} needed` };
  }
  return {
    verdict: "PARK",
    because: `the window resets in ${dur(headroomMs)}, under the ${dur(needMs)} this needs; wait until ${hhmm(resetAt)}`,
  };
}

function main() {
  const argv = process.argv.slice(2);
  const at = argv.indexOf("--need");
  const needMinutes = at === -1 ? 0 : Number(argv[at + 1] ?? 0);
  const { now, turns, limits } = scan();

  const windowStart = blockStart(turns, now);
  const inWindow = turns.filter((t) => t.at >= windowStart);
  const week = turns
    .filter((t) => t.at > now - 7 * 24 * 3600 * MS)
    .reduce((sum, t) => sum + t.billed, 0);
  const billed = inWindow.reduce((sum, t) => sum + t.billed, 0);
  const hit = limits.filter((l) => l.resetsAt > now).sort((a, b) => b.at - a.at)[0];
  const resetAt = hit ? hit.resetsAt : windowStart + WINDOW_MS;
  const headroomMs = Math.max(0, resetAt - now);
  const { verdict, because } = decide({
    needMinutes,
    headroomMs,
    resetAt,
    limited: hit ? hit.type : false,
    now,
  });

  if (argv.includes("--json")) {
    const report = {
      windowHours: WINDOW_HOURS,
      windowStart: new Date(windowStart).toISOString(),
      turns: inWindow.length,
      billedTokens: billed,
      weekBilledTokens: week,
      resetAt: new Date(resetAt).toISOString(),
      resetIsExact: Boolean(hit),
      headroomMinutes: Math.round(headroomMs / 60000),
      needMinutes: needMinutes || null,
      verdict,
      because,
    };
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  console.log(
    `credit · ${WINDOW_HOURS}h window opened ${hhmm(windowStart)} · ${inWindow.length} turns`,
  );
  console.log(`  burned    ${k(billed)} billed  (measured)`);
  console.log(`  week      ${k(week)} billed in 7 days  (measured)`);
  console.log(
    `  resets    ${hhmm(resetAt)} · ${dur(headroomMs)} left  (${hit ? "exact, a limit was hit" : "projected from the window start"})`,
  );
  console.log(`  ${verdict}  ${because}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
