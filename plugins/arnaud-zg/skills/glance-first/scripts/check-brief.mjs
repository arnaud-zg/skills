#!/usr/bin/env node
// Checks a one-minute brief against its limits before it is presented. Prints every finding with
// the field it is about and its fix, and exits 1; or prints the read size and exits 0.
//
//   node scripts/check-brief.mjs <brief.json>
//
// Exit 0 when the brief holds, 1 on a finding (an unreadable file or bad JSON is one), and 2 when
// no path was given.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { LIMITS, readWords, validateBrief } from "./brief.mjs";

/**
 * @param {string} path
 * @returns {{ brief?: any, findings?: { field: string, message: string, fix: string }[] }}
 */
function readBrief(path) {
  try {
    return { brief: JSON.parse(readFileSync(path, "utf8")) };
  } catch (error) {
    const fix = "point at a brief written as JSON";
    return {
      findings: [
        { field: "(file)", message: /** @type {Error} */ (error).message.split("\n")[0], fix },
      ],
    };
  }
}

/** @param {string[]} args */
function main(args) {
  const [path] = args;
  if (!path) {
    console.error("usage: node check-brief.mjs <brief.json>");
    return 2;
  }
  const read = readBrief(path);
  const findings = read.findings ?? validateBrief(read.brief);
  if (findings.length > 0) {
    console.log(`BRIEF ${findings.length} finding${findings.length === 1 ? "" : "s"}`);
    findings.forEach(({ field, message, fix }) => console.log(`  ${field}: ${message} → ${fix}`));
    return 1;
  }
  const { brief } = read;
  const words = `${readWords(brief)}/${LIMITS.read} words`;
  const blocks = `${brief.blocks.length}/${LIMITS.blocks} blocks`;
  console.log(`BRIEF OK ${words}, ${blocks}, target ${brief.target}`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = main(process.argv.slice(2));
}
