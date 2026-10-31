# The brief

**One JSON object every target is drawn from.** It holds the substance; the target's adapter holds
the form. [scripts/check-brief.mjs](../scripts/check-brief.mjs) holds these limits on a file.

## The shape

| Field        | Holds                                                                                                  | Limit                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `title`      | a name for the work                                                                                    | 4 words                                                                     |
| `target`     | where it lands, by [ports/PORTS.md](../ports/PORTS.md)                                                 | required                                                                    |
| `tldr`       | the answer, first: "Good idea. One thing to fix."                                                      | 25 words                                                                    |
| `numbers`    | the key figures, each `{value, label}`: `{"value": "3x", "label": "faster cold start"}`                | 4; a digit in each value; label 5 words; `[]` only when the work holds none |
| `blocks`     | each a `heading`, a `line`, a `picture`, and an optional `copy` list                                   | 1 to 4                                                                      |
| `heading`    | what the block is about                                                                                | 6 words                                                                     |
| `line`       | the one sentence the picture proves                                                                    | 15 words                                                                    |
| `picture`    | `{kind: "mermaid", source}`, `{kind: "table", rows}`, `{kind: "image", src, alt}`, or `{kind: "none"}` | tables: 3 columns; images: `alt`; never `none` in the first block           |
| `copy`       | `{label, text}` snippets a reader may want to paste                                                    | both fields filled                                                          |
| `fold`       | `{heading, text}` entries, collapsed, outside the minute                                               | 2 entries                                                                   |
| `sources`    | `read` (a list, not empty), `notRead` (a list, `[]` when nothing), `notTested` (text)                  | all three                                                                   |
| `convention` | optional: a caller's own format, held on top of the brief (below)                                      | its sections fit the blocks                                                 |

```json
{
  "title": "Release gate moves",
  "target": "pr-description",
  "tldr": "The release check now runs before the build ships, so a broken build never reaches users.",
  "numbers": [
    { "value": "0", "label": "broken builds shipped since" },
    { "value": "1 step", "label": "moved, nothing else" }
  ],
  "blocks": [
    {
      "heading": "The check runs earlier",
      "line": "One step moved; nothing else in the release changed.",
      "picture": {
        "kind": "mermaid",
        "source": "flowchart LR\n  a[Build] --> b[\"NEW: Check\"] --> c[Ship]"
      }
    }
  ],
  "sources": {
    "read": ["the diff"],
    "notRead": [],
    "notTested": "The release was not run end to end."
  }
}
```

## The convention

When a caller's format applies (a pull request template, a house style), it is written into the
brief, so the check sees every word that will be drawn. Every field is optional.

| Field      | Holds                                                           | The check refuses                                         |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------------- |
| `lead`     | the name of the opening slot, such as "Why it matters"          | nothing: the TLDR is drawn in it, so it needs no block    |
| `headings` | a list of every section the convention requires, lead included  | a required heading no block carries, or one in the fold   |
| `picture`  | `"image"` when the convention requires a screenshot, or `"any"` | `"image"` with no block carrying an image picture         |
| `banned`   | a list of characters the convention forbids                     | any text a reader sees holding one (below)                |
| `footer`   | a line or a list of lines the convention requires word for word | nothing to reword: a hit in it is reported for the caller |

A required section is never folded and never dropped. Headings match whatever their case and
spacing, and a block heading that is a required one is exempt from the 6-word cap: it is the
caller's wording. When the convention requires more sections than the block limit, the check says so
and the caller decides: trim the convention, or split the work.

The footer is drawn after the sources line, outside the word budget. An em dash or a banned
character in it is still reported, with the fix "the caller's own text: ask the caller".

The banned scan reads only what a reader sees: the title, the TLDR, headings, lines, table cells,
every line of a chart, alt text, copy snippets, the fold, the sources and the footer. Never the
target, or a picture's kind or file. Of a chart it skips only styling lines (`classDef`, `class`,
`style`, `linkStyle`, `%%` comments) and the diagram type, and takes out only syntax: arrows and
links, a node id with its shape brackets, quotes, and a line's leading keyword (`participant`, `as`,
`loop`, `subgraph`, `section`, `title`, `x-axis`, `quadrant-1` and the like).

## The numbers

The numbers are the second thing read, so pull them before writing anything else: counts, sizes,
durations, percentages, money, before and after. Keep the ones that carry the answer, at most four,
largest effect first. A value holds its unit (`120 ms`, `3x`, `-40%`); a before and after is one
figure, `12 → 3`. Every figure comes from something read: a figure nobody measured is left out, and
a guess says so in its label. `[]` says, on purpose, that the work holds no figure.

## The budget

At most 200 words, under one minute. What is read counts: the title, the TLDR, the numbers, every
heading, every line and every table cell. What is looked at does not: Mermaid source, an image, copy
snippets and the fold.

## The level

| Too much                                   | Right level                          |
| ------------------------------------------ | ------------------------------------ |
| a summary of every section                 | the answer, then only what proves it |
| a paragraph per idea                       | one idea per block                   |
| ids such as F1 that need a legend          | plain titles                         |
| a picture that needs a caption             | a picture labelled in place          |
| a picture that repeats the line above it   | the line alone, picture `none`       |
| a decision, an open item or a limit folded | a block: the fold holds proof only   |

The first block holds the one picture that shows the answer; the check refuses `none` there. When
the reader must approve something, order the blocks: the value, one picture of how it fits, what is
still open, what they decide.

## The words

- No em dashes anywhere, charts included. Use a comma, a colon or a period. The check catches the
  character and its HTML entities.
- Every number and quote comes from something read, and the line above the picture says so; in a
  chart, a number nobody read is left out.
- Judgement says it is judgement.
