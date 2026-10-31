#!/usr/bin/env node
// The branch a new skill fix is cut from: the top of the open skills chain, or the base branch.
//
// Usage: gh pr list --state open --json number,headRefName,baseRefName,isDraft,state |
//          node stack-base.mjs --skills-prefix <p> --feature-prefix <p> --base <branch>
//        (or --prs <file> in place of stdin)
//
// A skills pull request is one whose head starts with the skills prefix; every other one is
// ignored, which keeps the skills stack parallel to the feature stack. Draft or ready for review,
// a skills pull request is part of the chain: a person readies one before merging it. Prints the
// branch and exits 0. Refuses with one `REFUSE` line and exit 1, each reason in its own words: the
// prefixes overlap; the base is a feature branch; a skills pull request is not open, bases on a
// feature branch, or bases on a branch that is neither the base nor an open skills branch; the
// chain forks; the chain loops. Exit 2 on a missing flag or unreadable input. Node only, no
// dependencies.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/**
 * @typedef {{ number?: number, headRefName: string, baseRefName: string, state?: string, isDraft?: boolean }} PullRequest
 * @typedef {{ branch?: string, refuse?: string }} StackResult
 */

/** @param {string} reason @returns {StackResult} */
const refuse = (reason) => ({ refuse: reason });

/**
 * { branch } to cut the next fix from, or { refuse } with the one reason it cannot be said.
 * @param {{ prs: PullRequest[], skillsPrefix: string, featurePrefix: string, base: string }} input
 * @returns {StackResult}
 */
export function stackBase({ prs, skillsPrefix, featurePrefix, base }) {
  if (skillsPrefix.startsWith(featurePrefix) || featurePrefix.startsWith(skillsPrefix)) {
    return refuse(
      `the prefixes "${skillsPrefix}" and "${featurePrefix}" overlap, so a branch could be both`,
    );
  }
  if (base.startsWith(featurePrefix)) return refuse(`the base ${base} is a feature branch`);
  const skills = prs.filter((pr) => pr.headRefName.startsWith(skillsPrefix));
  const heads = new Set(skills.map((pr) => pr.headRefName));
  /** @type {Map<string, PullRequest[]>} */
  const children = new Map();
  for (const pr of skills) {
    const name = `skills #${String(pr.number)}`;
    if (pr.state !== "OPEN") return refuse(`${name} is not open (state: ${pr.state ?? "missing"})`);
    if (pr.baseRefName.startsWith(featurePrefix)) {
      return refuse(`${name} bases on the feature branch ${pr.baseRefName}`);
    }
    if (pr.baseRefName !== base && !heads.has(pr.baseRefName)) {
      return refuse(
        `${name} bases on ${pr.baseRefName}, which is neither ${base} nor an open skills branch`,
      );
    }
    children.set(pr.baseRefName, [...(children.get(pr.baseRefName) ?? []), pr]);
  }
  const forked = [...children].find(([, below]) => below.length > 1);
  if (forked) {
    return refuse(`the skills chain forks: ${numbers(forked[1])} all base on ${forked[0]}`);
  }
  const reached = new Set();
  let top = base;
  while (children.has(top) && !reached.has(top)) {
    reached.add(top);
    top = /** @type {PullRequest[]} */ (children.get(top))[0].headRefName;
  }
  const stranded = skills.filter((pr) => !reached.has(pr.baseRefName));
  if (stranded.length > 0) {
    return refuse(`the skills chain loops: ${numbers(stranded)} never lead down to ${base}`);
  }
  return { branch: top };
}

/** @param {PullRequest[]} prs */
const numbers = (prs) => prs.map((pr) => `#${String(pr.number)}`).join(", ");

/** @param {string[]} args @param {string} name */
function flag(args, name) {
  const at = args.indexOf(name);
  return at >= 0 ? args[at + 1] : undefined;
}

/** @param {string[]} args */
function main(args) {
  const names = ["--skills-prefix", "--feature-prefix", "--base"];
  const missing = names.filter((name) => !flag(args, name));
  if (missing.length > 0) {
    console.log(
      `missing ${missing.join(", ")}: the caller's adapter names them, there is no default`,
    );
    return 2;
  }
  let prs;
  try {
    prs = JSON.parse(readFileSync(flag(args, "--prs") ?? 0, "utf8"));
  } catch (error) {
    console.log(
      `the open pull requests could not be read: ${/** @type {Error} */ (error).message}`,
    );
    return 2;
  }
  if (!Array.isArray(prs)) {
    console.log("the open pull requests must be a list, as gh pr list --json prints them");
    return 2;
  }
  const result = stackBase({
    prs,
    skillsPrefix: flag(args, "--skills-prefix") ?? "",
    featurePrefix: flag(args, "--feature-prefix") ?? "",
    base: flag(args, "--base") ?? "",
  });
  if (result.refuse) {
    console.log(`REFUSE ${result.refuse}`);
    return 1;
  }
  console.log(result.branch);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
