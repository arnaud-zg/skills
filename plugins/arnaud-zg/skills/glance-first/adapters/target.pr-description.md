---
fulfils: target
target: pr-description
extras: a pointer to the caller's own pull request convention
---

# target · pr-description

**A pull request body in GitHub markdown.** GitHub renders a fenced `mermaid` block as a chart, so a
chart goes in as its source.

## The convention, before the brief is written

A convention is honoured on top of the brief, never instead of it, and never by writing words the
check does not see. So it goes into the brief's `convention`, by
[domain/brief.md](../domain/brief.md#the-convention), before the check runs.

1. **Find it.** Use the pointer the caller passed. Otherwise read both of the repository's own
   sources, matching names in any case:
   - **the template**, which gives the sections: `pull_request_template.md` in `.github/`, at the
     root or in `docs/`, or one file of `.github/PULL_REQUEST_TEMPLATE/` (ask the caller which when
     there are several);
   - **the agent instructions file** (`CLAUDE.md`, `AGENTS.md` or the like), whose "Pull requests"
     section gives the rules: banned characters, picture rules, the lead line, a required footer.

   Only if neither exists, write the plain brief and say "no PR convention found" in the hand-over.

2. **Merge them into `convention`**: `lead` from the slot the body opens with, `headings` from the
   template's sections, `picture: "image"` when a screenshot is required, `banned` and `footer` from
   the rules. Where the two sources disagree, write what the template says for sections and what the
   instructions say for rules, and name each disagreement in the hand-over for the caller to settle.
3. **Give every required section its block**, headed with the section's name, in the convention's
   order. A screenshot goes where [domain/pictures.md](../domain/pictures.md#an-image) says.
4. **Run the check**, by [verbs/present.md](../verbs/present.md). A finding in the footer goes to
   the caller as it stands.

## The body

| Brief               | In the body                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `tldr`              | in the slot `lead` names; with no `lead`, the first line, in bold                                                     |
| `numbers`           | a one-row table right after the TLDR: each value in bold over its label                                               |
| `blocks`            | each a heading (`###` unless the convention says), the picture, then the line                                         |
| `picture`           | a fenced `mermaid` block, a markdown table, an image embedded as the convention says (else `![alt](src)`), or nothing |
| `copy`              | a fenced code block under its label, so GitHub gives it a copy button                                                 |
| `fold`              | a closed `<details>` per entry, with the heading as its `<summary>`                                                   |
| `sources`           | one line at the foot: read, not read, not tested                                                                      |
| `convention.footer` | after the sources line, each line word for word                                                                       |

The `title` is the pull request's title only if the convention allows four words; otherwise the
convention's title format wins and the brief's title is not used.

## Where it goes

Print the body for the caller, or write it to a file the caller names. Posting it, or editing an
open pull request, is the caller's job and needs the caller's own approval.
