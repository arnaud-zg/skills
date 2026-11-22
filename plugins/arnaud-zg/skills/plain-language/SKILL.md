---
name: plain-language
description:
  Writes or rewrites any text in plain language, after ASD-STE100 (Simplified Technical English):
  short sentences, one idea each, active voice, numbered steps that start with a verb, no filler. A
  script checks the text before it is shown. Levels: strict for steps, standard for reports, light
  for comments to paste. English and French. Use whenever asked to write, rewrite or rephrase
  something "plainly", "in plain language", "in plain English", "in STE", "simply", "shorter", "with
  no filler", "as clear steps", at a "strict", "standard" or "light" level, or when another skill
  names a plain-language level for its output.
argument-hint: "[strict|standard|light] [text or file]"
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/check-plain.mjs *)
---

# plain-language

**A reader acts on a sentence they understand the first time.** Write so they never read it twice.
These rules take about 80% of ASD-STE100: its writing rules, not its dictionary.

`${CLAUDE_SKILL_DIR}` is this skill's folder. Claude Code sets it, and in another agent it is this
file's folder.

## Pick the level

The caller names the level. Another skill names it at its output step. When nobody names it, pick by
what the text is.

| Level        | The text is                                       | Words per sentence |
| ------------ | ------------------------------------------------- | ------------------ |
| **strict**   | steps, fixes, commands, a how-to                  | 20                 |
| **standard** | a report, a verdict, a finding, a PR body, a TLDR | 25                 |
| **light**    | a comment to paste, a question to a person        | 25                 |

[domain/levels.md](domain/levels.md) says what each level lets through.

## Verbs

| Verb      | Does                                            | File                             |
| --------- | ----------------------------------------------- | -------------------------------- |
| **write** | writes or rewrites a text at a level, checks it | [verbs/write.md](verbs/write.md) |

## Ports

One port, `language`: the words and patterns of the reader's language.
[ports/PORTS.md](ports/PORTS.md) lists the languages.

## Map

| File                                               | Read when                               |
| -------------------------------------------------- | --------------------------------------- |
| [domain/rules.md](domain/rules.md)                 | writing: the seven rules, with examples |
| [domain/levels.md](domain/levels.md)               | picking a level                         |
| [scripts/check-plain.mjs](scripts/check-plain.mjs) | checking a text before it is shown      |
