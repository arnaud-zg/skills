// The dependency rule of a hexagon, as pure functions over a project's files: every import and
// every Markdown link points inward, never outward.
//
//   rank 0  domain        what stays true       (domain, core, entities)
//   rank 1  ports         what the core asks    (ports)
//   rank 2  application   what the core does    (application, usecases, use-cases, verbs)
//   rank 3  adapters      how the world answers (adapters, infrastructure, infra)
//
// An edge from a file to one of a higher rank is `outward`. A file in no layer folder, or named as
// wiring (`PORTS.md`, `main.*`, `composition*`), is the composition root and may point anywhere.
//
// Nothing here reads the disk: `check-layers.mjs` does, and calls `inspectLayers`.

/** @typedef {{ rule: "outward", file: string, line: number, message: string, fix: string }} Finding */
/** @typedef {{ name: string, rank: number }} Layer */

export const DEFAULT_LAYERS =
  "domain|core|entities,ports,application|usecases|use-cases|verbs,adapters|infrastructure|infra";

const WIRING = /^(PORTS\.md|main\.[\w.]+|composition[\w.-]*)$/;

/** What each kind of file points with, by extension. */
const SOURCES = {
  js: [
    /\b(?:import|export)\s[^"'`;]*?\bfrom\s*["'`]([^"'`]+)["'`]/g,
    /\bimport\s*["'`]([^"'`]+)["'`]/g,
    /\b(?:require|import)\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  ],
  py: [/^\s*from\s+([.\w]+)\s+import\b/gm, /^\s*import\s+([\w.]+)\s*$/gm],
  go: [/^\s*(?:import\s+)?(?:[\w.]+\s+)?"([^"\s]+)"\s*$/gm],
  md: [/\]\(([^)\s#]+)(?:#[^)]*)?\)/g],
};

/** The kind of a file, by its extension, or null when the check does not read it. */
export function kindOf(/** @type {string} */ file) {
  const ext = /\.(\w+)$/.exec(file)?.[1] ?? "";
  if (/^[cm]?[jt]sx?$/.test(ext)) return "js";
  if (ext === "py" || ext === "go" || ext === "md") return ext;
  return null;
}

/** Parses `a|b,c,d` into a map of folder name to its layer, innermost first. */
export function parseLayers(/** @type {string} */ spec) {
  /** @type {Map<string, Layer>} */
  const byFolder = new Map();
  spec.split(",").forEach((group, rank) => {
    const names = group
      .split("|")
      .map((name) => name.trim())
      .filter(Boolean);
    for (const folder of names) byFolder.set(folder, { name: names[0] ?? folder, rank });
  });
  return byFolder;
}

/** The layer a path sits in: its last segment that names one, or null. */
export function layerOf(/** @type {string} */ path, /** @type {Map<string, Layer>} */ layers) {
  const segments = path.split("/");
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const layer = layers.get(segments[i] ?? "");
    if (layer) return layer;
  }
  return null;
}

/** Every place a file points at, with its line. */
export function edgesOf(/** @type {string} */ file, /** @type {string} */ text) {
  const kind = kindOf(file);
  /** @type {{ target: string, line: number }[]} */
  const edges = [];
  if (!kind) return edges;
  for (const pattern of SOURCES[kind]) {
    for (const match of text.matchAll(pattern)) {
      const target = match[1] ?? "";
      if (!target || /^[a-z]+:/i.test(target)) continue;
      edges.push({ target, line: text.slice(0, match.index).split("\n").length });
    }
  }
  return edges.sort((a, b) => a.line - b.line);
}

/**
 * Where a target lands, as a path from the root. A relative target joins the folder of `from`; a
 * Python module (`..adapters.db`, `app.adapters.db`) becomes a path; anything else is kept, so a
 * package such as `example.com/app/adapters/db` still names its layer.
 */
export function resolveTarget(/** @type {string} */ from, /** @type {string} */ target) {
  let path = target;
  if (kindOf(from) === "py") {
    const dots = /^\.*/.exec(target)?.[0].length ?? 0;
    const rest = target.slice(dots).replace(/\./g, "/");
    if (dots === 0) return rest;
    path = `${"../".repeat(dots - 1) || "./"}${rest}`;
  }
  if (!path.startsWith(".")) return path;
  const parts = from.split("/").slice(0, -1);
  for (const part of path.split("/")) {
    if (part === "..") parts.pop();
    else if (part !== "." && part !== "") parts.push(part);
  }
  return parts.join("/");
}

/**
 * @param {Map<string, string>} files each file's path, relative to the root, and its text
 * @param {string} [spec] the layers, innermost first, `|` between a layer's folder names
 */
export function inspectLayers(files, spec = DEFAULT_LAYERS) {
  const layers = parseLayers(spec);
  /** @type {Finding[]} */
  const findings = [];
  /** @type {Record<string, number>} */
  const counts = {};
  for (const { name } of layers.values()) counts[name] = 0;
  for (const [file, text] of files) {
    const from = layerOf(file.split("/").slice(0, -1).join("/"), layers);
    if (!from) continue;
    counts[from.name] = (counts[from.name] ?? 0) + 1;
    if (WIRING.test(file.split("/").pop() ?? "")) continue;
    for (const { target, line } of edgesOf(file, text)) {
      // A target with an extension is a file: its folder names the layer, not its own name.
      const landed = resolveTarget(file, target);
      const to = layerOf(
        /\.\w+$/.test(landed) ? landed.split("/").slice(0, -1).join("/") : landed,
        layers,
      );
      if (!to || to.rank <= from.rank) continue;
      findings.push({
        rule: "outward",
        file,
        line,
        message: `${from.name} points out at ${to.name}: ${target}`,
        fix: `name what ${from.name} needs as a port, and let the ${to.name} side fill it`,
      });
    }
  }
  return { counts, findings };
}
