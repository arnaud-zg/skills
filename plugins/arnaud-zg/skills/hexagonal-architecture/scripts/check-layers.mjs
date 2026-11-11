#!/usr/bin/env node
// Checks that every import and Markdown link under a folder points inward, from adapters toward
// the domain, and prints each one that points out with its file, line and fix. Node only, reads
// files, writes nothing.
//
//   node check-layers.mjs [<folder>] [--layers <inner,…,outer>] [--json]
//
// Exit 0 when every edge points inward, 1 on a finding, 2 when no file sits in a layer folder.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

import { DEFAULT_LAYERS, inspectLayers, kindOf } from "./layers.mjs";

const SKIP = new Set(["node_modules", ".git", "dist", "build", "coverage", ".cache", ".next"]);

/** A path's stat, or null when it cannot be read, such as a link to nothing. */
const statOrNull = (/** @type {string} */ full) => {
  try {
    return statSync(full);
  } catch {
    return null;
  }
};

const args = process.argv.slice(2);
const json = args.includes("--json");
const at = args.indexOf("--layers");
const spec = at === -1 ? DEFAULT_LAYERS : (args[at + 1] ?? DEFAULT_LAYERS);
const folder = resolve(
  args.find((arg, i) => !arg.startsWith("-") && (at === -1 || i !== at + 1)) ?? ".",
);
if (!existsSync(folder) || !statSync(folder).isDirectory()) {
  console.error(`${folder} is not a folder.`);
  process.exit(2);
}

/** @type {Map<string, string>} */
const files = new Map();
/** @param {string} dir */
const walk = (dir) => {
  for (const name of readdirSync(dir).sort()) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    const stat = statOrNull(full);
    if (stat?.isDirectory()) walk(full);
    else if (stat?.isFile() && kindOf(name))
      files.set(relative(folder, full).split(sep).join("/"), readFileSync(full, "utf8"));
  }
};
walk(folder);

const { counts, findings } = inspectLayers(files, spec);
const layered = Object.values(counts).reduce((sum, n) => sum + n, 0);
if (layered === 0) {
  console.error(`No file under ${folder} sits in a layer folder (${spec}).`);
  process.exit(2);
}
if (json) {
  process.stdout.write(`${JSON.stringify({ counts, findings }, null, 2)}\n`);
} else {
  const say = (/** @type {string} */ line) => process.stdout.write(`${line}\n`);
  say(
    `LAYERS ${Object.entries(counts)
      .map(([name, n]) => `${name} ${String(n)}`)
      .join(" · ")}`,
  );
  for (const f of findings)
    say(`  ${f.file}:${String(f.line)}  ${f.rule}\n  ${f.message}\n  → ${f.fix}`);
  say(
    findings.length === 0
      ? "✓ every dependency points inward."
      : `✗ ${String(findings.length)} findings.`,
  );
}
process.exit(findings.length === 0 ? 0 : 1);
