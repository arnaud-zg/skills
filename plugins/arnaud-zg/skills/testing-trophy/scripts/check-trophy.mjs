#!/usr/bin/env node
// Checks a project's tests against the testing trophy and prints each finding with its file, line
// and fix. Node only, reads files, writes nothing.
//
//   node check-trophy.mjs [<folder>] [--json]
//
// Exit 0 when the suite holds, 1 on a finding, 2 when there is no test file to read.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

import { inspectTrophy } from "./trophy.mjs";

const SKIP = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".cache",
  "Pods",
  ".next",
  ".turbo",
  ".expo",
]);

/** A path's stat, or null when it cannot be read, such as a link to nothing. */
const statOrNull = (/** @type {string} */ full) => {
  try {
    return statSync(full);
  } catch {
    return null;
  }
};
const TEST = /\.(test|spec)\.[cm]?[jt]sx?$/;
const STATIC = /^(tsconfig\.json|\.?eslint\.config\.[cm]?[jt]s|\.eslintrc(\.\w+)?)$/;

const args = process.argv.slice(2);
const json = args.includes("--json");
const folder = resolve(args.find((arg) => !arg.startsWith("-")) ?? ".");
if (!existsSync(folder) || !statSync(folder).isDirectory()) {
  console.error(`${folder} is not a folder.`);
  process.exit(2);
}

/** @type {Map<string, string>} */
const tests = new Map();
let hasStatic = false;
/** @param {string} dir */
const walk = (dir) => {
  for (const name of readdirSync(dir).sort()) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    const stat = statOrNull(full);
    if (stat?.isDirectory()) walk(full);
    else if (!stat?.isFile()) continue;
    else if (TEST.test(name))
      tests.set(relative(folder, full).split(sep).join("/"), readFileSync(full, "utf8"));
    else if (STATIC.test(name)) hasStatic = true;
  }
};
walk(folder);
if (tests.size === 0) {
  console.error(`No test file under ${folder}.`);
  process.exit(2);
}

const { counts, findings } = inspectTrophy(tests, { hasStatic });
if (json) {
  process.stdout.write(`${JSON.stringify({ counts, findings }, null, 2)}\n`);
} else {
  const say = (/** @type {string} */ line) => process.stdout.write(`${line}\n`);
  say(
    `TROPHY unit ${String(counts.unit)} · integration ${String(counts.integration)} · e2e ${String(counts.e2e)} · static ${hasStatic ? "yes" : "no"}`,
  );
  for (const f of findings)
    say(`  ${f.file}:${String(f.line)}  ${f.rule}\n  ${f.message}\n  → ${f.fix}`);
  say(
    findings.length === 0
      ? "✓ the suite holds the trophy."
      : `✗ ${String(findings.length)} findings.`,
  );
}
process.exit(findings.length === 0 ? 0 : 1);
