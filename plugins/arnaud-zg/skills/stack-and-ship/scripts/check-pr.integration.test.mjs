import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { checkPr, DROP_IN, findProjectFile, printCheck, readProject } from "./check-pr.mjs";

const EM_DASH = String.fromCharCode(0x2014);

const FIXTURE = fileURLToPath(new URL("fixtures/project.acme.md", import.meta.url));
const SCRIPT = fileURLToPath(new URL("check-pr.mjs", import.meta.url));
const project = readProject(FIXTURE);

const BODY = [
  "<!-- Ticket: acme/shop#2092 (S30-04) -->",
  "",
  "## 🎯 What & why",
  "",
  "Agents ship from one skill.",
  "",
  "```mermaid",
  "flowchart LR",
  "    A[Commit] --> B[PR]",
  "```",
  "",
  "## ✅ Testing",
  "",
  "No UI",
  "change, so no screenshots.",
].join("\n");

const PR = {
  title: "chore(dx): [S30-04] agents ship branches, commits and stacked PRs from one skill",
  branch: "chore/S30-04-ship-skill",
  body: BODY,
};

/** @param {import("./check-pr.mjs").Pr} pr */
const rules = (pr) => checkPr(pr, project).map(({ rule }) => rule);

describe("check-pr", () => {
  it("given a PR that follows the house rules, when checked, then it holds", () => {
    assert.deepEqual(printCheck(checkPr(PR, project)), [
      "✓ the PR holds every house rule this script checks",
    ]);
  });

  it("given a technical title with a phase number as scope, when checked, then the title is refused", () => {
    assert.deepEqual(rules({ ...PR, title: "feat(12): Add CRUD endpoints" }), [
      "title",
      "title-scope",
    ]);
  });

  it("given a subject opening on a capitalised word, when checked, then the title is refused, an acronym is not", () => {
    assert.deepEqual(rules({ ...PR, title: "chore(dx): [S30-04] Agents ship" }), ["title"]);
    assert.deepEqual(rules({ ...PR, title: "chore(dx): [S30-04] CLAUDE.md is short" }), []);
  });

  it("given a phase id in another project's format, when checked, then the title is refused", () => {
    assert.deepEqual(rules({ ...PR, title: "chore(dx): [P30-04] agents ship" }), ["title"]);
  });

  it("given nothing passed, when checked, then each missing input is named", () => {
    assert.deepEqual(rules({}), ["title", "branch", "body"]);
  });

  it("given a branch for another step than the title, when checked, then the phase ids must agree", () => {
    assert.deepEqual(rules({ ...PR, branch: "chore/S30-05-ship-skill" }), ["phase-id"]);
  });

  it("given the main branch, when checked, then shipping from it is refused", () => {
    assert.deepEqual(rules({ ...PR, branch: "main" }), ["branch"]);
  });

  it("given a project whose default branch is trunk, when shipped from trunk, then it is refused", () => {
    const trunk = { ...project, defaultBranch: "trunk" };

    assert.deepEqual(
      checkPr({ ...PR, branch: "trunk" }, trunk).map(({ rule }) => rule),
      ["branch"],
    );
  });

  it("given a project with no phases, when a plain title and branch are checked, then they hold and a phase id is refused", () => {
    const plain = { sections: ["What & why"] };
    const body = "## What & why\n\nAgents ship.";

    assert.deepEqual(
      checkPr(
        { title: "fix(cart): totals round once", branch: "fix/totals-round-once", body },
        plain,
      ),
      [],
    );
    assert.deepEqual(
      checkPr({ ...PR, body }, plain).map(({ rule }) => rule),
      ["title", "branch"],
    );
  });

  it("given a body without the Ticket line and with a closing keyword, when checked, then both are flagged", () => {
    const body = BODY.replace("<!-- Ticket: acme/shop#2092 (S30-04) -->", "Closes #2092");

    assert.deepEqual(rules({ ...PR, body }), ["ticket", "closing-keyword"]);
  });

  it("given a Ticket line naming another repository, when checked, then it is flagged", () => {
    const body = BODY.replace("acme/shop#2092", "other/repo#2092");

    assert.deepEqual(rules({ ...PR, body }), ["ticket"]);
  });

  it("given a closing keyword inside the commented Ticket line, when checked, then it is not flagged", () => {
    const body = BODY.replace("(S30-04)", "(reference only, no Closes #2092)");

    assert.deepEqual(rules({ ...PR, body }), []);
  });

  it("given a UI body with neither screenshots nor the no-UI line, when checked, then screenshots are asked for", () => {
    const body = BODY.replace(
      "No UI\nchange, so no screenshots.",
      "Looks good on the small phone.",
    );

    assert.deepEqual(rules({ ...PR, body }), ["screenshots"]);
  });

  it("given a missing section the project requires, when checked, then the template is asked for", () => {
    assert.deepEqual(rules({ ...PR, body: BODY.replace("## ✅ Testing", "## Proof") }), [
      "template",
    ]);
  });

  it("given a Mermaid graph with `&` and a `\\n` label, and text the project bans, when checked, then each is flagged", () => {
    const body = BODY.replace("A[Commit] --> B[PR]", "A & B --> C[two\\nlines]").concat(
      `\n\nSee https://chat.example.com/x ${EM_DASH} here.`,
    );

    assert.deepEqual(rules({ ...PR, body }), [
      "em-dash",
      "chat-link",
      "mermaid-edges",
      "mermaid-labels",
    ]);
  });

  it("given a blank body, when checked, then the template is asked for", () => {
    assert.deepEqual(rules({ ...PR, body: "  \n" }), ["body"]);
  });

  it("given a repository with no drop-in folder, when its adapter is looked for, then the error names the folder and how to write one", () => {
    const empty = mkdtempSync(join(tmpdir(), "no-project-"));

    assert.throws(
      () => findProjectFile(empty),
      /\.agents\/adapters\/stack-and-ship: write it from ports\/PORTS\.md/,
    );
  });

  it("given a repository with no drop-in folder, when the script runs, then it exits 2 naming the folder", () => {
    const empty = mkdtempSync(join(tmpdir(), "no-project-"));
    const result = spawnSync(process.execPath, [SCRIPT, "--title", PR.title], {
      cwd: empty,
      encoding: "utf8",
    });

    assert.equal(result.status, 2);
    assert.match(result.stderr, /\.agents\/adapters\/stack-and-ship/);
  });

  it("given a project adapter left in the legacy folder, when looked for, then it is still found and the move is asked for", () => {
    const root = mkdtempSync(join(tmpdir(), "legacy-"));
    mkdirSync(join(root, ".stack-and-ship/adapters"), { recursive: true });
    copyFileSync(FIXTURE, join(root, ".stack-and-ship/adapters/project.acme.md"));
    const result = spawnSync(process.execPath, [SCRIPT, "--title", PR.title], {
      cwd: root,
      encoding: "utf8",
    });

    assert.notEqual(result.status, 2);
    assert.match(result.stderr, /warning: legacy adapter folder .*migrate-adapters\.mjs/);
  });

  it("given a project adapter in the drop-in folder, when looked for, then it is found and read", () => {
    const root = mkdtempSync(join(tmpdir(), "drop-in-"));
    mkdirSync(join(root, DROP_IN), { recursive: true });
    copyFileSync(FIXTURE, join(root, DROP_IN, "project.acme.md"));

    assert.equal(readProject(findProjectFile(root)).defaultBranch, "main");
  });

  it("given the repository this runs from has a drop-in adapter, when read, then it holds every value the check needs", (context) => {
    if (!existsSync(join(process.cwd(), DROP_IN))) return context.skip("no drop-in adapter here");
    const { phaseId, sections = [], required = [], banned = [] } = readProject(findProjectFile());

    if (phaseId !== undefined) assert.doesNotThrow(() => new RegExp(phaseId));
    assert.ok(sections.every((section) => typeof section === "string"));
    for (const { rule, pattern, fix } of [...required, ...banned]) {
      assert.ok(rule && fix, `${rule} is incomplete`);
      assert.doesNotThrow(() => new RegExp(pattern));
    }
  });
});
