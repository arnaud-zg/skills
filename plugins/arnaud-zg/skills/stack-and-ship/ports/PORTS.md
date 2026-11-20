# Ports

**The method is the skill's. Which repository, commands and checks a project has, where its pull
requests and stacks live, and which board tracks them are three questions the world answers.**

| Port      | Count | Receives                                                  | Delivers                                                   | Never                                                   | Default           |
| --------- | ----- | --------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- | ----------------- |
| `project` | 1     | a step's word for a command, a place, an id or a rule     | the project's command, path, id or value for it            | restates a rule of the skill, or drops one              | none              |
| `forge`   | 1     | an issue to read, a PR to open or update, a stack to grow | the issue's body, the PR's number and URL, the stack order | merges, force-pushes, or pushes from a stacking command | `github`          |
| `board`   | 1     | an issue or PR, a status, an estimate                     | the item on the board with its fields set                  | applies a review label, or types an id from memory      | `github-projects` |

## Adapters

| Port      | Adapter                                                          | Reads or does                                |
| --------- | ---------------------------------------------------------------- | -------------------------------------------- |
| `forge`   | [forge.github.md](../adapters/forge.github.md)                   | `gh` for issues and PRs, the stacks REST API |
| `board`   | [board.github-projects.md](../adapters/board.github-projects.md) | `gh project` item add and field edits        |
| `project` | none built in: the project's own file in the drop-in folder      | its sections below                           |

## Binding

The entry's `bind` is the default, in the
[contract's grammar](../../hexagonal-architecture/domain/contract.md#binding-the-caller-picks), if
installed:

```text
forge=github; board=github-projects
```

The `project` adapter is found in the drop-in folder
`.agents/adapters/stack-and-ship/project.<name>.md` at the repository root, or passed with
`--project <file>`. The legacy `.stack-and-ship/adapters/` is still read, with a warning. With none,
the steps that need one of its keys stop and name the key.

## The `project` adapter

| Section     | Holds                                                                 |
| ----------- | --------------------------------------------------------------------- |
| Repository  | owner and name, default branch, PR template, where worktrees go       |
| Peer skills | which skills take the code shape and the UI verify steps              |
| Commands    | install, commit linter, format, affected tests, CI by hand            |
| Checks      | the table of what must pass before a push, and when each applies      |
| Conventions | phase ids, changelog entries, configuration, todos, labels, estimates |
| PR body     | what a body holds beyond the template: diagrams, numbers, language    |
| Board       | the keys the `board` adapter takes: ids, status options, estimate     |
| Traps       | what this project's tooling adds to the skill's traps                 |
| PR rules    | one fenced JSON block, read by `scripts/check-pr.mjs`                 |

The JSON block:

| Key             | Holds                                                                 | Without it               |
| --------------- | --------------------------------------------------------------------- | ------------------------ |
| `defaultBranch` | the branch nobody ships from                                          | `main`                   |
| `phaseId`       | a regular expression for a phase id, with no capture group            | titles carry no phase id |
| `types`         | the commit types a title may open on                                  | the seven in messages.md |
| `sections`      | the headings every PR body keeps                                      | none                     |
| `required`      | text a PR body must hold, such as the line that links its issue       | none                     |
| `banned`        | text a PR body may not hold, such as a closing keyword or a chat link | none                     |

Each `required` or `banned` entry is a `rule` name, a case-insensitive regular expression `pattern`
and its `fix`; `"shown": true` matches only the text outside HTML comments. A made-up adapter:
[project.acme.md](../scripts/fixtures/project.acme.md).

Ports, adapters, bindings and drop-ins follow the
[shared contract](../../hexagonal-architecture/domain/contract.md), if installed.
