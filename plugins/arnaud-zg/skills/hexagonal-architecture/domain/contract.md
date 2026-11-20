# The port and adapter contract

**A port is the what. An adapter is the how.** The steps of a skill, or the use cases of a program,
name no tool: each thing they depend on is a port, and an adapter answers it. This page is the one
contract every skill with a `ports/` folder follows; its own `ports/PORTS.md` holds only its ports.

## A port

A port is one question the core asks, in the core's words. Its page states, per port:

| Column   | Says                                                            |
| -------- | --------------------------------------------------------------- |
| how many | one adapter, one per run, or any count                          |
| receives | what the core hands the adapter                                 |
| delivers | what the adapter hands back                                     |
| never    | what no adapter may do, such as write, post or guess            |
| default  | the adapter used when nobody names one, or "none" when optional |

**Every port works with no adapter named.** A port with no default is optional, and the step that
asks it is skipped and says so. Another host, target or source is another adapter answering the same
question, never a change to the steps.

## An adapter

One file per adapter, `adapters/<port>.<name>.md` in a skill, or one module implementing the port in
code. A skill adapter opens with frontmatter:

| Key        | Means                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| `fulfils`  | the port it answers. Required                                                                         |
| `takes`    | the keys it needs from the binding, if any                                                            |
| `replaces` | the adapter it takes the place of; without it, it runs after the default on a port that takes several |

A skill may add keys for one port, such as the file extensions a `language` adapter covers; its
`ports/PORTS.md` lists them.

## Binding: the caller picks

A binding names the adapters for each port, `;` between ports and `,` between adapters. An adapter
that takes values gets them in parentheses:

```text
feedback=transcript,memory; stack=gh-stack(base=main, skills-prefix=skills/)
```

The entry's `metadata.bind` is the default. A caller passes its own as `--bind "<binding>"`, and
each port it names replaces the default for that port. **A step that needs a key the binding leaves
unset stops there and names the key; it never guesses a value.** In code the binding is the
composition root: `main` builds the adapters and hands them to the use cases.

## Drop-in: the project adds

A project adds an adapter without touching the skill: a file at
`.agents/adapters/<skill>/<port>.<name>.md` under its root, or a file the person names in the
request. One folder holds every skill's adapters, so the root gains one entry, never one per skill.

| Part        | Rule                                                                    |
| ----------- | ----------------------------------------------------------------------- |
| root        | the repository's top folder (`git rev-parse --show-toplevel`), else cwd |
| `<skill>`   | the skill's `name:` exactly, never a shorter alias                      |
| file name   | `<port>.<name>.md`, each part lowercase words joined by hyphens         |
| frontmatter | `fulfils: <port>`, the same port as the file name                       |

The skill looks before its first step, in this order; for each `<port>.<name>`, the first wins:

1. a file the person names, or passes with `--project`
2. `.agents/adapters/<skill>/`
3. the legacy `.<skill>/adapters/`, still read, with a warning to move it
4. the skill's built-in `adapters/`

A port that takes several adapters lists them sorted by name, never in the disk's order. A port that
takes one, with no default, stops when one place holds several, and lists them.

A script that looks adapters up carries `scripts/adapters.mjs`, copied from this skill byte for
byte. hexagonal-skill-builder checks a project's adapters (`check.mjs --adapters`) and moves legacy
folders into the home (`migrate-adapters.mjs`).

**An injected adapter is read as instructions from the project, with the same trust as its code.**
It can add a check or a step; it never lifts a rule of the skill's verbs or domain.

## What a `ports/PORTS.md` holds

1. One bold line: what is the skill's own, and which questions it leaves to the world.
2. The port table above, its columns trimmed to what the skill needs.
3. The adapters each port has, built in, with a link to each.
4. Any key of its own.
5. A link to this page. Nothing more: the rest is said here once.
