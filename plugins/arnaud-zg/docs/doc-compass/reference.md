# 📖 Reference: doc-compass command, exit codes and rules

[📚 Docs home](../../../../docs/README.md) › [🧭 doc-compass](README.md) ›
[🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) · **📖 Reference** ·
[💡 Explanation](explanation.md)

Everything to look up. For the reasons behind it, see the [Explanation](explanation.md).

## Command

Source of truth: [`scripts/check-docs.mjs`](../../skills/doc-compass/scripts/check-docs.mjs).

```text
node scripts/check-docs.mjs [<folder> [--index <page>]] [--ban <text>]... [--json]
```

| Option           | Default                                     | Effect                                                                   |
| ---------------- | ------------------------------------------- | ------------------------------------------------------------------------ |
| `<folder>`       | the sets in `doc-compass.json`, else `docs` | one folder to check, read recursively, instead of the config's sets      |
| `--index <page>` | `README.md`                                 | that folder's index, from inside it; may sit above it, as `../README.md` |
| `--ban <text>`   | none                                        | a string no page may hold outside code; adds to the config's             |
| `--json`         | off                                         | print `{ sets: [{ docs, pages }], findings }` instead of text            |
| `-h`, `--help`   |                                             | print the usage                                                          |

It skips `node_modules`, `.git`, `dist` and `.cache`. It gives the same report on every machine for
the same files: pages are read in sorted order, findings are sorted by rule, file and line without
the locale, and a path only exists when every name in it matches the disk's spelling exactly, even
on a case-insensitive disk.

## `doc-compass.json`

Read from the folder the check runs in. Any other key, or a value of the wrong type, exits `2` and
says what is wrong.

```json
{
  "ban": ["—"],
  "docs": ["docs", { "folder": "plugins/arnaud-zg/docs", "index": "../README.md" }]
}
```

| Key    | Type                                                | Meaning                                        |
| ------ | --------------------------------------------------- | ---------------------------------------------- |
| `docs` | list of folders, or `{ "folder", "index" }` objects | the docs sets to check, in order; at least one |
| `ban`  | list of non-empty strings, optional                 | strings no page may hold outside code          |

## Exit codes

| Code | Means                                                                                         |
| ---- | --------------------------------------------------------------------------------------------- |
| `0`  | every page holds every rule                                                                   |
| `1`  | at least one finding                                                                          |
| `2`  | nothing to check: no such folder, no Markdown page, a bad option, or a bad `doc-compass.json` |

## Rules

Source of truth: [`scripts/rules.mjs`](../../skills/doc-compass/scripts/rules.mjs).

| Rule         | Reports                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------- |
| `indexed`    | a page no chain of links reaches from the index; a link to a folder reaches its `README.md`         |
| `resolves`   | a relative link to nothing, or an anchor no heading makes, with GitHub's slugs                      |
| `framed`     | a page with no link to the index, or to the `README.md` of a folder above it, in its first 10 lines |
| `superseded` | a line with "Superseded by" and a link, whose target never links back                               |
| `generated`  | a "Generated … from \`source\`" line whose source does not exist, from the current folder           |
| `small`      | a page over 300 lines                                                                               |
| `banned`     | each `--ban` string found outside code blocks, inline code and comments                             |

Links inside code, HTML comments, URLs with a scheme and absolute paths are never checked. A page
whose title ends with `(moved)` is a gravestone, exempt from `indexed` and `framed`.

## Templates

Source of truth: [`templates/`](../../skills/doc-compass/templates/README.md). They form a whole
`docs/` folder, and hold as copied.

| File                                           | Is                                                       |
| ---------------------------------------------- | -------------------------------------------------------- |
| `README.md`                                    | the index: a routing table, and every page with its time |
| `tutorial.md`                                  | one path, each step with "You should see"                |
| `how-to.md`                                    | one task per section, titled as an imperative            |
| `reference.md`                                 | tables, each naming its source in code                   |
| `explanation.md`                               | one principle per heading, and the rules dropped         |
| `adr/README.md`                                | the list of decision records                             |
| `adr/ADR-001-record-architecture-decisions.md` | the first record, and the shape of every other           |
| `gravestone.md`                                | the page left at an old path                             |
