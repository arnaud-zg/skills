#!/usr/bin/env node
// Checks Diataxis docs folders against the rules in rules.mjs and prints every finding with its
// file, line and fix. It needs Node only, changes nothing, and gives the same result on every
// machine for the same files.
//
//   node check-docs.mjs                     the folders listed in ./doc-compass.json, else docs/
//   node check-docs.mjs <folder> [--index <page>] [--ban <text>]...
//
// Exit 0 when the docs hold, 1 on a finding, 2 when there is nothing to check.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, parse as parsePath, relative, resolve, sep } from "node:path";

import { inspectDocs, RULES } from "./rules.mjs";

const CONFIG = "doc-compass.json";

const USAGE = `Usage: node check-docs.mjs [<folder> [--index <page>]] [--ban <text>]... [--json]

  <folder>        one docs folder to check. Without it, the folders listed in ${CONFIG}
                  are checked, or docs/ when there is no ${CONFIG}
  --index <page>  that folder's index, from inside it: README.md when left out; may sit above
                  it, as ../README.md
  --ban <text>    a string no page may hold outside code, such as an em dash; repeatable
  --json          print the findings as JSON

${CONFIG}, beside package.json:

  { "ban": ["—"], "docs": ["docs", { "folder": "packages/cli/docs", "index": "../README.md" }],
    "examples": "examples" }

"examples" turns on the examples rule: the folder, from the project root, that holds example
files. A test runs an example when a test file names its path from that folder.

Exit 0 when the docs hold, 1 on a finding, 2 when there is nothing to check.`;

const SKIP = new Set(["node_modules", ".git", "dist", ".cache"]);

/** @typedef {{ folder: string, index: string }} DocsSet */

const colour =
  (process.env.FORCE_COLOR ?? "") !== "" && process.env.FORCE_COLOR !== "0"
    ? true
    : process.stdout.isTTY && (process.env.NO_COLOR ?? "") === "";
const paint = (/** @type {number} */ code) => (/** @type {string} */ text) =>
  colour ? `\u001b[${String(code)}m${text}\u001b[0m` : text;
const [green, red, dim, bold] = [paint(32), paint(31), paint(2), paint(1)];
const plural = (/** @type {number} */ count, /** @type {string} */ word) =>
  `${String(count)} ${word}${count === 1 ? "" : "s"}`;
const posixOf = (/** @type {string} */ path) => path.split(sep).join("/");

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
function parseArgs(args) {
  /** @type {{ folder: string | null, index: string | null, ban: string[], json: boolean }} */
  const parsed = { folder: null, index: null, ban: [], json: false };
  for (let at = 0; at < args.length; at += 1) {
    const arg = args[at] ?? "";
    if (arg === "--help" || arg === "-h") {
      say(USAGE);
      process.exit(0);
    }
    if (arg === "--json") parsed.json = true;
    else if (arg === "--index") parsed.index = args[++at] ?? stop(USAGE);
    else if (arg === "--ban") parsed.ban.push(args[++at] ?? stop(USAGE));
    else if (arg.startsWith("-")) stop(`Unknown option ${arg}.\n\n${USAGE}`);
    else if (parsed.folder === null) parsed.folder = arg;
    else stop(`One folder on the command line; list several in ${CONFIG}.\n\n${USAGE}`);
  }
  if (parsed.index !== null && parsed.folder === null)
    stop(`--index needs a <folder>.\n\n${USAGE}`);
  return parsed;
}

