// What makes a one-minute brief valid, and how the words a reader actually reads are counted
// against the budget. Every finding names the field it is about and the fix.
import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { LIMITS, readWords, TARGETS, validateBrief } from "./brief.mjs";

const words = (count) => Array.from({ length: count }, (_, index) => `w${index}`).join(" ");

const block = (over = {}) => ({
  heading: "The check runs earlier",
  line: "The check now runs before the release, not after it.",
  picture: { kind: "mermaid", source: "flowchart LR\n  a --> b" },
  ...over,
});

const brief = (over = {}) => ({
  title: "Release gate moves",
  target: "artifact",
  tldr: "Good idea. One thing to fix: the check runs too late.",
  numbers: [{ value: "1 step", label: "moved earlier" }],
  blocks: [block()],
  sources: { read: ["the proposal"], notRead: [], notTested: "Nothing was run." },
  ...over,
});

const fields = (findings) => findings.map((finding) => finding.field);
const findingFor = (findings, field) => findings.find((finding) => finding.field === field);

describe("a complete brief", () => {
  it("given every field within its limit, then there is no finding", () => {
    assert.deepEqual(validateBrief(brief()), []);
  });

  it("given copy snippets and a fold of two, then there is no finding", () => {
    const copy = [{ label: "Reply", text: "Not today." }];
    const entry = { heading: "Left out", text: "Naming, already raised." };
    assert.deepEqual(validateBrief(brief({ blocks: [block({ copy })], fold: [entry, entry] })), []);
  });

  it("names the four targets a caller can name", () => {
    assert.deepEqual(Object.keys(TARGETS).sort(), [
      "artifact",
      "markdown",
      "pr-description",
      "terminal",
    ]);
  });
});

describe("every finding says where and how to fix it", () => {
  it("given a long title, then the finding names the title, the limit and a fix", () => {
    const finding = findingFor(validateBrief(brief({ title: words(LIMITS.title + 1) })), "title");
    assert.match(finding.message, /5 words, at most 4/);
    assert.match(finding.fix, /\w/);
  });

  it("given a long TLDR, then the TLDR is named", () => {
    const findings = validateBrief(brief({ tldr: words(LIMITS.tldr + 1) }));
    assert.match(findingFor(findings, "tldr").message, /26 words, at most 25/);
  });

  it("given a long heading and a long line, then each is named by its block", () => {
    const findings = validateBrief(
      brief({ blocks: [block(), block({ heading: words(7), line: words(16) })] }),
    );
    assert.deepEqual(fields(findings), ["blocks[1].heading", "blocks[1].line"]);
  });
});

describe("the shape of the read", () => {
  it("given no block, then the blocks are named", () => {
    assert.deepEqual(fields(validateBrief(brief({ blocks: [] }))), ["blocks"]);
  });

  it("given five blocks, then the blocks are named with the limit", () => {
    const findings = validateBrief(brief({ blocks: Array.from({ length: 5 }, () => block()) }));
    assert.match(findingFor(findings, "blocks").message, /5 blocks, at most 4/);
  });

  it("given a fold of three, then the fold is named and told to become a block", () => {
    const entry = { heading: "Left out", text: "Naming." };
    const finding = findingFor(validateBrief(brief({ fold: [entry, entry, entry] })), "fold");
    assert.match(finding.fix, /block/);
  });

  it("given a fold entry without a heading, then that entry is named", () => {
    assert.deepEqual(fields(validateBrief(brief({ fold: [{ text: "Naming." }] }))), ["fold[0]"]);
  });

  it("given a copy snippet without text, then that snippet is named", () => {
    const findings = validateBrief(brief({ blocks: [block({ copy: [{ label: "Reply" }] })] }));
    assert.deepEqual(fields(findings), ["blocks[0].copy[0]"]);
  });
});

