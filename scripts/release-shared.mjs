/**
 * Helpers shared by `scripts/release-version.mjs` and `scripts/release.mjs`. Not a release step.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

// RELEASE_ROOT lets a test run a release step on a temporary copy of the repository.
export const root = process.env.RELEASE_ROOT ?? path.resolve(import.meta.dirname, "..");

export const readJson = (file) => JSON.parse(readFileSync(path.join(root, file), "utf8"));

export const fail = (message) => {
  console.error(`\n${message}`);
  process.exit(1);
};

// A failed step has already printed its own output; a stack trace on top of it only buries that.
process.on("uncaughtException", (error) =>
  fail(`${error.message}\n\nFix that, then run it again.`),
);

// Runs quietly and returns stdout.
export const run = (file, args) => {
  try {
    return execFileSync(file, args, { cwd: root, stdio: "pipe" }).toString().trim();
  } catch (error) {
    // execFileSync throws with the child's output attached as Buffers. Surface it: the useful
    // message ("uncommitted changes affecting this release") comes from the child, not from here.
    const output = [error.stdout, error.stderr]
      .map((buffer) => buffer?.toString().trim())
      .filter(Boolean);
    throw new Error([`${file} ${args.join(" ")} failed`, ...output].join("\n"));
  }
};

// Runs with the terminal attached, for steps worth watching or that may prompt (an npm OTP).
export const runVisible = (file, args) => execFileSync(file, args, { cwd: root, stdio: "inherit" });

export const succeeds = (file, args) => {
  try {
    run(file, args);
    return true;
  } catch {
    return false;
  }
};

// Every manifest an agent reads a plugin's version from. sync-versions writes them all, and
// `pnpm release` refuses to tag while any of them disagrees with `.claude-plugin/plugin.json`.
export const MANIFEST_DIRS = [".claude-plugin", ".codex-plugin", ".cursor-plugin"];

// The manifests of a plugin whose version is not `version`, as `<dir>/<manifest>: <found>` lines.
export const versionDrift = (dir, version) =>
  MANIFEST_DIRS.map((manifestDir) => `${dir}/${manifestDir}/plugin.json`)
    .filter((file) => existsSync(path.join(root, file)))
    .map((file) => [file, readJson(file).version])
    .filter(([, found]) => found !== version)
    .map(([file, found]) => `${file}: ${found}`);

// Every plugin in the changesets flow: a directory under plugins/ with a package.json.
export const plugins = () =>
  readdirSync(path.join(root, "plugins"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `plugins/${entry.name}`)
    .filter((dir) => existsSync(path.join(root, dir, "package.json")))
    .map((dir) => {
      const manifest = readJson(`${dir}/.claude-plugin/plugin.json`);
      return { dir, name: manifest.name, version: manifest.version };
    });

// Both release commands work from an up-to-date main with nothing uncommitted, so what they version
// or tag is exactly what is on origin/main.
export const startFromMain = () => {
  if (run("git", ["status", "--porcelain"])) fail("Commit or stash your changes first.");
  run("git", ["switch", "main"]);
  run("git", ["pull", "--ff-only"]);
};
