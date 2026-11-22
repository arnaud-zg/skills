# 📖 Reference: stack-and-ship

[📚 Docs home](../../../../docs/README.md) › [🚢 stack-and-ship](README.md) ›
[🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) · **📖 Reference** ·
[💡 Explanation](explanation.md)

**Every verb, port, key and rule, in one page.** 3 verbs · 3 ports · 6 JSON keys · exit 0, 1 or 2.

## Verbs

| Verb     | Ends on                                                              |
| -------- | -------------------------------------------------------------------- |
| `commit` | a branch named for its value, one commit per TDD step, nothing stray |
| `pr`     | the checks read, the branch pushed, a checked PR open on the board   |
| `stack`  | every PR of a phase in one stack, in order, nothing force-pushed     |

## Ports

| Port      | Default           | Built-in adapter                                  |
| --------- | ----------------- | ------------------------------------------------- |
| `project` | none              | the file in `.agents/adapters/stack-and-ship/`    |
| `forge`   | `github`          | `gh` for issues and PRs, GitHub's stacks REST API |
| `board`   | `github-projects` | `gh project` item add and field edits             |

## The project adapter

Sections: Repository, Peer skills, Commands, Checks, Conventions, PR body, Board, Traps, and PR
rules, one fenced JSON block:

| Key             | Holds                                         | Without it               |
| --------------- | --------------------------------------------- | ------------------------ |
| `defaultBranch` | the branch nobody ships from                  | `main`                   |
| `phaseId`       | a regular expression for a phase id           | titles carry no phase id |
| `types`         | the commit types a title may open on          | the seven below          |
| `sections`      | the headings every PR body keeps              | none                     |
| `required`      | `{ rule, pattern, fix, shown? }` a body holds | none                     |
| `banned`        | `{ rule, pattern, fix, shown? }` it may not   | none                     |

Patterns are case-insensitive; `shown` matches only the text outside HTML comments.

## Check

`node scripts/check-pr.mjs --title <title> --branch <branch> --body <file> [--project <file>]`

| Rule             | Holds when                                                                |
| ---------------- | ------------------------------------------------------------------------- |
| `title`          | `type(scope): [PHASE-ID] value`, scope lowercase, subject not capitalised |
| `title-scope`    | the scope is not a number                                                 |
| `title-length`   | 100 characters or fewer                                                   |
| `branch`         | `type/[PHASE-ID-]value`, never the default branch                         |
| `phase-id`       | the branch and the title name the same phase                              |
| `body`           | the body is not blank                                                     |
| `template`       | every `sections` heading is there                                         |
| `mermaid-edges`  | no `A & B` edge in a Mermaid block                                        |
| `mermaid-labels` | no `\n` inside a node label                                               |
| yours            | each `required` pattern matches, no `banned` pattern does                 |

Types without `types`: `feat`, `fix`, `test`, `refactor`, `chore`, `docs`, `perf`. Exit 0 when the
PR holds, 1 on a finding, 2 when no project adapter is found.

When plain-language is installed beside it, the check also prints one `plain: body:<line>:` note per
sentence of the body that breaks a `standard` rule. A note never changes the exit code. Without
plain-language, it prints `plain-language not installed, style not checked`.

## Files

| File                                                                       | Role                             |
| -------------------------------------------------------------------------- | -------------------------------- |
| [`SKILL.md`](../../skills/stack-and-ship/SKILL.md)                         | the entry the agent reads        |
| [`ports/PORTS.md`](../../skills/stack-and-ship/ports/PORTS.md)             | the ports and the adapter's keys |
| [`scripts/check-pr.mjs`](../../skills/stack-and-ship/scripts/check-pr.mjs) | the PR check                     |
| [`domain/messages.md`](../../skills/stack-and-ship/domain/messages.md)     | branch, commit and title formats |
| [`domain/traps.md`](../../skills/stack-and-ship/domain/traps.md)           | what git and the shell do to you |

## Example

[`project.acme.md`](../../examples/stack-and-ship/project.acme.md) and
[`body.md`](../../examples/stack-and-ship/body.md): a PR that holds every rule.
[`examples.integration.test.ts`](../../examples/examples.integration.test.ts) runs it.
