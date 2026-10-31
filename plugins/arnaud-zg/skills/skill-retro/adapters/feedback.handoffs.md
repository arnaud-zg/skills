---
fulfils: feedback
delivers: findings, each with its skill, kind and evidence
binds: the handoff blocks the caller's builders and reviewers returned this session
---

# feedback: the handoffs

A run of subagents hands back blocks: a builder's report, a reviewer's findings, a gate's verdict,
an escalation. Read the ones returned this session.

| Look for                                                      | Kind    | Evidence to copy          |
| ------------------------------------------------------------- | ------- | ------------------------- |
| a reviewer finding that a skill's step should have prevented  | `wrong` | the finding's line        |
| a gate failing on something a skill's check could have caught | `wrong` | the verdict line          |
| a review that took more than one round                        | `slow`  | the round count, as given |
| an escalation a skill page already answers, or should         | `slow`  | the question, quoted      |

Attribute each to the skill that drove the step, not to the builder or reviewer that hit it.
