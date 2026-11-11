#!/usr/bin/env node
// Copies hexagonal-architecture's port and adapter contract into every other skill with a `ports/`
// folder, as `ports/CONTRACT.md`, so a skill installed alone still carries the contract it follows.
// The source is the one place to edit; the pre-commit hook runs this, and `pnpm test` runs --check.
//
//   node scripts/sync-contract.mjs [--check]
//
// Run from the repository root. Writes each copy that is missing or differs, and names it.
// With --check it writes nothing and exits 1 if a copy is missing or differs.
// Exit 1 too when the source holds a relative link, which would break in the copies.
// Exit 2 when no plugins/*/skills/hexagonal-architecture/domain/contract.md is found.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE = "hexagonal-architecture/domain/contract.md";
const HEADER =
  "<!-- Generated from the hexagonal-architecture skill's contract page by `pnpm sync:contract`.\n" +
  "     Edit the source, then run it again: a test fails when this copy drifts. -->\n\n";
const check = process.argv.includes("--check");

/** The names in a folder, sorted; none when it cannot be read. */
const list = (/** @type {string} */ dir) => {
  try {
    return readdirSync(dir).sort();
  } catch {
    return [];
  }
};
/** Whether a path is a folder; false for a link to nothing. */
const isFolder = (/** @type {string} */ path) => {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
};

const shelves = list("plugins")
  .map((plugin) => join("plugins", plugin, "skills"))
  .filter((shelf) => existsSync(join(shelf, SOURCE)));
if (shelves.length === 0) {
  console.error(`✗ no plugins/*/skills/${SOURCE} under ${process.cwd()}`);
  process.exit(2);
}

// The copies land in other folders, so a relative link in the source would point somewhere else
// from each copy. Only links to a heading on the same page or to a full address are allowed.
for (const shelf of shelves) {
  const links = [...readFileSync(join(shelf, SOURCE), "utf8").matchAll(/\]\(([^)\s]+)/g)]
    .map((match) => match[1] ?? "")
    .filter((link) => !/^(#|https?:)/.test(link));
  if (links.length > 0) {
    console.error(`✗ ${join(shelf, SOURCE)} links to ${links.join(", ")}`);
    console.error(
      "→ it is copied into other skills: write the text inline or use a full https:// link",
    );
    process.exit(1);
  }
}

let stale = 0;
for (const shelf of shelves) {
  const copy = HEADER + readFileSync(join(shelf, SOURCE), "utf8");
  for (const skill of list(shelf).filter((name) => isFolder(join(shelf, name, "ports")))) {
    const target = join(shelf, skill, "ports/CONTRACT.md");
    if (existsSync(target) && readFileSync(target, "utf8") === copy) continue;
    stale += 1;
    if (check) console.error(`✗ ${target} differs from ${SOURCE}`);
    else {
      writeFileSync(target, copy);
      console.info(`↻ ${target}`);
    }
  }
}
if (check && stale > 0) {
  console.error("→ edit the source only, then run pnpm sync:contract");
  process.exit(1);
}
console.info(
  stale === 0 ? "✓ every contract copy matches its source." : "✓ contract copies synced.",
);
