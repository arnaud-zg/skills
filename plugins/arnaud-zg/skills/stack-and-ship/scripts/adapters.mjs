// Copied byte for byte into each skill that looks adapters up; a skill alone cannot import one.

/**
 * Finds the adapters a project drops in for a skill, at `<root>/.agents/adapters/<skill>/<port>.<name>.md`.
 * The source is hexagonal-architecture's copy; a test at the marketplace root fails when another
 * copy drifts. It reads the disk only: no network, no writes.
 *
 * Order, first match wins for each `<port>.<name>`:
 *   1. a file the caller names (`--project`, `--adapter`, or a path in the request)
 *   2. the home, `.agents/adapters/<skill>/`
 *   3. the legacy folder, `.<skill>/adapters/` (or a skill's old alias), read with a warning
 *   4. the skill's built-in `adapters/`
 * @module
 */

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";

/** The one folder, under a project's root, that holds every skill's project adapters. */
export const HOME = ".agents/adapters";

/** Lowercase words joined by hyphens: a port, a name, a skill. */
export const KEBAB = "[a-z0-9]+(?:-[a-z0-9]+)*";

const FILE = new RegExp(`^(${KEBAB})\\.(${KEBAB})\\.md$`);

/** Folder names a skill used before the home existed, besides `.<skill>/`. */
export const ALIASES = /** @type {Record<string, string[]>} */ ({ "big-o-optimizer": ["big-o"] });

/** The command that moves legacy folders into the home, named in every legacy warning. */
export const MIGRATE = "node <hexagonal-skill-builder>/scripts/migrate-adapters.mjs";

/**
 * @typedef {"named" | "home" | "legacy" | "built-in"} Source
 * @typedef {{ port: string, name: string, path: string, from: Source }} Adapter
 * @typedef {{ root: string, skill: string, port: string, named?: string[], builtIn?: string }} Query
 * @typedef {{ adapters: Adapter[], warnings: string[] }} Found
 */

/** A file's port and name from its file name, or null when it is not `<port>.<name>.md`. */
export function parseAdapterName(/** @type {string} */ file) {
  const match = FILE.exec(basename(file));
  return match ? { port: match[1] ?? "", name: match[2] ?? "" } : null;
}

