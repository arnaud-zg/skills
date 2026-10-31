import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { stackBase } from "./stack-base.mjs";

// A skill fix ships in a stack of its own, parallel to the feature stack. Its branch is cut from the
// top of the open skills chain, or from the base branch when none is open, and never from a feature
// branch, even when a skills pull request was wrongly based on one. Each refusal has its own words,
// asserted exactly, so taking any one guard away fails its own case.

const SCRIPT = fileURLToPath(new URL("./stack-base.mjs", import.meta.url));
const base = mkdtempSync(join(tmpdir(), "skill-retro-stack-base-"));
after(() => rmSync(base, { recursive: true, force: true }));

const FLAGS = { skillsPrefix: "skills/", featurePrefix: "feat/", base: "main" };

/**
 * A skills pull request: open and a draft unless the case says otherwise.
 * @param {number} number
 * @param {string} headRefName
 * @param {string} baseRefName
 * @param {{ isDraft?: boolean, state?: string | undefined }} [options]
 */
const skill = (number, headRefName, baseRefName, { isDraft = true, state = "OPEN" } = {}) => ({
  number,
  headRefName,
  baseRefName,
  isDraft,
  state,
});
/**
 * A feature pull request, ready for review: nothing about it may move the skills chain.
 * @param {number} number
 * @param {string} headRefName
 * @param {string} baseRefName
 * @param {string | undefined} [state]
 */
const feature = (number, headRefName, baseRefName, state = "OPEN") => ({
  number,
  headRefName,
  baseRefName,
  isDraft: false,
  state,
});

const CASES = [
  { name: "given no open pull request, then it is the base branch", prs: [], branch: "main" },
  {
    name: "given only feature pull requests, ready or not, then it is the base branch, never the top of the feature stack",
    prs: [feature(1, "feat/a", "main"), feature(2, "feat/b", "feat/a", "MERGED")],
    branch: "main",
  },
  {
    name: "given a skills chain of three beside a feature stack, then it is the head of the top skills pull request",
    prs: [
      feature(1, "feat/a", "main"),
      skill(4, "skills/2-b", "skills/1-a"),
      skill(3, "skills/1-a", "main"),
      skill(5, "skills/3-c", "skills/2-b"),
      feature(2, "feat/b", "feat/a"),
    ],
    branch: "skills/3-c",
  },
  {
    name: "given a feature pull request based on a skills branch, then the skills chain still answers",
    prs: [skill(1, "skills/1-a", "main"), feature(2, "feat/b", "skills/1-a")],
    branch: "skills/1-a",
  },
  {
    name: "given prefixes where one starts the other, then it refuses, since a branch could be both",
    prs: [],
    flags: { featurePrefix: "skills/f" },
    refuse: 'the prefixes "skills/" and "skills/f" overlap, so a branch could be both',
  },
  {
    name: "given a base branch that carries the feature prefix, then it refuses",
    prs: [],
    flags: { base: "feat/a" },
    refuse: "the base feat/a is a feature branch",
  },
  {
    name: "given a skills pull request that is merged, then it refuses",
    prs: [skill(3, "skills/1-a", "main", { state: "MERGED" })],
    refuse: "skills #3 is not open (state: MERGED)",
  },
  {
    name: "given a skills pull request listed without its state, then it refuses",
    prs: [{ ...skill(3, "skills/1-a", "main"), state: undefined }],
    refuse: "skills #3 is not open (state: missing)",
  },
  {
    name: "given skills pull requests a person marked ready for review, then they are still the chain and the top answers",
    prs: [
      skill(1, "skills/1-a", "main", { isDraft: false }),
      skill(2, "skills/2-b", "skills/1-a", { isDraft: false }),
    ],
    branch: "skills/2-b",
  },
  {
    name: "given a skills pull request based on a feature branch, then it refuses and names it",
    prs: [feature(1, "feat/a", "main"), skill(2, "skills/1-a", "feat/a")],
    refuse: "skills #2 bases on the feature branch feat/a",
  },
  {
    name: "given a skills pull request based on a branch that is neither the base nor an open skills branch, then it refuses",
    prs: [skill(2, "skills/2-b", "skills/1-a")],
    refuse: "skills #2 bases on skills/1-a, which is neither main nor an open skills branch",
  },
  {
    name: "given two skills pull requests on the same parent, then the chain forks and it refuses",
    prs: [
      skill(1, "skills/1-a", "main"),
      skill(2, "skills/2-b", "skills/1-a"),
      skill(3, "skills/2-c", "skills/1-a"),
    ],
    refuse: "the skills chain forks: #2, #3 all base on skills/1-a",
  },
  {
    name: "given two skills pull requests both on the base branch, then the chain forks and it refuses",
    prs: [skill(1, "skills/1-a", "main"), skill(2, "skills/1-b", "main")],
    refuse: "the skills chain forks: #1, #2 all base on main",
  },
  {
    name: "given skills pull requests that base on each other in a loop, then it refuses",
    prs: [skill(1, "skills/1-a", "skills/2-b"), skill(2, "skills/2-b", "skills/1-a")],
    refuse: "the skills chain loops: #1, #2 never lead down to main",
  },
];

