#!/usr/bin/env node
// Checks a text against the plain-language rules a script can see, at one level. Prints every
// finding with its line, rule and fix, then the hints (passive voice), which never fail.
//
//   node scripts/check-plain.mjs [--level strict|standard|light] [--lang en|fr|auto] [--json] <file | ->
//
// Exit 0 when the text holds (hints alone still hold), 1 on a finding, 2 on a bad option or an
// unreadable file.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { checkText, LANGUAGES, LEVELS } from "./plain.mjs";

const USAGE =
  "usage: node check-plain.mjs [--level strict|standard|light] [--lang en|fr|auto] [--json] <file | ->";

/** @param {string[]} args */
function parse(args) {
  /** @type {{ level: string, lang: string, json: boolean, path?: string }} */
  const options = { level: "standard", lang: "auto", json: false };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--json") options.json = true;
    else if (arg === "--level" || arg === "--lang")
      options[arg.slice(2) === "level" ? "level" : "lang"] = args[(i += 1)] ?? "";
    else options.path = arg;
  }
  return options;
}

/** @param {string[]} args */
function main(args) {
  const options = parse(args);
  const { level, lang, path } = options;
  if (!path || !(level in LEVELS) || !(lang === "auto" || lang in LANGUAGES)) {
    console.error(USAGE);
    return 2;
  }
  let text;
  try {
    text = readFileSync(path === "-" ? 0 : path, "utf8");
  } catch (error) {
    console.error(`cannot read ${path}: ${/** @type {Error} */ (error).message.split("\n")[0]}`);
    return 2;
  }
  const report = checkText(text, {
    level: /** @type {import("./plain.mjs").Level} */ (level),
    lang: /** @type {import("./plain.mjs").Lang | "auto"} */ (lang),
  });
  if (options.json) {
    console.log(JSON.stringify({ level, ...report }, null, 2));
    return report.findings.length > 0 ? 1 : 0;
  }
  const where = `(${level}, ${report.lang})`;
  const { findings, hints } = report;
  if (findings.length > 0) {
    console.log(`PLAIN ${findings.length} finding${findings.length === 1 ? "" : "s"} ${where}`);
    findings.forEach(({ line, rule, message, fix }) =>
      console.log(`  ${line}: ${rule}: ${message} → ${fix}`),
    );
  } else {
    const size = `${report.sentences} sentences, longest ${report.longest}/${report.limit} words`;
    console.log(`PLAIN OK ${size} ${where}`);
  }
  hints.forEach(({ line, rule, message, fix }) =>
    console.log(`  hint ${line}: ${rule}: ${message} → ${fix}`),
  );
  return findings.length > 0 ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = main(process.argv.slice(2));
}
