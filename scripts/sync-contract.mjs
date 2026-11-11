#!/usr/bin/env node
// Copies hexagonal-architecture's port and adapter contract into every other skill with a `ports/`
// folder, as `ports/CONTRACT.md`, so a skill installed alone still carries the contract it follows.
// The source stays the one place to edit it.
//
//   node scripts/sync-contract.mjs [--check] [<skills folder>]
//
// With --check it writes nothing, lists every copy that is missing or differs, and exits 1 if any
// does. Without it, it writes each copy and exits 0.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const OWNER = "hexagonal-architecture";
const HEADER =
  "<!-- Generated from the hexagonal-architecture skill's contract page by `pnpm sync:contract`.\n" +
  "     Edit the source, then run it again: a test fails when this copy drifts. -->\n\n";

/** The copy each skill should hold, given the source's text. */
export const copyOf = (/** @type {string} */ source) => HEADER + source;

/** Every skill folder under `shelf`, other than the owner, that has a `ports/` folder. */
export function skillsWithPorts(/** @type {string} */ shelf) {
  return readdirSync(shelf)
    .filter((name) => name !== OWNER)
    .map((name) => join(shelf, name))
    .filter((dir) => statSync(dir).isDirectory() && existsSync(join(dir, "ports")));
}

const args = process.argv.slice(2);
const check = args.includes("--check");
const shelf = resolve(
  args.find((arg) => !arg.startsWith("-")) ??
    join(import.meta.dirname, "../plugins/arnaud-zg/skills"),
);
const want = copyOf(readFileSync(join(shelf, OWNER, "domain/contract.md"), "utf8"));

const drifted = [];
for (const dir of skillsWithPorts(shelf)) {
  const target = join(dir, "ports/CONTRACT.md");
  const has = existsSync(target) ? readFileSync(target, "utf8") : null;
  if (has === want) continue;
  if (check) drifted.push(relative(process.cwd(), target));
  else writeFileSync(target, want);
}
for (const file of drifted) console.error(`✗ ${file} differs from ${OWNER}/domain/contract.md`);
if (drifted.length > 0) {
  console.error("→ run pnpm sync:contract");
  process.exit(1);
}
console.info(check ? "✓ every contract copy matches its source." : "✓ contract copies written.");
