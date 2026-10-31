// The testing trophy's shape, as pure functions over a project's test files.
//
//   static      the project has a type checker or a linter config
//   unlayered   every test file names its layer: .unit., .integration., .e2e. or under e2e/
//   inverted    integration files are at least as many as unit files
//   own-mock    no test mocks a module of the project (a relative path)
//   named       no test is titled with a bare function name
//
// Nothing here reads the disk: `check-trophy.mjs` does, and calls `inspectTrophy`.

/** @typedef {"static" | "unlayered" | "inverted" | "own-mock" | "named"} Rule */
/** @typedef {"unit" | "integration" | "e2e" | null} Layer */
/** @typedef {{ rule: Rule, file: string, line: number, message: string, fix: string }} Finding */

export const RULES = /** @type {const} */ ([
  "static",
  "unlayered",
  "inverted",
  "own-mock",
  "named",
]);

const OWN_MOCK = /\b(?:vi|jest)\.mock\(\s*["'`](\.{1,2}\/[^"'`]+)["'`]/g;
const BARE_TITLE = /\b(?:test|it)\(\s*["'`]([A-Za-z_$][\w$]*)["'`]/g;

/** The layer a test file's path names, or null. @returns {Layer} */
export function layerOf(/** @type {string} */ file) {
  if (/\.unit\.(test|spec)\./.test(file)) return "unit";
  if (/\.integration\.(test|spec)\./.test(file)) return "integration";
  if (/\.e2e\.(test|spec)\./.test(file) || /(^|\/)e2e\//.test(file)) return "e2e";
  return null;
}

/** @param {string} text @param {number} index */
const lineOf = (text, index) => text.slice(0, index).split("\n").length;

/**
 * @param {Map<string, string>} tests each test file's path and text
 * @param {{ hasStatic: boolean }} project
 */
export function inspectTrophy(tests, project) {
  /** @type {Finding[]} */
  const findings = [];
  /** @type {Record<"unit" | "integration" | "e2e", number>} */
  const counts = { unit: 0, integration: 0, e2e: 0 };
  if (!project.hasStatic) {
    findings.push({
      rule: "static",
      file: ".",
      line: 1,
      message: "no tsconfig.json and no ESLint config",
      fix: "add a type checker or a linter: the trophy's base catches typos for free",
    });
  }
  for (const [file, text] of tests) {
    const layer = layerOf(file);
    if (layer === null) {
      findings.push({
        rule: "unlayered",
        file,
        line: 1,
        message: `${file} names no layer`,
        fix: "rename it .unit.test, .integration.test or .e2e.test, by what it really runs",
      });
    } else counts[layer] += 1;
    for (const match of text.matchAll(OWN_MOCK)) {
      findings.push({
        rule: "own-mock",
        file,
        line: lineOf(text, match.index),
        message: `${file} mocks the project's own module ${match[1] ?? ""}`,
        fix: "use the real module; mock only what the project does not own",
      });
    }
    for (const match of text.matchAll(BARE_TITLE)) {
      findings.push({
        rule: "named",
        file,
        line: lineOf(text, match.index),
        message: `a test is titled "${match[1] ?? ""}", a name in the code`,
        fix: 'title it by the behaviour: "given …, when …, then …"',
      });
    }
  }
  if (counts.unit > counts.integration) {
    findings.push({
      rule: "inverted",
      file: ".",
      line: 1,
      message: `${String(counts.unit)} unit files against ${String(counts.integration)} integration`,
      fix: "move what the unit tests prove into integration tests that use the real modules",
    });
  }
  return { counts, findings };
}
