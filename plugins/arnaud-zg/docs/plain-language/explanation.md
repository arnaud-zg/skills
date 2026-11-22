# 💡 Explanation: why 80% of STE, and why three levels

[📚 Docs home](../../../../docs/README.md) › [✍️ plain-language](README.md) ›
[🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) · [📖 Reference](reference.md) · **💡
Explanation**

Why the skill works the way it does. To get something done, see the [How-to guides](how-to.md).

**ASD-STE100 has two parts. The skill takes the first and leaves the second.**

| STE part      | What it is                                          | In the skill |
| ------------- | --------------------------------------------------- | ------------ |
| Writing rules | short sentences, active voice, one instruction each | yes          |
| Dictionary    | about 900 approved words, one meaning each          | no           |

## Why not the dictionary

- It has no software words. "Mock", "rebase" and "adapter" are not in it.
- It exists only in English. No official French version exists.
- STE allows the technical words of a project. Rule 4 keeps their one meaning instead.

## Why not one percentage for every text

A maintenance manual is all procedure. A skill writes steps, reports and review comments. Each one
needs a different strictness:

- A step is followed with the hands. Strict rules make it safe.
- A report is read to decide. It needs a reason, so it gets 25 words, the STE limit for a
  description.
- A comment goes to a person. It may ask a question and be polite. Strict rules would make it rude.

## Why the passive voice is a hint

A script cannot tell "The file was deleted" (passive) from "The file was red" (an adjective). A
false finding that fails a build teaches people to ignore the check. So the check prints a hint and
does not fail.

## Why one skill, not a rule in each skill

The rules live in one place. Another skill names a level in one line. A change to a rule reaches
every skill at once, and no skill copies the rules.

## Why "plain language"

Most people know the phrase. It works in every language. ISO 24495-1 (2023) defines it. STE is its
stricter form for technical manuals.
