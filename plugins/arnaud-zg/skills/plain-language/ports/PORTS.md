# Ports

**The rules belong to no language. Each language holds its own words.** Ports and adapters follow
the [shared contract](../../hexagonal-architecture/domain/contract.md), if installed.

| Port       | The one question it answers                                   |
| ---------- | ------------------------------------------------------------- |
| `language` | which words are filler, and how does a step or a passive look |

The caller names the language with `--lang`. With `auto`, the script counts common words of each
language and picks the one with more.

## What every language adapter holds

| Receives        | Delivers                                       | Never                           |
| --------------- | ---------------------------------------------- | ------------------------------- |
| a text to write | the language's own advice, on top of the rules | changes the rules or the levels |

The word lists live once, in `LANGUAGES` in [scripts/plain.mjs](../scripts/plain.mjs). A test fails
when the adapters and `LANGUAGES` name different languages. Another language is one adapter plus one
entry there.

| Language | Adapter                                      |
| -------- | -------------------------------------------- |
| `en`     | [language.en.md](../adapters/language.en.md) |
| `fr`     | [language.fr.md](../adapters/language.fr.md) |
