// Checks the adapters a project drops in for its skills, against the contract's one convention:
//
//   <root>/.agents/adapters/<skill>/<port>.<name>.md, with `fulfils: <port>` in its frontmatter
//
//   name     every file is <port>.<name>.md, inside a folder named for a skill
//   fulfils  its frontmatter says `fulfils:`, and it names the file's port
//   skill    the folder is named for a skill this project, or this skill's own shelf, holds
//   port     the port is a row of that skill's ports/PORTS.md
//   one      a port that takes one adapter and has no default holds one file, never several
//   legacy   no `.<skill>/adapters/` folder is left at the root
//
// `inspectAdapters` is pure; `scanAdapters` and `knownSkills` read the disk for it.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { ALIASES, HOME, KEBAB, parseAdapterName, readFulfils } from "./adapters.mjs";
import { placesFor } from "./shelf.mjs";

export const CHECKS = /** @type {const} */ (["name", "fulfils", "skill", "port", "one", "legacy"]);

/**
 * @typedef {(typeof CHECKS)[number]} Check
 * @typedef {{ check: Check, path: string, line: number, message: string, fix: string }} Finding
 * @typedef {{ path: string, text: string }} File
 * @typedef {{ files: File[], legacy: string[] }} Scan
 * @typedef {Map<string, string | null>} Skills a skill's name to its ports/PORTS.md, or null
 */

const MIGRATE = "node <hexagonal-skill-builder>/scripts/migrate-adapters.mjs --write";
const LEGACY = new RegExp(`^\\.(${KEBAB})$`);
const isDir = (/** @type {string} */ path) => existsSync(path) && statSync(path).isDirectory();

/**
 * The ports a PORTS.md declares: each row of its first table headed `Port`, with whether the port
 * takes one adapter and has no default, so that only being the one file there picks it.
 * @param {string} text
 * @returns {Map<string, { onlyByFile: boolean }>}
 */
export function portsOf(text) {
  /** @type {Map<string, { onlyByFile: boolean }>} */
  const ports = new Map();
  /** @type {string[] | null} */
  let header = null;
  for (const line of text.split("\n")) {
    if (!line.startsWith("|")) {
      if (header !== null && ports.size > 0) break;
      header = null;
      continue;
    }
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (header === null) {
      header = cells[0]?.toLowerCase() === "port" ? cells.map((cell) => cell.toLowerCase()) : [];
      continue;
    }
    const port = /^`([^`]+)`$/.exec(cells[0] ?? "")?.[1];
    if (port === undefined || header.length === 0) continue;
    const count = cells[header.findIndex((cell) => cell === "count" || cell === "how many")];
    const fallback = cells[header.indexOf("default")];
    const one = count !== undefined && /^(?:1|0\.\.1)$/.test(count);
    ports.set(port, { onlyByFile: one && fallback?.toLowerCase() === "none" });
  }
  return ports;
}

/** @param {string} text */
const lineOfFulfils = (text) => {
  const index = text.search(/^fulfils:/m);
  return index < 0 ? 1 : text.slice(0, index).split("\n").length;
};

/**
 * Every finding in a project's adapters, sorted by path then check.
 * @param {Scan} scan paths from the project's root
 * @param {Skills} skills
 * @returns {Finding[]}
 */
export function inspectAdapters(scan, skills) {
  /** @type {Finding[]} */
  const findings = [];
  /** @type {(check: Check, path: string, line: number, message: string, fix: string) => void} */
  const add = (check, path, line, message, fix) => {
    findings.push({ check, path, line, message, fix });
  };
  /** @type {Map<string, string[]>} */
  const byPort = new Map();

  for (const { path, text } of scan.files) {
    const [skill, file, ...deeper] = path.slice(HOME.length + 1).split("/");
    if (file === undefined || deeper.length > 0) {
      add(
        "name",
        path,
        1,
        "an adapter sits outside a skill's folder",
        `move it to ${HOME}/<skill>/<port>.<name>.md`,
      );
      continue;
    }
    const parsed = parseAdapterName(file);
    if (parsed === null) {
      add(
        "name",
        path,
        1,
        `${file} is not <port>.<name>.md`,
        "rename it to lowercase-hyphen words, e.g. project.acme.md",
      );
      continue;
    }
    const fulfils = readFulfils(text);
    if (fulfils === null)
      add(
        "fulfils",
        path,
        1,
        "the frontmatter has no fulfils key",
        `start it with ---, fulfils: ${parsed.port}, ---`,
      );
    else if (fulfils !== parsed.port)
      add(
        "fulfils",
        path,
        lineOfFulfils(text),
        `fulfils: ${fulfils}, but the file is named for the ${parsed.port} port`,
        `set fulfils: ${parsed.port}, or rename the file`,
      );

    const skillPage = skills.get(skill ?? "");
    if (skillPage === undefined) {
      add(
        "skill",
        path,
        1,
        `no skill named ${skill ?? ""} is installed here`,
        "rename the folder for the skill, or pass --skills <folder that holds it>",
      );
      continue;
    }
    if (skillPage === null) {
      add(
        "port",
        path,
        1,
        `${skill ?? ""} has no ports/PORTS.md, so it takes no adapters`,
        "remove the file, or add the port to the skill",
      );
      continue;
    }
    const port = portsOf(skillPage).get(parsed.port);
    if (port === undefined) {
      add(
        "port",
        path,
        1,
        `${skill ?? ""} has no ${parsed.port} port`,
        `use a port its ports/PORTS.md lists: ${[...portsOf(skillPage).keys()].join(", ")}`,
      );
      continue;
    }
    if (port.onlyByFile) {
      const key = `${skill ?? ""}/${parsed.port}`;
      byPort.set(key, [...(byPort.get(key) ?? []), path]);
    }
  }

  for (const [key, paths] of byPort) {
    if (paths.length < 2) continue;
    for (const path of paths)
      add(
        "one",
        path,
        1,
        `${key} takes one adapter, and ${String(paths.length)} are here`,
        "keep one, and pass any other with --project",
      );
  }

  for (const dir of scan.legacy) {
    const folder = dir.split("/")[0] ?? dir;
    const old = folder.slice(1);
    const skill = Object.keys(ALIASES).find((name) => ALIASES[name]?.includes(old)) ?? old;
    add(
      "legacy",
      dir,
      1,
      `${folder}/ is the old home of ${skill}'s adapters`,
      `move them to ${HOME}/${skill}/ with ${MIGRATE}`,
    );
  }

  return findings.sort((a, b) =>
    a.path === b.path
      ? CHECKS.indexOf(a.check) - CHECKS.indexOf(b.check)
      : a.path < b.path
        ? -1
        : 1,
  );
}

