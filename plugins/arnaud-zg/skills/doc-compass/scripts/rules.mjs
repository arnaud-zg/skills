// The rules a Diataxis docs set is held to, as pure functions over its pages.
//
//   indexed     every page can be reached from the index by following links
//   resolves    every relative link and heading anchor a page points at exists
//   framed      every page but the index links back to the index near its top
//   superseded  an ADR that says "Superseded by X" is pointed back at by X
//   generated   a "Generated from `source`" header names a source that exists
//   small       every page fits in 300 lines
//   banned      no page holds a string the project bans (only when some are given)
//
// A docs set is a map of each Markdown page's path inside the docs folder to its text. Nothing
// here reads the disk: `check-docs.mjs` does, and calls `inspectDocs`.

import { posix } from "node:path";

/** @typedef {Map<string, string>} Docs */
/** @typedef {"indexed" | "resolves" | "framed" | "superseded" | "generated" | "small" | "banned"} Rule */
/**
 * @typedef {object} Finding
 * @property {Rule} rule
 * @property {string} file the page's path inside the docs folder
 * @property {number} line
 * @property {string} message
 * @property {string} fix
 */
/**
 * @typedef {object} Options
 * @property {string} [index] the index page, `README.md` when left out
 * @property {(path: string) => boolean} [exists] whether a path outside the pages exists: a
 *   file that is not Markdown, a folder, or anything outside the docs folder (`../x`)
 * @property {(path: string) => string | null} [readOutside] a Markdown page outside the docs
 *   folder, to look up its anchors; null when it cannot be read
 * @property {(source: string) => boolean} [sourceExists] whether a generated page's source
 *   exists, as written in its header (from the project root)
 * @property {string[]} [banned] strings no page may hold outside code
 */
/** @typedef {(rule: Rule, file: string, line: number, message: string, fix: string) => void} Add */

export const RULES = /** @type {const} */ ([
  "indexed",
  "resolves",
  "framed",
  "superseded",
  "generated",
  "small",
  "banned",
]);
export const LIMITS = { page: 300, frame: 10 };

const LINK = /!?\[[^\]\n]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
const SUPERSEDED = /superseded by\b[^\n]*?\]\(\s*<?([^)\s>]+)>?/gi;
const GENERATED = /^>?\s*_?generated\b[^\n]*?\bfrom\s+`([^`]+)`/gim;
const GRAVESTONE = /^#\s+.*\(moved\)\s*$/m;

/** @param {string} text @param {number} index */
const lineOf = (text, index) => text.slice(0, index).split("\n").length;

/** The text with every character but line breaks blanked, so lines keep their numbers. */
const blank = (/** @type {string} */ text) => text.replace(/[^\n]/g, " ");

/** The text with its code blocks and comments blanked, so an example or a note is not read. */
const unfenced = (/** @type {string} */ text) =>
  text.replace(/^(```|~~~)[\s\S]*?^\1|<!--[\s\S]*?-->/gm, (block) => blank(block));

/** The text with its code blocks and inline code blanked, so an example is never read. */
const readable = (/** @type {string} */ text) => unfenced(text).replace(/`[^`\n]*`/g, blank);

/** A page kept at its old path only to say where it went: exempt from the index and frame. */
export const isGravestone = (/** @type {string} */ text) => GRAVESTONE.test(text);

/** A heading's anchor as GitHub writes it (github-slugger): lowercase, punctuation dropped. */
export function slugOf(/** @type {string} */ heading) {
  return heading
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_`]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "")
    .replace(/ /g, "-");
}

/** Every anchor a page offers, with GitHub's `-1`, `-2` for headings that repeat. */
export function anchorsOf(/** @type {string} */ text) {
  /** @type {Map<string, number>} */
  const seen = new Map();
  const anchors = new Set();
  for (const match of unfenced(text).matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    const slug = slugOf(match[1] ?? "");
    const count = seen.get(slug) ?? 0;
    anchors.add(count === 0 ? slug : `${slug}-${String(count)}`);
    seen.set(slug, count + 1);
  }
  return anchors;
}

/**
 * Every relative link on a page, with where it points inside the docs folder.
 * @param {string} file @param {string} text
 */
