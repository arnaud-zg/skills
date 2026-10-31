#!/usr/bin/env node
// What each skill on a shelf costs a model to load, and the text it pays for twice.
//
// Usage: node weight.mjs <skills-folder> [--json]
//
// A skill is a folder holding a SKILL.md. Per skill it counts, in characters: the description's
// value as YAML reads it (plain, quoted, or a `>` or `|` block scalar), the entry's body (everything
// after the frontmatter), and every other Markdown page. A README.md or evidence.md at the skill's
// root is listed apart, as not loaded on use, and left out of the pages and the repeats. Tokens are
// an estimate, characters / 4 rounded up, and every output says so. A missing description is
// reported absent, never as zero. Repeats are sentences, list items or table rows of at least eight
// words, normalised for case, punctuation and wrapping, that appear in two or more pages; code
// fences are left out. Exit 0 when measured, 2 when there is nothing to measure. Node only, no
// dependencies.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

export const ESTIMATE = "characters / 4";
const MIN_WORDS = 8;
const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;

/**
 * @typedef {{ chars: number, tokens: number }} Weight
 * @typedef {{ file: string, line: number }} Place
 * @typedef {{ text: string, words: number, scope: string, places: Place[] }} Repeat
 * @typedef {{ name: string, description: Weight | null, entry: Weight, pages: ({ path: string } & Weight)[], notLoaded: ({ path: string } & Weight)[] }} SkillWeight
 * @typedef {{ estimate: string, skills: SkillWeight[], repeats: Repeat[] }} Shelf
 * @typedef {{ line: number, text: string, starts: [number, number][] }} Block
 */

/** @param {string} text */
const charsOf = (text) => [...text].length;
/** @param {string} text @returns {Weight} */
const weigh = (text) => ({ chars: charsOf(text), tokens: Math.ceil(charsOf(text) / 4) });

const NOT_LOADED = ["README.md", "evidence.md"];

/**
 * Lines joined as YAML folds them: a line break is a space, and each blank line a newline.
 * @param {string[]} lines
 */
function fold(lines) {
  let out = "";
  let blanks = 0;
  for (const line of lines) {
    if (line === "") {
      blanks += 1;
      continue;
    }
    if (out !== "") out += blanks > 0 ? "\n".repeat(blanks) : " ";
    out += line;
    blanks = 0;
  }
  return out;
}

/**
 * The description's value as YAML reads it, or null when the frontmatter has none.
 * @param {string} entry
 * @returns {string | null}
 */
