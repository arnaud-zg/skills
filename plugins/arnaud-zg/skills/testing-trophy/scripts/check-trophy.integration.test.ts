import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const CHECK = path.join(import.meta.dirname, "check-trophy.mjs");
let project: string | undefined;
afterEach(() => {
  if (project) rmSync(project, { recursive: true, force: true });
});

function projectWith(files: Record<string, string>) {
  project = mkdtempSync(path.join(os.tmpdir(), "testing-trophy-"));
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(project, file)), { recursive: true });
    writeFileSync(path.join(project, file), text);
  }
  return project;
}

const run = (cwd: string, ...args: string[]) =>
  spawnSync(process.execPath, [CHECK, ...args], { cwd, encoding: "utf8" });

describe("given a project", () => {
  test("when its suite holds the trophy, then the counts print and it exits 0", () => {
    const cwd = projectWith({ "tsconfig.json": "{}", "src/a.integration.test.ts": "" });
    const { status, stdout } = run(cwd);
    expect(stdout).toContain("TROPHY unit 0 · integration 1 · e2e 0 · static yes");
    expect(status).toBe(0);
  });

  test("when a test mocks its own module, then the file and line print and it exits 1", () => {
    const cwd = projectWith({
      "tsconfig.json": "{}",
      "src/a.integration.test.ts": '\nvi.mock("./db");\n',
    });
    const { status, stdout } = run(cwd);
    expect(stdout).toContain("src/a.integration.test.ts:2  own-mock");
    expect(status).toBe(1);
  });

  test("when it holds a link to nothing, then the link is stepped over", () => {
    const cwd = projectWith({ "tsconfig.json": "{}", "a.integration.test.ts": "" });
    symlinkSync(path.join(cwd, "nowhere"), path.join(cwd, "broken"));
    expect(run(cwd).status).toBe(0);
  });

  test("when it holds no test file, then it says so and exits 2", () => {
    expect(run(projectWith({ "a.ts": "" })).status).toBe(2);
  });
});
