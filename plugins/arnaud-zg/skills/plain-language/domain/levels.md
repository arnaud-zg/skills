# The levels

**One text, one level.** The level sets how strict the rules are. The limits live in `LEVELS` in
[scripts/plain.mjs](../scripts/plain.mjs). This page says why each one fits.

| Rule                    | strict | standard | light |
| ----------------------- | ------ | -------- | ----- |
| Words per sentence      | 20     | 25       | 25    |
| One idea, no `;`        | yes    | yes      | yes   |
| No filler               | yes    | yes      | yes   |
| Steps start with a verb | yes    | no       | no    |
| Passive voice hint      | yes    | yes      | no    |

## strict

For text a person follows with their hands: steps, fixes, commands, a how-to. 20 words is the
ASD-STE100 limit for a procedure. Each step is one action.

## standard

For text a person reads to decide: a report, a verdict, a finding, a PR body, a TLDR. 25 words is
the ASD-STE100 limit for a description.

## light

For text a person sends to another person: a review comment, a question. It may ask a question and
be polite: "Could you walk through the rollback?" It still has one idea and no filler.

## A text with two parts

Give each part its level. A report at standard can end on numbered fixes at strict. Check each part
with its own level.