/** The `fulfils` value of an adapter's frontmatter, or null when it has none. */
export function readFulfils(/** @type {string} */ text) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text)?.[1];
  if (front === undefined) return null;
  const value = /^fulfils:[ \t]*(.*)$/m.exec(front)?.[1]?.trim() ?? "";
  return value.replace(/^(["'])(.*)\1$/, "$2") || null;
}

/** A skill's folder in the home. */
export const adapterHome = (/** @type {string} */ root, /** @type {string} */ skill) =>
  join(root, HOME, skill);

/** The folders a skill used before the home, by its name and its aliases. */
export const legacyHomes = (/** @type {string} */ root, /** @type {string} */ skill) =>
  [skill, ...(ALIASES[skill] ?? [])].map((folder) => join(root, `.${folder}`, "adapters"));

/** The repository's top folder, or the folder itself outside a repository. */
export function projectRoot(cwd = process.cwd()) {
  const git = spawnSync("git", ["rev-parse", "--show-toplevel"], { cwd, encoding: "utf8" });
  return git.status === 0 && git.stdout.trim() !== "" ? git.stdout.trim() : cwd;
}

/**
 * The `<port>.<name>.md` files of one port in a folder, sorted by name, and a warning for each
 * `<port>.*.md` whose name breaks the grammar, so a file the old lookup took is never lost quietly.
 * @param {string} dir @param {string} port @param {Source} from
 * @returns {{ adapters: Adapter[], skipped: string[] }}
 */
function inFolder(dir, port, from) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return { adapters: [], skipped: [] };
  const files = readdirSync(dir).sort();
  /** @type {Adapter[]} */
  const adapters = files.flatMap((file) => {
    const parsed = parseAdapterName(file);
    return parsed?.port === port ? [{ ...parsed, path: join(dir, file), from }] : [];
  });
  const skipped = files
    .filter((file) => file.startsWith(`${port}.`) && file.endsWith(".md"))
    .filter((file) => parseAdapterName(file) === null)
    .map(
      (file) =>
        `${join(dir, file)} is skipped: rename it to ${port}.<name>.md, lowercase words joined by hyphens`,
    );
  return { adapters, skipped };
}

/**
 * Every level that holds an adapter for the port, in the order they win, and the warnings about
 * files that were looked at and left out.
 * @param {Query} query
 * @returns {{ found: { from: Source, adapters: Adapter[], warnings: string[] }[], skipped: string[] }}
 */
function levels({ root, skill, port, named = [], builtIn }) {
  const other = named.filter((path) => {
    const parsed = parseAdapterName(path);
    return parsed !== null && parsed.port !== port;
  });
  /** @type {Adapter[]} */
  const given = named
    .filter((path) => !other.includes(path))
    .map((path) => ({
      port,
      name: parseAdapterName(path)?.name ?? basename(path, ".md"),
      path,
      from: "named",
    }));
  const home = inFolder(adapterHome(root, skill), port, "home");
  const legacy = legacyHomes(root, skill).map((dir) => {
    const inside = inFolder(dir, port, "legacy");
    const warning = `legacy adapter folder ${dir}: move it to ${adapterHome(root, skill)} with ${MIGRATE}`;
    const used = inside.adapters.length > 0 || inside.skipped.length > 0;
    return { from: /** @type {Source} */ ("legacy"), ...inside, warnings: used ? [warning] : [] };
  });
  const builtInside =
    builtIn === undefined ? { adapters: [], skipped: [] } : inFolder(builtIn, port, "built-in");
  const found = [
    { from: /** @type {Source} */ ("named"), adapters: given, warnings: [] },
    { from: /** @type {Source} */ ("home"), adapters: home.adapters, warnings: [] },
    ...legacy,
    { from: /** @type {Source} */ ("built-in"), adapters: builtInside.adapters, warnings: [] },
  ];
  const skipped = [
    ...other.map((path) => `${path} is skipped: it is named for another port than ${port}`),
    ...home.skipped,
    ...legacy.flatMap((level) => level.skipped),
  ];
  const legacyOnlySkipped = legacy
    .filter((level) => level.adapters.length === 0)
    .flatMap((level) => level.warnings);
  return {
    found: found.filter((level) => level.adapters.length > 0),
    skipped: [...legacyOnlySkipped, ...skipped],
  };
}

/**
 * Every adapter for a port that takes several: one per name, the first level that has it winning,
 * sorted by name so the order never depends on the disk.
 * @param {Query} query
 * @returns {Found}
 */
export function findAdapters(query) {
  /** @type {Map<string, Adapter>} */
  const byName = new Map();
  /** @type {string[]} */
  const warnings = [];
  const { found, skipped } = levels(query);
  for (const level of found) {
    warnings.push(...level.warnings);
    for (const adapter of level.adapters) {
      const winner = byName.get(adapter.name);
      if (winner === undefined) {
        byName.set(adapter.name, adapter);
        continue;
      }
      if (adapter.from === "legacy")
        warnings.push(`${adapter.path} is shadowed by ${winner.path}: delete the legacy copy`);
    }
  }
  const adapters = [...byName.values()].sort((a, b) => (a.name < b.name ? -1 : 1));
  return { adapters, warnings: [...new Set([...warnings, ...skipped])] };
}

/**
 * The one adapter for a port picked by its file alone: one adapter, no default, such as `project`.
 * A port with a default is picked by the binding instead, so never call this for one. The first
 * level that has any wins, and a level holding several stops, listing them. Null when none has one.
 * @param {Query} query
 * @returns {{ adapter: Adapter | null, warnings: string[] }}
 */
export function findOneAdapter(query) {
  const { found, skipped } = levels(query);
  const [first, ...rest] = found;
  if (first === undefined) return { adapter: null, warnings: skipped };
  const ignored = rest
    .filter((level) => level.from === "legacy")
    .flatMap((level) => level.adapters)
    .map((adapter) => `${adapter.path} is ignored, ${first.from} wins: delete the legacy copy`);
  if (first.adapters.length > 1) {
    const paths = first.adapters.map((adapter) => adapter.path).join(", ");
    throw new Error(
      `Expected one ${query.port} adapter, found ${String(first.adapters.length)}: ${paths}. Keep one, or name it.`,
    );
  }
  return {
    adapter: first.adapters[0] ?? null,
    warnings: [...new Set([...first.warnings, ...ignored, ...skipped])],
  };
}