describe("the target", () => {
  it("given no target, then it asks the caller to name one rather than guessing", () => {
    const finding = findingFor(validateBrief(brief({ target: undefined })), "target");
    assert.match(finding.message, /artifact, pr-description, terminal, markdown/);
    assert.match(finding.fix, /caller/);
  });

  it("given the terminal, then a mermaid picture is refused and a table offered", () => {
    const finding = findingFor(validateBrief(brief({ target: "terminal" })), "blocks[0].picture");
    assert.match(finding.message, /terminal does not draw mermaid/);
    assert.match(finding.fix, /table/);
  });

  it("given the terminal, then a table wider than 100 columns is refused", () => {
    const wide = { kind: "table", rows: [["a".repeat(60), "b".repeat(60)]] };
    const findings = validateBrief(
      brief({ target: "terminal", blocks: [block({ picture: wide })] }),
    );
    assert.match(findingFor(findings, "blocks[0].picture").message, /127 columns, at most 100/);
  });

  it("given the terminal, then a table that fits is accepted", () => {
    const narrow = {
      kind: "table",
      rows: [
        ["Before", "After"],
        ["One check", "Two checks"],
      ],
    };
    assert.deepEqual(
      validateBrief(brief({ target: "terminal", blocks: [block({ picture: narrow })] })),
      [],
    );
  });

  it("given a pull request description, then a mermaid picture is accepted", () => {
    assert.deepEqual(validateBrief(brief({ target: "pr-description" })), []);
  });
});

describe("the picture", () => {
  it("given an unknown kind, then the picture is named with the kinds it may be", () => {
    const finding = findingFor(
      validateBrief(brief({ blocks: [block({ picture: { kind: "chart" } })] })),
      "blocks[0].picture",
    );
    assert.match(finding.message, /mermaid, table, none/);
  });

  it("given no picture at all, then the picture is named", () => {
    assert.deepEqual(fields(validateBrief(brief({ blocks: [block({ picture: undefined })] }))), [
      "blocks[0].picture",
    ]);
  });

  it("given a mermaid picture without source, then the picture is named", () => {
    const findings = validateBrief(brief({ blocks: [block({ picture: { kind: "mermaid" } })] }));
    assert.match(findingFor(findings, "blocks[0].picture").message, /source/);
  });

  it("given a table without rows, then the picture is named", () => {
    const findings = validateBrief(
      brief({ blocks: [block({ picture: { kind: "table", rows: [] } })] }),
    );
    assert.match(findingFor(findings, "blocks[0].picture").message, /rows/);
  });

  it("given a table of four columns, then it is refused at three", () => {
    const table = { kind: "table", rows: [["a", "b", "c", "d"]] };
    const findings = validateBrief(brief({ blocks: [block({ picture: table })] }));
    assert.match(findingFor(findings, "blocks[0].picture").message, /4 columns, at most 3/);
  });
});

describe("the sources", () => {
  it("given nothing read and nothing said about tests, then each field is named", () => {
    const findings = validateBrief(brief({ sources: { read: [] } }));
    assert.deepEqual(fields(findings), ["sources.read", "sources.notRead", "sources.notTested"]);
  });

  it("given no sources at all, then the three fields are named", () => {
    const findings = validateBrief(brief({ sources: undefined }));
    assert.deepEqual(fields(findings), ["sources.read", "sources.notRead", "sources.notTested"]);
  });
});