/** Every file under a folder, by its posix path from the root. */
function filesUnder(/** @type {string} */ root, /** @type {string} */ dir) {
  /** @type {string[]} */
  const found = [];
  for (const name of readdirSync(join(root, dir)).sort()) {
    const path = `${dir}/${name}`;
    if (isDir(join(root, path))) found.push(...filesUnder(root, path));
    else found.push(path);
  }
  return found;
}

/**
 * What a project holds: every file in the home, and every legacy `.<x>/adapters` folder at the
 * root that holds an adapter.
 * @param {string} root
 * @returns {Scan}
 */
export function scanAdapters(root) {
  const files = isDir(join(root, HOME))
    ? filesUnder(root, HOME).map((path) => ({ path, text: readFileSync(join(root, path), "utf8") }))
    : [];
  const legacy = readdirSync(root)
    .sort()
    .filter((name) => LEGACY.test(name) && name !== ".agents")
    .map((name) => `${name}/adapters`)
    .filter(
      (dir) =>
        isDir(join(root, dir)) &&
        readdirSync(join(root, dir)).some((file) => parseAdapterName(file) !== null),
    );
  return { files, legacy };
}

/**
 * The skills an adapter may be written for: those under the project's conventional places, then
 * each extra shelf, such as the one this skill is installed on. The first of a name wins.
 * @param {string} root
 * @param {string[]} shelves
 * @returns {Skills}
 */
export function knownSkills(root, shelves) {
  /** @type {Skills} */
  const skills = new Map();
  const places = [placesFor(root), ...shelves.filter(isDir).map((dir) => placesFor(root, dir))];
  for (const found of places) {
    if (typeof found === "string") continue;
    for (const place of found) {
      for (const name of place.skills) {
        if (skills.has(name)) continue;
        const ports = join(place.dir, name, "ports", "PORTS.md");
        skills.set(name, existsSync(ports) ? readFileSync(ports, "utf8") : null);
      }
    }
  }
  return skills;
}
