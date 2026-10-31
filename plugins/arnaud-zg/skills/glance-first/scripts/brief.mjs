// The rules of a one-minute brief: what makes it valid, and how the words a reader actually reads
// are counted against the budget. Pure: no I/O, so every rule is testable. `domain/brief.md` is the
// page these rules hold, and `check-brief.mjs` runs them on a file.
//
//   import { validateBrief, readWords, LIMITS, TARGETS } from "./brief.mjs";
//   validateBrief(brief)  -> [{ field, message, fix }], empty when the brief holds
//   readWords(brief)      -> the words a reader reads: title, TLDR, numbers, headings, lines, cells
//
// An optional `convention` ({ lead, headings, picture, banned, footer }) holds a caller's own format on top
// of the brief: `domain/brief.md` says what each field means.

import { footerTexts, visibleTexts } from "./visible.mjs";

/**
 * @typedef {{ field: string, message: string, fix: string }} Finding
 * @typedef {{ mermaid: boolean, image: boolean, width: number | null }} Target
 */

export const LIMITS = {
  title: 4,
  tldr: 25,
  heading: 6,
  line: 15,
  blocks: 4,
  fold: 2,
  columns: 3,
  numbers: 4,
  label: 5,
  read: 200,
};

// Where the brief lands, named by the caller. Only the target decides whether a picture may be
// Mermaid or an image, and how wide a table may be drawn. The adapters do not restate this.
/** @type {Record<string, Target>} */
export const TARGETS = {
  artifact: { mermaid: true, image: true, width: null },
  "pr-description": { mermaid: true, image: true, width: null },
  terminal: { mermaid: false, image: false, width: 100 },
  markdown: { mermaid: true, image: true, width: null },
};

export const PICTURES = ["mermaid", "table", "none", "image"];

// The convention's picture rule: "image" when the caller's convention requires a screenshot.
export const CONVENTION_PICTURES = ["any", "image"];

