#!/usr/bin/env node
// The time a session's budget paid for and nothing used: every silence between the model's own
// messages, read from the host's transcript, because the conversation itself carries no clock.
//
// Usage: node gaps.mjs <transcript.jsonl | folder> [--window <file.json>] [--min 30] [--spend]
//
// A folder is read for its newest `.jsonl`. Each line is a JSON entry with a `type` and a
// `timestamp`; only `assistant` entries count as the model speaking, so a compaction or a summary
// written while idle does not break a silence. A window file holds `bookedAt` (or `start`) and
// `end`, and `closedAt` when the budget ended early: each silence is clipped to it, and one of
// `--min` minutes or more inside it is an IDLE line. A silence after the last message runs to the
// window's end or now, whichever comes first. With no window every silence is listed, unbound.
// `--spend` also prints what the session cost (2026-10-29: a run spent its weekly limit and nothing
// recorded a token): one SPEND line for the whole session, the main thread plus every subagent in
// its `<session>/subagents/` folder, then one AGENT line per subagent, costliest first, named by its
// `.meta.json` description. Each assistant message counts once, by its id, inside the window.
// Exit 0 when measured, 2 when there is nothing to measure. Node only, no dependencies.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const MIN = 60_000;
/**
 * @typedef {{ at: number, text: string }} Message
 * @typedef {{ read: number, write: number, input: number, out: number, first: number, last: number }} Spend
 */

/** @param {number} ms */
const clock = (ms) => new Date(ms).toTimeString().slice(0, 5);
/** @param {number} ms */
const span = (ms) =>
  `${Math.floor(ms / 3_600_000)}h${String(Math.floor(ms / MIN) % 60).padStart(2, "0")}`;
/** @param {string} name */
const argument = (name) => {
  const at = process.argv.indexOf(name);
  return at === -1 ? undefined : process.argv[at + 1];
};

// A session that died mid-budget left its silence in an older file, so with a budget every file
// written since it began is read; without one, the newest alone.
/** @param {string} path @param {number} since @returns {string[]} */
function transcripts(path, since) {
  if (!existsSync(path)) return [];
  if (!statSync(path).isDirectory()) return [path];
  const files = readdirSync(path)
    .filter((name) => name.endsWith(".jsonl"))
    .map((name) => join(path, name))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return since > -Infinity
    ? files.filter((file) => statSync(file).mtimeMs >= since)
    : files.slice(0, 1);
}

/** @param {string} file @returns {Message[]} */
function spoken(file) {
  return readFileSync(file, "utf8")
    .split("\n")
    .flatMap((line) => {
      try {
        const entry = JSON.parse(line);
        return entry.type === "assistant" && entry.timestamp ? [entry] : [];
      } catch {
        return [];
      }
    })
    .map((entry) => ({
      at: Date.parse(entry.timestamp),
      text:
        (entry.message?.content ?? []).find?.(
          (/** @type {{ type?: string, text?: string }} */ part) => part.type === "text",
        )?.text ?? "",
    }));
}

/**
 * @param {Message[]} messages
 * @param {{ start?: number, end?: number, now?: number }} [window]
 */
function silences(messages, { start = -Infinity, end = Infinity, now = Date.now() } = {}) {
  /** @type {{ from: number, to: number, until: number, said: string }[]} */
  const found = [];
  let said = "";
  messages.forEach((message, index) => {
    if (message.text) said = message.text;
    const next = messages[index + 1]?.at ?? Math.min(end, now);
    const from = Math.max(message.at, start);
    const to = Math.min(next, end);
    if (to > from) found.push({ from, to, until: next, said });
  });
  return found;
}

const windowFile = argument("--window");
const budget = windowFile ? JSON.parse(readFileSync(windowFile, "utf8")) : undefined;
const start = Date.parse(budget?.bookedAt ?? budget?.start ?? "") || -Infinity;
const end = Math.min(
  Date.parse(budget?.end ?? "") || Infinity,
  Date.parse(budget?.closedAt ?? "") || Infinity,
);
const least = Number(argument("--min") ?? 30) * MIN;

const files = process.argv[2] ? transcripts(process.argv[2], start) : [];
if (files.length === 0) {
  console.error("gaps: no transcript to measure; pass a .jsonl file or the folder that holds it");
  process.exit(2);
}
const messages = files.flatMap(spoken).sort((a, b) => a.at - b.at);
const idle = silences(messages, { start, end }).filter((gap) => gap.to - gap.from >= least);
const target = files.join(", ");

console.log(
  `GAPS ${target}  (silences of ${least / MIN} min or more between the model's messages)`,
);
if (idle.length === 0) console.log("IDLE none");
for (const gap of idle) {
  const where = budget ? "inside the budget" : "no budget bound";
  const tail = gap.until > gap.to ? ` (silent until ${clock(gap.until)})` : "";
  const said = gap.said.replace(/\s+/g, " ").slice(0, 100);
  console.log(
    `IDLE ${clock(gap.from)} -> ${clock(gap.to)} ${span(gap.to - gap.from)} ${where}${tail} | last said: "${said}"`,
  );
}

/** @param {number} n */
const K = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1e3)}k`);
/** @param {string} file @returns {Spend} */
function cost(file) {
  const seen = new Set();
  const sum = { read: 0, write: 0, input: 0, out: 0, first: Infinity, last: -Infinity };
  for (const line of readFileSync(file, "utf8").split("\n")) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const usage = entry.message?.usage;
    const when = Date.parse(entry.timestamp ?? "");
    if (entry.type !== "assistant" || !usage || when < start || when > end) continue;
    if (seen.has(entry.message.id)) continue;
    seen.add(entry.message.id);
    sum.read += usage.cache_read_input_tokens ?? 0;
    sum.write += usage.cache_creation_input_tokens ?? 0;
    sum.input += usage.input_tokens ?? 0;
    sum.out += usage.output_tokens ?? 0;
    sum.first = Math.min(sum.first, when);
    sum.last = Math.max(sum.last, when);
  }
  return sum;
}
/** @param {Spend} sum */
const said = (sum) =>
  `read ${K(sum.read)} write ${K(sum.write)} in ${K(sum.input)} out ${K(sum.out)} over ${span(Math.max(0, sum.last - sum.first))}`;

if (process.argv.includes("--spend")) {
  const agents = files.flatMap((file) => {
    const folder = join(file.replace(/\.jsonl$/, ""), "subagents");
    if (!existsSync(folder)) return [];
    return readdirSync(folder)
      .filter((name) => name.endsWith(".jsonl"))
      .map((name) => {
        const meta = join(folder, name.replace(/\.jsonl$/, ".meta.json"));
        const about = existsSync(meta) ? JSON.parse(readFileSync(meta, "utf8")) : {};
        return {
          name: `${about.agentType ?? "agent"}: ${about.description ?? name}`,
          ...cost(join(folder, name)),
        };
      })
      .filter((agent) => agent.first <= agent.last);
  });
  const all = [...files.map(cost), ...agents];
  const total = all.reduce(
    (sum, part) => ({
      read: sum.read + part.read,
      write: sum.write + part.write,
      input: sum.input + part.input,
      out: sum.out + part.out,
      first: Math.min(sum.first, part.first),
      last: Math.max(sum.last, part.last),
    }),
    { read: 0, write: 0, input: 0, out: 0, first: Infinity, last: -Infinity },
  );
  console.log(`SPEND session, ${agents.length} subagents: ${said(total)}`);
  for (const agent of agents.sort((a, b) => b.read + b.write - (a.read + a.write)))
    console.log(`AGENT ${said(agent)} | ${agent.name}`);
}
