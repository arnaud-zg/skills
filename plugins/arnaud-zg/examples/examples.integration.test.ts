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

type Allowed = { allowed: (users: { id: number }[], banned: number[]) => { id: number }[] };

describe("the examples the docs show", () => {
  test("given install/settings.json, then it turns on arnaud-zg from this marketplace, pinned to a release tag", () => {
    const settings = JSON.parse(readFileSync(example("install/settings.json"), "utf8")) as {
      extraKnownMarketplaces: Record<string, { source: { repo: string; ref: string } }>;
      enabledPlugins: Record<string, boolean>;
    };
    const market = settings.extraKnownMarketplaces["arnaud-zg-skills"];
    expect(market.source.repo).toBe("arnaud-zg/skills");
    expect(market.source.ref).toMatch(/^arnaud-zg--v\d+\.\d+\.\d+$/);
    expect(settings.enabledPlugins).toEqual({ "arnaud-zg@arnaud-zg-skills": true });
  });

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

  test("given plain-language/before.md, then the strict check finds 4 findings, and after.md holds", () => {
    const before = run(
      skill("plain-language", "check-plain.mjs"),
      "--level",
      "strict",
      example("plain-language/before.md"),
    );
    expect(before.stdout).toContain("PLAIN 4 findings (strict, en)");
    expect(before.status).toBe(1);
    const after = run(
      skill("plain-language", "check-plain.mjs"),
      "--level",
      "strict",
      example("plain-language/after.md"),
    );
    expect(after.stdout).toContain("PLAIN OK 4 sentences, longest 5/20 words (strict, en)");
    expect(after.status).toBe(0);
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

  test("given big-o-optimizer/before.mjs and after.mjs, then the O(n+m) rewrite returns the same users", async () => {
    const before = (await import(example("big-o-optimizer/before.mjs"))) as Allowed;
    const after = (await import(example("big-o-optimizer/after.mjs"))) as Allowed;
    const users = [{ id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }];
    for (const banned of [[], [2], [1, 3, 4]]) {
      expect(after.allowed(users, banned)).toEqual(before.allowed(users, banned));
    }
  });

  test("given big-o-optimizer/adapters/extra.eslint.md, then it is an extra adapter that runs after verify", () => {
    const text = readFileSync(example("big-o-optimizer/adapters/extra.eslint.md"), "utf8");
    expect(text).toMatch(/^---\nfulfils: extra\nstep: after verify\n---/);
  });

  test("given big-o-optimizer/adapters/language.rust.md, then it is a language adapter for .rs files", () => {
    const text = readFileSync(example("big-o-optimizer/adapters/language.rust.md"), "utf8");
    expect(text).toMatch(/^---\nfulfils: language\nmatches: \.rs\n---/);
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

  test("given stack-and-ship/body.md and Acme's adapter, then the PR holds every house rule", () => {
    const { status, stdout } = run(
      skill("stack-and-ship", "check-pr.mjs"),
      "--title",
      "fix(cart): [S30-04] totals round once, so the cart and the receipt agree",
      "--branch",
      "fix/S30-04-totals-round-once",
      "--body",
      example("stack-and-ship/body.md"),
      "--project",
      example("stack-and-ship/project.acme.md"),
    );
    expect(stdout).toContain("✓ the PR holds every house rule this script checks");
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

  test("given hexagonal-architecture/before, then the domain importing an adapter is flagged", () => {
    const { status, stdout } = run(
      skill("hexagonal-architecture", "check-layers.mjs"),
      "hexagonal-architecture/before",
    );
    expect(stdout).toContain("domain/order.mjs:2  outward");
    expect(status).toBe(1);
  });

  test("given hexagonal-architecture/after, then every dependency points inward and the total holds", async () => {
    const { status, stdout } = run(
      skill("hexagonal-architecture", "check-layers.mjs"),
      "hexagonal-architecture/after",
    );
    expect(stdout).toContain("LAYERS domain 1 · ports 1 · application 1 · adapters 1");
    expect(status).toBe(0);
    const main = (await import(example("hexagonal-architecture/after/main.mjs"))) as {
      run: () => number;
    };
    expect(main.run()).toBe(4);
  });
});
