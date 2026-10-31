# 🚀 Tutorial: start a checked Diataxis docs set

[📚 Docs home](../../../../docs/README.md) › [🧭 doc-compass](README.md) › **🚀 Tutorial** ·
[🛠️ How-to](how-to.md) · [📖 Reference](reference.md) · [💡 Explanation](explanation.md)

Ten minutes. You will copy the templates into a project, break the docs twice, watch the check find
both, fix them, and end with a clean result.

You will:

1. start a docs set that already holds
2. add a page the way people usually do, and see why it goes stale
3. fix it, and get exit 0

## Before you start

- Node 22 or later: `node --version`
- The skill installed (see the [docs home](README.md)), and an empty folder to work in. The commands
  below call the skill folder `$SKILL`: set it to where the skill was installed, for example
  `SKILL=~/.claude/skills/doc-compass`.

## 1. Copy the templates

```sh
cp -R $SKILL/templates docs && rm -f docs/gravestone.md
node $SKILL/scripts/check-docs.mjs
```

You should see:

```text
Checking 7 pages in docs against indexed, resolves, framed, superseded, generated, small, banned

✓ 7 pages in docs hold.
```

## 2. Add a page, and rename a heading

Write a page with no breadcrumb and no row in the index, and break the how-to's list at the top:

```sh
printf '# 🧪 Testing\n\nRun the tests with `pnpm test`.\n' > docs/testing.md
sed -i.bak 's/#do-the-second-task/#do-the-2nd-task/' docs/how-to.md && rm docs/how-to.md.bak
node $SKILL/scripts/check-docs.mjs
```

You should see three findings, each with its file, line and fix:

```text
  docs/testing.md:1  indexed
  testing.md cannot be reached from README.md
  → add a row for it to README.md, or to a page README.md links to

  docs/how-to.md:13  resolves
  how-to.md has no heading #do-the-2nd-task
  → point at where it lives now, or remove the link

  docs/testing.md:1  framed
  testing.md has no link to README.md in its first 10 lines
  → open the page with the breadcrumb from the templates, current page in bold

✗ 3 findings in 2 of 8 pages.
```

## 3. Fix them

Give the page its breadcrumb, give it a row in the index, and put the anchor back:

```sh
printf '# 🧪 Testing\n\n[🏠 Home](README.md) · **🧪 Testing**\n\nRun the tests with `pnpm test`.\n' > docs/testing.md
printf '| [Testing](testing.md) | how to run the tests | 1 |\n' >> docs/README.md
sed -i.bak 's/#do-the-2nd-task/#do-the-second-task/' docs/how-to.md && rm docs/how-to.md.bak
node $SKILL/scripts/check-docs.mjs
```

You should see:

```text
✓ 8 pages in docs hold.
```

## What you learned

- The templates are a whole docs folder, and they hold as copied.
- A page nobody links is a page nobody finds, and the check says so.
- Every finding names its file, its line and its fix.

## Next

- 🛠️ [How-to guides](how-to.md): fail a build on a finding, ban a house-style string.
- 📖 [Reference](reference.md): every option and rule.
- 💡 [Explanation](explanation.md): why four quadrants, and why these rules.
