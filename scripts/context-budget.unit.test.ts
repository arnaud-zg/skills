import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { check, description } from "./context-budget.mjs";

function repo(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "budget-"));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

describe("context budget", () => {
  it("passes this repository", () => {
    expect(check(process.cwd())).toEqual([]);
  });

  it("flags an always-loaded file over 2 KB", () => {
    const findings = check(repo({ "CLAUDE.md": "x".repeat(3000) }));
    expect(findings).toMatchObject([{ path: "CLAUDE.md", kind: "always-loaded", max: 2048 }]);
  });

  it("flags a skill description over 1024 characters", () => {
    const root = repo({
      "skills/a/SKILL.md": `---\nname: a\ndescription: ${"w ".repeat(600)}\n---\n`,
    });
    expect(check(root)).toMatchObject([{ kind: "skill description" }]);
  });

  it("ignores pages outside a budget", () => {
    expect(check(repo({ "notes/big.md": "x".repeat(50000) }))).toEqual([]);
  });

  it("reads a folded description", () => {
    expect(description("---\nname: a\ndescription:\n  one\n  two\nother: b\n---\n")).toBe(
      "one two",
    );
  });
});
