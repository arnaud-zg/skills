// The plain-language check as a person runs it: a file or stdin in, every finding with its line,
// rule and fix out, and an exit code a caller can branch on.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "check-plain.mjs");
const folder = mkdtempSync(join(tmpdir(), "plain-language-"));
afterAll(() => rmSync(folder, { recursive: true, force: true }));

function run(args: string[], input?: string) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8", input });
  return { code: result.status, out: result.stdout, err: result.stderr };
}

function fileWith(name: string, text: string) {
  const path = join(folder, name);
  writeFileSync(path, text);
  return path;
}

describe("checking a text file", () => {
  it("given plain text, then it prints its size and level and exits 0", () => {
    const { code, out } = run([fileWith("good.md", "Remove the step. Nobody owns it.\n")]);
    expect(code).toBe(0);
    expect(out).toMatch(/^PLAIN OK 2 sentences, longest 3\/25 words \(standard, en\)$/m);
  });

  it("given text that breaks the rules, then each finding names its line, rule and fix, and it exits 1", () => {
    const text = "Intro.\n\n1. The step runs; it is really slow.\n";
    const { code, out } = run(["--level", "strict", fileWith("bad.md", text)]);
    expect(code).toBe(1);
    expect(out).toMatch(/^PLAIN 3 findings \(strict, en\)$/m);
    expect(out).toMatch(/^ {2}3: joined: .+ → .+$/m);
    expect(out).toMatch(/^ {2}3: filler: "really" .+ → .+$/m);
    expect(out).toMatch(/^ {2}3: step: .+ → .+$/m);
  });

  it("given only a passive sentence, then the hint is printed and it still exits 0", () => {
    const { code, out } = run(["-"], "The file was deleted.\n");
    expect(code).toBe(0);
    expect(out).toMatch(/^ {2}hint 1: passive: .+ → .+$/m);
  });

  it("given --json, then the report is JSON with its level and language", () => {
    const { code, out } = run(["--json", "--lang", "fr", "-"], "Il convient de lancer le test.\n");
    expect(code).toBe(1);
    expect(JSON.parse(out)).toMatchObject({
      level: "standard",
      lang: "fr",
      findings: [{ rule: "filler" }],
    });
  });

  it("given no file, an unknown level or a missing file, then it prints the usage and exits 2", () => {
    expect(run([]).code).toBe(2);
    expect(run(["--level", "loose", "-"], "x").code).toBe(2);
    const missing = run([join(folder, "none.md")]);
    expect(missing.code).toBe(2);
    expect(missing.err).toMatch(/^cannot read /);
  });
});
