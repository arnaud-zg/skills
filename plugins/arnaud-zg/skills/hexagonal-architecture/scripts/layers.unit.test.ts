import { describe, expect, test } from "vitest";

import { DEFAULT_LAYERS, inspectLayers, layerOf, parseLayers, resolveTarget } from "./layers.mjs";

const found = (files: Record<string, string>, spec?: string) =>
  inspectLayers(new Map(Object.entries(files)), spec).findings.map(
    ({ file, line, message }) => `${file}:${String(line)} ${message}`,
  );

describe("the layer of a path", () => {
  const layers = parseLayers(DEFAULT_LAYERS);

  test("given a folder name or one of its aliases, then the layer is read from it", () => {
    expect(layerOf("src/core", layers)?.name).toBe("domain");
    expect(layerOf("src/use-cases", layers)?.name).toBe("application");
    expect(layerOf("skill/verbs", layers)?.name).toBe("application");
    expect(layerOf("src/infra/db", layers)?.name).toBe("adapters");
    expect(layerOf("src/lib", layers)).toBeNull();
  });

  test("given a Python module, then dots become folders", () => {
    expect(resolveTarget("app/domain/order.py", "..adapters.db")).toBe("app/adapters/db");
    expect(resolveTarget("app/domain/order.py", "app.adapters.db")).toBe("app/adapters/db");
  });
});

describe("the dependency rule", () => {
  test("given adapters that import the domain and a use case that imports a port, then it holds", () => {
    expect(
      found({
        "src/adapters/db.ts": 'import { Order } from "../domain/order";',
        "src/application/place.ts": 'import type { Store } from "../ports/store";',
        "src/domain/order.ts": "export type Order = { id: string };",
      }),
    ).toEqual([]);
  });

  test("given a domain file that imports an adapter, then the line and the target print", () => {
    expect(
      found({ "src/domain/order.ts": '\nimport { db } from "../adapters/postgres.ts";' }),
    ).toEqual(["src/domain/order.ts:2 domain points out at adapters: ../adapters/postgres.ts"]);
  });

  test("given a Python use case that imports an adapter, then it points out", () => {
    expect(found({ "app/application/place.py": "from ..adapters.db import save\n" })).toEqual([
      "app/application/place.py:1 application points out at adapters: ..adapters.db",
    ]);
  });

  test("given a Go domain package that imports an adapter package, then it points out", () => {
    const text = 'package domain\n\nimport (\n\t"fmt"\n\t"example.com/shop/adapters/db"\n)\n';
    expect(found({ "domain/order.go": text })).toEqual([
      "domain/order.go:5 domain points out at adapters: example.com/shop/adapters/db",
    ]);
  });

  test("given a skill's domain page that links an adapter page, then it points out", () => {
    expect(found({ "skill/domain/rules.md": "See [the db](../adapters/db.md)." })).toEqual([
      "skill/domain/rules.md:1 domain points out at adapters: ../adapters/db.md",
    ]);
  });

  test("given the composition root or a ports page listing adapters, then it is wiring", () => {
    expect(
      found({
        "skill/ports/PORTS.md": "[db](../adapters/db.md)",
        "src/main.ts": 'import "./adapters/db";',
        "src/application/main.ts": 'import "../adapters/db";',
      }),
    ).toEqual([]);
  });

  test("given a domain file named like a layer beside it, then its folder names the layer", () => {
    expect(found({ "src/domain/order.ts": 'import "./ports.ts";' })).toEqual([]);
  });

  test("given a package and a web link, then neither is read as a layer", () => {
    expect(
      found({
        "src/domain/order.ts": 'import { z } from "zod";',
        "doc/domain/a.md": "[x](https://example.com/adapters/db)",
      }),
    ).toEqual([]);
  });

  test("given layers of the project's own, then they replace the defaults", () => {
    expect(found({ "model/a.ts": 'import "../web/b";' }, "model,web")).toEqual([
      "model/a.ts:1 model points out at web: ../web/b",
    ]);
  });
});
