import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { descriptionOf, weighShelf as weighShelfOrNull } from "./weight.mjs";

// What a skill costs a model to load: the description every session pays, the entry every session
// that fires the skill pays, a page only when it is read. Text said in two pages is paid twice.

const SCRIPT = fileURLToPath(new URL("./weight.mjs", import.meta.url));
const base = mkdtempSync(join(tmpdir(), "skill-retro-weight-"));
after(() => rmSync(base, { recursive: true, force: true }));

const SHARED = "Every finding carries its evidence, a quote or a log line or a count.";

/** The weighed shelf; these cases all hold at least one skill. @param {string} root */
function weighShelf(root) {
  const weighed = weighShelfOrNull(root);
  assert.ok(weighed);
  return weighed;
}

/** @param {Record<string, string>} files */
function shelf(files) {
  const root = mkdtempSync(join(base, "shelf-"));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

/** @param {string | null} description @param {string} body */
const entry = (description, body) =>
  `---\nname: x\n${description === null ? "" : `description:\n  ${description}\n`}---\n${body}`;

/** @param {string[]} args */
function run(...args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });
}

describe("what each skill costs to load", () => {
  it("given a skill, then its description, entry body and each page are counted in characters, with tokens as characters over four", () => {
    const root = shelf({
      "alpha/SKILL.md": entry("Does one thing. Use when asked.", "\n# alpha\n\nRead the page.\n"),
      "alpha/verbs/go.md": "# Go\n\nDo it.\n",
    });
    const [alpha] = weighShelf(root).skills;
    assert.equal(alpha.name, "alpha");
    assert.deepEqual(alpha.description, { chars: 31, tokens: 8 });
    assert.deepEqual(alpha.entry, { chars: 25, tokens: 7 });
    assert.deepEqual(alpha.pages, [{ path: "alpha/verbs/go.md", chars: 13, tokens: 4 }]);
  });

  it("given a description folded over several lines, then it is counted as one line of words", () => {
    const root = shelf({
      "alpha/SKILL.md": "---\nname: alpha\ndescription:\n  Does one\n  thing.\n---\nBody.\n",
    });
    assert.equal(weighShelf(root).skills[0].description?.chars, "Does one thing.".length);
  });

  it("given a description written as a YAML block scalar, then the value is what YAML reads, never the indicator", () => {
    /** @param {string} front */
    const value = (front) => descriptionOf(`---\nname: alpha\n${front}---\nBody.\n`);
    assert.equal(value("description: >-\n  Does one\n  thing.\n"), "Does one thing.");
    assert.equal(value("description: >\n  First.\n\n  Second.\n"), "First.\nSecond.\n");
    assert.equal(value("description: |\n  First.\n\n  Second.\n"), "First.\n\nSecond.\n");
    assert.equal(value("description: |-\n  One.\n  Two.\nname2: x\n"), "One.\nTwo.");
    assert.equal(value("description:\n  First\n\n  Second\n"), "First\nSecond");
    assert.equal(value('description: "Does it. Use when."\n'), "Does it. Use when.");
  });

  it("given a literal description of two paragraphs, then both are counted", () => {
    const root = shelf({
      "alpha/SKILL.md": "---\nname: alpha\ndescription: |\n  First.\n\n  Second.\n---\nBody.\n",
    });
    assert.equal(weighShelf(root).skills[0].description?.chars, "First.\n\nSecond.\n".length);
  });

  it("given a README and an evidence page at the skill's root, then they are listed apart as not loaded on use, and never counted as pages", () => {
    const root = shelf({
      "alpha/SKILL.md": entry("A. Use when.", "Body.\n"),
      "alpha/README.md": "# For people\n",
      "alpha/evidence.md": "# Why\n",
      "alpha/verbs/go.md": "# Go\n",
    });
    const [alpha] = weighShelf(root).skills;
    assert.deepEqual(
      alpha.pages.map((page) => page.path),
      ["alpha/verbs/go.md"],
    );
    assert.deepEqual(alpha.notLoaded, [
      { path: "alpha/README.md", chars: 13, tokens: 4 },
      { path: "alpha/evidence.md", chars: 6, tokens: 2 },
    ]);
    assert.match(run(root).stdout, /not loaded on use {2}alpha\/README\.md/);
  });

  it("given a skill with no description, then the description is reported absent, never as zero", () => {
    const root = shelf({ "alpha/SKILL.md": entry(null, "Body.\n") });
    assert.equal(weighShelf(root).skills[0].description, null);
    assert.match(run(root).stdout, /alpha\s+description absent/);
  });

  it("given a folder beside the skills with no entry, then it is not weighed as a skill", () => {
    const root = shelf({ "alpha/SKILL.md": entry("A. Use when.", "B\n"), "docs/notes.md": "x\n" });
    assert.deepEqual(
      weighShelf(root).skills.map((skill) => skill.name),
      ["alpha"],
    );
  });
});

