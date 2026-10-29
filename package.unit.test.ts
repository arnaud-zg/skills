import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const pkg = JSON.parse(readFileSync(path.join(import.meta.dirname, "package.json"), "utf8")) as {
  private?: boolean;
};

describe("the workspace root", () => {
  test("is private, so `changeset publish` never pushes it to npm", () => {
    expect(pkg.private).toBe(true);
  });
});
