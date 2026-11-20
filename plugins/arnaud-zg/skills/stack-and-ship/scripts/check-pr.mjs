#!/usr/bin/env node
// Checks a PR title, branch and body against the house rules; usage in ../SKILL.md#check.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { adapterHome, findOneAdapter, HOME, projectRoot } from "./adapters.mjs";

const SKILL = "stack-and-ship";
export const DROP_IN = `${HOME}/${SKILL}`;
const TYPES = ["feat", "fix", "test", "refactor", "chore", "docs", "perf"];
const NO_PHASE = "(?!)";
const MERMAID = /```mermaid\n([\s\S]*?)```/g;

/**
 * @typedef {{ rule: string, pattern: string, fix: string, shown?: boolean }} TextRule
 * @typedef {{ defaultBranch?: string, phaseId?: string, types?: string[], sections?: string[],
 *   required?: TextRule[], banned?: TextRule[] }} Project
 * @typedef {{ title?: string, branch?: string, body?: string }} Pr
 * @typedef {{ rule: string, fix: string }} Finding
 */

/** @param {Project} project */
const typesOf = (project) => (project.types ?? TYPES).join("|");
/** @param {Project} project */
const phaseOf = (project) => project.phaseId ?? NO_PHASE;
/** @param {Project} project */
const titlePattern = (project) =>
  new RegExp(
    `^(?:${typesOf(project)})\\(([a-z0-9][a-z0-9-]*)\\): (?:\\[(${phaseOf(project)})\\] )?(?!\\[|[A-Z][a-z])\\S`,
  );
/** @param {Project} project */
const branchPattern = (project) =>
  new RegExp(`^(?:${typesOf(project)})/(?:(${phaseOf(project)})-)?[a-z0-9][a-z0-9-]*$`);
/** @param {string} text */
const escaped = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The one `project.<name>.md` of a repository, by the contract's lookup: the home first, then the
 * legacy `.stack-and-ship/adapters/`, whose use is warned about on stderr.
 * @param {string} [root]
 */
export const findProjectFile = (root = projectRoot()) => {
  const { adapter, warnings } = findOneAdapter({ root, skill: SKILL, port: "project" });
  for (const warning of warnings) console.warn(`warning: ${warning}`);
  if (adapter === null)
    throw new Error(
      `Expected one project.<name>.md in ${adapterHome(root, SKILL)}: write it from ports/PORTS.md, or pass --project <file>`,
    );
  return adapter.path;
};

/** A project adapter's values: its one fenced JSON block. @param {string} file @returns {Project} */
export const readProject = (file) => {
  const block = /```json\n([\s\S]*?)```/.exec(readFileSync(file, "utf8"))?.[1];
  if (block === undefined) throw new Error(`${file} has no fenced JSON block: see ports/PORTS.md`);
  return JSON.parse(block);
};

/** @param {string} body */
const withoutComments = (body) => body.replace(/<!--[\s\S]*?-->/g, "");

/** @param {string | undefined} title @param {Project} project @returns {Finding[]} */
const checkTitle = (title, project) => {
  if (!title) return [{ rule: "title", fix: "pass --title, the issue's title" }];
  const findings = [];
  if (!titlePattern(project).test(title))
    findings.push({
      rule: "title",
      fix: "write `type(scope): [PHASE-ID] value`, scope a domain, subject lowercase (domain/messages.md)",
    });
  if (/^[a-z]+\(\d+\)/.test(title))
    findings.push({ rule: "title-scope", fix: "the scope names a domain, never a phase number" });
  if (title.length > 100)
    findings.push({ rule: "title-length", fix: `cut it to 100 characters (now ${title.length})` });
  return findings;
};

/** @param {string | undefined} branch @param {string | undefined} title @param {Project} project @returns {Finding[]} */
const checkBranch = (branch, title, project) => {
  if (!branch) return [{ rule: "branch", fix: "pass --branch, the PR's head branch" }];
  const base = project.defaultBranch ?? "main";
  if (branch === base) return [{ rule: "branch", fix: `never ship from ${base}: branch first` }];
  const match = branchPattern(project).exec(branch);
  if (!match)
    return [
      {
        rule: "branch",
        fix: "name it `type/PHASE-ID-short-business-description` (domain/messages.md#branch)",
      },
    ];
  const phase = titlePattern(project).exec(title ?? "")?.[2];
  return match[1] && phase && match[1] !== phase
    ? [
        {
          rule: "phase-id",
          fix: `the branch says ${match[1]}, the title says ${phase}: make them agree`,
        },
      ]
    : [];
};

/** @param {string} body @returns {Finding[]} */
const checkMermaid = (body) =>
  [...body.matchAll(MERMAID)].flatMap(([, graph = ""]) => [
    ...(/\s&\s/.test(graph)
      ? [
          {
            rule: "mermaid-edges",
            fix: "write each edge on its own line (`A --> C`), a Mermaid renderer may refuse `A & B`",
          },
        ]
      : []),
    ...(/\[[^\]]*\\n[^\]]*\]/.test(graph)
      ? [{ rule: "mermaid-labels", fix: "no `\\n` inside a node label" }]
      : []),
  ]);

/** @param {string | undefined} body @param {Project} project @returns {Finding[]} */
const checkBody = (body, { sections = [], required = [], banned = [] }) => {
  if (!body?.trim())
    return [{ rule: "body", fix: "write the body from the project's PR template, never blank" }];
  const shown = withoutComments(body);
  /** @param {TextRule} rule */
  const holds = ({ pattern, shown: onlyShown }) =>
    new RegExp(pattern, "i").test(onlyShown ? shown : body);
  /** @param {string} section */
  const hasSection = (section) => new RegExp(`^## .*${escaped(section)}`, "m").test(body);
  const missing = sections.filter((section) => !hasSection(section));
  return [
    ...(missing.length === 0
      ? []
      : [{ rule: "template", fix: `keep the template's sections: ${missing.join(", ")}` }]),
    ...required.filter((rule) => !holds(rule)).map(({ rule, fix }) => ({ rule, fix })),
    ...banned.filter(holds).map(({ rule, fix }) => ({ rule, fix })),
    ...checkMermaid(body),
  ];
};

/** @param {Pr} pr @param {Project} project @returns {Finding[]} */
export const checkPr = ({ title, branch, body }, project) => [
  ...checkTitle(title, project),
  ...checkBranch(branch, title, project),
  ...checkBody(body, project),
];

/** @param {Finding[]} findings */
export const printCheck = (findings) => [
  ...findings.map(({ rule, fix }) => `${rule}  → ${fix}`),
  findings.length === 0
    ? "✓ the PR holds every house rule this script checks"
    : `✗ ${findings.length} finding(s)`,
];

/** @param {string[]} args @param {string} flag */
const option = (args, flag) => {
  const index = args.indexOf(flag);
  return index === -1 ? undefined : args[index + 1];
};

const isMain =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const args = process.argv.slice(2);
  const bodyFile = option(args, "--body");
  let project;
  try {
    project = readProject(option(args, "--project") ?? findProjectFile());
  } catch (error) {
    console.error(/** @type {Error} */ (error).message);
    process.exit(2);
  }
  const findings = checkPr(
    {
      title: option(args, "--title"),
      branch: option(args, "--branch"),
      body: bodyFile === undefined ? undefined : readFileSync(bodyFile, "utf8"),
    },
    project,
  );
  for (const line of printCheck(findings)) console.info(line);
  process.exit(findings.length === 0 ? 0 : 1);
}
