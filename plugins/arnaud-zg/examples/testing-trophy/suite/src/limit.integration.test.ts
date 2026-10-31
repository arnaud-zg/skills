// A suite shaped as a trophy: one integration file, named by behaviour, no own-module mock.
import { describe, expect, test } from "vitest";

import { allows } from "./limit.mjs";

describe("a usage limit", () => {
  test("given a limit of zero, then no request is allowed", () => {
    expect(allows(0, 0)).toBe(false);
  });

  test("given usage under the limit, then the request is allowed", () => {
    expect(allows(1, 2)).toBe(true);
  });
});