describe("text said twice", () => {
  it("given a sentence a page shares only with a README or an evidence page, then it is not a repeat, since those are not loaded on use", () => {
    const root = shelf({
      "alpha/SKILL.md": entry("A. Use when.", "Body.\n"),
      "alpha/README.md": `${SHARED}\n`,
      "alpha/evidence.md": `${SHARED}\n`,
      "alpha/verbs/go.md": `${SHARED}\n`,
    });
    assert.deepEqual(weighShelf(root).repeats, []);
  });

  it("given one sentence of eight words or more in two pages of a skill, then it is reported within that skill with both places", () => {
    const root = shelf({
      "alpha/SKILL.md": entry("A. Use when.", `\nIntro.\n\n${SHARED}\n`),
      "alpha/verbs/go.md": `# Go\n\nFirst line.\n${SHARED}\n`,
    });
    const [repeat] = weighShelf(root).repeats;
    assert.equal(repeat.scope, "within alpha");
    assert.deepEqual(repeat.places, [
      { file: "alpha/SKILL.md", line: 9 },
      { file: "alpha/verbs/go.md", line: 4 },
    ]);
  });

  it("given the same sentence in two skills, then it is reported across skills", () => {
    const root = shelf({
      "alpha/SKILL.md": entry("A. Use when.", `${SHARED}\n`),
      "beta/SKILL.md": entry("B. Use when.", `${SHARED}\n`),
    });
    assert.equal(weighShelf(root).repeats[0].scope, "across skills");
  });

  it("given a sentence wrapped at different words and styled differently on two pages, then it is still one repeat", () => {
    const root = shelf({
      "alpha/SKILL.md": entry(
        "A. Use when.",
        "Every finding carries its evidence, a quote\nor a log line or a count.\n",
      ),
      "alpha/verbs/go.md":
        "**Every finding** carries its `evidence`, a quote or a log\nline or a count.\n",
    });
    assert.equal(weighShelf(root).repeats.length, 1);
  });

  it("given a repeated sentence of seven words, a sentence repeated inside one page, or a repeated code block, then nothing is reported", () => {
    const short = "Seven words only are said here twice.";
    const fence = "```sh\nnode run the same command line with many many words here\n```\n";
    const root = shelf({
      "alpha/SKILL.md": entry("A. Use when.", `${short}\n\n${SHARED}\n\n${SHARED}\n\n${fence}`),
      "alpha/verbs/go.md": `${short}\n\n${fence}`,
    });
    assert.deepEqual(weighShelf(root).repeats, []);
  });

  it("given table rows that repeat across pages, then the row is reported once with both places", () => {
    const row = "| shape | one | the check a skill must pass after every single fix |\n";
    const root = shelf({
      "alpha/SKILL.md": entry("A. Use when.", `| a | b | c |\n| - | - | - |\n${row}`),
      "alpha/ports/PORTS.md": `| a | b | c |\n| - | - | - |\n${row}`,
    });
    assert.equal(weighShelf(root).repeats[0].places.length, 2);
  });
});

describe("the command", () => {
  it("given a shelf, then the text says the tokens are an estimate and lists every page", () => {
    const root = shelf({
      "alpha/SKILL.md": entry("A. Use when.", `${SHARED}\n`),
      "alpha/verbs/go.md": `${SHARED}\n`,
    });
    const out = run(root);
    assert.equal(out.status, 0);
    assert.match(out.stdout, /estimate: characters \/ 4/);
    assert.match(out.stdout, /alpha\/verbs\/go\.md/);
    assert.match(out.stdout, /REPEAT .* within alpha/);
    assert.match(out.stdout, /alpha\/verbs\/go\.md:1/);
  });

  it("given --json, then the record parses and carries the skills and the repeats", () => {
    const root = shelf({ "alpha/SKILL.md": entry("A. Use when.", "Body.\n") });
    const record = JSON.parse(run(root, "--json").stdout);
    assert.equal(record.estimate, "characters / 4");
    assert.equal(record.skills[0].name, "alpha");
    assert.deepEqual(record.repeats, []);
  });

  it("given a folder with no skill in it, or no folder at all, then it exits 2 and says so", () => {
    const empty = shelf({ "docs/notes.md": "x\n" });
    assert.equal(run(empty).status, 2);
    assert.match(run(empty).stdout, /no skill/);
    assert.equal(run(join(base, "missing")).status, 2);
    assert.equal(run().status, 2);
  });
});
