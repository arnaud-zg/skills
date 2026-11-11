import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

// The contract copies are rewritten by the pre-commit hook in lefthook.yml and checked here, in
// `pnpm test`, so a copy out of step fails even when the hook did not run.

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

  test("given a relative link in the source, then nothing is copied and it exits 1", () => {
    const cwd = project(
      "See [the rules](rules.md), [a heading](#a-port) and [the web](https://example.com).\n",
    );
    const { status, stderr } = sync(cwd);
    expect(stderr).toContain("links to rules.md");
    expect(stderr).not.toContain("#a-port");
    expect(status).toBe(1);
    expect(sync(cwd, "--check").status).toBe(1);
  });

  test("given no contract to copy, then it says so and exits 2", () => {
    const cwd = project();
    rmSync(path.join(cwd, SOURCE));
    expect(sync(cwd).status).toBe(2);
  });
});