export function descriptionOf(entry) {
  const lines = (FRONTMATTER.exec(entry)?.[1] ?? "").split("\n");
  const at = lines.findIndex((line) => line.startsWith("description:"));
  if (at < 0) return null;
  const head = lines[at].slice("description:".length).trim();
  /** @type {string[]} */
  const block = [];
  for (const line of lines.slice(at + 1)) {
    if (line.trim() !== "" && !/^[ \t]/.test(line)) break;
    block.push(line);
  }
  let trailing = 0;
  while (block.length > 0 && (block.at(-1) ?? "").trim() === "") {
    block.pop();
    trailing += 1;
  }
  const indent = Math.min(...block.filter((line) => line.trim()).map((line) => line.search(/\S/)));
  const body = block.map((line) => (line.trim() === "" ? "" : line.slice(indent).trimEnd()));
  const scalar = /^([>|])([+-]?)$/.exec(head);
  if (!scalar) {
    const plain = fold([head, ...body.map((line) => line.trim())]);
    return plain.replace(/^(["'])([\s\S]*)\1$/, "$2") || null;
  }
  const text = scalar[1] === ">" ? fold(body) : body.join("\n");
  if (text === "") return null;
  if (scalar[2] === "-") return text;
  return text + "\n".repeat(scalar[2] === "+" ? 1 + trailing : 1);
}

/** @param {string} dir @param {string[]} [files] @returns {string[]} */
function markdownUnder(dir, files = []) {
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) markdownUnder(path, files);
    else if (name.endsWith(".md")) files.push(path);
  }
  return files;
}

const BLOCK_START = /^\s*(?:[-*+]\s|\d+\.\s|\||#)/;

/**
 * Blocks of prose with the line each starts on: paragraphs, list items, table rows, headings.
 * @param {string} text
 */
function blocksOf(text) {
  /** @type {Block[]} */
  const blocks = [];
  /** @type {Block | null} */
  let current = null;
  let fenced = false;
  text.split("\n").forEach((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced || /^\s*(```|~~~)/.test(line) || line.trim() === "") {
      current = null;
      return;
    }
    if (current === null || BLOCK_START.test(line) || /^\s*(?:\||#)/.test(current.text)) {
      current = { line: index + 1, text: line, starts: [[0, index + 1]] };
      blocks.push(current);
      return;
    }
    current.starts.push([current.text.length + 1, index + 1]);
    current.text += ` ${line}`;
  });
  return blocks;
}

/** @param {string} text */
const normalise = (text) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Each sentence of a page's prose, normalised, with the line it starts on.
 * @param {string} text
 */
function sentencesOf(text) {
  /** @type {{ text: string, line: number }[]} */
  const sentences = [];
  for (const block of blocksOf(text)) {
    const pattern = /\S[\s\S]*?(?:[.!?](?=\s|$)|$)/g;
    for (const match of block.text.matchAll(pattern)) {
      const at = match.index ?? 0;
      const line = block.starts.filter(([offset]) => offset <= at).at(-1)?.[1] ?? 0;
      sentences.push({ text: normalise(match[0]), line });
    }
  }
  return sentences;
}

/**
 * Sentences of at least eight words found in two or more pages, most words wasted first.
 * @param {{ file: string, body: string }[]} pages
 * @returns {Repeat[]}
 */
export function repeatsOf(pages) {
  /** @type {Map<string, Place[]>} */
  const seen = new Map();
  for (const { file, body } of pages) {
    for (const { text, line } of sentencesOf(body)) {
      if (text.split(" ").length < MIN_WORDS) continue;
      if (!seen.has(text)) seen.set(text, []);
      /** @type {Place[]} */ (seen.get(text)).push({ file, line });
    }
  }
  /** @type {Repeat[]} */
  const repeats = [];
  for (const [text, places] of seen) {
    if (new Set(places.map((place) => place.file)).size < 2) continue;
    const skills = new Set(places.map((place) => place.file.split("/")[0]));
    const scope = skills.size === 1 ? `within ${[...skills][0]}` : "across skills";
    repeats.push({ text, words: text.split(" ").length, scope, places });
  }
  /** @param {Repeat} repeat */
  const wasted = (repeat) => repeat.words * (repeat.places.length - 1);
  return repeats.sort((a, b) => wasted(b) - wasted(a) || a.text.localeCompare(b.text));
}

/**
 * Every skill on the shelf, weighed, and the repeats among their pages; null when there is none.
 * @param {string} folder
 * @returns {Shelf | null}
 */
export function weighShelf(folder) {
  if (!existsSync(folder) || !statSync(folder).isDirectory()) return null;
  const names = readdirSync(folder)
    .filter((name) => existsSync(join(folder, name, "SKILL.md")))
    .sort();
  if (names.length === 0) return null;
  /** @type {{ file: string, body: string }[]} */
  const pages = [];
  const skills = names.map((name) => {
    const entryText = readFileSync(join(folder, name, "SKILL.md"), "utf8");
    const description = descriptionOf(entryText);
    /** @type {SkillWeight} */
    const skill = {
      name,
      description: description === null ? null : weigh(description),
      entry: weigh(entryText.replace(FRONTMATTER, "")),
      pages: [],
      notLoaded: [],
    };
    for (const path of markdownUnder(join(folder, name))) {
      const file = relative(folder, path).split("\\").join("/");
      const text = readFileSync(path, "utf8");
      if (NOT_LOADED.some((page) => file === `${name}/${page}`)) {
        skill.notLoaded.push({ path: file, ...weigh(text) });
        continue;
      }
      const body = text.replace(FRONTMATTER, (front) => front.replace(/[^\n]/g, " "));
      pages.push({ file, body });
      if (file !== `${name}/SKILL.md`) skill.pages.push({ path: file, ...weigh(text) });
    }
    skill.pages.sort((a, b) => b.chars - a.chars || a.path.localeCompare(b.path));
    return skill;
  });
  return { estimate: ESTIMATE, skills, repeats: repeatsOf(pages) };
}

/** @param {Weight} weight */
const cost = ({ chars, tokens }) => `${String(chars)} ch ~${String(tokens)} tok`;

/**
 * The weight as lines a person reads.
 * @param {string} folder
 * @param {Shelf} shelf
 */
export function formatWeight(folder, { skills, repeats }) {
  const lines = [`WEIGHT ${folder}  (tokens are an estimate: ${ESTIMATE})`];
  for (const skill of skills) {
    const total = skill.pages.reduce((sum, page) => sum + page.chars, 0);
    const description = skill.description
      ? `description ${cost(skill.description)}`
      : "description absent";
    lines.push(
      `${skill.name}  ${description}  entry ${cost(skill.entry)}  pages ${cost({ chars: total, tokens: Math.ceil(total / 4) })}`,
    );
    for (const page of skill.pages) lines.push(`  ${page.path}  ${cost(page)}`);
    for (const page of skill.notLoaded) {
      lines.push(`  not loaded on use  ${page.path}  ${cost(page)}`);
    }
  }
  lines.push(`REPEATS ${String(repeats.length)}`);
  for (const repeat of repeats) {
    lines.push(
      `REPEAT ${String(repeat.words)} words x${String(repeat.places.length)} ${repeat.scope}: "${repeat.text}"`,
    );
    for (const place of repeat.places) lines.push(`  ${place.file}:${String(place.line)}`);
  }
  return lines.join("\n");
}

/** @param {string[]} args */
function main(args) {
  const folder = args.find((arg) => !arg.startsWith("--"));
  if (!folder) {
    console.log("usage: node weight.mjs <skills-folder> [--json]");
    return 2;
  }
  const result = weighShelf(folder);
  if (result === null) {
    console.log(`no skill in ${folder}: a skill is a folder holding a SKILL.md`);
    return 2;
  }
  console.log(
    args.includes("--json") ? JSON.stringify(result, null, 2) : formatWeight(folder, result),
  );
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
