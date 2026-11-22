// The rules of plain language a script can see, after ASD-STE100: how long a sentence may be at each
// level, the words that carry nothing, two ideas joined by a semicolon, a step that does not start
// with a verb, and (as a hint only) the passive voice.
//
//   checkText(text, { level, lang }) -> { findings, hints, sentences, longest, limit, lang }
//   detectLang(text)                 -> "en" or "fr"
//
// Code, inline code, links' targets, headings, block quotes and table borders are never read: they
// are copied, not written.

/** @typedef {"strict" | "standard" | "light"} Level */
/** @typedef {"en" | "fr"} Lang */
/** @typedef {{ line: number, rule: string, message: string, fix: string }} Finding */
/** @typedef {{ text: string, line: number, step: boolean }} Sentence */

/** @type {Record<Level, { words: number, steps: boolean, passive: boolean }>} */
export const LEVELS = {
  strict: { words: 20, steps: true, passive: true },
  standard: { words: 25, steps: false, passive: true },
  light: { words: 25, steps: false, passive: false },
};

/**
 * Each language holds its filler words, the openings that tell a step does not start with a verb,
 * the passive pattern, and the words that tell the language apart.
 * @type {Record<Lang, { filler: string[], notAVerb: RegExp, passive: RegExp, marks: RegExp }>}
 */
export const LANGUAGES = {
  en: {
    filler: [
      "really",
      "just",
      "basically",
      "actually",
      "simply",
      "truly",
      "very",
      "quite",
      "extremely",
      "obviously",
      "clearly",
      "seamless",
      "seamlessly",
      "robust",
      "leverage",
      "delightful",
      "in order to",
      "it is worth noting",
      "it's worth noting",
      "please note",
      "needless to say",
      "at the end of the day",
      "going forward",
    ],
    notAVerb:
      /^(?:the|a|an|this|that|these|those|it|we|you|i|there|our|your|my|then|now|next|first|finally|also)\b/i,
    passive: /\b(?:is|are|was|were|be|been|being)\s+(?:\w+ly\s+)?\w+(?:ed|en)\b/i,
    marks: /\b(?:the|and|is|are|of|to|with|this|that|it)\b/gi,
  },
  fr: {
    filler: [
      "vraiment",
      "simplement",
      "clairement",
      "évidemment",
      "littéralement",
      "tout à fait",
      "en effet",
      "il convient de",
      "il est à noter que",
      "force est de constater",
      "au niveau de",
      "en termes de",
      "dans le cadre de",
      "afin de",
    ],
    notAVerb:
      /^(?:le|la|les|un|une|des|ce|cette|ces|il|elle|ils|elles|on|nous|vous|je|puis|ensuite|enfin|aussi)\b/i,
    passive:
      /\b(?:est|sont|était|étaient|sera|seront|été)\s+(?:\p{L}+ment\s+)?\p{L}+(?:é|ée|és|ées)\b/iu,
    marks: /\b(?:le|la|les|des|et|est|une|du|pour|avec|que|dans)\b/gi,
  },
};

const FENCE = /^\s*(?:```|~~~)/;
const SENTENCE_END = /(?<=[.!?…])\s+(?=[\p{Lu}\d"'«(`])/u;
const STEP = /^\s*\d+[.)]\s+/;
const BULLET = /^\s*[-*+]\s+/;
const WORD = /[\p{L}\p{N}]/u;

