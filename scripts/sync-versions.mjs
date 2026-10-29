/**
 * Propagate versions after `changeset version`.
 *
 * Changesets owns `package.json` versions and changelogs. It knows nothing about each plugin's
 * `.claude-plugin/plugin.json`, the version Claude Code installs and `claude plugin tag` tags.
 * Marketplace entries carry no version — plugin.json would override it anyway — so there is nothing
 * to sync into the catalogue.
 *
 * Run as part of `pnpm release:version`, never on its own.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { plugins, root } from "./release-shared.mjs";

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const changed = [];

for (const { dir } of plugins()) {
  const { version } = readJson(path.join(root, dir, "package.json"));
  const manifestPath = path.join(root, dir, ".claude-plugin", "plugin.json");
  const manifest = readJson(manifestPath);
  if (manifest.version !== version) {
    manifest.version = version;
    writeJson(manifestPath, manifest);
    changed.push(`${dir}/.claude-plugin/plugin.json → ${version}`);
  }
}

console.info(changed.length ? changed.map((line) => `  ${line}`).join("\n") : "  nothing to sync");
