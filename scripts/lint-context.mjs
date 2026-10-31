#!/usr/bin/env node
// Runs `context-budget check` (agent-context-budget) in every folder holding a
// context-budget.config.json, and requires one beside every SKILL.md. Exit 1 fails the build and
// prints what to clean up; exit 2 (advisory only) is printed but does not fail.
// Usage: pnpm lint:context
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const BIN = join(ROOT, "node_modules", ".bin", "context-budget");
const CONFIG = "context-budget.config.json";
const SKIP = new Set(["node_modules", "dist", ".git", "templates", "examples"]);

function folders(dir, out = []) {
  out.push(dir);
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!SKIP.has(name) && statSync(full).isDirectory()) folders(full, out);
  }
  return out;
}

const all = folders(ROOT);
const failed = [];
const missing = all
  .filter((dir) => existsSync(join(dir, "SKILL.md")) && !existsSync(join(dir, CONFIG)))
  .map((dir) => relative(ROOT, dir));

for (const dir of all.filter((d) => existsSync(join(d, CONFIG)))) {
  const name = relative(ROOT, dir) || ".";
  console.info(`\n▶ context budget: ${name}`);
  const { status } = spawnSync(BIN, ["check"], { cwd: dir, stdio: "inherit" });
  if (status === 1 || status === null) failed.push(name);
  else if (status === 2) console.warn(`  advisory only in ${name}, not failing`);
}

for (const dir of missing) console.error(`\n✗ ${dir}: no ${CONFIG} beside SKILL.md`);

if (failed.length || missing.length) {
  console.error(`
✗ Context budget failed${failed.length ? ` in: ${failed.join(", ")}` : ""}.

Clean up before merging:
  - Split each file marked BAD: move the sections flagged "← EXTRACT" into their own page and link
    to it by path. An entry (CLAUDE.md, SKILL.md, a README) routes; it does not teach.
  - Tighten files flagged "redundant" or "noise": say each thing once, trim wide tables.
  - A new skill needs a ${CONFIG}; copy one from plugins/arnaud-zg/skills/hexagonal-skill-builder.
  - Never raise a threshold to make a file pass.
Details for one file: cd <folder> && npx context-budget check --explain <file>`);
  process.exit(1);
}
console.info("\n✓ Context budget holds everywhere.");
