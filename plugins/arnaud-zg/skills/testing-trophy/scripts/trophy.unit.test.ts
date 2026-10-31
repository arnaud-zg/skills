import { describe, expect, test } from "vitest";

import { inspectTrophy, layerOf } from "./trophy.mjs";

const rulesOf = (tests: Record<string, string>, hasStatic = true) =>
  inspectTrophy(new Map(Object.entries(tests)), { hasStatic }).findings.map(({ rule }) => rule);

describe("the layer of a test file", () => {
  test("given its name or folder, then the layer is read from it", () => {
    expect(layerOf("a.unit.test.ts")).toBe("unit");
    expect(layerOf("a.integration.spec.js")).toBe("integration");
    expect(layerOf("e2e/login.test.ts")).toBe("e2e");
    expect(layerOf("a.test.ts")).toBeNull();
  });
});

describe("the shape of a suite", () => {
  test("given more integration than unit files, behaviour names and no own mocks, then it holds", () => {
    expect(
      rulesOf({
        "a.unit.test.ts": 'test("given 0, then it refuses", () => {});',
        "a.integration.test.ts": "",
        "b.integration.test.ts": "",
      }),
    ).toEqual([]);
  });

  test("given more unit than integration files, then the trophy is inverted", () => {
    expect(rulesOf({ "a.unit.test.ts": "", "b.unit.test.ts": "" })).toEqual(["inverted"]);
  });

  test("given a test file with no layer in its name, then it is unlayered", () => {
    expect(rulesOf({ "a.test.ts": "" })).toEqual(["unlayered"]);
  });

  test("given a mock of a relative module, then it is an own mock, and a package mock is not", () => {
    const text = 'vi.mock("./store");\njest.mock("node-fetch");\n';
    expect(rulesOf({ "a.integration.test.ts": text })).toEqual(["own-mock"]);
  });

  test("given a test titled with a bare name, then it is reported", () => {
    expect(rulesOf({ "a.integration.test.ts": 'it("checkLimit", () => {});' })).toEqual(["named"]);
  });

  test("given no type checker and no linter, then the static base is missing", () => {
    expect(rulesOf({ "a.integration.test.ts": "" }, false)).toEqual(["static"]);
  });
});
