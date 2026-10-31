// The ledger adapter: where Claude Code records every turn's usage and every limit it hit.
//
// The only file in this skill that knows the host writes one JSON object per line under
// `~/.claude/projects`, that a turn's tokens sit in `message.usage`, and that a 429 carries
// `quotaLimits.resetsAt`. `credit.mjs` asks for the turns and the limits and does the arithmetic;
// another host is another module beside this one.
// The prose half is `adapters/ledger.claude-code.md`.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const PROJECTS = join(homedir(), ".claude", "projects");
const MS = 1000;
/** A window's start is found within two days; a weekly limit's 429 can be a week old. */
const WEEK_MS = 7 * 24 * 3600 * MS;

/**
 * Every transcript on this machine. The limit is per account, so every project counts.
 * @param {string} root
 * @returns {string[]}
 */
function transcripts(root) {
  if (!existsSync(root)) return [];
  /** @type {string[]} */
  const out = [];
  /** @param {string} dir @param {number} [depth] */
  const walk = (dir, depth = 0) => {
    if (depth > 3) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path, depth + 1);
      else if (entry.name.endsWith(".jsonl")) out.push(path);
    }
  };
  walk(root);
  return out;
}

/**
 * Tokens that count toward a limit, and the cache reads that mostly do not, kept apart.
 * @param {{ input_tokens?: number, output_tokens?: number, cache_creation_input_tokens?: number, cache_read_input_tokens?: number }} usage
 * @returns {{ billed: number, cacheRead: number }}
 */
function tally(usage) {
  return {
    billed:
      (usage.input_tokens ?? 0) +
      (usage.output_tokens ?? 0) +
      (usage.cache_creation_input_tokens ?? 0),
    cacheRead: usage.cache_read_input_tokens ?? 0,
  };
}

/**
 * One pass over every transcript touched in the last week. Usage rows are kept with their
 * timestamps so the window's start can be found afterwards, and every 429 with its reset. Reading
 * 30 days took 7.3s a call; two days hold every turn a window can contain.
 * @param {{ root?: string, now?: number }} [options]
 * @returns {{ now: number, turns: { at: number, billed: number, cacheRead: number }[], limits: { at: number, resetsAt: number, type: string }[] }}
 */
export function scan({ root = PROJECTS, now = Date.now() } = {}) {
  const week = now - WEEK_MS;
  /** @type {{ at: number, billed: number, cacheRead: number }[]} */
  const turns = [];
  /** @type {{ at: number, resetsAt: number, type: string }[]} */
  const limits = [];

  for (const path of transcripts(root)) {
    if (statSync(path).mtimeMs < week) continue;
    let text;
    try {
      text = readFileSync(path, "utf8");
    } catch {
      continue;
    }
    for (const line of text.split("\n")) {
      if (!line || (!line.includes('"usage"') && !line.includes("quotaLimits"))) continue;
      let row;
      try {
        row = JSON.parse(line);
      } catch {
        continue;
      }
      const at = Date.parse(row.timestamp ?? "");
      if (!Number.isFinite(at)) continue;
      if (row.quotaLimits?.resetsAt) {
        limits.push({
          at,
          resetsAt: row.quotaLimits.resetsAt * MS,
          type: row.quotaLimits.rateLimitType ?? "unknown",
        });
      }
      const usage = row.message?.usage;
      if (usage) turns.push({ at, ...tally(usage) });
    }
  }
  turns.sort((a, b) => a.at - b.at);
  return { now, turns, limits };
}
