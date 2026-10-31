import { describe, expect, test } from "vitest";

import { anchorsOf, inspectDocs, isGravestone, slugOf } from "./rules.mjs";

type Pages = Record<string, string>;

const HOME = "[🏠 Home](README.md)";

/** A page that opens with the breadcrumb, so only what the test adds can break a rule. */
function page(title: string, body = "", home = HOME) {
  return `# ${title}\n\n${home} · **${title}**\n\n${body}\n`;
}

/** An index linking every page it is given, so they are all reached. */
function indexOf(...files: string[]) {
  return `# Docs\n\n${files.map((file) => `- [${file}](${file})`).join("\n")}\n`;
}

function findingsOf(pages: Pages, options = {}) {
  return inspectDocs(new Map(Object.entries(pages)), options).map(({ rule, file, line }) => ({
    rule,
    file,
    line,
  }));
}

describe("a docs set that holds", () => {
  test("given an index and four quadrant pages that link home, then nothing is found", () => {
    const quadrants = ["tutorial.md", "how-to.md", "reference.md", "explanation.md"];
    const pages: Pages = { "README.md": indexOf(...quadrants) };
    for (const file of quadrants) pages[file] = page(file);
    expect(findingsOf(pages)).toEqual([]);
  });
});

describe("indexed", () => {
  test("given a page no link reaches, then it is reported on its first line", () => {
    expect(findingsOf({ "README.md": indexOf(), "lost.md": page("Lost") })).toEqual([
      { rule: "indexed", file: "lost.md", line: 1 },
    ]);
  });

  test("given a page reached through another page, then it counts as indexed", () => {
    const pages = {
      "README.md": indexOf("adr/README.md"),
      "adr/README.md": page("ADRs", "- [One](ADR-001-one.md)", "[Home](../README.md)"),
      "adr/ADR-001-one.md": page("One", "", "[Home](../README.md)"),
    };
    expect(findingsOf(pages)).toEqual([]);
  });

  test("given a link to a folder, then it reaches that folder's README.md", () => {
    const pages = {
      "README.md": "# Docs\n\n[Decisions](adr/)\n",
      "adr/README.md": page("ADRs", "", "[Home](../README.md)"),
    };
    expect(findingsOf(pages)).toEqual([]);
  });

  test("given a gravestone nobody links, then it is exempt from the index and the frame", () => {
    const pages = { "README.md": indexOf(), "old.md": "# Old screens (moved)\n\nSee new.md.\n" };
    expect(findingsOf(pages)).toEqual([]);
  });

  test("given no index at all, then that is the one finding about the index", () => {
    expect(findingsOf({ "a.md": "# A\n" })).toEqual([
      { rule: "indexed", file: "README.md", line: 1 },
    ]);
  });

  test("given a named index, then it is read instead of README.md", () => {
    expect(
      findingsOf(
        { "index.md": "# Docs\n\n[A](a.md)\n", "a.md": "# A\n\n[Home](index.md)\n" },
        { index: "index.md" },
      ),
    ).toEqual([]);
  });
});

describe("resolves", () => {
  test("given a link to a page that does not exist, then the line is reported", () => {
    const pages = { "README.md": indexOf("a.md"), "a.md": page("A", "See [gone](gone.md).") };
    expect(findingsOf(pages)).toEqual([{ rule: "resolves", file: "a.md", line: 5 }]);
  });

  test("given an anchor no heading makes, then it is reported, and a real one is not", () => {
    const body =
      "## Check or write a skill\n\n[good](#check-or-write-a-skill) [bad](#check-a-skill)";
    const pages = { "README.md": indexOf("a.md"), "a.md": page("A", body) };
    expect(findingsOf(pages)).toEqual([{ rule: "resolves", file: "a.md", line: 7 }]);
  });

  test("given headings with emoji, inline code and repeats, then anchors follow GitHub", () => {
    const anchors = anchorsOf(
      "## 🚀 Tutorial\n## The lane: `pnpm verify` / `deep`\n## Steps\n## Steps\n",
    );
    expect([...anchors]).toEqual(["-tutorial", "the-lane-pnpm-verify--deep", "steps", "steps-1"]);
    expect(slugOf("[A link](x.md) and *bold*")).toBe("a-link-and-bold");
  });

  test("given links in code, URLs and absolute paths, then none of them is checked", () => {
    const body =
      "`[x](gone.md)`\n\n```md\n[y](gone.md)\n```\n\n[web](https://x.dev) [root](/abs.md)";
    const pages = { "README.md": indexOf("a.md"), "a.md": page("A", body) };
    expect(findingsOf(pages)).toEqual([]);
  });

  test("given a link outside the pages, then the exists option decides", () => {
    const pages = { "README.md": indexOf("a.md"), "a.md": page("A", "[code](../src/x.ts)") };
    expect(findingsOf(pages, { exists: () => true })).toEqual([]);
    expect(findingsOf(pages, { exists: () => false })).toEqual([
      { rule: "resolves", file: "a.md", line: 5 },
    ]);
  });

  test("given an anchor into a page outside, then it is checked against that page's headings", () => {
    const pages = {
      "README.md": indexOf("a.md"),
      "a.md": page("A", "[x](../CONTRIBUTING.md#setup)"),
    };
    const options = { exists: () => true, readOutside: () => "# Contributing\n## Install\n" };
    expect(findingsOf(pages, options)).toEqual([{ rule: "resolves", file: "a.md", line: 5 }]);
  });
});

