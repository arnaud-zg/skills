// What a reader sees in a chart: every line but styling, with only syntax taken out. One case per
// chart type domain/pictures.md recommends, each with a banned character in a label (seen) and one
// with it only in syntax (not seen).
import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { mermaidLabels } from "./visible.mjs";

const sees = (source, character) => mermaidLabels(source).join("\n").includes(character);
const lines = (...rows) => rows.join("\n");

const CHARTS = [
  {
    type: "flowchart LR",
    labels: [
      lines("flowchart LR", "  a -- re;run --> b"),
      lines("flowchart LR", "  a -. re;run .-> b"),
      lines("flowchart LR", "  a == re;run ==> b"),
      lines("flowchart LR", "  a -->|re;run| b"),
      lines("flowchart LR", "  a>re;run] --> b"),
      lines("flowchart LR", '  a["re;run"] --> b(Ship)'),
      lines("flowchart LR", "  a{re;run?} --> b"),
    ],
    syntax: [
      [
        "-",
        lines(
          "flowchart LR",
          "  a[Build] --> b[Check]",
          "  b -.-> c[Ship]",
          "  c ==> d",
          "  d --o e",
          "  e --x f",
          "  f --- g",
          "  g <--> h",
        ),
      ],
      ["[", lines("flowchart LR", "  a[Build] --> b[[Check]]", "  b --> c[(Store)]")],
      ["(", lines("flowchart LR", "  a(Build) --> b((Check))", "  b --> c([Ship])")],
      ['"', lines("flowchart LR", '  a["Build"] --> b["Check"]')],
      ["|", lines("flowchart LR", "  a -->|ships| b")],
    ],
  },
  {
    type: "flowchart TB",
    labels: [
      lines("flowchart TB", "  subgraph Before; old", "    a[Build]", "  end"),
      lines("flowchart TB", '  subgraph now["Exists; today"]', "    a[Build]", "  end"),
    ],
    syntax: [
      [
        "-",
        lines(
          "flowchart TB",
          "  subgraph today[Exists today]",
          "    a[Build]",
          "  end",
          "  a --> b",
          "  classDef c stroke-width:3px,stroke-dasharray:5 5",
          "  class a c",
          "  style b fill:#fff",
          "  linkStyle 0 stroke-width:3px",
          "  %% a-comment",
        ),
      ],
    ],
  },
  {
    type: "sequenceDiagram",
    labels: [
      lines("sequenceDiagram", "  participant A as Re;viewer", "  A->>B: hi"),
      lines("sequenceDiagram", "  actor A as Au;thor"),
      lines("sequenceDiagram", "  A->>B: re;run the check"),
      lines("sequenceDiagram", "  loop Every; hour", "    A->>B: ping", "  end"),
      lines(
        "sequenceDiagram",
        "  alt Passes; first",
        "    A->>B: ok",
        "  else Fails; then",
        "  end",
      ),
      lines("sequenceDiagram", "  Note over A,B: re;run"),
    ],
    syntax: [
      [
        "-",
        lines(
          "sequenceDiagram",
          "  A->>B: hi",
          "  B-->>A: ok",
          "  A-xB: no",
          "  A-)B: async",
          "  A->B: plain",
          "  A->>+B: up",
          "  B-->>-A: down",
        ),
      ],
      [">", lines("sequenceDiagram", "  A->>B: hi", "  B-->>A: ok")],
    ],
  },
  {
    type: "timeline",
    labels: [
      lines("timeline", "  title Roll; out"),
      lines("timeline", "  section Q4; first", "    October : beta"),
      lines("timeline", "  October : beta; wide"),
    ],
    syntax: [["-", lines("timeline", "  title Rollout", "  October : beta")]],
  },
  {
    type: "quadrantChart",
    labels: [
      lines("quadrantChart", "  title Options; ranked"),
      lines("quadrantChart", "  x-axis Low; effort --> High effort"),
      lines("quadrantChart", "  y-axis Low value --> High; value"),
      lines("quadrantChart", "  quadrant-1 Do; now"),
      lines("quadrantChart", "  Option; A: [0.3, 0.6]"),
    ],
    syntax: [
      [
        "-",
        lines(
          "quadrantChart",
          "  x-axis Low effort --> High effort",
          "  y-axis Low value --> High value",
          "  quadrant-1 Do now",
          "  quadrant-4 Later",
        ),
      ],
    ],
  },
  {
    type: "pie",
    labels: [lines("pie title Budget; split", '  "Build" : 40'), lines("pie", '  "Bu;ild" : 40')],
    syntax: [['"', lines("pie title Budget", '  "Build" : 40', '  "Test" : 60')]],
  },
  {
    type: "xychart-beta",
    labels: [
      lines("xychart-beta", "  title Sales; 2026"),
      lines("xychart-beta", '  title "Sales; 2026"'),
      lines("xychart-beta", "  x-axis [jan, fe;b]"),
      lines("xychart-beta", '  y-axis "Reve;nue" 0 --> 100'),
    ],
    syntax: [
      [
        "-",
        lines(
          "xychart-beta",
          "  title Sales",
          "  x-axis [jan, feb]",
          "  y-axis Revenue 0 --> 100",
          "  bar [5, 6]",
          "  line [5, 6]",
        ),
      ],
    ],
  },
];

for (const chart of CHARTS) {
  describe(`a ${chart.type} chart`, () => {
    for (const source of chart.labels) {
      it(`given a banned character in a label, then it is seen: ${JSON.stringify(source)}`, () => {
        assert.equal(sees(source, ";"), true);
      });
    }

    for (const [character, source] of chart.syntax) {
      it(`given "${character}" only as syntax, then it is not seen`, () => {
        assert.equal(sees(source, character), false, mermaidLabels(source).join(" / "));
      });
    }
  });
}

describe("lines a reader never sees", () => {
  it("given only the diagram line and styling, then nothing is read", () => {
    const source = lines(
      "flowchart LR",
      "  classDef c fill:#fff",
      "  %% note",
      "  linkStyle 0 stroke:#000",
    );
    assert.deepEqual(
      mermaidLabels(source).filter((text) => text.trim() !== ""),
      [],
    );
  });
});
