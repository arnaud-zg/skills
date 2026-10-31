#!/usr/bin/env node
// Context budget for Markdown an agent loads: always-loaded instructions, skill pages, and docs an
// agent is routed to. Over budget means the page should route to smaller pages, not teach inline.
// Usage: node scripts/context-budget.mjs [--json]
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export const BUDGETS = [
  { kind: "always-loaded", test: (p) => /(^|\/)(CLAUDE|AGENTS)\.md$/.test(p), max: 2048 },
  { kind: "skill entry", test: (p) => /(^|\/)skills\/[^/]+\/SKILL\.md$/.test(p), max: 6144 },
  { kind: "skill page", test: (p) => /(^|\/)skills\/[^/]+\/.+\.md$/.test(p), max: 12288 },
  { kind: "routed doc", test: (p) => /(^|\/)docs\/[^/]+\.md$/.test(p), max: 12288 },
];
const SKIP = new Set(["node_modules", "dist", ".git", "templates"]);
const DESCRIPTION_MAX = 1024;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith(".md")) out.push(full);
  }
  return out;
}

export function description(text) {
  const fm = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!fm) return "";
  const m = /^description:\s*([\s\S]*?)(?=^\S[^:\n]*:|$(?![\s\S]))/m.exec(fm[1]);
  return m ? m[1].replace(/\s+/g, " ").trim() : "";
}

export function check(root) {
  const findings = [];
  for (const file of walk(root)) {
    const path = relative(root, file);
    const budget = BUDGETS.find((b) => b.test(path));
    if (!budget) continue;
    const text = readFileSync(file, "utf8");
    const bytes = Buffer.byteLength(text);
    if (bytes > budget.max)
      findings.push({
        path,
        kind: budget.kind,
        bytes,
        max: budget.max,
        fix: "split it; link the detail by path",
      });
    if (budget.kind === "skill entry" && description(text).length > DESCRIPTION_MAX)
      findings.push({
        path,
        kind: "skill description",
        bytes: description(text).length,
        max: DESCRIPTION_MAX,
        fix: "shorten the description",
      });
  }
  return findings;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const findings = check(process.cwd());
  if (process.argv.includes("--json")) console.info(JSON.stringify(findings, null, 2));
  else
    for (const f of findings)
      console.info(`${f.path}: ${f.kind} ${f.bytes} > ${f.max}\n  → ${f.fix}`);
  if (!findings.length && !process.argv.includes("--json")) console.info("context budget: ok");
  process.exit(findings.length ? 1 : 0);
}
