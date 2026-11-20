import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

import { findAdapters, findOneAdapter, projectRoot } from "./adapters.mjs";

let root: string | undefined;
afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
});

function projectWith(files: string[]) {
  root = realpathSync(mkdtempSync(path.join(os.tmpdir(), "adapters-")));
  for (const file of files) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), "---\nfulfils: x\n---\n");
  }
  return root;
}

const names = (found: { adapters: { name: string; from: string }[] }) =>
  found.adapters.map((adapter) => `${adapter.from}:${adapter.name}`);

describe("given a port that takes several adapters", () => {
  test("when the home, the legacy folder and the built-ins all hold some, then each name is taken once, the home first, sorted by name", () => {
    const cwd = projectWith([
      ".agents/adapters/big-o-optimizer/language.rust.md",
      ".big-o/adapters/language.zig.md",
      ".big-o/adapters/language.rust.md",
      "skill/adapters/language.go.md",
      "skill/adapters/language.rust.md",
      ".agents/adapters/big-o-optimizer/measure.bench.md",
    ]);
    const found = findAdapters({
      root: cwd,
      skill: "big-o-optimizer",
      port: "language",
      builtIn: path.join(cwd, "skill/adapters"),
    });
    expect(names(found)).toEqual(["built-in:go", "home:rust", "legacy:zig"]);
    expect(found.warnings).toEqual([
      expect.stringContaining(`legacy adapter folder ${cwd}/.big-o/adapters`),
      expect.stringContaining(".big-o/adapters/language.rust.md is shadowed by"),
    ]);
  });

  test("when nothing is dropped in, then only the built-ins are found and nothing warns", () => {
    const cwd = projectWith(["skill/adapters/language.go.md"]);
    const found = findAdapters({
      root: cwd,
      skill: "big-o-optimizer",
      port: "language",
      builtIn: path.join(cwd, "skill/adapters"),
    });
    expect(names(found)).toEqual(["built-in:go"]);
    expect(found.warnings).toEqual([]);
  });
});

describe("given a port that takes one adapter", () => {
  test("when a file is named, then it wins over every folder", () => {
    const cwd = projectWith([
      ".agents/adapters/stack-and-ship/project.acme.md",
      "elsewhere/mine.md",
    ]);
    const { adapter } = findOneAdapter({
      root: cwd,
      skill: "stack-and-ship",
      port: "project",
      named: [path.join(cwd, "elsewhere/mine.md")],
    });
    expect(adapter?.from).toBe("named");
  });

  test("when only the legacy folder holds one, then it is used and the warning names the home and the migrate script", () => {
    const cwd = projectWith([".stack-and-ship/adapters/project.acme.md"]);
    const { adapter, warnings } = findOneAdapter({
      root: cwd,
      skill: "stack-and-ship",
      port: "project",
    });
    expect(adapter?.from).toBe("legacy");
    expect(warnings).toEqual([
      expect.stringMatching(/\.agents\/adapters\/stack-and-ship with .*migrate-adapters\.mjs/),
    ]);
  });

  test("when the home and the legacy folder both hold one, then the home wins and the legacy copy is called out", () => {
    const cwd = projectWith([
      ".agents/adapters/stack-and-ship/project.acme.md",
      ".stack-and-ship/adapters/project.old.md",
    ]);
    const { adapter, warnings } = findOneAdapter({
      root: cwd,
      skill: "stack-and-ship",
      port: "project",
    });
    expect(adapter?.name).toBe("acme");
    expect(warnings).toEqual([expect.stringContaining("project.old.md is ignored, home wins")]);
  });

  test("when the home holds two, then it stops and lists both", () => {
    const cwd = projectWith([
      ".agents/adapters/stack-and-ship/project.a.md",
      ".agents/adapters/stack-and-ship/project.b.md",
    ]);
    expect(() => findOneAdapter({ root: cwd, skill: "stack-and-ship", port: "project" })).toThrow(
      /Expected one project adapter, found 2: .*project\.a\.md, .*project\.b\.md/,
    );
  });

  test("when no folder holds one, then there is none", () => {
    const cwd = projectWith([]);
    expect(findOneAdapter({ root: cwd, skill: "stack-and-ship", port: "project" })).toEqual({
      adapter: null,
      warnings: [],
    });
  });
});

describe("given files the lookup cannot take", () => {
  test("when a legacy project file breaks the name grammar, then it is skipped with a warning naming the rename, never dropped quietly", () => {
    const cwd = projectWith([".stack-and-ship/adapters/project.my_repo.md"]);
    const { adapter, warnings } = findOneAdapter({
      root: cwd,
      skill: "stack-and-ship",
      port: "project",
    });
    expect(adapter).toBeNull();
    expect(warnings).toEqual([
      expect.stringContaining("legacy adapter folder"),
      expect.stringContaining("project.my_repo.md is skipped: rename it to project.<name>.md"),
    ]);
  });

  test("when a named file is written for another port, then it is left out of this port and said so", () => {
    const cwd = projectWith(["mine/extra.lint.md", "mine/language.zig.md"]);
    const found = findAdapters({
      root: cwd,
      skill: "big-o-optimizer",
      port: "language",
      named: [path.join(cwd, "mine/extra.lint.md"), path.join(cwd, "mine/language.zig.md")],
    });
    expect(names(found)).toEqual(["named:zig"]);
    expect(found.warnings).toEqual([
      expect.stringContaining("extra.lint.md is skipped: it is named for another port"),
    ]);
  });
});

describe("given a folder outside any repository", () => {
  test("when its root is asked for, then the folder itself is the root", () => {
    const cwd = projectWith([]);
    expect(projectRoot(cwd)).toBe(cwd);
  });
});