describe("the words", () => {
  it("given an em dash anywhere, even in a chart, then the field holding it is named", () => {
    const chart = { kind: "mermaid", source: 'flowchart LR\n  a["one — two"] --> b' };
    const findings = validateBrief(brief({ blocks: [block({ picture: chart })] }));
    assert.deepEqual(fields(findings), ["blocks[0].picture.source"]);
  });

  it("counts the title, TLDR, headings, lines and table cells, never the chart or the fold", () => {
    const table = { kind: "table", rows: [["one two", "three"]] };
    const base = brief({
      title: "a",
      tldr: "b",
      numbers: [],
      blocks: [block({ heading: "c", line: "d e" })],
    });
    const fold = [{ heading: "many words in here", text: "and many more words here too" }];
    assert.equal(readWords(base), 5);
    assert.equal(readWords({ ...base, fold }), 5);
    assert.equal(
      readWords({ ...base, blocks: [block({ heading: "c", line: "d e", picture: table })] }),
      8,
    );
  });

  it("given a read over 200 words, then the finding names the count", () => {
    const table = { kind: "table", rows: [[words(200)]] };
    const findings = validateBrief(brief({ blocks: [block({ picture: table })] }));
    assert.match(findingFor(findings, "blocks").message, /reads 2\d\d words, at most 200/);
  });

  it("given four full blocks, then the read still fits the budget", () => {
    const full = block({
      heading: words(LIMITS.heading),
      line: words(LIMITS.line),
    });
    const figure = { value: "40%", label: words(LIMITS.label) };
    const numbers = Array.from({ length: LIMITS.numbers }, () => figure);
    const blocks = [full, full, full, full];
    const fullBrief = brief({ title: words(4), tldr: words(25), numbers, blocks });
    assert.deepEqual(validateBrief(fullBrief), []);
  });
});

describe("the key numbers", () => {
  it("given a figure and a short label, then it holds and counts toward the read", () => {
    const numbers = [{ value: "3x", label: "faster cold start" }];
    const base = brief({
      title: "a",
      tldr: "b",
      numbers: [],
      blocks: [block({ heading: "c", line: "d" })],
    });
    assert.deepEqual(validateBrief(brief({ numbers })), []);
    assert.equal(readWords({ ...base, numbers }), readWords(base) + 4);
  });

  it("given an empty list, then the brief says on purpose that the work holds no figure", () => {
    assert.deepEqual(validateBrief(brief({ numbers: [] })), []);
  });

  it("given no numbers field, then it is named with a fix", () => {
    const { numbers, ...rest } = brief();
    assert.match(findingFor(validateBrief(rest), "numbers").message, /missing/);
  });

  it("given a value with no digit, then that value is named", () => {
    const findings = validateBrief(brief({ numbers: [{ value: "many", label: "users" }] }));
    assert.match(findingFor(findings, "numbers[0].value").message, /no digit/);
  });

  it("given a long label, then that label is named", () => {
    const numbers = [{ value: "12", label: words(LIMITS.label + 1) }];
    assert.ok(fields(validateBrief(brief({ numbers }))).includes("numbers[0].label"));
  });

  it("given more figures than the limit, then the list is named", () => {
    const numbers = Array.from({ length: LIMITS.numbers + 1 }, () => ({ value: "1", label: "x" }));
    assert.match(findingFor(validateBrief(brief({ numbers })), "numbers").message, /at most 4/);
  });
});

describe("the picture comes first", () => {
  it("given a first block with no picture, then it is named", () => {
    const findings = validateBrief(brief({ blocks: [block({ picture: { kind: "none" } })] }));
    assert.match(findingFor(findings, "blocks[0].picture").message, /must show a picture/);
  });

  it("given a later block with no picture, then it holds", () => {
    const blocks = [block(), block({ picture: { kind: "none" } })];
    assert.deepEqual(validateBrief(brief({ blocks })), []);
  });
});

describe("a brief that is not one", () => {
  it("given nothing, then it says a brief is an object and does not throw", () => {
    for (const absent of [null, undefined, [], "text", 3]) {
      assert.deepEqual(fields(validateBrief(absent)), ["(brief)"]);
    }
  });

  it("given an empty object, then every required field is named", () => {
    assert.deepEqual(fields(validateBrief({})), [
      "title",
      "tldr",
      "target",
      "numbers",
      "blocks",
      "sources.read",
      "sources.notRead",
      "sources.notTested",
    ]);
  });

  it("counts no words in nothing", () => {
    assert.equal(readWords(null), 0);
    assert.equal(readWords({}), 0);
  });
});
