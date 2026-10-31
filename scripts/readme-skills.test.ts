import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Each skill folder appears once in the root's use-case list and once in the plugin's table, so a
// new or removed skill fails here until both READMEs say so.

const root = join(import.meta.dirname, "..");
const skills = readdirSync(join(root, "plugins/arnaud-zg/skills")).sort();
const rootReadme = readFileSync(join(root, "README.md"), "utf8");
const pluginReadme = readFileSync(join(root, "plugins/arnaud-zg/README.md"), "utf8");

const linked = (text: string, pattern: RegExp) =>
  [...text.matchAll(pattern)].map((match) => match[1]).sort();

describe("the skill list in the READMEs", () => {
  it("given the root README, then its use cases link every skill on disk, and only those", () => {
    expect(linked(rootReadme, /^- \*\*.+\*\*: use\s+\[`([a-z0-9-]+)`\]/gm)).toEqual(skills);
  });

  it("given the plugin README, then its table has one row per skill on disk, and only those", () => {
    expect(linked(pluginReadme, /^\| \[\S+ `([a-z0-9-]+)`\]\(docs\//gm)).toEqual(skills);
  });
});
