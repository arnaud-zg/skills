import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const root = import.meta.dirname;
const pluginsDir = path.join(root, "plugins");

const readJson = (file: string) => JSON.parse(readFileSync(file, "utf8")) as Record<string, string>;

const pluginDirs = readdirSync(pluginsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const marketplace = readJson(path.join(root, ".claude-plugin", "marketplace.json")) as unknown as {
  plugins: { name: string; source: string }[];
};

// The plugin template is copied into plugins/ to start a new plugin, and every field in it has to
// be renamed by hand. Forgetting the package.json rename is silent: changesets would version a
// plugin under the template's name, or skip it entirely. These checks make that a test failure.
describe("a plugin added to the marketplace", () => {
  test("has a package.json named after its directory, so changesets can version it", () => {
    for (const name of pluginDirs) {
      const packageJsonPath = path.join(pluginsDir, name, "package.json");
      expect(existsSync(packageJsonPath), `plugins/${name} has no package.json`).toBe(true);
      expect(readJson(packageJsonPath).name).toBe(`@arnaud-zg/plugin-${name}`);
    }
  });

  test("has a shiplane.unit.yml, so `pnpm shiplane` tags and releases it", () => {
    // shiplane releases only the folders holding a unit file. Without one, a plugin is versioned by
    // changesets yet never tagged nor given release notes, and nothing says so.
    for (const name of pluginDirs) {
      const unitFile = path.join(pluginsDir, name, "shiplane.unit.yml");
      expect(existsSync(unitFile), `plugins/${name} has no shiplane.unit.yml`).toBe(true);
      expect(readFileSync(unitFile, "utf8")).toMatch(/^module: agent-plugin$/m);
    }
  });

  test("is private, so `changeset publish` never pushes it to npm", () => {
    for (const name of pluginDirs) {
      expect(readJson(path.join(pluginsDir, name, "package.json")).private).toBe(true);
    }
  });

  test("has a plugin manifest whose name matches its directory", () => {
    for (const name of pluginDirs) {
      const manifest = readJson(path.join(pluginsDir, name, ".claude-plugin", "plugin.json"));
      expect(manifest.name).toBe(name);
    }
  });

  test("carries the same version in package.json and plugin.json", () => {
    // Changesets bumps package.json and writes the changelog against it; Claude Code installs
    // whatever plugin.json says. shiplane's agentPlugin() copies one into the other in the release
    // PR, so a mismatch means a version was edited by hand.
    for (const name of pluginDirs) {
      const pkg = readJson(path.join(pluginsDir, name, "package.json"));
      const manifest = readJson(path.join(pluginsDir, name, ".claude-plugin", "plugin.json"));
      expect(manifest.version, `plugins/${name} versions disagree`).toBe(pkg.version);
    }
  });

  test("has a name without `--`, so its `<name>--v<version>` tag reads one way only", () => {
    for (const name of pluginDirs) expect(name, `plugins/${name}`).not.toContain("--");
  });

  test("is listed in the marketplace catalogue, and nothing is listed that isn't there", () => {
    expect([...pluginDirs].sort()).toEqual([...marketplace.plugins.map((p) => p.name)].sort());
  });

  test("keeps its version out of the catalogue entry, so plugin.json is the only place it lives", () => {
    // Claude Code reads plugin.json's version before the entry's, so a version here is ignored at
    // install time and can only go stale.
    for (const entry of marketplace.plugins) {
      expect(entry, `marketplace entry ${entry.name} has a version`).not.toHaveProperty("version");
    }
  });

  test("has a changelog section for its version, so its GitHub release has real notes", () => {
    // shiplane reads a release's notes from this section. A later release writes it from commits; a
    // new plugin has none to read, so it carries its own from the template.
    for (const name of pluginDirs) {
      const pkg = readJson(path.join(pluginsDir, name, "package.json"));
      const changelog = path.join(pluginsDir, name, "CHANGELOG.md");
      expect(existsSync(changelog), `plugins/${name} has no CHANGELOG.md`).toBe(true);
      expect(readFileSync(changelog, "utf8"), `plugins/${name} ${pkg.version}`).toContain(
        `\n## ${pkg.version}\n`,
      );
    }
  });
});

describe("the plugin template", () => {
  test("stays outside plugins/, so it is never versioned, tagged or listed", () => {
    expect(pluginDirs).not.toContain("plugin-template");
    expect(existsSync(path.join(root, "templates", "plugin-template", "package.json"))).toBe(true);
  });

  test("starts at 0.1.0 with its changelog, so a plugin copied from it releases as it stands", () => {
    const template = path.join(root, "templates", "plugin-template");
    expect(readJson(path.join(template, "package.json")).version).toBe("0.1.0");
    expect(readJson(path.join(template, ".claude-plugin", "plugin.json")).version).toBe("0.1.0");
    expect(readFileSync(path.join(template, "CHANGELOG.md"), "utf8")).toContain("\n## 0.1.0\n");
  });
});
