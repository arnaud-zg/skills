#!/usr/bin/env bash
# Two unit files, no integration file, and one mock of the project's own module.
set -euo pipefail
mkdir -p src
printf '{}\n' > tsconfig.json
printf 'export const sum = (a, b) => a + b;\n' > src/sum.mjs
printf 'vi.mock("./sum.mjs");\nit("sum", () => {});\n' > src/sum.unit.test.ts
printf 'it("given 1 and 2, then 3", () => {});\n' > src/other.unit.test.ts
