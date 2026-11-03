import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

// The real skills CLI, run the way a user runs it, into a throwaway project and HOME. It downloads
// the CLI, so it runs only when asked: `pnpm test:e2e`.

const root = import.meta.dirname;
const skillsOnDisk = readdirSync(path.join(root, "plugins/arnaud-zg/skills")).sort();
let temp = "";

afterEach(() => {
  if (temp) rmSync(temp, { recursive: true, force: true });
});

describe.skipIf(!process.env.E2E)("installing with the skills CLI", () => {
  test("given this repository, when every skill is added for Codex and Cursor, then exactly the shipped skills land", () => {
    temp = mkdtempSync(path.join(tmpdir(), "skills-e2e-"));
    const { status, stdout, stderr } = spawnSync(
      "pnpm",
      ["dlx", "skills", "add", root, "--agent", "codex", "cursor", "--skill", "*", "-y"],
      { cwd: temp, env: { ...process.env, HOME: temp }, encoding: "utf8" },
    );
    expect(status, stdout + stderr).toBe(0);

    const installed = path.join(temp, ".agents/skills");
    const found = readdirSync(installed)
      .filter((name) => existsSync(path.join(installed, name, "SKILL.md")))
      .sort();
    expect(found).toEqual(skillsOnDisk);
  }, 120_000);
});
