# 🛠️ How-to guides: glance-first

[📚 Docs home](../../../../docs/README.md) › [👁️ glance-first](README.md) ›
[🚀 Tutorial](tutorial.md) · **🛠️ How-to** · [📖 Reference](reference.md) ·
[💡 Explanation](explanation.md)

## Write a pull request description

Ask _write the PR description for this branch_. The skill reads the repository's pull request
template and its agent instructions file, writes their sections, banned characters and footer into
the brief's `convention`, and the check holds them. It prints the body; posting it is yours.

## Publish a page

Ask for an _artifact page_. Mermaid renders natively, the numbers become stat tiles, and a revision
republishes to the same address.

## Print it in the terminal

Ask for it _in the terminal_. Charts are refused there, so each picture is a table that fits 100
columns, and the numbers sit on one line.

## Write a Markdown file

Ask for it _as a Markdown file at `<path>`_. The skill never picks a folder, and runs the
repository's formatter on the file.

## Present work with no figure in it

The brief's `numbers` is then `[]`, on purpose. The check refuses a missing field, so an empty list
says nobody forgot.

## Check a brief by hand

```sh
node plugins/arnaud-zg/skills/glance-first/scripts/check-brief.mjs brief.json
```

It exits 0 on `BRIEF OK`, 1 on a finding, 2 when no path is given.
