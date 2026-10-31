#!/usr/bin/env node
// Checks a Diataxis docs folder against the rules in rules.mjs and prints every finding with its
// file, line and fix. It needs Node only, and changes nothing.
//
//   node check-docs.mjs [docs folder] [--index <page>] [--ban <text>]... [--json]
//
// Exit 0 when the docs hold, 1 on a finding, 2 when there is nothing to check.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

import { inspectDocs, RULES } from "./rules.mjs";

const USAGE = `Usage: node check-docs.mjs [docs folder] [--index <page>] [--ban <text>]... [--json]

  docs folder     the folder holding the docs, docs/ when left out
  --index <page>  the index page inside it, README.md when left out
  --ban <text>    a string no page may hold outside code, such as an em dash; repeatable
  --json          print the findings as JSON

Exit 0 when the docs hold, 1 on a finding, 2 when there is nothing to check.`;

const SKIP = new Set(["node_modules", ".git", "dist", ".cache"]);

const colour =
  (process.env.FORCE_COLOR ?? "") !== "" && process.env.FORCE_COLOR !== "0"
    ? true
    : process.stdout.isTTY && (process.env.NO_COLOR ?? "") === "";
const paint = (/** @type {number} */ code) => (/** @type {string} */ text) =>
  colour ? `\u001b[${String(code)}m${text}\u001b[0m` : text;
const [green, red, dim, bold] = [paint(32), paint(31), paint(2), paint(1)];
const plural = (/** @type {number} */ count, /** @type {string} */ word) =>
  `${String(count)} ${word}${count === 1 ? "" : "s"}`;

/** Prints a line to stdout, where a report belongs. */
const say = (text = "") => {
  process.stdout.write(`${text}\n`);
};

/** @param {string} message @returns {never} */
function stop(message) {
  console.error(message);
  process.exit(2);
}

/** @param {string[]} args */
function parse(args) {
  /** @type {{ dir: string | null, index: string, banned: string[], json: boolean }} */
  const parsed = { dir: null, index: "README.md", banned: [], json: false };
  for (let at = 0; at < args.length; at += 1) {
    const arg = args[at] ?? "";
    if (arg === "--help" || arg === "-h") {
      say(USAGE);
      process.exit(0);
    }
    if (arg === "--json") parsed.json = true;
    else if (arg === "--index") parsed.index = args[++at] ?? stop(USAGE);
    else if (arg === "--ban") parsed.banned.push(args[++at] ?? stop(USAGE));
    else if (arg.startsWith("-")) stop(`Unknown option ${arg}.\n\n${USAGE}`);
    else if (parsed.dir === null) parsed.dir = arg;
    else stop(`One docs folder at a time.\n\n${USAGE}`);
  }
  return parsed;
}

/** Every Markdown page under a folder, by its posix path from `base`. */
function pagesUnder(/** @type {string} */ root, /** @type {string} */ base) {
  /** @type {Map<string, string>} */
  const docs = new Map();
  /** @param {string} dir */
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      if (SKIP.has(name)) continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith(".md"))
        docs.set(posixOf(relative(base, full)), readFileSync(full, "utf8"));
    }
  };
  walk(root);
  return docs;
}

const posixOf = (/** @type {string} */ path) => path.split(sep).join("/");

const options = parse(process.argv.slice(2));
const cwd = process.cwd();
const root = resolve(cwd, options.dir ?? "docs");
const shown = relative(cwd, root) || ".";
if (!existsSync(root) || !statSync(root).isDirectory()) stop(`${shown} is not a folder.`);

// The index may sit above the docs folder, as a landing README does: paths are then read from
// the index's folder, so its links and the pages' links resolve the same way.
const indexPath = resolve(root, options.index);
const inside = !relative(root, indexPath).startsWith("..");
const base = inside ? root : dirname(indexPath);
if (!inside && relative(base, root).startsWith("..")) {
  stop(`${options.index} must sit inside ${shown} or in a folder above it.`);
}
const docs = pagesUnder(root, base);
if (docs.size === 0) stop(`${shown} holds no Markdown page.`);
const index = posixOf(relative(base, indexPath));
if (!inside && existsSync(indexPath)) docs.set(index, readFileSync(indexPath, "utf8"));
const shownBase = relative(cwd, base) || ".";

const findings = inspectDocs(docs, {
  index,
  banned: options.banned,
  exists: (path) => existsSync(join(base, path)),
  readOutside: (path) => {
    const full = join(base, path);
    return existsSync(full) && statSync(full).isFile() ? readFileSync(full, "utf8") : null;
  },
  sourceExists: (source) => existsSync(resolve(cwd, source)),
}).map((finding) => ({ ...finding, path: posixOf(join(shownBase, finding.file)) }));

if (options.json) {
  say(JSON.stringify({ docs: shown, pages: docs.size, findings }, null, 2));
} else {
  say(`Checking ${plural(docs.size, "page")} in ${shown} against ${RULES.join(", ")}\n`);
  for (const finding of findings) {
    say(`  ${bold(`${finding.path}:${String(finding.line)}`)}  ${dim(finding.rule)}`);
    say(`  ${finding.message}`);
    say(`  ${dim("→")} ${finding.fix}\n`);
  }
  const broken = new Set(findings.map((finding) => finding.file)).size;
  say(
    findings.length === 0
      ? green(`✓ ${plural(docs.size, "page")} in ${shown} ${docs.size === 1 ? "holds" : "hold"}.`)
      : red(
          `✗ ${plural(findings.length, "finding")} in ${String(broken)} of ${plural(docs.size, "page")}.`,
        ),
  );
}

process.exit(findings.length === 0 ? 0 : 1);
