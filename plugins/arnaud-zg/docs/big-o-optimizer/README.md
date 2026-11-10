# ⚡ big-o-optimizer

[📚 Docs home](../../../../docs/README.md) › [arnaud-zg](../../README.md) › **⚡ big-o-optimizer**

A skill that lowers the time complexity of a piece of code, such as O(n²) to O(n), without changing
what it returns, in any programming language. It names the Big O from the code, picks a known
pattern, rewrites the smallest piece, and proves the behaviour with the project's tests. Language
details (JavaScript and TypeScript, Python, Go built in) and extra behaviour, such as a benchmark or
a lint, are adapters a project can inject as a file.

## At a glance

- **What is it?** A method Claude follows: read, name the Big O, pick a pattern, rewrite, verify,
  hand over a before → after table
- **What does it work on?** A file, a function or a pasted snippet, in any language; without a
  language adapter it uses the standard library's own structures
- **How do I install it?** `/plugin install arnaud-zg --marketplace arnaud-zg/skills`, or
  `npx skills add arnaud-zg/skills --skill big-o-optimizer` for any agent
- **How do I call it?** Type `/arnaud-zg:big-o-optimizer <target>`, or ask Claude to _make this
  O(n)_
- **What does it need?** Nothing. No script; it runs your own tests

## Which page do I need?

| If you want to…                       | Go to                            | It gives you                     |
| ------------------------------------- | -------------------------------- | -------------------------------- |
| cut a first nested loop, step by step | 🚀 [Tutorial](tutorial.md)       | an O(n·m) filter made O(n+m)     |
| add a language, a benchmark or a step | 🛠️ [How-to guides](how-to.md)    | one recipe per adapter           |
| look up the steps, ports and patterns | 📖 [Reference](reference.md)     | what each part does and returns  |
| understand why it proves both         | 💡 [Explanation](explanation.md) | why behaviour comes before speed |

## 🔒 Know what you're installing

- **It is instructions only.** No script, no hook, no MCP server, no `allowed-tools`. Running your
  tests goes through Claude's usual permission prompts.
- **An injected adapter is instructions too**, read with the same trust as your code. Review
  `.big-o/adapters/` as you would a script.

Read [`SKILL.md`](../../skills/big-o-optimizer/SKILL.md) before installing it. Claude reads
`SKILL.md`, not this page.
