#!/usr/bin/env node
// Checks an audit result against the source it audits, before it is presented. A finding is kept
// only when it passes the three tests, every critical one is kept, only the most severe lead, and
// every comment quotes one passage the source text holds and says how sure the audit is of it.
// `domain/result.md` is the page these
// rules hold, and `domain/lenses.md` owns the keep rule.
//
//   node ${CLAUDE_SKILL_DIR}/scripts/check-audit.mjs <audit.json> <source.txt>
//
//   import { validateAudit } from "./check-audit.mjs";
//   validateAudit(audit, sourceText)  -> [{ field, message, fix }], empty when the audit holds
//
// The source text is what a comment can be posted on, saved apart from the context that was only
// read. Exit 0 when the audit holds, 1 on anything to fix (an unreadable file or bad JSON is one),
// and 2 when a path is missing.
//
// When the plain-language skill is installed beside this one, an audit that holds also prints its
// plain-language notes: the verdict and the good points at standard level, the comments at light.
// A note never changes the exit code.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/** @type {(string | undefined)[]} */
export const SEVERITIES = ["critical", "medium", "low"];
/** @type {(string | undefined)[]} */
export const TYPES = ["Challenge", "Ask", "Suggest", "Reply"];
/** @type {(string | undefined)[]} */
export const GROUPS = ["post first", "good to ask", "reply", "more"];
/** @type {(string | undefined)[]} */
export const TAGS = ["already raised", "can wait"];
export const PARTS = ["Problem", "Proposal", "Example"];
export const LIMITS = {
  keptWithoutCritical: 2,
  goodToAsk: 3,
  good: 3,
  sentences: 4,
  partSentences: 2,
  quoteWords: 4,
  quoteCharacters: 20,
  confidenceMin: 1,
  confidenceMax: 10,
  confidenceWhySentences: 3,
};

/**
 * @typedef {{ field: string, message: string, fix: string }} Finding
 * @typedef {{ real?: boolean, covered?: boolean, raised?: boolean }} Tests
 * @typedef {{ title?: string, severity?: string, evidence?: string, tests?: Tests, kept?: boolean, tag?: string }} Item
 * @typedef {{ score?: number, why?: string }} Confidence
 * @typedef {{ type?: string, group?: string, quote?: string, text?: string, after?: string, confidence?: Confidence }} Comment
 * @typedef {{ asked?: string, answer?: string }} Question
 * @typedef {{ verdict?: string, findings?: Item[], comments?: Comment[], good?: string[], questions?: Question[] }} Audit
 */

/** @type {Record<string, number>} */
const RANK = { critical: 3, medium: 2, low: 1 };
/** @type {(string | undefined)[]} */
const POST_FIRST = ["Challenge", "Suggest"];

/** @param {unknown} value @returns {value is Record<string, unknown>} */
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
/** @param {unknown} value @returns {value is string} */
const isText = (value) => typeof value === "string" && value.trim() !== "";
/** @param {unknown} value @returns {any[]} */
const listOf = (value) => (Array.isArray(value) ? value : []);
/** @param {string} field @param {string} message @param {string} fix @returns {Finding} */
const finding = (field, message, fix) => ({ field, message, fix });

