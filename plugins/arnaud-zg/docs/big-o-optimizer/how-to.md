# 🛠️ How-to guides: plug your own behaviour into big-o-optimizer

[📚 Docs home](../../../../docs/README.md) › [⚡ big-o-optimizer](README.md) ›
[🚀 Tutorial](tutorial.md) · **🛠️ How-to** · [📖 Reference](reference.md) ·
[💡 Explanation](explanation.md)

One recipe per need. For a first run, see the [Tutorial](tutorial.md).

## Get timings, not only the Big O

Ask for them: _optimize this and benchmark it_. The skill switches to `measure.bench`, runs both
versions at two input sizes, and copies each figure from the command that printed it.

## Inject your own step

Drop a Markdown file in `.big-o/adapters/` at the project root, named `<port>.<name>.md`:

```markdown
---
fulfils: extra
step: after verify
---

# extra · eslint

Run `pnpm lint` on the changed files. A new warning fails the step.
```

The skill finds it on its next run and says it ran. `step` is `before rewrite`, `after verify` or
`end`.

## Replace how behaviour is verified

Add `replaces: verify.tests` to a `verify` adapter, for example one that runs a golden-file
comparison instead of the unit tests. Without `replaces`, it runs after the default.

## Use an adapter for one run only

Name its file in the request: _optimize src/search.ts with ./perf/verify.snapshot.md_.

## Example

[`examples/big-o-optimizer/adapters/extra.eslint.md`](../../examples/big-o-optimizer/adapters/extra.eslint.md):
an injected `extra` adapter. [`before.mjs`](../../examples/big-o-optimizer/before.mjs) and
[`after.mjs`](../../examples/big-o-optimizer/after.mjs): a rewrite
[`examples.integration.test.ts`](../../examples/examples.integration.test.ts) proves returns the
same users.
