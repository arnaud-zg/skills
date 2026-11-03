/**
 * Propagate versions after `changeset version`.
 *
 * Changesets owns `package.json` versions and changelogs. It knows nothing about each plugin's agent
 * manifests: `.claude-plugin/plugin.json` (Claude Code and Copilot CLI, and what `claude plugin tag`
 * tags), `.codex-plugin/plugin.json` (Codex) and `.cursor-plugin/plugin.json` (Cursor). Every one
 * present gets the package.json version.
 * Marketplace entries carry no version — plugin.json would override it anyway — so there is nothing
 * to sync into the catalogue.
 *
 * Run as part of `pnpm release:version`, never on its own.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { MANIFEST_DIRS, plugins, root } from "./release-shared.mjs";

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const changed = [];

for (const { dir } of plugins()) {
  const { version } = readJson(path.join(root, dir, "package.json"));
  for (const manifestDir of MANIFEST_DIRS) {
    const manifestPath = path.join(root, dir, manifestDir, "plugin.json");
    if (!existsSync(manifestPath)) continue;
    const manifest = readJson(manifestPath);
    if (manifest.version !== version) {
      manifest.version = version;
      writeJson(manifestPath, manifest);
      changed.push(`${dir}/${manifestDir}/plugin.json → ${version}`);
    }
  }
}

console.info(changed.length ? changed.map((line) => `  ${line}`).join("\n") : "  nothing to sync");