// A quote is copied word for word; only the line breaks and spacing of the source may differ.
/** @param {string} text */
const flatten = (text) => text.replace(/\s+/g, " ").trim();
// A sentence ends at a stop or an ellipsis character, even inside a closing quote or bracket, and
// at every line break.
const SENTENCE_END = /[.!?…]+["'’”)\]]*(?:\s+|$)|\n+/;
/** @param {string} text */
const sentencesIn = (text) => text.split(SENTENCE_END).filter((part) => part.trim()).length;

/** @param {Item | undefined} item */
const passes = (item) =>
  item?.tests?.real === true && item.tests.covered === false && item.tests.raised === false;
/** @param {Item | undefined} item */
const isKept = (item) => item?.kept === true;
/** @param {Item[]} items */
const topRank = (items) =>
  Math.max(0, ...items.filter(passes).map((item) => RANK[item.severity ?? ""] ?? 0));

/** @param {unknown} verdict @returns {Finding[]} */
function verdictFindings(verdict) {
  if (!isText(verdict)) return [finding("verdict", "is missing", "write it, answer first")];
  if (!verdict.includes("\n")) return [];
  return [finding("verdict", "runs over more than one line", "say it in one line")];
}

/** @param {Item | undefined} item @param {string} field @returns {Finding[]} */
function testFindings(item, field) {
  if (item?.tests?.real !== true) {
    return [finding(field, "is not shown to be real", "drop it: a hunch is not a finding")];
  }
  if (item.tests.covered !== false) {
    return [finding(field, "is covered by the document", "drop it, or show what is missing")];
  }
  if (isKept(item) && item.tests.raised !== false) {
    return [finding(`${field}.kept`, "was already raised", "credit the reviewer, tag it, unkeep")];
  }
  return [];
}

/** @param {Item | undefined} item @param {string} field @returns {Finding[]} */
function tagFindings(item, field) {
  if (isKept(item) || TAGS.includes(item?.tag)) return [];
  return [finding(`${field}.tag`, `must be one of ${TAGS.join(", ")}`, "tag why it was left out")];
}

/** @param {Item | undefined} item @param {string} field @param {number} top @returns {Finding[]} */
function keepFindings(item, field, top) {
  if (!isKept(item) && item?.severity === "critical" && passes(item)) {
    return [finding(`${field}.kept`, "is critical and left out", "keep every critical finding")];
  }
  if (!isKept(item) || (RANK[item?.severity ?? ""] ?? 0) >= top) return [];
  const message = `is ${item?.severity} while a ${SEVERITIES[3 - top]} point passed`;
  return [finding(`${field}.kept`, message, "keep only the most severe, tag this one can wait")];
}

/** @param {Item | undefined} item @param {number} index @param {number} top @returns {Finding[]} */
function itemFindings(item, index, top) {
  const field = `findings[${index}]`;
  const shape = [
    ...(isText(item?.title) ? [] : [finding(`${field}.title`, "is missing", "name the point")]),
    ...(SEVERITIES.includes(item?.severity)
      ? []
      : [finding(`${field}.severity`, `must be one of ${SEVERITIES.join(", ")}`, "rate it")]),
    ...(isText(item?.evidence)
      ? []
      : [finding(`${field}.evidence`, "is missing", "quote what you read, or drop it")]),
  ];
  const tests = testFindings(item, field);
  if (tests.length > 0) return [...shape, ...tests];
  return [...shape, ...tagFindings(item, field), ...keepFindings(item, field, top)];
}

/** @param {Item[]} items @param {number} top @returns {Finding[]} */
function keptFindings(items, top) {
  const kept = items.filter(isKept).length;
  if (top < RANK.critical && kept > LIMITS.keptWithoutCritical) {
    const message = `keeps ${kept} with nothing critical, at most ${LIMITS.keptWithoutCritical}`;
    return [finding("findings", message, "keep the most severe; two only when equally severe")];
  }
  if (kept === 0 && items.some(passes)) {
    return [finding("findings", "keeps none", "keep the most severe that passes the tests")];
  }
  return [];
}

/** @param {unknown} items @returns {Finding[]} */
function findingsFindings(items) {
  if (!Array.isArray(items)) {
    return [finding("findings", "is missing", "list what you found, [] when nothing")];
  }
  const top = topRank(items);
  return [...keptFindings(items, top), ...items.flatMap((item, i) => itemFindings(item, i, top))];
}

/** @param {string} text @param {string} passage */
function occurrences(text, passage) {
  let count = 0;
  for (let at = text.indexOf(passage); at !== -1; at = text.indexOf(passage, at + 1)) count += 1;
  return count;
}

/** @param {unknown} quote @param {string} source @param {string} field @returns {Finding[]} */
function quoteFindings(quote, source, field) {
  if (!isText(quote)) return [finding(field, "is missing", "anchor it on a passage, copied")];
  const passage = flatten(quote);
  const short = passage.split(" ").length < LIMITS.quoteWords;
  if (short && passage.length < LIMITS.quoteCharacters) {
    const fix = `quote at least ${LIMITS.quoteWords} words, or ${LIMITS.quoteCharacters} characters`;
    return [finding(field, `"${quote}" is too short to place`, fix)];
  }
  const count = occurrences(flatten(source), passage);
  if (count === 1) return [];
  if (count === 0) {
    return [finding(field, `"${quote}" is not in the source`, "copy the passage again, exactly")];
  }
  const message = `"${quote}" occurs ${count} times in the source`;
  return [finding(field, message, "quote a longer passage that occurs once")];
}

/** @param {Comment | undefined} comment @param {string} field @returns {Finding[]} */
function groupFindings(comment, field) {
  const { group, type } = comment ?? {};
  if (!GROUPS.includes(group)) {
    return [finding(`${field}.group`, `must be one of ${GROUPS.join(", ")}`, "pick its group")];
  }
  if ((type === "Reply") !== (group === "reply")) {
    return [finding(`${field}.group`, "is not where it belongs", "replies in reply, others not")];
  }
  if (group !== "post first" || !TYPES.includes(type) || POST_FIRST.includes(type)) return [];
  return [finding(`${field}.group`, "post first holds a challenge and its edit", "move it")];
}

// A Challenge or an Ask has three lines, so a reader sees the problem, the fix and a case at once.
// A Suggest shows its own before and after, and a Reply answers first, so both keep the short rule.
/** @param {string} text @param {string} field @returns {Finding[]} */
function partsFindings(text, field) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const labels = lines.map((line) => line.split(":")[0]);
  if (
    labels.join() !== PARTS.join() ||
    lines.some((line) => !isText(line.split(":").slice(1).join(":")))
  ) {
    const fix = `write ${PARTS.map((part) => `"${part}: ..."`).join(", then ")}, one per line`;
    return [finding(field, `must be ${PARTS.join(", ")} in that order`, fix)];
  }
  const long = lines.filter((line) => sentencesIn(line) > LIMITS.partSentences);
  return long.length > 0
    ? [finding(field, `has a part over ${LIMITS.partSentences} sentences`, "cut it")]
    : [];
}

