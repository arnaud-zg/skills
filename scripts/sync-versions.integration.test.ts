import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

// shiplane bumps package.json through changesets, then sync-versions copies the new version into
// every agent manifest. Run on a temporary copy of the plugin, so the real one is untouched.

const root = path.join(import.meta.dirname, "..");
const plugin = "plugins/arnaud-zg";
const MANIFESTS = [".claude-plugin", ".codex-plugin", ".cursor-plugin"];
let temp = "";

afterEach(() => {
  if (temp) rmSync(temp, { recursive: true, force: true });
});

const readVersion = (file: string) =>
  (JSON.parse(readFileSync(file, "utf8")) as { version: string }).version;

describe("a version bump", () => {
  test("given package.json at a new version, when sync-versions runs, then every agent manifest carries it", () => {
    temp = mkdtempSync(path.join(tmpdir(), "sync-versions-"));
    const copy = path.join(temp, plugin);
    mkdirSync(copy, { recursive: true });
    cpSync(path.join(root, plugin, "package.json"), path.join(copy, "package.json"));
    for (const dir of MANIFESTS)
      cpSync(path.join(root, plugin, dir), path.join(copy, dir), { recursive: true });

    const pkgPath = path.join(copy, "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };
    writeFileSync(pkgPath, JSON.stringify({ ...pkg, version: "99.1.0" }));

    const { status, stdout } = spawnSync(
      process.execPath,
      [path.join(root, "scripts/sync-versions.mjs")],
      { env: { ...process.env, RELEASE_ROOT: temp }, encoding: "utf8" },
    );

    expect(status, stdout).toBe(0);
    for (const dir of MANIFESTS) {
      expect(readVersion(path.join(copy, dir, "plugin.json")), dir).toBe("99.1.0");
    }
  });
});
