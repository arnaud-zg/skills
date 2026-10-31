---
fulfils: target
target: terminal
---

# target · terminal

**Plain text at the width `TARGETS` holds** (see [ports/PORTS.md](../ports/PORTS.md)). No markdown
syntax, no colour, no HTML. The check refuses a picture this target does not take, so a change is
shown as a table, and a flow as a table whose columns are its steps.

## The text

| Brief     | In the terminal                                                      |
| --------- | -------------------------------------------------------------------- |
| `title`   | the first line, in capitals                                          |
| `tldr`    | the next lines, wrapped at the width, then a blank line              |
| `numbers` | one line: each `value label`, separated by `·`, then a blank line    |
| `blocks`  | the heading on its own line, the picture, then the line under it     |
| `picture` | an ASCII table: `+---+` borders, `\|` between cells, one row per row |
| `copy`    | the label, then the text indented by four spaces                     |
| `fold`    | `More:` and each entry as `heading: text`, after the last block      |
| `sources` | one line at the foot: read, not read, not tested                     |

- A table is drawn as `| a | b |`: the cells, plus three for each column, plus one. The check counts
  it that way against the width.
- The three looks of [domain/pictures.md](../domain/pictures.md) keep their words (`NEW:`,
  `REVIEW:`, `LATER:`) and drop their fills.
- Wrap prose at the width; never break a table row.

## Where it goes

Print it as the reply, inside a fenced text block so the host keeps the spacing. Nothing is written
to disk unless the caller names a file.
