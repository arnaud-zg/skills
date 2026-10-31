---
fulfils: target
target: artifact
---

# target · artifact

**An HTML page, published with the host's artifact tool.** Mermaid renders natively there, so a
chart goes in as its source, not as an image.

## The page

| Brief     | On the page                                                          |
| --------- | -------------------------------------------------------------------- |
| `title`   | the page title and the one heading at the top                        |
| `tldr`    | the first paragraph, larger than the rest, above everything else     |
| `numbers` | a row of stat tiles under the TLDR: the value large, the label small |
| `blocks`  | one section each: the heading, the picture, then the line            |
| `picture` | a Mermaid chart, an HTML table, an `<img>` with its alt, or none     |
| `copy`    | each snippet in a box with its label and a Copy button               |
| `fold`    | a closed `<details>` per entry, after the last block                 |
| `sources` | one small line at the foot: read, not read, not tested               |

- When a block marks a change, put the legend of [domain/pictures.md](../domain/pictures.md) above
  its chart.
- Follow the host's own page rules (title, theme tokens, light and dark, allowed script sources).
  The host's rules decide the form; the brief decides what is said.
- The page reads in light and dark, and nothing scrolls sideways on a phone except a wide chart
  inside its own frame.

## Publish

Publish with the host's artifact tool, and republish to the same address when revising, never a new
one. Hand over the link. The page is private until the person shares it.
