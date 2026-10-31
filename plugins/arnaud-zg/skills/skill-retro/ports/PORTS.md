# The ports

**A port is the WHAT. An adapter is the HOW.** The steps name no tool; each thing they depend on is
a port below.

| Port       | Count | Receives                            | Delivers                                              | Never                                                                             |
| ---------- | ----- | ----------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| `feedback` | 1..n  | the session and the skills it fired | findings, each with its skill, kind and evidence      | writes anything                                                                   |
| `shape`    | 1     | one skill's folder                  | holds, or findings each with a file, a line and a fix | relaxes a rule to let a fix through                                               |
| `stack`    | 1     | a checked fix                       | the base to cut from, then a draft pull request on it | merges, force-pushes, opens a non-draft, or bases a skill fix on a feature branch |

The skills stack runs beside the feature stack and never inside it: a skill fix waits for no
feature, and no feature waits for a skill fix.

## Adapters

| Port       | Adapter                           | Reads or does                                             |
| ---------- | --------------------------------- | --------------------------------------------------------- |
| `feedback` | `adapters/feedback.transcript.md` | the session's own record                                  |
| `feedback` | `adapters/feedback.idle.md`       | silences inside the session's budget, from its timestamps |
| `feedback` | `adapters/feedback.spend.md`      | tokens and time per agent, from the host's transcripts    |
| `feedback` | `adapters/feedback.handoffs.md`   | review findings and escalations in subagent handoffs      |
| `feedback` | `adapters/feedback.memory.md`     | feedback notes the session wrote or changed               |
| `feedback` | `adapters/feedback.deferred.md`   | rows a run deferred to a skill or its tooling             |
| `shape`    | `adapters/shape.hexagonal.md`     | the hexagonal-skill-builder check                         |
| `stack`    | `adapters/stack.gh-stack.md`      | one draft pull request per fix, stacked with `gh stack`   |

## Binding

A binding names the adapters for each port, `;` between ports and `,` between adapters. An adapter
that takes values gets them in parentheses, `key=value` and `,` between:

```text
feedback=transcript,memory; shape=hexagonal; stack=gh-stack(skills-prefix=skills/, feature-prefix=feat/, base=main)
```

The entry's `bind` is the default. A caller passes its own as `--bind "<binding>"` when it fires the
skill, and each port it names replaces the default for that port. An adapter lists the keys it takes
in its frontmatter `takes:`. A step that needs a key the binding leaves unset stops there and names
the key; it never guesses a value.
