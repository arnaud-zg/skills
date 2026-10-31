# 🛠️ How-to guides: glance-audit

[📚 Docs home](../../../../docs/README.md) › [🔍 glance-audit](README.md) ›
[🚀 Tutorial](tutorial.md) · **🛠️ How-to** · [📖 Reference](reference.md) ·
[💡 Explanation](explanation.md)

**3 sources, one result, the same check.**

| Ask for…                          | Source         | The source text is                  |
| --------------------------------- | -------------- | ----------------------------------- |
| _audit this doc_, _poke holes_    | `document`     | the document, then comments to you  |
| _review this PR_, _is this sound_ | `pull-request` | the description, the diff, comments |
| _check this report_, _status box_ | `status`       | the report alone, as handed         |

## Audit a document

Point at a file or paste the text, with any comments or thread you have. A link the host cannot open
is listed as not read, never guessed.

## Audit a pull request

Give its link or number and name the forge's CLI, such as `gh`. If none is named, the skill asks. It
uses only reading commands: it never comments, approves, labels, merges or pushes.

## Check a status report

Hand over the report and the read-only commands it may run. Every number is copied again from what
prints it; one that needs a long job or a writing command becomes an Ask.

## Choose where the result lands

Name the target: an artifact page, a pull request description, the terminal or a Markdown file. It
goes to [glance-first](../glance-first/README.md) as given; if none is named, glance-first asks.

## Answer questions addressed to you

A comment that names you is drafted as a Reply, in the `reply` group, answer first.

## Check a result by hand

```sh
node plugins/arnaud-zg/skills/glance-audit/scripts/check-audit.mjs audit.json source.txt
```

It exits 0 on `AUDIT OK`, 1 on anything to fix, 2 when a path is missing.

## Example

[`examples/glance-audit/audit.json`](../../examples/glance-audit/audit.json): an audit the check
passes against [its source](../../examples/glance-audit/source.txt).
[`examples.integration.test.ts`](../../examples/examples.integration.test.ts) runs it.
