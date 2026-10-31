# The result

**One JSON object the presenting skill is fed from.** It holds the judgement; the `present` adapter
holds the form. [scripts/check-audit.mjs](../scripts/check-audit.mjs) holds these rules as code and
runs them against the source text you saved, never against the context.

## The shape

| Field       | Holds                                                                      | Rule                   |
| ----------- | -------------------------------------------------------------------------- | ---------------------- |
| `subject`   | the name of what was audited                                               | as the source names it |
| `verdict`   | the answer, first: "Good idea. One thing to fix."                          | one line               |
| `good`      | what the source gets right, one line each                                  | 3 at most              |
| `findings`  | every point that was real and not covered, kept or left out                | `[]` when nothing      |
| `comments`  | drafts for the reader to paste, each typed, grouped and anchored           | `[]` when nothing      |
| `questions` | the questions addressed to the reader, each `{asked, answer}`              | both filled            |
| `sources`   | `read` (a list), `notRead` (a list, `[]` when nothing), `notTested` (text) | passed on as they are  |

A finding is `{title, severity, evidence, tests: {real, covered, raised}, kept}`, plus `tag` when it
is left out. The severity is `critical`, `medium` or `low`, and the tag `already raised` or
`can wait`. Which findings are listed and which are kept is
[the keep rule in lenses.md](lenses.md#the-keep-rule); the check holds it.

## The verdict

One line, answer first, in the reader's words. "Good idea. One thing to fix." "Sound, but the
estimate is a third short." When the source is a status report, the verdict says whether its claims
hold: "Two of the five numbers do not hold."

**When nothing kept is critical**, this page owns what the reader sees: the verdict says nothing
blocks it and names the point that leads, "Good idea. Nothing blocks it. A success measure would
help." The kept point is presented as the one worth raising, never as a fix that blocks.

## Comments

| Type      | Use it to                                 | Opening                                                      |
| --------- | ----------------------------------------- | ------------------------------------------------------------ |
| Challenge | push back on a claim that may not hold    | "Does this hold when ...?"                                   |
| Ask       | get a clarification or a missing detail   | "Could you walk through ...?" "What happens when ...?"       |
| Suggest   | reword the one sentence that is wrong     | the quote is the before; `after` holds the new wording       |
| Reply     | answer a question addressed to the reader | the answer first, then one limit: "not checked on our setup" |

A comment is `{type, group, quote, text}`, plus `after` for a Suggest. Group them so the reader
never ranks them:

| Group         | Holds                                                        | Limit                                  |
| ------------- | ------------------------------------------------------------ | -------------------------------------- |
| `post first`  | the challenge for each kept finding, and its suggested edit  | one Challenge, one Suggest per kept    |
| `good to ask` | challenges or asks that test the source's claims             | 3 at most                              |
| `reply`       | the Replies, and nothing else                                | one per entry in `questions`, no other |
| `more`        | an optional ask for every point left out, so nothing is lost | none                                   |

Rules for every comment, all held by the check:

- `quote` is one passage of the source text, copied exactly: same words, same capitals, same
  punctuation. Only line breaks and spacing may differ.
- The passage is at least 4 words or 20 characters, and occurs once in the source text, so the
  reader can place it. If it occurs twice, quote more of it.
- `text` is four sentences at most: the question or claim, why it matters, what you suggest. A line
  break ends a sentence too.

And for the words:

- Challenge the claim, not the author. Ask for a walk-through or evidence instead of "this is
  wrong".
- Write in the source's own words. If you use simpler names, say so.

## An example

Against a source holding "The build check makes a breaking change between the two apps impossible,
because it compares their schemas before merge.", this result prints `AUDIT OK`:

```json
{
  "subject": "Release gate",
  "verdict": "Good idea. One thing to fix.",
  "good": ["It names the two incidents it answers."],
  "findings": [
    {
      "title": "The check runs too early",
      "severity": "critical",
      "evidence": "Both incidents broke at release, after the merge check had passed.",
      "tests": { "real": true, "covered": false, "raised": false },
      "kept": true
    }
  ],
  "comments": [
    {
      "type": "Challenge",
      "group": "post first",
      "quote": "makes a breaking change between the two apps impossible",
      "text": "Does this hold when the two apps are released on different days?"
    }
  ],
  "questions": [],
  "sources": {
    "read": ["the proposal"],
    "notRead": [],
    "notTested": "My judgement, nothing was run."
  }
}
```