describe("framed", () => {
  test("given a page with no link home near its top, then it is reported", () => {
    const late = `# A\n${"\n".repeat(12)}${HOME}\n`;
    expect(findingsOf({ "README.md": indexOf("a.md"), "a.md": late })).toEqual([
      { rule: "framed", file: "a.md", line: 1 },
    ]);
  });
});

describe("framed, in a nested docs set", () => {
  test("given pages that link their section's README, then they count as framed", () => {
    const pages = {
      "README.md": indexOf("tool/README.md"),
      "tool/README.md": page("Tool", "- [Guide](guide.md)", "[Home](../README.md)"),
      "tool/guide.md": page("Guide", "", "[Tool](README.md)"),
    };
    expect(findingsOf(pages)).toEqual([]);
  });

  test("given a section README that links only itself, then it is not framed", () => {
    const pages = {
      "README.md": indexOf("tool/README.md"),
      "tool/README.md": page("Tool", "", "[Tool](README.md)"),
    };
    expect(findingsOf(pages)).toEqual([{ rule: "framed", file: "tool/README.md", line: 1 }]);
  });

  test("given a README in a sibling folder, then it does not frame the page", () => {
    const pages = {
      "README.md": indexOf("a/README.md", "b/page.md"),
      "a/README.md": page("A", "", "[Home](../README.md)"),
      "b/page.md": page("Page", "", "[A](../a/README.md)"),
    };
    expect(findingsOf(pages)).toEqual([{ rule: "framed", file: "b/page.md", line: 1 }]);
  });
});

describe("superseded", () => {
  test("given an ADR superseded by one that never links back, then the status line is reported", () => {
    const pages = {
      "README.md": indexOf("adr-1.md", "adr-2.md"),
      "adr-1.md": page("ADR 1", "**Status:** Superseded by [ADR 2](adr-2.md)"),
      "adr-2.md": page("ADR 2", "**Status:** Accepted"),
    };
    expect(findingsOf(pages)).toEqual([{ rule: "superseded", file: "adr-1.md", line: 5 }]);
  });

  test("given the newer ADR links back, then the pair holds", () => {
    const pages = {
      "README.md": indexOf("adr-1.md", "adr-2.md"),
      "adr-1.md": page("ADR 1", "**Status:** Superseded by [ADR 2](adr-2.md)"),
      "adr-2.md": page("ADR 2", "**Status:** Accepted. Supersedes [ADR 1](adr-1.md)"),
    };
    expect(findingsOf(pages)).toEqual([]);
  });
});

describe("generated", () => {
  test("given a header naming a source, then the sourceExists option decides", () => {
    const body = "> Generated by `pnpm diagram` from `packages/engine`. Edit the source.";
    const pages = { "README.md": indexOf("a.md"), "a.md": page("A", body) };
    expect(findingsOf(pages, { sourceExists: () => true })).toEqual([]);
    expect(
      findingsOf(pages, { sourceExists: (source: string) => source !== "packages/engine" }),
    ).toEqual([{ rule: "generated", file: "a.md", line: 5 }]);
  });
});

describe("small", () => {
  test("given a page of 301 lines, then it is reported on line 301, and 300 is fine", () => {
    const fill = (count: number) => Array.from({ length: count - 4 }, () => "text").join("\n");
    const ok = { "README.md": indexOf("a.md"), "a.md": page("A", fill(300)) };
    const over = { "README.md": indexOf("a.md"), "a.md": page("A", fill(301)) };
    expect(findingsOf(ok)).toEqual([]);
    expect(findingsOf(over)).toEqual([{ rule: "small", file: "a.md", line: 301 }]);
  });
});

describe("banned", () => {
  test("given banned strings, then each one in prose is reported, and code is left alone", () => {
    const pages = { "README.md": indexOf("a.md"), "a.md": page("A", "one — two\n\n`a — b`") };
    expect(findingsOf(pages)).toEqual([]);
    expect(findingsOf(pages, { banned: ["—"] })).toEqual([
      { rule: "banned", file: "a.md", line: 5 },
    ]);
  });
});

describe("isGravestone", () => {
  test("given a title ending in (moved), then the page is a gravestone, and otherwise not", () => {
    expect(isGravestone("# Screens (moved)\n")).toBe(true);
    expect(isGravestone("# Screens\n\nIt moved.\n")).toBe(false);
  });
});
