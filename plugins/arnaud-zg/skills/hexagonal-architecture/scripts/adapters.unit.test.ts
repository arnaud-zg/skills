import { describe, expect, test } from "vitest";

import { adapterHome, legacyHomes, parseAdapterName, readFulfils } from "./adapters.mjs";

describe("an adapter's file name", () => {
  test("given <port>.<name>.md, then the port and the name are read from it", () => {
    expect(parseAdapterName("a/b/project.kipik-academy.md")).toEqual({
      port: "project",
      name: "kipik-academy",
    });
  });

  test("given a name that is not two lowercase words joined by a dot, then it is not an adapter", () => {
    for (const file of [
      "project.md",
      "Project.acme.md",
      "project.acme.txt",
      "a.b.c.md",
      "README.md",
    ]) {
      expect(parseAdapterName(file), file).toBeNull();
    }
  });
});

describe("an adapter's frontmatter", () => {
  test("given fulfils, quoted or not, then its value is read", () => {
    expect(readFulfils("---\nfulfils: project\n---\n# x")).toBe("project");
    expect(readFulfils('---\ntakes: x\nfulfils: "forge"\n---\n')).toBe("forge");
  });

  test("given no frontmatter or no fulfils key, then there is none", () => {
    expect(readFulfils("# no frontmatter")).toBeNull();
    expect(readFulfils("---\ntakes: x\n---\n")).toBeNull();
    expect(readFulfils("---\nfulfils:\n---\n")).toBeNull();
  });
});

describe("where a skill's adapters live", () => {
  test("given a skill, then its home is .agents/adapters/<skill> under the root", () => {
    expect(adapterHome("/repo", "stack-and-ship")).toBe("/repo/.agents/adapters/stack-and-ship");
  });

  test("given a skill with an old alias, then both legacy folders are looked at, its own name first", () => {
    expect(legacyHomes("/repo", "big-o-optimizer")).toEqual([
      "/repo/.big-o-optimizer/adapters",
      "/repo/.big-o/adapters",
    ]);
  });
});
