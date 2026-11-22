// The plain-language rules a script can see, fed the text a skill writes: what each level lets
// through, what it flags, and what it never reads because it is copied, not written.
import { describe, expect, it } from "vitest";

import { checkText, detectLang, sentencesOf } from "./plain.mjs";

const rules = (text: string, level: "strict" | "standard" | "light" = "standard") =>
  checkText(text, { level, lang: "en" }).findings.map((f) => f.rule);

const words = (n: number) => `${Array.from({ length: n }, () => "word").join(" ")}.`;

describe("the sentence limit of each level", () => {
  it("given 21 words, then strict flags it and standard lets it through", () => {
    expect(rules(words(21), "strict")).toEqual(["long"]);
    expect(rules(words(21), "standard")).toEqual([]);
  });

  it("given 26 words, then standard and light both flag it", () => {
    expect(rules(words(26), "standard")).toEqual(["long"]);
    expect(rules(words(26), "light")).toEqual(["long"]);
  });

  it("given a finding, then it names the line the sentence starts on", () => {
    const [finding] = checkText(`# Title\n\n${words(30)}`, { lang: "en" }).findings;
    expect(finding).toMatchObject({ line: 3, rule: "long", message: "30 words, at most 25" });
  });
});

describe("one idea per sentence, no filler", () => {
  it("given two ideas joined by a semicolon, then it asks for two sentences", () => {
    expect(rules("Fill the country; show one button.")).toEqual(["joined"]);
  });

  it("given filler words, then each one is a finding, case and apostrophe aside", () => {
    expect(rules("It's worth noting that we Really just need this.")).toEqual([
      "filler",
      "filler",
      "filler",
    ]);
  });

  it("given a word that only holds a filler word, then it is not flagged", () => {
    expect(rules("Adjust the verylong setting.")).toEqual([]);
  });

  it("given French filler, then the French list flags it", () => {
    const { findings } = checkText("Il convient de lancer le test.", { lang: "fr" });
    expect(findings.map((f) => f.rule)).toEqual(["filler"]);
  });
});

describe("steps start with a verb", () => {
  it("given a strict numbered step that opens on an article, then it is flagged", () => {
    expect(rules("1. The step is skipped.\n2. Run the check.", "strict")).toEqual(["step"]);
  });

  it("given the same step at standard level, then it is let through", () => {
    expect(rules("1. The step is skipped.", "standard")).toEqual([]);
  });
});

describe("the passive voice", () => {
  it("given a passive sentence, then it is a hint that never fails, and light gives none", () => {
    const standard = checkText("The file was deleted by the script.", { lang: "en" });
    expect(standard.findings).toEqual([]);
    expect(standard.hints.map((h) => h.rule)).toEqual(["passive"]);
    expect(checkText("The file was deleted.", { level: "light", lang: "en" }).hints).toEqual([]);
  });
});

describe("what is copied, not written", () => {
  it("given code, quotes, headings and frontmatter, then none of them is read", () => {
    const text = [
      "---",
      `description: ${words(40)}`,
      "---",
      `# ${words(40)}`,
      `> ${words(40)}`,
      "```",
      `${words(40)} just really`,
      "```",
      "Run `node scripts/a-very-long-command --with --many --flags --that --count --as --one` now.",
    ].join("\n");
    expect(checkText(text, { level: "strict", lang: "en" }).findings).toEqual([]);
  });

  it("given a table, then each cell is read on its own and the border is skipped", () => {
    const table = `| a | b |\n| --- | --- |\n| ${words(30)} | short |`;
    expect(sentencesOf(table).map((s) => s.line)).toEqual([1, 1, 3, 3]);
    expect(rules(table)).toEqual(["long"]);
  });

  it("given a paragraph over several lines, then its sentences are split on their ends", () => {
    expect(sentencesOf("Run the check.\nThen read it. Fix e.g. one line.").length).toBe(3);
  });

  it("given empty text, then nothing is found", () => {
    expect(checkText("", { lang: "en" })).toMatchObject({ findings: [], sentences: 0 });
  });
});

describe("the language", () => {
  it("given French or English text, then it is told apart", () => {
    expect(detectLang("Supprimez l'étape et lancez le test pour les fichiers.")).toBe("fr");
    expect(detectLang("Remove the step and run the test.")).toBe("en");
  });
});

describe("the language adapters", () => {
  it("given the adapters on disk, then they name the same languages as LANGUAGES", async () => {
    const { readdirSync } = await import("node:fs");
    const { LANGUAGES } = await import("./plain.mjs");
    const folder = new URL("../adapters/", import.meta.url);
    const named = readdirSync(folder)
      .map((name) => /^language\.([a-z]+)\.md$/.exec(name)?.[1])
      .filter(Boolean)
      .sort();
    expect(named).toEqual(Object.keys(LANGUAGES).sort());
  });
});
