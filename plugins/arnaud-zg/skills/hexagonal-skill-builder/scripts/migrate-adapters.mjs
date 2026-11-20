#!/usr/bin/env node
// Moves a project's adapters from the old per-skill folders into the one home:
//
//   .<skill>/adapters/<port>.<name>.md  →  .agents/adapters/<skill>/<port>.<name>.md
//
// and rewrites every mention of the old folder in the project's tracked text files. It prints the
// plan and changes nothing unless given --write. A second run finds nothing to do.
//
//   node migrate-adapters.mjs [root] [--skill <name> ...] [--write] [--json]
//
// Exit 0 when the plan is clean (or applied), 1 when it refuses (a file would be overwritten),
// 2 on a usage error.
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { ALIASES, HOME, KEBAB, projectRoot } from "./adapters.mjs";

const USAGE = `Usage: node migrate-adapters.mjs [root] [--skill <name> ...] [--write] [--json]

  root            the project's top folder; the repository's when left out
  --skill <name>  migrate only this skill's folder; repeat it for several. Every skill when left out
  --write         apply the plan; without it, only print it
  --json          print the plan as JSON`;

const LEGACY = new RegExp(`^\\.(${KEBAB})$`);
const TEXT = /\.(?:md|mdx|[cm]?[jt]sx?|json|jsonc|ya?ml|toml)$/;
const SKIPPED = new Set(["node_modules", ".git"]);

/**
 * @typedef {{ from: string, to: string }} Move
 * @typedef {{ file: string, count: number }} Rewrite
 * @typedef {{ file: string, line: number, text: string }} Mention
 * @typedef {{ folder: string, skill: string }} Legacy
 * @typedef {{ root: string, legacy: Legacy[], moves: Move[], rewrites: Rewrite[],
 *   byHand: Mention[], collisions: string[] }} Plan
 */

