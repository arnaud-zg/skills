import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

// Each agent finds the skills its own way: Claude Code and Copilot CLI through
// `.claude-plugin/marketplace.json`, Codex through `.agents/plugins/marketplace.json`, Cursor through
// `.cursor-plugin/marketplace.json`, and every other agent through the skills CLI. These tests follow
// each path on disk, the way the agent would, and expect to land on the same skills.

const root = import.meta.dirname;
const skillsDir = path.join(root, "plugins/arnaud-zg/skills");
const skillsOnDisk = readdirSync(skillsDir).sort();

type Json = Record<string, unknown>;
const readJson = (file: string) => JSON.parse(readFileSync(path.join(root, file), "utf8")) as Json;

const skillsUnder = (dir: string) =>
  readdirSync(dir)
    .filter((name) => existsSync(path.join(dir, name, "SKILL.md")))
    .sort();

const frontmatter = (file: string) => readFileSync(file, "utf8").split("\n---")[0] ?? "";

describe("each agent's marketplace", () => {
  test("given the Codex marketplace, when its plugin source and skills path are followed, then they reach every skill", () => {
    const market = readJson(".agents/plugins/marketplace.json") as {
      plugins: { name: string; source: { source: string; path: string } }[];
    };
    expect(market.plugins.map((p) => p.name)).toEqual(["arnaud-zg"]);
    for (const entry of market.plugins) {
      expect(entry.source.source).toBe("local");
      const manifest = readJson(path.join(entry.source.path, ".codex-plugin/plugin.json"));
      expect(manifest.name).toBe(entry.name);
      const found = skillsUnder(path.join(root, entry.source.path, String(manifest.skills)));
      expect(found).toEqual(skillsOnDisk);
    }
  });

  test("given the Cursor marketplace, when its plugin root and skills path are followed, then they reach every skill", () => {
    const market = readJson(".cursor-plugin/marketplace.json") as {
      metadata: { pluginRoot: string };
      plugins: { name: string; source: string }[];
    };
    for (const entry of market.plugins) {
      const dir = path.join(market.metadata.pluginRoot, entry.source);
      const manifest = readJson(path.join(dir, ".cursor-plugin/plugin.json"));
      expect(manifest.name).toBe(entry.name);
      expect(skillsUnder(path.join(root, dir, String(manifest.skills)))).toEqual(skillsOnDisk);
    }
  });

  test("given the three marketplaces, when their plugin names are listed, then they list the same plugins", () => {
    const names = (file: string) =>
      (readJson(file) as { plugins: { name: string }[] }).plugins.map((p) => p.name).sort();
    const claude = names(".claude-plugin/marketplace.json");
    expect(names(".agents/plugins/marketplace.json")).toEqual(claude);
    expect(names(".cursor-plugin/marketplace.json")).toEqual(claude);
  });
});

describe("the skills in any agent", () => {
  test("given a SKILL.md that runs a script by ${CLAUDE_SKILL_DIR}, when another agent reads it, then it says what that folder is", () => {
    for (const name of skillsOnDisk) {
      const text = readFileSync(path.join(skillsDir, name, "SKILL.md"), "utf8");
      if (!text.includes("${CLAUDE_SKILL_DIR}")) continue;
      expect(text, `${name} uses CLAUDE_SKILL_DIR without saying what it is`).toMatch(
        /`\$\{CLAUDE_SKILL_DIR\}` is this skill's folder\..*in another agent/,
      );
    }
  });

  test("given each SKILL.md, when its frontmatter is read, then it carries the name and description every agent needs", () => {
    for (const name of skillsOnDisk) {
      const head = frontmatter(path.join(skillsDir, name, "SKILL.md"));
      expect(head, name).toMatch(new RegExp(`^name: ${name}$`, "m"));
      expect(head, name).toMatch(/^description:/m);
    }
  });

  test("given an example skill outside plugins/*/skills, when the skills CLI scans the repo, then it is marked internal and stays hidden", () => {
    const examples = path.join(root, "plugins/arnaud-zg/examples");
    const stack = [examples];
    while (stack.length) {
      const dir = stack.pop() as string;
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) stack.push(full);
        else if (entry.name === "SKILL.md")
          expect(frontmatter(full), path.relative(root, full)).toMatch(/^\s+internal: true$/m);
      }
    }
  });
});

describe("the install instructions", () => {
  const AGENT_COMMANDS = [
    "/plugin install arnaud-zg --marketplace arnaud-zg/skills",
    "codex plugin marketplace add arnaud-zg/skills",
    "copilot plugin marketplace add arnaud-zg/skills",
    "npx skills add arnaud-zg/skills",
  ];

  for (const file of ["README.md", "plugins/arnaud-zg/README.md", "llms.txt"]) {
    test(`given ${file}, when its install commands are read, then each agent has one`, () => {
      const text = readFileSync(path.join(root, file), "utf8");
      for (const command of AGENT_COMMANDS) expect(text, `${file}: ${command}`).toContain(command);
      expect(text, `${file}: Cursor`).toMatch(/Cursor/);
    });
  }
});
