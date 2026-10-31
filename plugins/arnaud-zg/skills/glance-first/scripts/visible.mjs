// The words a reader sees in a brief, field by field: what the banned-character scan reads. Never
// the target, a picture's kind or source file, or chart syntax. Pure; `brief.mjs` uses it.
//
//   import { visibleTexts, footerTexts, mermaidLabels } from "./visible.mjs";
//   visibleTexts(brief)    -> [[field, text]] for every reader-visible field, the footer included
//   footerTexts(brief)     -> [[field, text]] for the convention's footer alone
//   mermaidLabels(source)  -> every line of a chart a reader sees, with only its syntax taken out

// Read inverted: every line is seen except pure styling, and only syntax tokens are taken out, so a
// chart type or a label place nobody listed is still read.
const STYLE = /^\s*(%%|classDef\b|class\b|linkStyle\b|style\b)/;
const DIAGRAM =
  /^\s*(?:(?:flowchart|graph)(?:\s+(?:LR|RL|TB|TD|BT))?|sequenceDiagram|timeline|quadrantChart|xychart-beta|stateDiagram-v2|stateDiagram|classDiagram|erDiagram|gantt|journey|mindmap|gitGraph)(?=\s|$)/;
const KEYWORD =
  /^\s*(?:participant|actor|loop|alt|else|opt|par|and|critical|break|rect|end|subgraph|section|title|x-axis|y-axis|quadrant-[1-4]|pie|showData|bar|line|note\s+(?:left of|right of|over)|accTitle:?|accDescr:?)(?=\s|$)/i;
const ALIAS = /^\s*[\w-]+\s+as\s+/;
const ARROW = /<?(?:-\.+-?>?|\.+->|={2,}>?|-{2,}[>xo)]?>?|-+>{1,2}|-[x)])[+-]?\|?/g;
const EDGE_CLOSE = /\|(?=\s|$)/g;
const SHAPE_OPEN = /[\w-]+(?:\[\[|\[\(|\[\/|\[\\|\(\(|\(\[|\{\{|[[({>])/g;
const SHAPE_CLOSE = /(?:\]\]|\)\]|\]\)|\/\]|\\\]|\)\)|\}\}|[\])}])(?=\s|$)/g;
const CLASS_SHORTHAND = /:::[\w-]+/g;

/** @param {any} value @returns {any[]} */
const listOf = (value) => (Array.isArray(value) ? value : []);
/** @param {any} value @returns {value is string} */
const isString = (value) => typeof value === "string";

/** @param {string} line */
function withoutKeywords(line) {
  let rest = line;
  while (KEYWORD.test(rest)) rest = rest.replace(KEYWORD, "");
  return rest.replace(ALIAS, "");
}

/** @param {string} line */
function withoutSyntax(line) {
  return withoutKeywords(line)
    .replace(ARROW, " ")
    .replace(EDGE_CLOSE, " ")
    .replace(CLASS_SHORTHAND, " ")
    .replace(SHAPE_OPEN, " ")
    .replace(SHAPE_CLOSE, " ")
    .replaceAll('"', " ");
}

/** Every line but styling, the diagram type and syntax tokens (arrows, shapes, keywords) taken out. * @param {string} source
 * @returns {string[]}
 */
export function mermaidLabels(source) {
  return source
    .split("\n")
    .filter((line) => line.trim() !== "" && !STYLE.test(line))
    .map((line, index) => (index === 0 ? line.replace(DIAGRAM, "") : line))
    .map(withoutSyntax);
}

/** @param {any} brief @returns {any[][]} */
export function footerTexts(brief) {
  const footer = brief?.convention?.footer;
  if (isString(footer)) return [["convention.footer", footer]];
  return listOf(footer).map((line, index) => [`convention.footer[${index}]`, line]);
}

/** @param {any} picture @param {string} field @returns {any[][]} */
function pictureTexts(picture, field) {
  if (picture?.kind === "image") return [[`${field}.alt`, picture.alt]];
  if (picture?.kind === "mermaid" && isString(picture.source)) {
    return [[`${field}.source`, mermaidLabels(picture.source).join("\n")]];
  }
  if (picture?.kind !== "table") return [];
  return listOf(picture.rows).flatMap((row, rowIndex) =>
    listOf(row).map((cell, cellIndex) => [`${field}.rows[${rowIndex}][${cellIndex}]`, cell]),
  );
}

/** @param {any} entries @param {string} field @param {string[]} keys @returns {any[][]} */
function pairTexts(entries, field, keys) {
  return listOf(entries).flatMap((entry, index) =>
    keys.map((key) => [`${field}[${index}].${key}`, entry?.[key]]),
  );
}

/** @param {any} block @param {number} index @returns {any[][]} */
function blockTexts(block, index) {
  const field = `blocks[${index}]`;
  return [
    [`${field}.heading`, block?.heading],
    [`${field}.line`, block?.line],
    ...pictureTexts(block?.picture, `${field}.picture`),
    ...pairTexts(block?.copy, `${field}.copy`, ["label", "text"]),
  ];
}

/** @param {any} sources @returns {any[][]} */
function sourceTexts(sources) {
  return [
    ...listOf(sources?.read).map((text, index) => [`sources.read[${index}]`, text]),
    ...listOf(sources?.notRead).map((text, index) => [`sources.notRead[${index}]`, text]),
    ["sources.notTested", sources?.notTested],
  ];
}

/** @param {any} brief @returns {any[][]} */
export function visibleTexts(brief) {
  return [
    ["title", brief?.title],
    ["tldr", brief?.tldr],
    ...pairTexts(brief?.numbers, "numbers", ["value", "label"]),
    ...listOf(brief?.blocks).flatMap(blockTexts),
    ...pairTexts(brief?.fold, "fold", ["heading", "text"]),
    ...sourceTexts(brief?.sources),
    ...footerTexts(brief),
  ].filter(([, text]) => isString(text));
}
