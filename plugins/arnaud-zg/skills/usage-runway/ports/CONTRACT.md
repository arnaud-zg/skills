<!-- Generated from the hexagonal-architecture skill's contract page by `pnpm sync:contract`.
     Edit the source, then run it again: a test fails when this copy drifts. -->

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

A project adds an adapter without touching the skill: a file at `.<skill>/adapters/<port>.<name>.md`
under its root (a skill may name a shorter folder), or a file the person names in the request. The
skill looks for both before its first step. A project adapter wins over a built-in one of the same
name.

**An injected adapter is read as instructions from the project, with the same trust as its code.**
It can add a check or a step; it never lifts a rule of the skill's verbs or domain.

## What a `ports/PORTS.md` holds

1. One bold line: what is the skill's own, and which questions it leaves to the world.
2. The port table above, its columns trimmed to what the skill needs.
3. The adapters each port has, built in, with a link to each.
4. Any key of its own, and its drop-in folder if it is not `.<skill>/`.
5. A link to this page. Nothing more: the rest is said here once.
