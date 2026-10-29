/**
 * `pnpm release` — tag and announce whatever the merged release PR versioned.
 *
 * It works out what is new by itself: every plugin version that has no GitHub release yet. For each
 * one it tags `<name>--v<version>` through `claude plugin tag`, which validates the plugin first,
 * pushes the tag, and creates the GitHub release with the changelog section as its notes. Nothing
 * goes to npm: a plugin reached users when the release PR merged.
 *
 * Every step is safe to repeat, so a release that stopped halfway is finished by running
 * `pnpm release` again.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { fail, plugins, root, run, startFromMain, succeeds } from "./release-shared.mjs";

startFromMain();

// The section changesets wrote for this version.
const changelogSection = (dir, version) => {
  const file = path.join(root, dir, "CHANGELOG.md");
  if (!existsSync(file)) return undefined;
  return readFileSync(file, "utf8").split(`\n## ${version}\n`)[1]?.split("\n## ")[0]?.trim();
};

// One listing rather than a `gh release view` per tag: that fails the same way for "no such release"
// and "not logged in", and the second must stop the release rather than look like work to do.
const released = new Set(
  run("gh", ["release", "list", "--limit", "1000", "--json", "tagName", "--jq", ".[].tagName"])
    .split("\n")
    .filter(Boolean),
);

// A plugin at 0.0.0 has never been versioned: its first version comes from a changeset, through
// `pnpm release:version`, like every later one. Until then there is nothing to release.
const releases = plugins()
  .filter((plugin) => plugin.version !== "0.0.0")
  .map((plugin) => ({
    tag: `${plugin.name}--v${plugin.version}`,
    notes: changelogSection(plugin.dir, plugin.version),
    plugin,
  }))
  .filter((release) => !released.has(release.tag));

if (releases.length === 0) {
  console.info("Nothing to release: every current version already has a GitHub release.");
  process.exit(0);
}

for (const { tag, notes } of releases) {
  if (!notes) fail(`No changelog section for ${tag}. Did the \`pnpm release:version\` PR merge?`);
}

for (const { tag, plugin } of releases) {
  if (succeeds("git", ["rev-parse", "-q", "--verify", `refs/tags/${tag}`])) continue;
  run("claude", ["plugin", "tag", plugin.dir]);
}

run("git", ["push", "origin", ...releases.map(({ tag }) => `refs/tags/${tag}`)]);

for (const { tag, notes } of releases) {
  run("gh", ["release", "create", tag, "--verify-tag", "--title", tag, "--notes", notes]);
  console.info(`  released ${tag}`);
}
