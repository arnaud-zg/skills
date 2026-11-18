---
name: stack-and-ship
description:
  Ships a change from branch to stacked pull request by a project's house rules: branch names, the
  TDD commit sequence, a commit linter before each commit, `git commit -F` with explicit paths, the
  checks before a push, the PR body from the project's template checked by a script, changelog
  entry, type label, board estimate, and one stack per phase that never force-pushes. Use when
  committing, pushing, opening or updating a PR, stacking PRs for a phase, or when asked to "ship
  this", "open the PR", "commit this", "stack these PRs" or "is this PR ready".
argument-hint: "[commit|pr|stack] [<issue number>] [--project <file>] [--bind <binding>]"
metadata:
  format: hexagon/1
  bind: "forge=github; board=github-projects"
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/check-pr.mjs *)
---

# Stack and ship

**A change is shipped when a reviewer can merge it without asking a question.** That means a branch
named for its value, one commit per TDD step, a PR body that explains itself, and the change
registered where the team tracks it. The never-negotiable rules stay in the project's agent rules
file (never commit to the default branch, never force-push, ask before pushing or opening a PR
unless the person approved it for this run, never merge unless asked at that moment); this skill is
how to work inside them.

`${CLAUDE_SKILL_DIR}` is this skill's folder. Claude Code sets it; in another agent, use the folder
that holds this file.

The method belongs to no project and no host. Before the first command, read the project adapter:
the one `project.<name>.md` in `.stack-and-ship/adapters/` at the repository root, or the file
passed with `--project`. It holds the repository, the commands, the checks, the board ids and the
traps of this one. With none, say so, and stop at the first step that needs one of its keys, naming
the key. Issues, pull requests and stacks go through the `forge` port, the board through the `board`
port. [ports/PORTS.md](ports/PORTS.md) names their adapters and what a project adapter holds.

## Pick the verb

| The person wants to…                                 | Read                                           |
| ---------------------------------------------------- | ---------------------------------------------- |
| start a branch, or commit a step                     | [verbs/commit.md](verbs/commit.md)             |
| push and open (or update) a pull request             | [verbs/pull-request.md](verbs/pull-request.md) |
| stack a phase's PRs, or update a lower PR in a stack | [verbs/stack.md](verbs/stack.md)               |

With no verb, follow them in that order: commit, pull request, then stack for every PR of a phase
after the first.

## Map

- [domain/messages.md](domain/messages.md): the branch, commit and title format, with examples.
- [domain/board.md](domain/board.md): when to move an item on the board, and its labels.
- [domain/traps.md](domain/traps.md): what the shell and the hooks do behind your back. Read it once
  per session before the first commit.

## Check

```sh
node ${CLAUDE_SKILL_DIR}/scripts/check-pr.mjs --title "<title>" --branch <branch> --body <file> [--project <file>]
```

It prints one line per broken house rule (`rule → fix`) for a PR title, branch name and body, read
from the project adapter's PR rules, and exits 1 on a finding, 0 when the PR holds, 2 when no
project adapter is found. Run it before the PR is opened and before each update of its body.
`--project` names an adapter kept outside the drop-in folder.