// The character, the HTML entities a renderer turns into it, and Mermaid's spelling without "&".
const EM_DASH = /\u2014|[&#]mdash;|&?#0*8212;|&?#x0*2014;/i;

// A finding in the footer is the caller's to settle: the skill never rewords the caller's text.
const CALLERS_TEXT = "the caller's own text: ask the caller";

/** @param {any} value @returns {value is Record<string, any>} */
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
/** @param {any} value @returns {value is string} */
const isText = (value) => typeof value === "string" && value.trim() !== "";
/** @param {any} value @returns {any[]} */
const listOf = (value) => (Array.isArray(value) ? value : []);
/** @param {any} value @returns {value is string[]} */
const isTextList = (value) => Array.isArray(value) && value.every(isText);
/** @param {any} text */
const countWords = (text) => (isText(text) ? text.trim().split(/\s+/).length : 0);
/** @param {string} field @param {string} message @param {string} fix @returns {Finding} */
const finding = (field, message, fix) => ({ field, message, fix });

/** @param {any} block @returns {any[][]} */
const rowsOf = (block) => listOf(block?.picture?.rows).map(listOf);
/** @param {any} block */
const cellsOf = (block) => rowsOf(block).flat();

/** The words a reader reads. Mermaid source, copy snippets and the fold are outside the minute. * @param {any} brief
 * @returns {number}
 */
export function readWords(brief) {
  if (!isObject(brief)) return 0;
  const blockTexts = listOf(brief.blocks).flatMap((block) => [
    block?.heading,
    block?.line,
    ...cellsOf(block),
  ]);
  const numberTexts = listOf(brief.numbers).flatMap((entry) => [entry?.value, entry?.label]);
  return [brief.title, brief.tldr, ...numberTexts, ...blockTexts].reduce(
    (sum, text) => sum + countWords(text),
    0,
  );
}

/** @param {string} field @param {any} text @param {number} limit @returns {Finding[]} */
function wordLimit(field, text, limit) {
  if (!isText(text)) return [finding(field, "is missing", `write it in ${limit} words or fewer`)];
  const count = countWords(text);
  if (count <= limit) return [];
  return [finding(field, `is ${count} words, at most ${limit}`, `cut it to ${limit} words`)];
}

/** @param {any} target @returns {Finding[]} */
function targetFindings(target) {
  if (Object.hasOwn(TARGETS, target ?? "")) return [];
  const names = Object.keys(TARGETS).join(", ");
  return [finding("target", `must be one of ${names}`, "ask the caller to name it, never guess")];
}

/** @param {any[][]} rows */
function tableWidth(rows) {
  /** @type {number[]} */
  const widths = [];
  rows.forEach((row) =>
    row.forEach((cell, index) => {
      widths[index] = Math.max(widths[index] ?? 0, String(cell).length);
    }),
  );
  return widths.reduce((sum, width) => sum + width, 0) + 3 * widths.length + 1;
}

/** @param {any} block @param {any} target @param {string} field @returns {Finding[]} */
function tableFindings(block, target, field) {
  const rows = rowsOf(block);
  if (cellsOf(block).length === 0)
    return [finding(field, "table has no rows", "add rows, or use none")];
  const columns = Math.max(...rows.map((row) => row.length));
  if (columns > LIMITS.columns) {
    const message = `table has ${columns} columns, at most ${LIMITS.columns}`;
    return [finding(field, message, "merge or drop a column")];
  }
  const width = TARGETS[target]?.width;
  const drawn = tableWidth(rows);
  if (!width || drawn <= width) return [];
  const message = `table draws ${drawn} columns, at most ${width}`;
  return [finding(field, message, "shorten the cells or split the table")];
}

/** @param {any} block @param {any} target @param {string} field @returns {Finding[]} */
function pictureFindings(block, target, field) {
  const picture = block?.picture;
  const kind = picture?.kind;
  if (!PICTURES.includes(kind)) {
    return [
      finding(
        field,
        `kind must be one of ${PICTURES.join(", ")}`,
        "pick one in domain/pictures.md",
      ),
    ];
  }
  if (kind === "table") return tableFindings(block, target, field);
  if (kind === "none") return [];
  if (kind === "image") return imageFindings(picture, target, field);
  if (TARGETS[target]?.mermaid === false) {
    return [finding(field, `${target} does not draw mermaid`, "use a table, or none")];
  }
  if (!isText(picture.source))
    return [finding(field, "mermaid picture has no source", "write the chart")];
  return [];
}

/** @param {any} picture @param {any} target @param {string} field @returns {Finding[]} */
function imageFindings(picture, target, field) {
  if (TARGETS[target]?.image === false) {
    return [finding(field, `${target} does not draw an image`, "use a table, or none")];
  }
  if (isText(picture.src) && isText(picture.alt)) return [];
  const fix = "give the file or address, and the words a screen reader says";
  return [finding(field, "image picture needs src and alt", fix)];
}

/** @param {any} entries @param {string} field @param {string} first @param {string} second @returns {Finding[]} */
function pairFindings(entries, field, first, second) {
  return listOf(entries).flatMap((entry, index) =>
    isText(entry?.[first]) && isText(entry?.[second])
      ? []
      : [finding(`${field}[${index}]`, `needs ${first} and ${second}`, `fill both, or drop it`)],
  );
}

// A heading a convention requires is the caller's wording, so the word cap does not apply to it.
/** @param {any} heading @param {string} field @param {Set<string>} required */
function headingFindings(heading, field, required) {
  if (required.has(normal(heading))) return [];
  return wordLimit(field, heading, LIMITS.heading);
}

/** @param {any} block @param {any} target @param {number} index @param {Set<string>} required */
function blockFindings(block, target, index, required) {
  const field = `blocks[${index}]`;
  return [
    ...headingFindings(block?.heading, `${field}.heading`, required),
    ...wordLimit(`${field}.line`, block?.line, LIMITS.line),
    ...pictureFindings(block, target, `${field}.picture`),
    ...pairFindings(block?.copy, `${field}.copy`, "label", "text"),
  ];
}

/** @param {Record<string, any>} brief @returns {Finding[]} */
function blocksFindings(brief) {
  const blocks = listOf(brief.blocks);
  if (blocks.length === 0) return [finding("blocks", "has no block", "write 1 to 4 blocks")];
  const tooMany =
    blocks.length > LIMITS.blocks
      ? [
          finding(
            "blocks",
            `has ${blocks.length} blocks, at most ${LIMITS.blocks}`,
            "merge or drop blocks",
          ),
        ]
      : [];
  const required = new Set(requiredHeadings(brief).map(normal));
  return [
    ...tooMany,
    ...blocks.flatMap((block, index) => blockFindings(block, brief.target, index, required)),
  ];
}

// The key numbers are read before any block: each a figure with a digit in it, and a short label.
/** @param {any} numbers @returns {Finding[]} */
function numbersFindings(numbers) {
  if (!Array.isArray(numbers)) {
    const fix = "list the key figures as { value, label }, [] only when the work holds none";
    return [finding("numbers", "is missing", fix)];
  }
  const tooMany =
    numbers.length > LIMITS.numbers
      ? [
          finding(
            "numbers",
            `has ${numbers.length} figures, at most ${LIMITS.numbers}`,
            "keep the figures that carry the answer",
          ),
        ]
      : [];
  return [
    ...tooMany,
    ...numbers.flatMap((entry, index) => {
      const field = `numbers[${index}]`;
      if (!isText(entry?.value) || !/\d/.test(entry.value)) {
        return [finding(`${field}.value`, "holds no digit", "write the figure itself, such as 3x")];
      }
      return wordLimit(`${field}.label`, entry?.label, LIMITS.label);
    }),
  ];
}

// The reader looks before reading: the first block opens on its picture, never on words alone.
/** @param {any} blocks @returns {Finding[]} */
function leadPictureFindings(blocks) {
  const kind = listOf(blocks)[0]?.picture?.kind;
  if (kind === undefined || kind !== "none") return [];
  const fix = "give the first block the diagram, chart or table that shows the answer";
  return [finding("blocks[0].picture", "is none: the first block must show a picture", fix)];
}

// A folded entry is proof, not required reading: anything the reader needs belongs in a block.
/** @param {any} fold @returns {Finding[]} */
function foldFindings(fold) {
  const entries = listOf(fold);
  const tooMany =
    entries.length > LIMITS.fold
      ? [
          finding(
            "fold",
            `has ${entries.length} entries, at most ${LIMITS.fold}`,
            "if it matters, make it a block",
          ),
        ]
      : [];
  return [...tooMany, ...pairFindings(entries, "fold", "heading", "text")];
}

/** @param {any} sources @returns {Finding[]} */
function sourceFindings(sources) {
  const read = listOf(sources?.read).filter(isText);
  return [
    ...(read.length > 0
      ? []
      : [finding("sources.read", "lists nothing read", "name what you read")]),
    ...(Array.isArray(sources?.notRead)
      ? []
      : [finding("sources.notRead", "is missing", "list what you did not read, [] when nothing")]),
    ...(isText(sources?.notTested)
      ? []
      : [finding("sources.notTested", "is missing", "say what was not tested")]),
  ];
}

/** @param {Record<string, any>} brief @param {string[]} required @returns {Finding[]} */
function requiredFindings(brief, required) {
  if (required.length > LIMITS.blocks) {
    const message = `requires ${required.length} sections, at most ${LIMITS.blocks} blocks`;
    const fix = "ask the caller to trim the convention or split the work";
    return [finding("convention.headings", message, fix)];
  }
  const headings = new Set(listOf(brief.blocks).map((block) => normal(block?.heading)));
  return required
    .filter((heading) => !headings.has(normal(heading)))
    .map((heading) =>
      finding(
        "blocks",
        `misses the required heading "${heading}"`,
        `add a block headed "${heading}"`,
      ),
    );
}

/** @param {Record<string, any>} brief @param {string[]} required @returns {Finding[]} */
function foldedFindings(brief, required) {
  const names = new Map(required.map((heading) => [normal(heading), heading]));
  return listOf(brief.fold).flatMap((entry, index) =>
    names.has(normal(entry?.heading))
      ? [
          finding(
            `fold[${index}]`,
            `folds the required heading "${names.get(normal(entry.heading))}"`,
            "make it a block; the fold holds proof only",
          ),
        ]
      : [],
  );
}

/** @param {Record<string, any>} brief @param {any} rule @returns {Finding[]} */
function conventionPictureFindings(brief, rule) {
  if (rule === undefined || rule === "any") return [];
  if (!CONVENTION_PICTURES.includes(rule)) {
    const message = `must be one of ${CONVENTION_PICTURES.join(", ")}`;
    return [finding("convention.picture", message, "write the convention's picture rule")];
  }
  const shown = listOf(brief.blocks).some((block) => block?.picture?.kind === "image");
  if (shown) return [];
  const fix = "give the block it illustrates an image picture";
  return [finding("convention.picture", "requires an image and no block carries one", fix)];
}

// The caller's own convention, held on top of the brief: required sections are blocks, never
// folded; the lead slot is the TLDR's, so it needs no block.
/** @param {Record<string, any>} brief @returns {Finding[]} */
function conventionFindings(brief) {
  const { convention } = brief;
  if (convention === undefined) return [];
  if (!isObject(convention)) {
    return [
      finding(
        "convention",
        "is not an object",
        "write it as { lead, headings, picture, banned, footer }",
      ),
    ];
  }
  const required = requiredHeadings(brief);
  return [
    ...shapeFindings(convention),
    ...requiredFindings(brief, required),
    ...foldedFindings(brief, required),
    ...conventionPictureFindings(brief, convention.picture),
  ];
}

/** @param {any} text @returns {string} */
function normal(text) {
  return isText(text) ? text.trim().toLowerCase().replace(/\s+/g, " ") : "";
}

/** The sections a convention requires, the lead left out: the TLDR is drawn in it. * @param {Record<string, any>} brief
 * @returns {string[]}
 */
function requiredHeadings(brief) {
  const convention = isObject(brief.convention) ? brief.convention : {};
  if (!isTextList(convention.headings)) return [];
  const lead = normal(convention.lead);
  return convention.headings.filter((heading) => normal(heading) !== lead);
}

/** @param {Record<string, any>} brief @returns {string[]} */
function bannedOf(brief) {
  const banned = brief.convention?.banned;
  return isTextList(banned) ? banned : [];
}

/** @param {Record<string, any>} convention @returns {Finding[]} */
function shapeFindings(convention) {
  const lists = ["headings", "banned"]
    .filter((key) => convention[key] !== undefined && !isTextList(convention[key]))
    .map((key) =>
      finding(`convention.${key}`, "is not a list of strings", 'write it as ["...", "..."]'),
    );
  const footer = convention.footer;
  if (footer === undefined || isText(footer) || isTextList(footer)) return lists;
  const message = "is not a string or a list of strings";
  return [...lists, finding("convention.footer", message, "copy the caller's lines as given")];
}

/** @param {any} value @param {string} path @returns {Generator<[string, string]>} */
function* textsOf(value, path) {
  if (typeof value === "string") yield [path, value];
  else if (Array.isArray(value))
    for (const [index, inner] of value.entries()) yield* textsOf(inner, `${path}[${index}]`);
  else if (isObject(value))
    for (const [key, inner] of Object.entries(value))
      yield* textsOf(inner, path ? `${path}.${key}` : key);
}

// The convention is the caller's: of it, only the footer is drawn, so only the footer is scanned.
/** @param {Record<string, any>} brief @returns {any[][]} */
const drawnTexts = (brief) => [
  ...textsOf({ ...brief, convention: undefined }, ""),
  ...footerTexts(brief),
];

/** @param {string} path @param {string} fix */
const fixFor = (path, fix) => (path.startsWith("convention.footer") ? CALLERS_TEXT : fix);

/** @param {Record<string, any>} brief @returns {Finding[]} */
function emDashFindings(brief) {
  return drawnTexts(brief)
    .filter(([, text]) => EM_DASH.test(text))
    .map(([path]) =>
      finding(path, "holds an em dash", fixFor(path, "use a comma, colon or period")),
    );
}

// Only what a reader sees: never the target, a picture's kind or file, or chart syntax.
/** @param {Record<string, any>} brief @returns {Finding[]} */
function bannedFindings(brief) {
  const banned = bannedOf(brief);
  return visibleTexts(brief).flatMap(([path, text]) =>
    banned
      .filter((character) => text.includes(character))
      .map((character) =>
        finding(
          path,
          `holds "${character}", which the convention bans`,
          fixFor(path, "rephrase without it"),
        ),
      ),
  );
}

/** @param {Record<string, any>} brief @returns {Finding[]} */
function budgetFindings(brief) {
  const read = readWords(brief);
  if (read <= LIMITS.read) return [];
  return [
    finding(
      "blocks",
      `the page reads ${read} words, at most ${LIMITS.read}`,
      "cut words, or move proof to the fold",
    ),
  ];
}

/** Every way the brief breaks its limits, each with the field it is about and the fix. * @param {any} brief
 * @returns {Finding[]}
 */
export function validateBrief(brief) {
  if (!isObject(brief))
    return [finding("(brief)", "is not a JSON object", "write the brief as an object")];
  return [
    ...wordLimit("title", brief.title, LIMITS.title),
    ...wordLimit("tldr", brief.tldr, LIMITS.tldr),
    ...targetFindings(brief.target),
    ...numbersFindings(brief.numbers),
    ...blocksFindings(brief),
    ...leadPictureFindings(brief.blocks),
    ...foldFindings(brief.fold),
    ...sourceFindings(brief.sources),
    ...conventionFindings(brief),
    ...emDashFindings(brief),
    ...bannedFindings(brief),
    ...budgetFindings(brief),
  ];
}
