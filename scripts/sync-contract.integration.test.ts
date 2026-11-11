import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const SYNC = path.join(import.meta.dirname, "sync-contract.mjs");
const SHELF = path.join(import.meta.dirname, "../plugins/arnaud-zg/skills");
let temp: string | undefined;
afterEach(() => {
  if (temp) rmSync(temp, { recursive: true, force: true });
});

const run = (...args: string[]) =>
  spawnSync(process.execPath, [SYNC, ...args], { encoding: "utf8" });

function shelfWith(contract: string) {
  temp = mkdtempSync(path.join(os.tmpdir(), "sync-contract-"));
  mkdirSync(path.join(temp, "hexagonal-architecture/domain"), { recursive: true });
  writeFileSync(path.join(temp, "hexagonal-architecture/domain/contract.md"), contract);
  mkdirSync(path.join(temp, "with-ports/ports"), { recursive: true });
  mkdirSync(path.join(temp, "without-ports"), { recursive: true });
  return temp;
}

describe("the contract copies", () => {
  test("given the shipped skills, then every copy matches hexagonal-architecture's contract", () => {
    const { status, stderr } = run("--check", SHELF);
    expect(stderr).toBe("");
    expect(status).toBe(0);
  });

  test("given a skill with ports and no copy, when checked, then it is named and it exits 1", () => {
    const { status, stderr } = run("--check", shelfWith("# The contract\n"));
    expect(stderr).toContain(path.join("with-ports", "ports", "CONTRACT.md"));
    expect(status).toBe(1);
  });

  test("given a skill with ports, when synced, then the copy is written only where ports exist", () => {
    const shelf = shelfWith("# The contract\n");
    expect(run(shelf).status).toBe(0);
    const copy = readFileSync(path.join(shelf, "with-ports/ports/CONTRACT.md"), "utf8");
    expect(copy).toMatch(/^<!-- Generated from the hexagonal-architecture skill/);
    expect(copy.endsWith("# The contract\n")).toBe(true);
    expect(run("--check", shelf).status).toBe(0);
  });

  test("given the source changed after a sync, when checked, then the copy has drifted", () => {
    const shelf = shelfWith("# The contract\n");
    run(shelf);
    cpSync(path.join(shelf, "with-ports"), path.join(shelf, "kept"), { recursive: true });
    writeFileSync(path.join(shelf, "hexagonal-architecture/domain/contract.md"), "# Changed\n");
    expect(run("--check", shelf).status).toBe(1);
  });
});
