import { describe, expect, test } from "vitest";

import { inspectAdapters, portsOf } from "./adapters-check.mjs";

const PORTS = [
  "| Port      | Count | Receives | Default  |",
  "| --------- | ----- | -------- | -------- |",
  "| `project` | 1     | words    | none     |",
  "| `forge`   | 1     | an issue | `github` |",
  "| `extra`   | any   | a step   | none     |",
  "",
  "| Port    | Adapter          |",
  "| ------- | ---------------- |",
  "| `board` | board.github.md  |",
].join("\n");

const skills = new Map<string, string | null>([
  ["stack-and-ship", PORTS],
  ["no-ports", null],
]);

const adapter = (
  path: string,
  fulfils: string | null = path.split("/").at(-1)?.split(".")[0] ?? "",
) => ({
  path,
  text: fulfils === null ? "# no frontmatter\n" : `---\nfulfils: ${fulfils}\n---\n`,
});

const checks = (files: { path: string; text: string }[], legacy: string[] = []) =>
  inspectAdapters({ files, legacy }, skills).map((finding) => `${finding.check} ${finding.path}`);

describe("a skill's ports page", () => {
  test("given a port table, then only its rows are ports, and a one-adapter port with no default is picked by its file alone", () => {
    expect(Object.fromEntries(portsOf(PORTS))).toEqual({
      project: { onlyByFile: true },
      forge: { onlyByFile: false },
      extra: { onlyByFile: false },
    });
  });
});

describe("a project's adapters", () => {
  test("given each file named for its port, fulfilling it, for a skill's port, then nothing is found", () => {
    expect(
      checks([
        adapter(".agents/adapters/stack-and-ship/project.acme.md"),
        adapter(".agents/adapters/stack-and-ship/forge.gitlab.md"),
        adapter(".agents/adapters/stack-and-ship/forge.gitea.md"),
      ]),
    ).toEqual([]);
  });

  test("given a file outside a skill's folder or not named <port>.<name>.md, then the name check flags it", () => {
    expect(
      checks([
        adapter(".agents/adapters/project.acme.md"),
        adapter(".agents/adapters/stack-and-ship/Project.md"),
      ]),
    ).toEqual([
      "name .agents/adapters/project.acme.md",
      "name .agents/adapters/stack-and-ship/Project.md",
    ]);
  });

  test("given no fulfils, or one naming another port, then the fulfils check flags it", () => {
    expect(
      checks([
        adapter(".agents/adapters/stack-and-ship/forge.gitlab.md", null),
        adapter(".agents/adapters/stack-and-ship/project.acme.md", "forge"),
      ]),
    ).toEqual([
      "fulfils .agents/adapters/stack-and-ship/forge.gitlab.md",
      "fulfils .agents/adapters/stack-and-ship/project.acme.md",
    ]);
  });

  test("given a folder for no installed skill, a skill with no ports, or an unknown port, then each is flagged, never guessed", () => {
    expect(
      checks([
        adapter(".agents/adapters/stack-and-shp/project.acme.md"),
        adapter(".agents/adapters/no-ports/project.acme.md"),
        adapter(".agents/adapters/stack-and-ship/board.jira.md"),
      ]),
    ).toEqual([
      "port .agents/adapters/no-ports/project.acme.md",
      "port .agents/adapters/stack-and-ship/board.jira.md",
      "skill .agents/adapters/stack-and-shp/project.acme.md",
    ]);
  });

  test("given two adapters for a port only its file picks, then both are flagged; several on a port with a default are fine", () => {
    expect(
      checks([
        adapter(".agents/adapters/stack-and-ship/project.a.md"),
        adapter(".agents/adapters/stack-and-ship/project.b.md"),
        adapter(".agents/adapters/stack-and-ship/extra.x.md"),
        adapter(".agents/adapters/stack-and-ship/extra.y.md"),
      ]),
    ).toEqual([
      "one .agents/adapters/stack-and-ship/project.a.md",
      "one .agents/adapters/stack-and-ship/project.b.md",
    ]);
  });

  test("given a legacy folder, then it is flagged with the skill it belongs to, an old alias resolved", () => {
    const findings = inspectAdapters({ files: [], legacy: [".big-o/adapters"] }, skills);
    expect(findings).toEqual([
      expect.objectContaining({
        check: "legacy",
        path: ".big-o/adapters",
        fix: expect.stringContaining(".agents/adapters/big-o-optimizer/") as string,
      }),
    ]);
  });
});
