import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

// Every example the docs link, run as a reader would run it. When a skill's script changes and an
// example stops holding, this fails, and so does the page that shows it.

const EXAMPLES = import.meta.dirname;
const SKILLS = path.join(EXAMPLES, "..", "skills");

function run(script: string, ...args: string[]) {
  const { status, stdout } = spawnSync(process.execPath, [script, ...args], {
    cwd: EXAMPLES,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "" },
  });
  return { status, stdout };
}

const skill = (name: string, script: string) => path.join(SKILLS, name, "scripts", script);
const example = (relative: string) => path.join(EXAMPLES, relative);

describe("the examples the docs show", () => {
  test("given marketplace/.claude-plugin/plugin.json, then it is a plugin manifest", () => {
    const manifest = JSON.parse(
      readFileSync(example("marketplace/.claude-plugin/plugin.json"), "utf8"),
    ) as Record<string, unknown>;
    expect(manifest).toMatchObject({ name: "hello-tools", version: "0.1.0" });
  });

  test("given hexagonal-skill-builder/release-notes, then it holds all four rules", () => {
    const { status, stdout } = run(
      skill("hexagonal-skill-builder", "check.mjs"),
      "hexagonal-skill-builder/release-notes",
    );
    expect(stdout).toContain("1 skill holds all four rules");
    expect(status).toBe(0);
  });

  test("given doc-compass/docs, then the docs hold", () => {
    const { status, stdout } = spawnSync(
      process.execPath,
      [skill("doc-compass", "check-docs.mjs"), "docs"],
      { cwd: example("doc-compass"), encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } },
    );
    expect(stdout).toContain("2 pages in docs hold");
    expect(status).toBe(0);
  });

  test("given glance-first/brief.json, then the brief is OK", () => {
    const { status, stdout } = run(
      skill("glance-first", "check-brief.mjs"),
      example("glance-first/brief.json"),
    );
    expect(stdout).toContain("BRIEF OK");
    expect(status).toBe(0);
  });

  test("given glance-audit/audit.json and its source, then the audit is OK", () => {
    const { status, stdout } = run(
      skill("glance-audit", "check-audit.mjs"),
      example("glance-audit/audit.json"),
      example("glance-audit/source.txt"),
    );
    expect(stdout).toContain("AUDIT OK 1 of 1 finding kept");
    expect(status).toBe(0);
  });

  test("given radical-simplify/onboarding.md, then it walks the six steps in order", () => {
    const text = readFileSync(example("radical-simplify/onboarding.md"), "utf8");
    const headings = [...text.matchAll(/^## (.+)$/gm)].map((match) => match[1]);
    expect(headings).toEqual([
      "Question",
      "Remove",
      "Simplify",
      "Reimagine",
      "Accelerate",
      "Automate",
    ]);
  });

  test("given skill-retro/session.jsonl, then the 45 minute silence is an IDLE line", () => {
    const { status, stdout } = run(
      skill("skill-retro", "gaps.mjs"),
      example("skill-retro/session.jsonl"),
    );
    expect(stdout).toMatch(/IDLE .* 0h45 /);
    expect(status).toBe(0);
  });

  test("given usage-runway/decide.mjs, then two hours against forty minutes is PARK", () => {
    const { status, stdout } = run(example("usage-runway/decide.mjs"));
    expect(stdout).toContain("PARK: the window resets in 40m, under the 3h00 this needs");
    expect(status).toBe(0);
  });

  test("given testing-trophy/suite, then the suite holds the trophy", () => {
    const { status, stdout } = run(
      skill("testing-trophy", "check-trophy.mjs"),
      "testing-trophy/suite",
    );
    expect(stdout).toContain("TROPHY unit 0 · integration 1 · e2e 0 · static yes");
    expect(status).toBe(0);
  });
});