function linksOf(file, text) {
  return [...readable(text).matchAll(LINK)].flatMap((match) => {
    const written = match[1] ?? "";
    if (/^[a-z][\w+.-]*:|^\/|^\$\{|^<|^\{/i.test(written)) return [];
    const [pathPart = "", anchor = ""] = written.split("#");
    let decoded = pathPart;
    try {
      decoded = decodeURI(pathPart);
    } catch {
      // A malformed escape is checked as written.
    }
    const target = pathPart ? posix.normalize(posix.join(posix.dirname(file), decoded)) : file;
    return [{ index: match.index, written: pathPart, anchor, target }];
  });
}

/** The page a link to `target` opens: the page itself, or a folder's README.md. */
function pageAt(/** @type {Docs} */ docs, /** @type {string} */ target) {
  const folder = target.replace(/\/$/, "");
  if (docs.has(folder)) return folder;
  const readme = folder === "." ? "README.md" : `${folder}/README.md`;
  return docs.has(readme) ? readme : null;
}

/** @param {Docs} docs @param {Add} add @param {Options} options */
function resolves(docs, add, options) {
  const { exists = () => false, readOutside = () => null } = options;
  for (const [file, text] of docs) {
    for (const link of linksOf(file, text)) {
      const page = pageAt(docs, link.target);
      const missing = (/** @type {string} */ message) =>
        add(
          "resolves",
          file,
          lineOf(text, link.index),
          message,
          "point at where it lives now, or remove the link",
        );
      if (page === null && !exists(link.target)) {
        missing(`${link.written} does not exist`);
        continue;
      }
      if (!link.anchor) continue;
      const target =
        page === null
          ? link.target.endsWith(".md")
            ? readOutside(link.target)
            : null
          : (docs.get(page) ?? null);
      if (target === null) continue;
      let anchor = link.anchor;
      try {
        anchor = decodeURIComponent(anchor);
      } catch {
        // Checked as written.
      }
      if (!anchorsOf(target).has(anchor.toLowerCase())) {
        missing(`${link.written || file} has no heading #${link.anchor}`);
      }
    }
  }
}

/** @param {Docs} docs @param {string} index @param {Add} add */
function indexed(docs, index, add) {
  const reached = new Set([index]);
  const queue = [index];
  for (let page = queue.shift(); page !== undefined; page = queue.shift()) {
    for (const link of linksOf(page, docs.get(page) ?? "")) {
      const next = pageAt(docs, link.target);
      if (next !== null && !reached.has(next)) {
        reached.add(next);
        queue.push(next);
      }
    }
  }
  for (const [file, text] of docs) {
    if (reached.has(file) || isGravestone(text)) continue;
    add(
      "indexed",
      file,
      1,
      `${file} cannot be reached from ${index}`,
      `add a row for it to ${index}, or to a page ${index} links to`,
    );
  }
}

/** @param {Docs} docs @param {string} index @param {Add} add */
function framed(docs, index, add) {
  for (const [file, text] of docs) {
    if (file === index || isGravestone(text)) continue;
    const top = text.split("\n").slice(0, LIMITS.frame).join("\n");
    const home = linksOf(file, top).some((link) => link.target === index);
    if (home) continue;
    add(
      "framed",
      file,
      1,
      `${file} has no link to ${index} in its first ${String(LIMITS.frame)} lines`,
      "open the page with the breadcrumb from the templates, current page in bold",
    );
  }
}

/** @param {Docs} docs @param {Add} add */
function superseded(docs, add) {
  for (const [file, text] of docs) {
    for (const match of readable(text).matchAll(SUPERSEDED)) {
      const written = (match[1] ?? "").split("#")[0] ?? "";
      const newer = pageAt(docs, posix.normalize(posix.join(posix.dirname(file), written)));
      if (newer === null) continue;
      const back = linksOf(newer, docs.get(newer) ?? "").some((link) => link.target === file);
      if (back) continue;
      add(
        "superseded",
        file,
        lineOf(text, match.index),
        `${file} is superseded by ${newer}, which never links back`,
        `add "Supersedes [${posix.basename(file)}](…)" to the status of ${newer}`,
      );
    }
  }
}

/** @param {Docs} docs @param {Add} add @param {Options} options */
function generated(docs, add, options) {
  const { sourceExists = () => true } = options;
  for (const [file, text] of docs) {
    for (const match of unfenced(text).matchAll(GENERATED)) {
      const source = match[1] ?? "";
      if (sourceExists(source)) continue;
      add(
        "generated",
        file,
        lineOf(text, match.index),
        `${file} says it is generated from ${source}, which does not exist`,
        "name the source it is generated from now, or regenerate the page",
      );
    }
  }
}

/** @param {Docs} docs @param {Add} add */
function small(docs, add) {
  for (const [file, text] of docs) {
    const count = text.replace(/\n$/, "").split("\n").length;
    if (count <= LIMITS.page) continue;
    add(
      "small",
      file,
      LIMITS.page + 1,
      `${file} is ${String(count)} lines, over ${String(LIMITS.page)}`,
      "split it by reader need: each part goes to the quadrant it belongs to",
    );
  }
}

/** @param {Docs} docs @param {Add} add @param {string[]} words */
function banned(docs, add, words) {
  for (const [file, text] of docs) {
    const prose = readable(text);
    for (const word of words.filter(Boolean)) {
      for (let at = prose.indexOf(word); at !== -1; at = prose.indexOf(word, at + word.length)) {
        add(
          "banned",
          file,
          lineOf(text, at),
          `${file} holds "${word}", which this project bans`,
          "rewrite the sentence without it",
        );
      }
    }
  }
}

/**
 * Every finding in the docs set, rule by rule, then by page and line.
 * @param {Docs} docs
 * @param {Options} [options]
 * @returns {Finding[]}
 */
export function inspectDocs(docs, options = {}) {
  const index = options.index ?? "README.md";
  /** @type {Finding[]} */
  const findings = [];
  /** @type {Add} */
  const add = (rule, file, line, message, fix) => {
    findings.push({ rule, file, line, message, fix });
  };
  if (!docs.has(index)) {
    add("indexed", index, 1, `there is no ${index}`, `write ${index} from templates/README.md`);
  } else {
    indexed(docs, index, add);
    framed(docs, index, add);
  }
  resolves(docs, add, options);
  superseded(docs, add);
  generated(docs, add, options);
  small(docs, add);
  banned(docs, add, options.banned ?? []);
  return findings.sort(
    (a, b) =>
      RULES.indexOf(a.rule) - RULES.indexOf(b.rule) ||
      a.file.localeCompare(b.file) ||
      a.line - b.line,
  );
}