/** The docs sets and banned strings in doc-compass.json, checked so a typo fails loudly. */
function readConfig(/** @type {string} */ path) {
  /** @type {unknown} */
  let config;
  try {
    config = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    stop(`${CONFIG} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  const bad = (/** @type {string} */ why) => stop(`${CONFIG}: ${why}.\n\n${USAGE}`);
  if (typeof config !== "object" || config === null || Array.isArray(config))
    bad("expected an object");
  const {
    docs,
    ban = [],
    examples = null,
    ...rest
  } = /** @type {Record<string, unknown>} */ (config);
  const unknown = Object.keys(rest);
  if (unknown.length > 0)
    bad(`unknown key ${unknown.join(", ")}; the keys are "docs", "ban" and "examples"`);
  if (examples !== null && (typeof examples !== "string" || examples === "")) {
    bad('"examples" must be a folder name');
  }
  if (!Array.isArray(ban) || !ban.every((word) => typeof word === "string" && word !== "")) {
    bad('"ban" must be a list of non-empty strings');
  }
  if (!Array.isArray(docs) || docs.length === 0) bad('"docs" must list at least one folder');
  const sets = /** @type {unknown[]} */ (docs).map((entry) => {
    if (typeof entry === "string") return { folder: entry, index: "README.md" };
    const {
      folder,
      index = "README.md",
      ...extra
    } = /** @type {Record<string, unknown>} */ (
      typeof entry === "object" && entry !== null ? entry : {}
    );
    if (typeof folder !== "string" || typeof index !== "string" || Object.keys(extra).length > 0) {
      bad(`each "docs" entry is a folder, or { "folder": "...", "index": "..." }`);
    }
    return { folder, index };
  });
  return {
    sets: /** @type {DocsSet[]} */ (sets),
    ban: /** @type {string[]} */ (ban),
    examples: /** @type {string | null} */ (examples),
  };
}

// Whether a path exists with exactly this spelling. existsSync alone says yes to README.MD on a
// case-insensitive disk (macOS, Windows) and no on Linux; comparing each name keeps one answer.
/** @type {Map<string, string[]>} */
const listings = new Map();
function existsExactly(/** @type {string} */ full) {
  if (!existsSync(full)) return false;
  const { root } = parsePath(full);
  let folder = root;
  for (const name of full.slice(root.length).split(sep).filter(Boolean)) {
    const names = listings.get(folder) ?? readdirSync(folder);
    listings.set(folder, names);
    if (!names.includes(name)) return false;
    folder = join(folder, name);
  }
  return true;
}

/** Every Markdown page under a folder, by its posix path from `base`, in a fixed order. */
function pagesUnder(/** @type {string} */ folder, /** @type {string} */ base) {
  /** @type {Map<string, string>} */
  const pages = new Map();
  /** @param {string} dir */
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      if (SKIP.has(name)) continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith(".md"))
        pages.set(posixOf(relative(base, full)), readFileSync(full, "utf8"));
    }
  };
  walk(folder);
  return pages;
}

const TEST_FILE = /\.(test|spec)\.[cm]?[jt]sx?$/;

/** Every test file's text under the project, read once. @param {string} cwd */
function testTexts(cwd) {
  /** @type {string[]} */
  const texts = [];
  /** @param {string} dir */
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      if (SKIP.has(name)) continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (TEST_FILE.test(name)) texts.push(readFileSync(full, "utf8"));
    }
  };
  walk(cwd);
  return texts;
}

/** The example options for one docs set, or none when no examples folder is set. */
function exampleOptions(
  /** @type {string} */ cwd,
  /** @type {string} */ base,
  /** @type {string | null} */ examples,
) {
  if (examples === null) return {};
  const root = resolve(cwd, examples);
  /** @type {string[] | null} */
  let tests = null;
  const fromRoot = (/** @type {string} */ path) => posixOf(relative(root, join(base, path)));
  return {
    isExample: (/** @type {string} */ path) => {
      const inside = fromRoot(path);
      return inside !== "" && !inside.startsWith("..");
    },
    isTested: (/** @type {string} */ path) => {
      tests ??= testTexts(cwd);
      const named = fromRoot(path).replace(/\.[^./]+$/, "");
      return tests.some((text) => text.includes(named));
    },
  };
}

/** One docs set's pages and findings. @param {string} cwd @param {DocsSet} set @param {string[]} ban @param {string | null} examples */
function check(cwd, set, ban, examples) {
  const folder = resolve(cwd, set.folder);
  const shown = posixOf(relative(cwd, folder)) || ".";
  if (!existsExactly(folder) || !statSync(folder).isDirectory()) stop(`${shown} is not a folder.`);

  // The index may sit above the folder, as a landing README does: paths are then read from the
  // index's folder, so its links and the pages' links resolve the same way.
  const indexPath = resolve(folder, set.index);
  const inside = !relative(folder, indexPath).startsWith("..");
  const base = inside ? folder : dirname(indexPath);
  if (!inside && relative(base, folder).startsWith("..")) {
    stop(`${set.index} must sit inside ${shown} or in a folder above it.`);
  }
  const pages = pagesUnder(folder, base);
  if (pages.size === 0) stop(`${shown} holds no Markdown page.`);
  const index = posixOf(relative(base, indexPath));
  if (!inside && existsExactly(indexPath)) pages.set(index, readFileSync(indexPath, "utf8"));

  const findings = inspectDocs(pages, {
    index,
    banned: ban,
    exists: (path) => existsExactly(join(base, path)),
    readOutside: (path) => {
      const full = join(base, path);
      return existsExactly(full) && statSync(full).isFile() ? readFileSync(full, "utf8") : null;
    },
    sourceExists: (source) => existsExactly(resolve(cwd, source)),
    ...exampleOptions(cwd, base, examples),
  }).map((finding) => ({ ...finding, path: posixOf(join(relative(cwd, base), finding.file)) }));
  return { docs: shown, pages: pages.size, findings };
}

/** @param {ReturnType<typeof check>} result */
function print(result) {
  say(`Checking ${plural(result.pages, "page")} in ${result.docs} against ${RULES.join(", ")}\n`);
  for (const finding of result.findings) {
    say(`  ${bold(`${finding.path}:${String(finding.line)}`)}  ${dim(finding.rule)}`);
    say(`  ${finding.message}`);
    say(`  ${dim("→")} ${finding.fix}\n`);
  }
  const broken = new Set(result.findings.map((finding) => finding.file)).size;
  say(
    result.findings.length === 0
      ? green(
          `✓ ${plural(result.pages, "page")} in ${result.docs} ${result.pages === 1 ? "holds" : "hold"}.\n`,
        )
      : red(
          `✗ ${plural(result.findings.length, "finding")} in ${String(broken)} of ${plural(result.pages, "page")}.\n`,
        ),
  );
}

const cwd = process.cwd();
const args = parseArgs(process.argv.slice(2));
const config = existsExactly(join(cwd, CONFIG)) ? readConfig(join(cwd, CONFIG)) : null;
const sets =
  args.folder !== null
    ? [{ folder: args.folder, index: args.index ?? "README.md" }]
    : (config?.sets ?? [{ folder: "docs", index: "README.md" }]);
const ban = [...new Set([...(config?.ban ?? []), ...args.ban])];

const results = sets.map((set) => check(cwd, set, ban, config?.examples ?? null));
const findings = results.flatMap((result) => result.findings);

if (args.json) {
  const checked = results.map(({ docs, pages }) => ({ docs, pages }));
  say(JSON.stringify({ sets: checked, findings }, null, 2));
} else {
  results.forEach(print);
}

process.exit(findings.length === 0 ? 0 : 1);
