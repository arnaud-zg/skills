import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "..");
const skills = readdirSync(join(root, "plugins/arnaud-zg/skills")).sort();
const rootReadme = readFileSync(join(root, "README.md"), "utf8");
const pluginReadme = readFileSync(join(root, "plugins/arnaud-zg/README.md"), "utf8");

describe("skill list in the READMEs", () => {
  it("root README links every skill on disk, and only those", () => {
    const linked = [...rootReadme.matchAll(/plugins\/arnaud-zg\/README\.md#([a-z0-9-]+)\)/g)]
      .map((m) => m[1])
      .filter((a) => a !== "skills")
      .sort();
    expect(linked).toEqual(skills);
  });

  it("plugin README has one section per skill on disk, and only those", () => {
    const sections = [...pluginReadme.matchAll(/^### ([a-z0-9-]+)$/gm)].map((m) => m[1]).sort();
    expect(sections).toEqual(skills);
  });
});