/** @param {unknown} text @param {string | undefined} type @param {string} field @returns {Finding[]} */
function textFindings(text, type, field) {
  if (!isText(text)) return [finding(field, "is missing", "write the comment")];
  if (type === "Challenge" || type === "Ask") return partsFindings(text, field);
  if (sentencesIn(text) <= LIMITS.sentences) return [];
  return [finding(field, `is over ${LIMITS.sentences} sentences`, "cut it")];
}

// Every comment says how sure the audit is of it: a score from 1 to 10 in halves, and the reason,
// which names what was checked and what holds the score back.
/** @param {Confidence | undefined} confidence @param {string} field @returns {Finding[]} */
function confidenceFindings(confidence, field) {
  const { confidenceMin: min, confidenceMax: max, confidenceWhySentences: most } = LIMITS;
  const { score, why } = confidence ?? {};
  const fits =
    typeof score === "number" && score >= min && score <= max && Number.isInteger(score * 2);
  return [
    ...(fits
      ? []
      : [
          finding(`${field}.score`, `must be ${min} to ${max}, in halves`, "rate how sure you are"),
        ]),
    ...(isText(why)
      ? sentencesIn(why) > most
        ? [finding(`${field}.why`, `is over ${most} sentences`, "cut it")]
        : []
      : [finding(`${field}.why`, "is missing", "say what was checked and what holds it back")]),
  ];
}

/** @param {Comment | undefined} comment @param {number} index @param {string} source @returns {Finding[]} */
function commentFindings(comment, index, source) {
  const field = `comments[${index}]`;
  return [
    ...confidenceFindings(comment?.confidence, `${field}.confidence`),
    ...(TYPES.includes(comment?.type)
      ? []
      : [finding(`${field}.type`, `must be one of ${TYPES.join(", ")}`, "pick its kind")]),
    ...groupFindings(comment, field),
    ...quoteFindings(comment?.quote, source, `${field}.quote`),
    ...textFindings(comment?.text, comment?.type, `${field}.text`),
    ...(comment?.type === "Suggest" && !isText(comment?.after)
      ? [finding(`${field}.after`, "is missing", "write the new wording")]
      : []),
  ];
}

// The group limits of domain/result.md: three good to ask, one challenge and one edit to post
// first per kept finding, and one reply per question for the reader, and no other. `kept` is null
// when the findings list does not say yet: its own problem is the one to fix first.
/** @param {Comment[]} comments @param {number | null} kept @param {number} questions @returns {Finding[]} */
function groupLimitFindings(comments, kept, questions) {
  /** @param {(comment: Comment) => boolean} test */
  const count = (test) => comments.filter(test).length;
  const asks = count((comment) => comment?.group === "good to ask");
  const replies = count((comment) => comment?.type === "Reply");
  /** @type {[string | undefined, number][]} */
  const postFirst = POST_FIRST.map((type) => [
    type,
    count((comment) => comment?.group === "post first" && comment.type === type),
  ]);
  return [
    ...(asks > LIMITS.goodToAsk
      ? [finding("comments", `has ${asks} good to ask`, `keep ${LIMITS.goodToAsk}, fold the rest`)]
      : []),
    ...postFirst
      .filter(([, posted]) => kept !== null && posted > kept)
      .map(([type, posted]) =>
        finding("comments", `posts ${posted} ${type} first for ${kept} kept`, "one per kept"),
      ),
    ...(replies === questions
      ? []
      : [finding("comments", `has ${replies} replies for ${questions} questions`, "one each")]),
  ];
}

/** @param {unknown} items @returns {number | null} */
function keptCount(items) {
  if (!Array.isArray(items)) return null;
  const kept = items.filter(isKept).length;
  return kept === 0 && items.some(passes) ? null : kept;
}

