// A caller's convention is honoured on top of the brief, inside the check: required sections are
// blocks, never folded, never left out; a required screenshot is an image picture; banned characters
// are refused. Also: the image picture, the em dash in its entity forms, and the adapters naming
// exactly the targets the check knows.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";

import { TARGETS, validateBrief } from "./brief.mjs";

const ADAPTERS = join(dirname(fileURLToPath(import.meta.url)), "..", "adapters");

const table = { kind: "table", rows: [["Before", "After"]] };

const block = (heading: string, picture: object = table) => ({
  heading,
  line: "One short line the picture proves.",
  picture,
});

const brief = (over = {}) => ({
  title: "Release gate moves",
  target: "pr-description",
  tldr: "The check now runs before the release.",
  numbers: [{ value: "1 step", label: "moved earlier" }],
  blocks: [block("What you get"), block("Verified")],
  sources: { read: ["the diff"], notRead: [], notTested: "Nothing was run." },
  ...over,
});

const convention = (over = {}) => ({
  lead: "Why it matters",
  headings: ["Why it matters", "What you get", "Verified"],
  picture: "any",
  ...over,
});

const fields = (findings) => findings.map((finding) => finding.field);
const findingFor = (findings, field) => findings.find((finding) => finding.field === field);
const image = { kind: "image", src: "evidence/today.png", alt: "Today before and after" };

describe("a caller's convention", () => {
  it("given every required heading as a block and the lead left to the TLDR, then there is no finding", () => {
    assert.deepEqual(validateBrief(brief({ convention: convention() })), []);
  });

  it("matches a required heading whatever its case and spacing", () => {
    const blocks = [block("what  you GET"), block("verified")];
    assert.deepEqual(validateBrief(brief({ blocks, convention: convention() })), []);
  });

  it("given a required heading no block carries, then the blocks are named with the heading", () => {
    const findings = validateBrief(
      brief({ blocks: [block("Verified")], convention: convention() }),
    );
    assert.match(
      findingFor(findings, "blocks").message,
      /misses the required heading "What you get"/,
    );
  });

  it("given a required heading in the fold, then that fold entry is refused", () => {
    const fold = [{ heading: "What you get", text: "A longer list." }];
    const blocks = [block("What you get"), block("Verified")];
    const findings = validateBrief(brief({ blocks, fold, convention: convention() }));
    const finding = findingFor(findings, "fold[0]");
    assert.match(finding.message, /folds the required heading "What you get"/);
    assert.match(finding.fix, /block/);
  });

  it("given more required sections than blocks allowed, then it says so for the caller to decide", () => {
    const headings = ["One", "Two", "Three", "Four", "Five"];
    const findings = validateBrief(
      brief({ convention: convention({ lead: undefined, headings }) }),
    );
    const finding = findingFor(findings, "convention.headings");
    assert.match(finding.message, /requires 5 sections, at most 4 blocks/);
    assert.match(finding.fix, /caller/);
    assert.equal(findingFor(findings, "blocks"), undefined);
  });

  it("given a convention that requires an image and no block carries one, then it is refused", () => {
    const findings = validateBrief(brief({ convention: convention({ picture: "image" }) }));
    assert.match(findingFor(findings, "convention.picture").message, /requires an image/);
  });

  it("given a convention that requires an image and a block carries one, then there is no finding", () => {
    const blocks = [block("What you get", image), block("Verified")];
    assert.deepEqual(
      validateBrief(brief({ blocks, convention: convention({ picture: "image" }) })),
      [],
    );
  });

  it("given an unknown picture rule, then the rule is named", () => {
    const findings = validateBrief(brief({ convention: convention({ picture: "photo" }) }));
    assert.deepEqual(fields(findings), ["convention.picture"]);
  });

  it("given banned characters, then every field holding one is named, and the convention itself is not", () => {
    const findings = validateBrief(
      brief({
        tldr: "The check runs; before the release.",
        convention: convention({ banned: [";"] }),
      }),
    );
    assert.deepEqual(fields(findings), ["tldr"]);
  });

  it("given a convention that is not an object, then it is named", () => {
    assert.deepEqual(fields(validateBrief(brief({ convention: "the template" }))), ["convention"]);
  });

  it("given no convention, then nothing is required", () => {
    assert.deepEqual(validateBrief(brief({ blocks: [block("Anything at all")] })), []);
  });
});

