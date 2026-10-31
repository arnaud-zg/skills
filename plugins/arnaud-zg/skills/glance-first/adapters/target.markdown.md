---
fulfils: target
target: markdown
extras: the path of the file, named by the caller
---

# target · markdown

**A `.md` file in a repository.** Most code hosts render a fenced `mermaid` block as a chart, so a
chart goes in as its source.

## The file

| Brief     | In the file                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------- |
| `title`   | the one `#` heading                                                                               |
| `tldr`    | the first paragraph, in bold                                                                      |
| `numbers` | a one-row table under the TLDR: each value in bold over its label                                 |
| `blocks`  | each a `##` heading, the picture, then the line                                                   |
| `picture` | a fenced `mermaid` block, a markdown table, `![alt](src)`, or nothing                             |
| `copy`    | a fenced code block under its label                                                               |
| `fold`    | a closed `<details>` per entry if the renderer allows HTML, else a `## More` section after a rule |
| `sources` | one line at the foot: read, not read, not tested                                                  |

- The repository's own markdown rules apply: its formatter, its linter, its line width. Run its
  formatter on the file once it is written.
- Write to the path the caller names. If none is named, ask; never pick a folder.

## Where it goes

The file stays on disk, uncommitted, unless the caller asks for a commit. Hand over the path.
