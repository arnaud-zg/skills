import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const CHECK = path.join(import.meta.dirname, "check-layers.mjs");
let project: string | undefined;
afterEach(() => {
  if (project) rmSync(project, { recursive: true, force: true });
});

function projectWith(files: Record<string, string>) {
  project = mkdtempSync(path.join(os.tmpdir(), "hexagonal-architecture-"));
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(project, file)), { recursive: true });
    writeFileSync(path.join(project, file), text);
  }
  return project;
}

const run = (cwd: string, ...args: string[]) =>
  spawnSync(process.execPath, [CHECK, ...args], { cwd, encoding: "utf8" });

describe("given a project", () => {
  test("when every dependency points inward, then the counts print and it exits 0", () => {
    const cwd = projectWith({
      "src/domain/order.ts": "export type Order = {};",
      "src/adapters/db.ts": 'import "../domain/order.ts";',
    });
    const { status, stdout } = run(cwd);
    expect(stdout).toContain("LAYERS domain 1 · ports 0 · application 0 · adapters 1");
    expect(stdout).toContain("✓ every dependency points inward.");
    expect(status).toBe(0);
  });

  test("when the domain imports an adapter, then the file and line print and it exits 1", () => {
    const cwd = projectWith({ "src/domain/order.ts": '\nimport "../adapters/db.ts";' });
    const { status, stdout } = run(cwd);
    expect(stdout).toContain("src/domain/order.ts:2  outward");
    expect(status).toBe(1);
  });

  test("when --layers names the project's own folders, then they are the layers", () => {
    const cwd = projectWith({ "model/a.ts": 'import "../web/b.ts";' });
    const { status, stdout } = run(cwd, "--layers", "model,web", ".");
    expect(stdout).toContain("model/a.ts:1  outward");
    expect(status).toBe(1);
  });

  test("when --json is passed, then the findings print as JSON", () => {
    const cwd = projectWith({ "src/domain/a.ts": 'import "../adapters/b.ts";' });
    const out = JSON.parse(run(cwd, "--json").stdout) as { findings: { rule: string }[] };
    expect(out.findings.map(({ rule }) => rule)).toEqual(["outward"]);
  });

  test("when it holds a link to nothing, then the link is stepped over", () => {
    const cwd = projectWith({ "src/domain/a.ts": "" });
    symlinkSync(path.join(cwd, "nowhere"), path.join(cwd, "broken"));
    expect(run(cwd).status).toBe(0);
  });

  test("when no file sits in a layer folder, then it says so and exits 2", () => {
    expect(run(projectWith({ "src/a.ts": "" })).status).toBe(2);
  });
});
