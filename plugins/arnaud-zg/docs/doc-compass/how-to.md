# 🛠️ How-to guides: check Diataxis docs in CI, hooks and audits

[📚 Docs home](../../../../docs/README.md) › [🧭 doc-compass](README.md) ›
[🚀 Tutorial](tutorial.md) · **🛠️ How-to** · [📖 Reference](reference.md) ·
[💡 Explanation](explanation.md)

One task per section. New here? Start with the [Tutorial](tutorial.md). Every option named here is
in the [Reference](reference.md).

- [Fail a build when the docs break](#fail-a-build-when-the-docs-break)
- [Ban a house-style string](#ban-a-house-style-string)
- [Check docs whose home is the project README](#check-docs-whose-home-is-the-project-readme)
- [Keep a page that moved](#keep-a-page-that-moved)
- [Audit a docs set that grew without rules](#audit-a-docs-set-that-grew-without-rules)

## Fail a build when the docs break

Copy the skill into the project with the skills CLI, list the docs in `doc-compass.json` at the
project root, then run the check with no arguments where it always runs: a commit hook, and the
verify script CI calls. A check only CI runs by hand never fails.

```json
{ "ban": ["—"], "docs": ["docs"] }
```

```yaml
# lefthook.yml
pre-commit:
  commands:
    docs:
      glob: "**/*.md"
      run: node .claude/skills/doc-compass/scripts/check-docs.mjs
```

**Check it worked:** break a link in `docs/`, commit, and the hook prints the finding and exits `1`.

## Ban a house-style string

List each string the project's style rules forbid in prose under `"ban"` in `doc-compass.json`. Code
blocks, inline code and comments are skipped. For a one-off run, pass `--ban` instead:

```sh
node scripts/check-docs.mjs docs --ban "—" --ban "claude.ai/chat"
```

**Check it worked:** each finding says `banned`, with the page and the line.

## Check docs whose home is the project README

When the landing page sits above `docs/`, name it as the index:
`{ "folder": "docs", "index": "../README.md" }` in `doc-compass.json`, or on the command line. Links
then resolve from its folder.

```sh
node scripts/check-docs.mjs docs --index ../README.md
```

## Keep a page that moved

When code or other repos cite a page's old path, leave a gravestone there instead of deleting it.

1. Move the content to its new page, and link the new page from the index.
2. Copy `templates/gravestone.md` to the old path. Its title ends with `(moved)`, which exempts it
   from `indexed` and `framed`.
3. Point its link at the new page, and say how many files still cite it.

**Check it worked:** the check passes without the old path in the index.

## Audit a docs set that grew without rules

Ask Claude to _audit the docs_. It runs the check, reports the counts per rule as printed, then
reads each page for what no check sees. To see the size of the job first:

```sh
node scripts/check-docs.mjs docs --json > docs-audit.json
```

Too many findings to fix in one change? Fix every `resolves` finding first, then record the
remaining count as a baseline that each later change lowers.
