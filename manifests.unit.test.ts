import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

// One plugin, one manifest per agent. Claude Code and Copilot CLI read `.claude-plugin/`, Codex reads
// `.codex-plugin/`, Cursor reads `.cursor-plugin/`. A field that drifts between them shows a
// different plugin to each agent, so every agent manifest must say what the Claude one says.

const root = import.meta.dirname;
const pluginsDir = path.join(root, "plugins");
const AGENT_MANIFESTS = [".codex-plugin", ".cursor-plugin"];
const SHARED_FIELDS = ["name", "version", "description", "license", "repository"] as const;

const readJson = (file: string) =>
  JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>;

const pluginDirs = readdirSync(pluginsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe("a plugin's agent manifests", () => {
  test("given a plugin, when its Codex and Cursor manifests are read, then both exist", () => {
    for (const name of pluginDirs) {
      for (const dir of AGENT_MANIFESTS) {
        const file = path.join(pluginsDir, name, dir, "plugin.json");
        expect(existsSync(file), `plugins/${name}/${dir}/plugin.json is missing`).toBe(true);
      }
    }
  });

  test("given each agent manifest, when it is compared with the Claude one, then the shared fields match", () => {
    for (const name of pluginDirs) {
      const claude = readJson(path.join(pluginsDir, name, ".claude-plugin", "plugin.json"));
      for (const dir of AGENT_MANIFESTS) {
        const other = readJson(path.join(pluginsDir, name, dir, "plugin.json"));
        for (const field of SHARED_FIELDS) {
          expect(other[field], `plugins/${name}/${dir} ${field} differs`).toEqual(claude[field]);
        }
        expect(other.keywords, `plugins/${name}/${dir} keywords differ`).toEqual(claude.keywords);
      }
    }
  });
});
