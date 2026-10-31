# 🚀 Tutorial: check a first test suite

[📚 Docs home](../../../../docs/README.md) › [🏆 testing-trophy](README.md) › **🚀 Tutorial** ·
[🛠️ How-to](how-to.md) · [📖 Reference](reference.md) · [💡 Explanation](explanation.md)

**2 minutes, 2 steps: run the check, read the counts.**

## 1. Run the check on a project

```sh
node plugins/arnaud-zg/skills/testing-trophy/scripts/check-trophy.mjs plugins/arnaud-zg/examples/testing-trophy/suite
```

## 2. Read the counts

You should see:

```text
TROPHY unit 0 · integration 1 · e2e 0 · static yes
✓ the suite holds the trophy.
```

One integration file, a `tsconfig.json` for the static base, nothing bending the shape. Next, the
[How-to guides](how-to.md) plan and write tests for your own package.