/** @param {Audit} audit @param {string} source @returns {Finding[]} */
function commentsFindings(audit, source) {
  const { comments } = audit;
  if (!Array.isArray(comments)) {
    return [finding("comments", "is missing", "list the comments, [] when there are none")];
  }
  return [
    ...groupLimitFindings(comments, keptCount(audit.findings), listOf(audit.questions).length),
    ...comments.flatMap((comment, index) => commentFindings(comment, index, source)),
  ];
}

/** @param {Audit} audit @returns {Finding[]} */
function restFindings(audit) {
  const good = listOf(audit.good);
  const questions = listOf(audit.questions).flatMap((question, index) =>
    isText(question?.asked) && isText(question?.answer)
      ? []
      : [finding(`questions[${index}]`, "needs asked and answer", "fill both")],
  );
  return [
    ...(good.length > LIMITS.good
      ? [finding("good", `has ${good.length} points`, `keep the best ${LIMITS.good}`)]
      : []),
    ...questions,
  ];
}

/**
 * Everything to fix before the audit is presented; empty when it holds.
 * @param {unknown} audit
 * @param {unknown} source
 * @returns {Finding[]}
 */
export function validateAudit(audit, source) {
  if (!isObject(audit)) return [finding("(audit)", "is not an object", "write the audit as JSON")];
  return [
    ...verdictFindings(audit.verdict),
    ...findingsFindings(audit.findings),
    ...commentsFindings(audit, String(source ?? "")),
    ...restFindings(audit),
  ];
}

/** @param {string} path @param {string} label @param {boolean} parse @returns {{ value?: any, findings?: Finding[] }} */
function readFile(path, label, parse) {
  try {
    const text = readFileSync(path, "utf8");
    return { value: parse ? JSON.parse(text) : text };
  } catch (error) {
    const message = /** @type {Error} */ (error).message.split("\n")[0];
    return { findings: [finding(`(${label})`, message, `point at the ${label} file`)] };
  }
}

/** @param {number} count @param {string} word */
const counted = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** @param {{ findings: Item[], comments: Comment[] }} audit */
function summary(audit) {
  const kept = audit.findings.filter(isKept).length;
  const findings = counted(audit.findings.length, "finding");
  const comments = counted(audit.comments.length, "comment");
  return `AUDIT OK ${kept} of ${findings} kept, ${comments}, every quote found`;
}

/**
 * The plain-language check, when that skill is installed beside this one; null when it is not.
 * @returns {Promise<((text: string, options: { level: string }) => { findings: { rule: string, message: string, fix: string }[] }) | null>}
 */
async function loadPlain() {
  const url = new URL("../../plain-language/scripts/plain.mjs", import.meta.url);
  try {
    return (await import(url.href)).checkText;
  } catch {
    return null;
  }
}

/**
 * Each plain-language note on the words a reader sees, as `field: rule: message → fix`.
 * @param {{ verdict?: string, good?: string[], comments: Comment[] }} audit
 * @param {NonNullable<Awaited<ReturnType<typeof loadPlain>>>} checkText
 */
function plainNotes(audit, checkText) {
  /** @type {[string, string | undefined, string][]} */
  const texts = [
    ["verdict", audit.verdict, "standard"],
    ...listOf(audit.good).map(
      (text, i) => /** @type {[string, string, string]} */ ([`good[${i}]`, text, "standard"]),
    ),
    ...audit.comments.flatMap(
      (comment, i) =>
        /** @type {[string, string | undefined, string][]} */ ([
          [`comments[${i}].text`, comment.text, "light"],
          [`comments[${i}].after`, comment.after, "light"],
        ]),
    ),
  ];
  return texts.flatMap(([field, text, level]) =>
    isText(text)
      ? checkText(text, { level }).findings.map(
          (f) => `${field}: ${f.rule}: ${f.message} → ${f.fix}`,
        )
      : [],
  );
}

/** @param {string[]} args */
async function main(args) {
  const [auditPath, sourcePath] = args;
  if (!auditPath || !sourcePath) {
    console.error("usage: node check-audit.mjs <audit.json> <source.txt>");
    return 2;
  }
  const audit = readFile(auditPath, "audit", true);
  const source = readFile(sourcePath, "source", false);
  const findings = [
    ...(audit.findings ?? []),
    ...(source.findings ?? []),
    ...(audit.findings || source.findings ? [] : validateAudit(audit.value, source.value)),
  ];
  if (findings.length > 0) {
    console.log(`AUDIT ${findings.length} to fix`);
    findings.forEach(({ field, message, fix }) => console.log(`  ${field}: ${message} → ${fix}`));
    return 1;
  }
  console.log(summary(audit.value));
  const checkText = await loadPlain();
  if (!checkText) console.log("  plain-language not installed, style not checked");
  else plainNotes(audit.value, checkText).forEach((note) => console.log(`  plain: ${note}`));
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = await main(process.argv.slice(2));
}
