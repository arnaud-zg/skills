# 🛠️ How-to guides: testing-trophy

[📚 Docs home](../../../../docs/README.md) › [🏆 testing-trophy](README.md) ›
[🚀 Tutorial](tutorial.md) · **🛠️ How-to** · [📖 Reference](reference.md) ·
[💡 Explanation](explanation.md)

**3 verbs, one check.**

## Choose the testing trophy for a project

Say it in the project's `CLAUDE.md`, so every session uses it without being told:

```md
Tests: we follow the testing trophy, use `testing-trophy`.
```

## Plan the tests for a package

Ask _plan the tests for `<package>`_. You get a table: behaviour, layer, file, real or mocked.

## Write a failing test for a bug

Ask _write a failing test for this bug_. It lands at the lowest layer that reproduces it; the fix
goes in its own change.

## Fix an inverted trophy

Move what the unit tests prove into integration tests that use the real modules, then run the check
again.

## Example

[`examples/testing-trophy/suite/`](../../examples/testing-trophy/suite/): a suite that holds.
[`examples.integration.test.ts`](../../examples/examples.integration.test.ts) runs the check on it.
