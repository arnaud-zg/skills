# The rule and the layers

**One rule: a dependency points inward.** The domain knows nothing of the use cases, the use cases
know only the ports, and the adapters know whatever they need. Swap an adapter and nothing inside
changes; change the domain and the adapters follow.

## The layers

| Rank | Layer         | Holds                                                   | Folder names the check reads                    |
| ---- | ------------- | ------------------------------------------------------- | ----------------------------------------------- |
| 0    | `domain`      | what stays true: entities, values, rules, no I/O        | `domain`, `core`, `entities`                    |
| 1    | `ports`       | what the core asks of the world, in the core's words    | `ports`                                         |
| 2    | `application` | what the core does: one use case per job, through ports | `application`, `usecases`, `use-cases`, `verbs` |
| 3    | `adapters`    | how the world answers: a database, an API, a CLI, a UI  | `adapters`, `infrastructure`, `infra`           |

A file may depend on its own rank or a lower one. A project with other folder names passes its own
list to the check with `--layers`, innermost first.

**The composition root** wires adapters to ports and starts the program: `main.*`, a `composition*`
file, or any file outside the layer folders. It may point anywhere, and nothing points at it.

## Two kinds of port

- **Driving**, on the left: how the world calls the core. An HTTP handler, a CLI command, a test, or
  a skill's entry calls a use case.
- **Driven**, on the right: what the core calls out to. A store, a clock, a mailer, a model.

The core owns both. A port is named for the core's need (`OrderStore.save`), never for its first
adapter (`PostgresClient.query`).

## Clean architecture, onion, hexagonal

Three names, one rule. Clean architecture's rings map onto the same layers:

| Clean architecture ring         | Layer here             |
| ------------------------------- | ---------------------- |
| Entities                        | `domain`               |
| Use cases, and their boundaries | `application`, `ports` |
| Interface adapters              | `adapters`             |
| Frameworks and drivers          | `adapters`, the root   |

## A skill is a hexagon too

| Skill part            | Layer                                               |
| --------------------- | --------------------------------------------------- |
| `SKILL.md`, the entry | driving port and composition root: it routes        |
| `verbs/`              | `application`: what Claude does, step by step       |
| `domain/`             | `domain`: what stays true, whichever tool answers   |
| `ports/PORTS.md`      | `ports`, and the wiring table of its adapters       |
| `adapters/`           | `adapters`: the tools, hosts and formats it touches |

The check reads Markdown links the way it reads imports, so a `domain/` page that links an
`adapters/` page is the same leak as a domain module importing a database driver.
