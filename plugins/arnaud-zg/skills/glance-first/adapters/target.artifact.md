---
fulfils: target
target: artifact
---

# target · artifact

**An HTML page, published with the host's artifact tool.** Mermaid renders natively there, so a
chart goes in as its source, not as an image.

## The page

| Brief     | On the page                                                                  |
| --------- | ---------------------------------------------------------------------------- |
| `title`   | the page title and the one heading at the top                                |
| `tldr`    | the first paragraph, larger than the rest, above everything else             |
| `numbers` | a row of stat tiles under the TLDR: the value large, the label small         |
| `blocks`  | one section each: the heading, the picture, then the line                    |
| `picture` | a Mermaid chart, an HTML table, an `<img>` with its alt, or none             |
| `copy`    | each snippet as a card, drawn as [the review cards](#the-review-cards) below |
| `fold`    | a closed `<details>` per entry, after the last block                         |
| `sources` | one small line at the foot: read, not read, not tested                       |

- When a block marks a change, put the legend of [domain/pictures.md](../domain/pictures.md) above
  its chart.
- Follow the host's own page rules (title, theme tokens, light and dark, allowed script sources).
  The host's rules decide the form; the brief decides what is said.
- The page reads in light and dark, and nothing scrolls sideways on a phone except a wide chart
  inside its own frame.

## Easy to review

A reader reviews in order: understand, check, act. Make that order visible.

- With three blocks or more, a sticky bar under the top links to each block by its heading, with its
  position (1, 2, 3). It stays above the page's safe-area band.
- The first block is the one picture that shows the answer. A block that proves a claim shows its
  evidence beside the claim, and a table's cells name where each piece came from.

## The review cards

A copy snippet is a card, so the reader can decide per snippet and keep track.

| Part   | From the snippet                                                               |
| ------ | ------------------------------------------------------------------------------ |
| label  | `label`, as the card's heading                                                 |
| text   | `text`, in a box a reader can select                                           |
| button | Copy: `navigator.clipboard.writeText` in the click, a select-text fallback     |
| meter  | `score` as a bar and a number, green from 8, amber below; none without a score |
| reason | `why`, in a `<details>` under the card, open on the first card only            |
| tick   | a "Posted" checkbox: the card dims, a counter in the bar reads "2 of 7 posted" |

- Cards are in the brief's order. With four cards or more, filter chips above them split the first
  card of a block from the rest.
- The tick state goes in `localStorage` inside `try/catch`, and the page works without it.
- A snippet with no `score` is drawn as label, text and Copy button only.
- A text line that starts with `Problem:`, `Proposal:` or `Example:` has that word drawn as a bold
  label, `Problem:` in the warning colour, so the reader finds the problem first.

## Publish

Publish with the host's artifact tool, and republish to the same address when revising, never a new
one. Hand over the link. The page is private until the person shares it.
