/**
 * Propagate versions after `changeset version`.
 *
 * Changesets owns `package.json` versions and changelogs. It knows nothing about each plugin's agent
 * manifests: `.claude-plugin/plugin.json` (Claude Code and Copilot CLI), `.codex-plugin/plugin.json`
 * (Codex) and `.cursor-plugin/plugin.json` (Cursor). Every one present gets the package.json version.
 * Marketplace entries carry no version — plugin.json would override it anyway — so there is nothing
 * to sync into the catalogue.
 *
 * shiplane runs it right after `changeset version` while it opens the release PR (see
 * `shiplane.config.ts`), never on its own.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// RELEASE_ROOT lets a test run it on a temporary copy of the repository.
const root = process.env.RELEASE_ROOT ?? path.resolve(import.meta.dirname, "..");
const MANIFEST_DIRS = [".claude-plugin", ".codex-plugin", ".cursor-plugin"];

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

// Every plugin changesets versions: a directory under plugins/ with a package.json.
const pluginDirs = readdirSync(path.join(root, "plugins"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(root, "plugins", entry.name))
  .filter((dir) => existsSync(path.join(dir, "package.json")));

const changed = [];

for (const dir of pluginDirs) {
  const { version } = readJson(path.join(dir, "package.json"));
  for (const manifestDir of MANIFEST_DIRS) {
    const manifestPath = path.join(dir, manifestDir, "plugin.json");
    if (!existsSync(manifestPath)) continue;
    const manifest = readJson(manifestPath);
    if (manifest.version !== version) {
      manifest.version = version;
      writeJson(manifestPath, manifest);
      changed.push(`${path.relative(root, dir)}/${manifestDir}/plugin.json → ${version}`);
    }
  }
}

console.info(changed.length ? changed.map((line) => `  ${line}`).join("\n") : "  nothing to sync");
