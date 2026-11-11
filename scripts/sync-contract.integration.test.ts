import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

// The contract copies are guarded twice: by this script's --check in `pnpm test`, and by the
// pre-commit hook in lefthook.yml, which rewrites them. Both run here as a person runs them, the
// hook in a throwaway git repository with this repository's lefthook.yml.

const ROOT = path.join(import.meta.dirname, "..");
const SYNC = path.join(import.meta.dirname, "sync-contract.mjs");
const SOURCE = "plugins/p/skills/hexagonal-architecture/domain/contract.md";
const COPY = "plugins/p/skills/with-ports/ports/CONTRACT.md";
let repo = "";
afterEach(() => {
  if (repo) rmSync(repo, { recursive: true, force: true });
});

const sync = (cwd: string, ...args: string[]) =>
  spawnSync(process.execPath, [SYNC, ...args], { cwd, encoding: "utf8" });

/** A repository folder with the contract's owner, a skill with ports, one without, a dead link. */
function project(contract = "# Contract\n") {
  repo = mkdtempSync(path.join(os.tmpdir(), "sync-contract-"));
  const shelf = path.join(repo, "plugins/p/skills");
  mkdirSync(path.join(shelf, "hexagonal-architecture/domain"), { recursive: true });
  writeFileSync(path.join(repo, SOURCE), contract);
  mkdirSync(path.join(shelf, "with-ports/ports"), { recursive: true });
  writeFileSync(path.join(shelf, "with-ports/ports/PORTS.md"), "# Ports\n");
  mkdirSync(path.join(shelf, "without-ports"));
  symlinkSync(path.join(shelf, "nowhere"), path.join(shelf, "broken"));
  return repo;
}

describe("the contract copies", () => {
  test("given this repository, then every copy matches hexagonal-architecture's contract", () => {
    const { status, stderr } = sync(ROOT, "--check");
    expect(stderr).toBe("");
    expect(status).toBe(0);
  });

  test("given a skill with ports and no copy, when checked, then it is named and it exits 1", () => {
    const { status, stderr } = sync(project(), "--check");
    expect(stderr).toContain(path.join("with-ports", "ports", "CONTRACT.md"));
    expect(status).toBe(1);
  });

  test("given a sync, then only skills with ports get the copy, and a second run writes nothing", () => {
    const cwd = project();
    expect(sync(cwd).status).toBe(0);
    const copy = readFileSync(path.join(cwd, COPY), "utf8");
    expect(copy).toMatch(/^<!-- Generated from the hexagonal-architecture skill/);
    expect(copy.endsWith("# Contract\n")).toBe(true);
    expect(sync(cwd).stdout).toBe("✓ every contract copy matches its source.\n");
  });

  test("given no contract to copy, then it says so and exits 2", () => {
    const cwd = project();
    rmSync(path.join(cwd, SOURCE));
    expect(sync(cwd).status).toBe(2);
  });
});

describe("the pre-commit hook", () => {
  /** A git repository with the project, the sync script and this repository's lefthook.yml. */
  function gitProject() {
    const cwd = project();
    mkdirSync(path.join(cwd, "scripts"));
    copyFileSync(SYNC, path.join(cwd, "scripts/sync-contract.mjs"));
    copyFileSync(path.join(ROOT, "lefthook.yml"), path.join(cwd, "lefthook.yml"));
    symlinkSync(path.join(ROOT, "node_modules"), path.join(cwd, "node_modules"));
    const git = (...args: string[]) =>
      spawnSync(
        "git",
        ["-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false", ...args],
        { cwd, encoding: "utf8" },
      );
    git("init", "-q");
    sync(cwd);
    git("add", "plugins", "scripts", "lefthook.yml");
    git("commit", "-qn", "-m", "start");
    const hook = () =>
      spawnSync(
        path.join(ROOT, "node_modules/.bin/lefthook"),
        ["run", "pre-commit", "--command", "contract", "--no-tty", "--no-auto-install"],
        { cwd, encoding: "utf8" },
      );
    const staged = () => git("diff", "--cached", "--name-only").stdout.trim();
    return { cwd, git, hook, staged };
  }

  test("given the source is changed and staged, then the hook rewrites every copy and stages it", () => {
    const { cwd, git, hook, staged } = gitProject();
    appendFileSync(path.join(cwd, SOURCE), "\nOne more rule.\n");
    git("add", SOURCE);
    expect(hook().status).toBe(0);
    expect(staged().split("\n")).toEqual([SOURCE, COPY]);
    expect(readFileSync(path.join(cwd, COPY), "utf8").endsWith("One more rule.\n")).toBe(true);
  });

  test("given a copy is edited by hand and staged, then the hook puts it back to the source", () => {
    const { cwd, git, hook, staged } = gitProject();
    appendFileSync(path.join(cwd, COPY), "drift\n");
    git("add", COPY);
    expect(hook().status).toBe(0);
    expect(staged()).toBe("");
    expect(sync(cwd, "--check").status).toBe(0);
  });
}, 30_000);