const isDir = (/** @type {string} */ path) => existsSync(path) && statSync(path).isDirectory();
const escaped = (/** @type {string} */ text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The skill an old folder name belongs to: its own name, or the skill that used it as an alias. */
export const skillOf = (/** @type {string} */ old) =>
  Object.keys(ALIASES).find((name) => ALIASES[name]?.includes(old)) ?? old;

/** A mention of an old folder, with or without a trailing slash, never inside a longer name. */
const pattern = (/** @type {string} */ old) =>
  new RegExp(`(?<![\\w.-])\\.${escaped(old)}/adapters(?![\\w-])`, "g");

/**
 * Rewrites every mention of the old folders in one text.
 * @param {string} text
 * @param {Legacy[]} legacy
 */
export function rewrite(text, legacy) {
  let count = 0;
  let out = text;
  for (const { folder, skill } of legacy) {
    out = out.replace(pattern(folder.slice(1)), () => {
      count += 1;
      return `${HOME}/${skill}`;
    });
  }
  return { text: out, count };
}

/** Whether a folder is a git work tree. */
const inGit = (/** @type {string} */ root) =>
  spawnSync("git", ["rev-parse", "--is-inside-work-tree"], {
    cwd: root,
    encoding: "utf8",
  }).stdout.trim() === "true";

/** The project's text files: git's tracked files in a repository, else every file under it. */
function textFiles(/** @type {string} */ root) {
  if (inGit(root)) {
    const listed = spawnSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" }).stdout;
    return listed
      .split("\0")
      .filter((file) => TEXT.test(file) && existsSync(join(root, file)))
      .sort();
  }
  /** @type {string[]} */
  const found = [];
  const walk = (/** @type {string} */ dir) => {
    for (const name of readdirSync(join(root, dir)).sort()) {
      if (SKIPPED.has(name)) continue;
      const path = dir === "" ? name : `${dir}/${name}`;
      if (isDir(join(root, path))) walk(path);
      else if (TEXT.test(name)) found.push(path);
    }
  };
  walk("");
  return found;
}

/**
 * The migration for a project, read from the disk and changing nothing.
 * @param {string} root
 * @param {string[]} [only] the skills to migrate; every one with a legacy folder when empty
 * @returns {Plan}
 */
export function planMigration(root, only = []) {
  const legacy = readdirSync(root)
    .sort()
    .filter(
      (name) => LEGACY.test(name) && name !== ".agents" && isDir(join(root, name, "adapters")),
    )
    .map((folder) => ({ folder, skill: skillOf(folder.slice(1)) }))
    .filter(({ skill }) => only.length === 0 || only.includes(skill));

  /** @type {Move[]} */
  const moves = [];
  /** @type {string[]} */
  const collisions = [];
  for (const { folder, skill } of legacy) {
    for (const file of readdirSync(join(root, folder, "adapters")).sort()) {
      const from = `${folder}/adapters/${file}`;
      const to = `${HOME}/${skill}/${file}`;
      if (existsSync(join(root, to))) {
        const same =
          readFileSync(join(root, from), "utf8") === readFileSync(join(root, to), "utf8");
        if (!same) collisions.push(`${from} → ${to}: the target exists and differs`);
      }
      moves.push({ from, to });
    }
  }

  /** @type {Rewrite[]} */
  const rewrites = [];
  /** @type {Mention[]} */
  const byHand = [];
  const moved = new Map(moves.map((move) => [move.from, move.to]));
  for (const file of textFiles(root)) {
    const text = readFileSync(join(root, file), "utf8");
    const { text: out, count } = rewrite(text, legacy);
    if (count > 0) rewrites.push({ file: moved.get(file) ?? file, count });
    out.split("\n").forEach((line, index) => {
      if (!/adapters/.test(line)) return;
      for (const { folder } of legacy) {
        const name = folder.slice(1);
        if (
          new RegExp(`["'\`/]\\.?${escaped(name)}["'\`/]`).test(line) &&
          !line.includes(`${HOME}/`)
        )
          byHand.push({ file: moved.get(file) ?? file, line: index + 1, text: line.trim() });
      }
    });
  }
  return { root, legacy, moves, rewrites, byHand, collisions };
}

/** Moves a file, by `git mv` when git tracks it so its history follows. */
function move(/** @type {string} */ root, /** @type {Move} */ { from, to }) {
  mkdirSync(dirname(join(root, to)), { recursive: true });
  if (existsSync(join(root, to))) return;
  const tracked =
    inGit(root) &&
    spawnSync("git", ["ls-files", "--error-unmatch", from], { cwd: root }).status === 0;
  if (tracked) {
    const git = spawnSync("git", ["mv", from, to], { cwd: root, encoding: "utf8" });
    if (git.status !== 0) throw new Error(`git mv ${from} ${to} failed: ${git.stderr.trim()}`);
  } else renameSync(join(root, from), join(root, to));
}

/** Removes a file whose identical copy already sits at the target. */
function dropDuplicate(/** @type {string} */ root, /** @type {Move} */ { from }) {
  if (!existsSync(join(root, from))) return;
  const tracked =
    inGit(root) &&
    spawnSync("git", ["ls-files", "--error-unmatch", from], { cwd: root }).status === 0;
  if (tracked) spawnSync("git", ["rm", "-q", from], { cwd: root });
  else rmSync(join(root, from));
}

/**
 * Applies a plan: moves the files, rewrites the mentions, removes the emptied folders.
 * @param {Plan} plan
 */
export function applyMigration(plan) {
  if (plan.collisions.length > 0) throw new Error(plan.collisions.join("\n"));
  const { root } = plan;
  for (const step of plan.moves) {
    if (existsSync(join(root, step.to))) dropDuplicate(root, step);
    else move(root, step);
  }
  for (const { file } of plan.rewrites) {
    const path = join(root, file);
    writeFileSync(path, rewrite(readFileSync(path, "utf8"), plan.legacy).text);
  }
  for (const { folder } of plan.legacy) {
    for (const dir of [join(root, folder, "adapters"), join(root, folder)]) {
      if (isDir(dir) && readdirSync(dir).length === 0) rmdirSync(dir);
    }
  }
}

/** @param {Plan} plan @param {boolean} written */
function print(plan, written) {
  const say = (/** @type {string} */ text = "") => process.stdout.write(`${text}\n`);
  if (plan.legacy.length === 0) {
    say(`Nothing to migrate: no .<skill>/adapters/ folder under ${plan.root}.`);
    return;
  }
  say(written ? "Migrated:" : "Plan (nothing written; pass --write to apply):");
  say();
  for (const { from, to } of plan.moves) say(`  move     ${from} → ${to}`);
  for (const { file, count } of plan.rewrites)
    say(`  rewrite  ${file} (${String(count)} mention${count === 1 ? "" : "s"})`);
  for (const { folder } of plan.legacy) say(`  remove   ${folder}/ once empty`);
  if (plan.byHand.length > 0) {
    say();
    say("Check by hand, the old folder is named in a way no rewrite is sure of:");
    for (const { file, line, text } of plan.byHand) say(`  ${file}:${String(line)}  ${text}`);
  }
  for (const collision of plan.collisions) say(`  refused  ${collision}`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    process.stdout.write(`${USAGE}\n`);
    return 0;
  }
  /** @type {string[]} */
  const only = [];
  /** @type {string[]} */
  const paths = [];
  let unknown = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index] ?? "";
    if (arg === "--skill") {
      const name = args[++index];
      if (name === undefined || name.startsWith("-")) unknown = true;
      else only.push(name);
    } else if (arg === "--write" || arg === "--json") continue;
    else if (arg.startsWith("-")) unknown = true;
    else paths.push(arg);
  }
  if (unknown || paths.length > 1) {
    process.stderr.write(`${USAGE}\n`);
    return 2;
  }
  const root = paths[0] === undefined ? projectRoot() : resolve(paths[0]);
  if (!isDir(root)) {
    process.stderr.write(`${root} is not a folder.\n`);
    return 2;
  }
  const plan = planMigration(root, only);
  const write = args.includes("--write") && plan.collisions.length === 0;
  if (write) applyMigration(plan);
  if (args.includes("--json"))
    process.stdout.write(`${JSON.stringify({ ...plan, written: write }, null, 2)}\n`);
  else print(plan, write);
  return plan.collisions.length === 0 ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) process.exitCode = main();