describe("the image picture", () => {
  for (const target of ["artifact", "pr-description", "markdown"]) {
    it(`given ${target}, then an image with its source and alt text is accepted`, () => {
      assert.deepEqual(validateBrief(brief({ target, blocks: [block("Shown", image)] })), []);
    });
  }

  it("given the terminal, then an image is refused and a table offered", () => {
    const findings = validateBrief(brief({ target: "terminal", blocks: [block("Shown", image)] }));
    const finding = findingFor(findings, "blocks[0].picture");
    assert.match(finding.message, /terminal does not draw an image/);
    assert.match(finding.fix, /table/);
  });

  it("given an image without alt text, then the picture is named", () => {
    const blocks = [block("Shown", { kind: "image", src: "a.png" })];
    assert.match(findingFor(validateBrief(brief({ blocks })), "blocks[0].picture").message, /alt/);
  });
});

describe("the em dash in every spelling", () => {
  for (const spelling of ["&mdash;", "&#8212;", "&#x2014;", "&#X2014;"]) {
    it(`given ${spelling}, then the field holding it is named`, () => {
      const findings = validateBrief(brief({ tldr: `The check runs ${spelling} earlier.` }));
      assert.deepEqual(fields(findings), ["tldr"]);
    });
  }
});

describe("the adapters and the check name the same targets", () => {
  const adapters = readdirSync(ADAPTERS).filter((name) => /^target\..+\.md$/.test(name));
  const frontmatterOf = (name) => readFileSync(join(ADAPTERS, name), "utf8").split("---")[1] ?? "";

  it("has one adapter per target the check knows, and no other", () => {
    const named = adapters.map((name) => name.slice("target.".length, -".md".length)).sort();
    assert.deepEqual(named, Object.keys(TARGETS).sort());
  });

  it("each adapter names its own target, and leaves what it draws to the check", () => {
    for (const name of adapters) {
      const frontmatter = frontmatterOf(name);
      assert.match(frontmatter, new RegExp(`^target: ${name.slice(7, -3)}$`, "m"), name);
      assert.doesNotMatch(frontmatter, /^(draws|width|mermaid|image):/m, name);
    }
  });
});

describe("a convention's lists are lists", () => {
  for (const field of ["headings", "banned"]) {
    it(`given ${field} written as one string, then it is refused rather than read as empty`, () => {
      const findings = validateBrief(
        brief({ convention: convention({ [field]: "What you get, ;" }) }),
      );
      assert.match(findingFor(findings, `convention.${field}`).message, /list of strings/);
    });

    it(`given ${field} holding something other than a string, then it is refused`, () => {
      const findings = validateBrief(
        brief({ convention: convention({ [field]: ["Verified", 3] }) }),
      );
      assert.match(findingFor(findings, `convention.${field}`).message, /list of strings/);
    });
  }

  it("given a footer that is neither a string nor a list of strings, then it is refused", () => {
    const findings = validateBrief(brief({ convention: convention({ footer: { line: "x" } }) }));
    assert.match(findingFor(findings, "convention.footer").message, /string or a list of strings/);
  });
});

describe("a required heading longer than a block heading may be", () => {
  const long = "Screenshots of every screen this change touched";

  it("given a block carrying it word for word, then the six-word cap does not refuse it", () => {
    const headings = ["What you get", long];
    const blocks = [block("What you get"), block(long)];
    assert.deepEqual(validateBrief(brief({ blocks, convention: convention({ headings }) })), []);
  });

  it("given the same long heading with no convention requiring it, then the cap still holds", () => {
    const findings = validateBrief(brief({ blocks: [block(long)] }));
    assert.match(findingFor(findings, "blocks[0].heading").message, /7 words, at most 6/);
  });
});

