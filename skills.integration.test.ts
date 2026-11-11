import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

// The skills this marketplace ships are held to the rules its own hexagonal-skill-builder checks, by the
// same script a person runs, so the shelf never asks of others what it does not do itself.

const root = import.meta.dirname;
const check = path.join(root, "plugins/arnaud-zg/skills/hexagonal-skill-builder/scripts/check.mjs");

function run(...args: string[]) {
  return spawnSync(process.execPath, [check, ...args], { cwd: root, encoding: "utf8" });
}

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? filesUnder(full) : [full];
  });
}

const docsCheck = path.join(root, "plugins/arnaud-zg/skills/doc-compass/scripts/check-docs.mjs");

describe("the docs this marketplace ships", () => {
  test("every set in doc-compass.json holds its own doc-compass rules", () => {
    const { status, stdout } = spawnSync(process.execPath, [docsCheck, "--json"], {
      cwd: root,
      encoding: "utf8",
    });
    const report = JSON.parse(stdout) as { sets: unknown[]; findings: unknown[] };
    expect(report.sets.length).toBeGreaterThan(0);
    expect(report.findings).toEqual([]);
    expect(status).toBe(0);
  });
});

describe("the skills this marketplace ships", () => {
  test("installed alone, every link to another skill is marked optional, or the page says what to do without it", () => {
    const shelf = path.join(root, "plugins/arnaud-zg/skills");
    const unmarked: string[] = [];
    for (const skill of readdirSync(shelf)) {
      const own = path.join(shelf, skill);
      for (const file of filesUnder(own).filter((f) => f.endsWith(".md"))) {
        const text = readFileSync(file, "utf8");
        const lines = text.split("\n");
        lines.forEach((line, i) => {
          for (const match of line.matchAll(/\]\(([^)\s#]+)/g)) {
            const link = match[1];
            const target = path.resolve(path.dirname(file), link);
            if (/^[a-z]+:/i.test(link) || target.startsWith(own + path.sep)) continue;
            const other = path.relative(shelf, target).split(path.sep)[0] ?? "";
            const near = lines.slice(Math.max(0, i - 1), i + 2).join(" ");
            const fallback = new RegExp(`if ${other} is not installed`, "i").test(text);
            if (!/if\s+installed/i.test(near) && !fallback)
              unmarked.push(`${path.relative(root, file)}:${String(i + 1)} → ${other}`);
          }
        });
      }
    }
    expect(unmarked).toEqual([]);
  });

  test("every dependency inside them points inward, by hexagonal-architecture's check", () => {
    const layers = path.join(
      root,
      "plugins/arnaud-zg/skills/hexagonal-architecture/scripts/check-layers.mjs",
    );
    const { status, stdout } = spawnSync(
      process.execPath,
      [layers, "plugins/arnaud-zg/skills", "--json"],
      { cwd: root, encoding: "utf8" },
    );
    const report = JSON.parse(stdout) as { findings: unknown[] };
    expect(report.findings).toEqual([]);
    expect(status).toBe(0);
  });

  test("every one holds the four rules: named, small, resolves, tested", () => {
    const { status, stdout } = run("--json");
    const report = JSON.parse(stdout) as { findings: unknown[] };
    expect(report.findings).toEqual([]);
    expect(status).toBe(0);
  });

  test("the template's skill holds them too, so a plugin copied from it starts clean", () => {
    expect(run("templates/plugin-template/skills").status).toBe(0);
  });

  test("the template's skill stays out of the skills CLI's listings, so nobody installs a TODO", () => {
    const entries = filesUnder(path.join(root, "templates")).filter((file) =>
      file.endsWith("SKILL.md"),
    );
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(readFileSync(entry, "utf8"), entry).toMatch(/^metadata:\n\s+internal: true$/m);
    }
  });
});
