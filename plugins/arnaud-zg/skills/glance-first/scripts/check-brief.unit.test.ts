// The brief check as a person runs it: a file in, every finding with its field and fix out, and an
// exit code a caller can branch on.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, it } from "vitest";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "check-brief.mjs");
const folder = mkdtempSync(join(tmpdir(), "glance-first-"));
afterAll(() => rmSync(folder, { recursive: true, force: true }));

const good = {
  title: "Release gate moves",
  target: "pr-description",
  tldr: "Good idea. One thing to fix: the check runs too late.",
  numbers: [{ value: "1 step", label: "moved earlier" }],
  blocks: [
    {
      heading: "The check runs earlier",
      line: "The check now runs before the release.",
      picture: {
        kind: "table",
        rows: [
          ["Before", "After"],
          ["After release", "Before release"],
        ],
      },
    },
  ],
  sources: { read: ["the proposal"], notRead: [], notTested: "Nothing was run." },
};

function run(...args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });
  return { code: result.status, out: result.stdout, err: result.stderr };
}

function fileWith(name, text) {
  const path = join(folder, name);
  writeFileSync(path, text);
  return path;
}

describe("checking a brief file", () => {
  it("given a brief within its limits, then it prints the read size and exits 0", () => {
    const { code, out } = run(fileWith("good.json", JSON.stringify(good)));
    assert.equal(code, 0);
    assert.match(out, /^BRIEF OK \d+\/200 words, 1\/4 blocks, target pr-description$/m);
  });

  it("given a brief over its limits, then each finding names its field and fix, and it exits 1", () => {
    const bad = { ...good, title: "one two three four five", tldr: "" };
    const { code, out } = run(fileWith("bad.json", JSON.stringify(bad)));
    assert.equal(code, 1);
    assert.match(out, /^BRIEF 2 findings$/m);
    assert.match(out, /^ {2}title: .+ → .+$/m);
    assert.match(out, /^ {2}tldr: .+ → .+$/m);
  });

  it("given a file that is not JSON, then it says so as a finding and exits 1", () => {
    const { code, out } = run(fileWith("broken.json", "{ not json"));
    assert.equal(code, 1);
    assert.match(out, /^ {2}\(file\): .+ → .+$/m);
  });

  it("given a path to nothing, then it says so as a finding and exits 1", () => {
    const { code, out } = run(join(folder, "missing.json"));
    assert.equal(code, 1);
    assert.match(out, /\(file\)/);
  });

  it("given no path, then it prints its usage and exits 2", () => {
    const { code, err } = run();
    assert.equal(code, 2);
    assert.match(err, /usage: .*check-brief\.mjs <brief\.json>/);
  });
});