/** @param {{ prs: { number: number, headRefName: string, baseRefName: string, isDraft: boolean, state?: string | undefined }[], flags?: { featurePrefix?: string, base?: string } }} input */
const answer = ({ prs, flags = {} }) => stackBase({ prs, ...FLAGS, ...flags });

describe("where the next skill fix is cut from, and what it refuses", () => {
  for (const testCase of CASES) {
    it(testCase.name, () => {
      const expected = testCase.refuse ? { refuse: testCase.refuse } : { branch: testCase.branch };
      assert.deepEqual(answer(testCase), expected);
    });
  }

  it("given every case above, then no answer is ever a feature branch", () => {
    for (const testCase of CASES) {
      const { branch } = answer(testCase);
      const featurePrefix = testCase.flags?.featurePrefix ?? FLAGS.featurePrefix;
      assert.ok(!branch?.startsWith(featurePrefix), testCase.name);
    }
  });
});

describe("the pull request the retro opens", () => {
  it("given the stack adapter, then every pull request it creates is a draft", () => {
    const page = readFileSync(new URL("../adapters/stack.gh-stack.md", import.meta.url), "utf8");
    const creates = page.split("\n").filter((line) => line.includes("gh pr create"));
    assert.ok(creates.length > 0);
    for (const line of creates) assert.match(line, /--draft/);
  });
});

describe("the command", () => {
  const flags = ["--skills-prefix", "skills/", "--feature-prefix", "feat/", "--base", "main"];
  /** @param {string[]} args @param {string} [input] */
  const run = (args, input) =>
    spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8", input });

  it("given the open pull requests on stdin, then it prints the one branch", () => {
    const out = run(flags, JSON.stringify([skill(3, "skills/1-a", "main")]));
    assert.equal(out.status, 0);
    assert.equal(out.stdout, "skills/1-a\n");
  });

  it("given the open pull requests in a file, then it reads the file", () => {
    const file = join(base, "prs.json");
    writeFileSync(file, "[]");
    assert.equal(run(["--prs", file, ...flags]).stdout, "main\n");
  });

  it("given a refusal, then it exits 1 with one line", () => {
    const out = run(flags, JSON.stringify([skill(2, "skills/1-a", "feat/a")]));
    assert.equal(out.status, 1);
    assert.equal(out.stdout, "REFUSE skills #2 bases on the feature branch feat/a\n");
  });

  it("given a missing flag or input that is not a list, then it exits 2 and names what is missing", () => {
    const missing = run(["--skills-prefix", "skills/", "--base", "main"], "[]");
    assert.equal(missing.status, 2);
    assert.match(missing.stdout, /--feature-prefix/);
    assert.equal(run(flags, "{}").status, 2);
    assert.equal(run(flags, "not json").status, 2);
  });
});
