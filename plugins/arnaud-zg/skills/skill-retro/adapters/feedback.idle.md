---
fulfils: feedback
delivers: findings, each with its skill, kind and evidence
binds: the host's transcript of the session, which carries the clock the conversation does not
takes: window (optional), transcripts (optional)
---

# feedback: idle time

A session that stops talking leaves nothing in the conversation to notice, so the transcript walk
cannot see it. The host's transcript has a timestamp on every message. Measure it once:

```sh
node ${CLAUDE_SKILL_DIR}/scripts/gaps.mjs <transcripts> --window <window>
```

- `transcripts`: the folder of the host's transcripts, whose newest file is this session. Claude
  Code keeps them in `~/.claude/projects/<the project's path, every / as ->/`.
- `window`: a JSON file whose `bookedAt` and `end` bound the time the person gave the session.
  Without one there is no budget, and a silence is the session waiting on its person: write
  `idle: no budget bound` and stop.

Each `IDLE` line is one `wrong` finding: the budget paid for time nothing used. It is against the
skill whose step ended the turn before the silence, which the line's `last said` names. The evidence
is the line, copied. The fix makes that skill unable to end a turn that way, not one that asks it to
remember.