describe("the convention's footer", () => {
  const footer = ["Generated with a tool", "Reviewed by a person"];

  it("given a footer, then it holds and is outside the word budget", () => {
    const many = Array.from({ length: 300 }, (_, index) => `w${index}`).join(" ");
    assert.deepEqual(validateBrief(brief({ convention: convention({ footer: [many] }) })), []);
  });

  it("given an em dash in the footer, then it is reported for the caller, not reworded", () => {
    const findings = validateBrief(brief({ convention: convention({ footer: "Made — here" }) }));
    const finding = findingFor(findings, "convention.footer");
    assert.match(finding.message, /em dash/);
    assert.match(finding.fix, /the caller's own text: ask the caller/);
  });

  it("given a banned character in a footer line, then it is reported for the caller", () => {
    const findings = validateBrief(
      brief({ convention: convention({ footer, banned: ["person"] }) }),
    );
    const finding = findingFor(findings, "convention.footer[1]");
    assert.match(finding.fix, /the caller's own text: ask the caller/);
  });
});

describe("the em dash as Mermaid spells it", () => {
  for (const spelling of ["#8212;", "#mdash;", "#x2014;"]) {
    it(`given ${spelling} inside a chart label, then the chart is named`, () => {
      const chart = { kind: "mermaid", source: `flowchart LR\n  a["one ${spelling} two"] --> b` };
      const findings = validateBrief(brief({ blocks: [block("Shown", chart)] }));
      assert.deepEqual(fields(findings), ["blocks[0].picture.source"]);
    });
  }
});

describe("banned characters are looked for only where a reader sees them", () => {
  const dash = convention({ headings: [], banned: ["-"] });

  it("given a banned dash, then the target, the picture kind, the image source and chart syntax pass", () => {
    const chart = {
      kind: "mermaid",
      source:
        "flowchart LR\n  a[Build] --> b[Check]\n  classDef c stroke-width:3px,stroke-dasharray:5 5\n  linkStyle 0 stroke-width:3px",
    };
    const shot = { kind: "image", src: "evidence/before-after.png", alt: "Before and after" };
    const blocks = [block("Built", chart), block("Shown", shot)];
    assert.deepEqual(validateBrief(brief({ blocks, convention: dash })), []);
  });

  it("given a banned dash in a node label, an edge label or a message, then the chart is named", () => {
    for (const source of [
      'flowchart LR\n  a["re-run"] --> b',
      "flowchart LR\n  a -->|re-run| b",
      "sequenceDiagram\n  A->>B: re-run the check",
    ]) {
      const picture = { kind: "mermaid", source };
      const findings = validateBrief(
        brief({ blocks: [block("Shown", picture)], convention: dash }),
      );
      assert.deepEqual(fields(findings), ["blocks[0].picture.source"], source);
    }
  });

  it("given a banned dash in alt text, a table cell, a copy snippet, the fold or the sources, then each is named", () => {
    const shot = { kind: "image", src: "a.png", alt: "re-run" };
    const table = { kind: "table", rows: [["re-run"]] };
    const blocks = [
      { ...block("Shown", shot), copy: [{ label: "Reply", text: "re-run" }] },
      block("Listed", table),
    ];
    const fold = [{ heading: "Proof", text: "re-run" }];
    const sources = { read: ["the re-run"], notRead: [], notTested: "Nothing was run." };
    const findings = validateBrief(brief({ blocks, fold, sources, convention: dash }));
    assert.deepEqual(fields(findings).sort(), [
      "blocks[0].copy[0].text",
      "blocks[0].picture.alt",
      "blocks[1].picture.rows[0][0]",
      "fold[0].text",
      "sources.read[0]",
    ]);
  });
});

describe("an adapter's body leaves what a target draws to the check", () => {
  const adapters = readdirSync(ADAPTERS).filter((name) => /^target\..+\.md$/.test(name));
  const bodyOf = (name) =>
    readFileSync(join(ADAPTERS, name), "utf8").split("---").slice(2).join("---");
  const DRAWS =
    /\b(draws?|does not draw|cannot draw)\b[^.\n]*\b(mermaid|charts?|images?|tables?)\b/i;

  it("states no width as a number of columns, and no kind a target draws or does not", () => {
    for (const name of adapters) {
      const body = bodyOf(name);
      assert.doesNotMatch(body, /\b\d+\s*columns?\b/i, name);
      assert.doesNotMatch(body, DRAWS, name);
    }
  });
});
