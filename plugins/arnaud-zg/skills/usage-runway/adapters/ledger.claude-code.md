---
tools: [Claude Code, quotaLimits]
---

# ledger · Claude Code transcripts

**Claude Code records every turn it takes, in every project, in files it never publishes a format
for.** This file and `scripts/ledger.claude-code.mjs` are the only two places that know the format,
so a change in it is one module to fix.

| The meter needs    | Where Claude Code writes it                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| every turn         | one `.jsonl` per session under `~/.claude/projects/<project>/`, every project on the machine, up to three directories deep |
| when               | `timestamp` on each line                                                                                                   |
| billed tokens      | `message.usage`: `input_tokens + output_tokens + cache_creation_input_tokens`                                              |
| cache reads, apart | `message.usage.cache_read_input_tokens`                                                                                    |
| a limit hit        | a line carrying `quotaLimits`: `resetsAt` in epoch seconds, and `rateLimitType`, `five_hour` or `seven_day` (weekly)       |

**`quotaLimits` appears only on a 429**, and its `resetsAt` is the one exact reset time there is.
Transcripts not touched for a week are skipped: a weekly 429 can be that old and still in flight.