/** Replace what is copied, not written, so it is never read as prose. */
function prose(/** @type {string} */ line) {
  return line
    .replace(/`[^`]*`/g, "code")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "link")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1");
}

/**
 * The sentences of a text, each with the line it starts on, and whether it opens a numbered step.
 * @param {string} text
 * @returns {Sentence[]}
 */
export function sentencesOf(text) {
  /** @type {Sentence[]} */
  const out = [];
  /** @type {{ text: string, line: number, step: boolean } | null} */
  let block = null;
  let fenced = false;
  let front = false;
  const flush = () => {
    if (!block) return;
    const { line, step } = block;
    block.text
      .split(SENTENCE_END)
      .map((part) => part.trim())
      .filter((part) => WORD.test(part))
      .forEach((part, i) => out.push({ text: part, line, step: step && i === 0 }));
    block = null;
  };
  text.split("\n").forEach((raw, i) => {
    const line = i + 1;
    if (i === 0 && raw.trim() === "---") return void (front = true);
    if (front) return void (raw.trim() === "---" && (front = false));
    if (FENCE.test(raw)) return void (flush(), (fenced = !fenced));
    if (fenced) return;
    const trimmed = raw.trim();
    if (!trimmed || /^(?:#|>|<!--|\|?\s*:?-{3,})/.test(trimmed)) return void flush();
    if (trimmed.startsWith("|")) {
      flush();
      trimmed
        .split("|")
        .map((cell) => prose(cell).trim())
        .filter((cell) => WORD.test(cell))
        .forEach((cell) => out.push({ text: cell, line, step: false }));
      return;
    }
    const opens = STEP.test(raw) || BULLET.test(raw);
    if (opens) flush();
    const body = prose(raw.replace(STEP, "").replace(BULLET, "")).trim();
    if (block) block.text += ` ${body}`;
    else block = { text: body, line, step: STEP.test(raw) };
  });
  flush();
  return out;
}

/** @param {string} sentence */
const wordsIn = (sentence) => sentence.split(/\s+/).filter((w) => WORD.test(w)).length;

/** @param {string} text @returns {Lang} */
export function detectLang(text) {
  const count = (/** @type {Lang} */ lang) => (text.match(LANGUAGES[lang].marks) ?? []).length;
  return count("fr") > count("en") ? "fr" : "en";
}

/** @param {string} word */
const escape = (word) => word.replace(/[.*+?^${}()|[\]\\']/g, "\\$&").replace(/\\'/g, "['’]");

/**
 * @param {string} text
 * @param {{ level?: Level, lang?: Lang | "auto" }} [options]
 */
export function checkText(text, options = {}) {
  const level = options.level ?? "standard";
  const rules = LEVELS[level];
  const lang = !options.lang || options.lang === "auto" ? detectLang(text) : options.lang;
  const language = LANGUAGES[lang];
  const filler = new RegExp(
    `(?<![\\p{L}\\p{N}])(${language.filler.map(escape).join("|")})(?![\\p{L}\\p{N}])`,
    "giu",
  );
  /** @type {Finding[]} */
  const findings = [];
  /** @type {Finding[]} */
  const hints = [];
  const sentences = sentencesOf(text);
  let longest = 0;
  for (const { text: sentence, line, step } of sentences) {
    const words = wordsIn(sentence);
    longest = Math.max(longest, words);
    if (words > rules.words)
      findings.push({
        line,
        rule: "long",
        message: `${words} words, at most ${rules.words}`,
        fix: "split it: one idea per sentence",
      });
    if (sentence.includes(";"))
      findings.push({
        line,
        rule: "joined",
        message: "two ideas joined by `;`",
        fix: "end the first sentence, then start the second",
      });
    for (const match of sentence.matchAll(filler))
      findings.push({
        line,
        rule: "filler",
        message: `"${match[1]}" carries nothing`,
        fix: "delete it, or say the fact it stands for",
      });
    if (rules.steps && step && language.notAVerb.test(sentence))
      findings.push({
        line,
        rule: "step",
        message: "the step does not start with a verb",
        fix: 'start with the action: "Run…", "Delete…"',
      });
    if (rules.passive && language.passive.test(sentence))
      hints.push({
        line,
        rule: "passive",
        message: "may be passive voice",
        fix: 'say who does it: "The script reads the file"',
      });
  }
  return { findings, hints, sentences: sentences.length, longest, limit: rules.words, lang };
}
