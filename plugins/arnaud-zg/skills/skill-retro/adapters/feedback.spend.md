---
fulfils: feedback
delivers: findings, each with its skill, kind and evidence
binds: the host's transcript of the session and its subagents' transcripts
takes: window (optional), transcripts (optional)
---

# feedback: spend

What a session cost in tokens and time is in the host's transcripts, not the conversation. Measure
it once, with the `idle` adapter's `transcripts` and `window`:

```sh
node ${CLAUDE_SKILL_DIR}/scripts/gaps.mjs <transcripts> --window <window> --spend
```

| Line                                                        | Kind        | Against                            |
| ----------------------------------------------------------- | ----------- | ---------------------------------- |
| each of the three costliest `AGENT` lines                   | `expensive` | the skill that briefed that agent  |
| two or more `AGENT` lines for one feature's review or fixes | `expensive` | the skill whose step set the round |
| an `AGENT` line whose span is hours longer than its work    | `slow`      | the skill that left it waiting     |

The evidence is the lines, copied, and the `SPEND` line beside them. The fix makes the step cheaper
(a smaller brief, a cheaper model, one round fewer), never a rule to spend less.
