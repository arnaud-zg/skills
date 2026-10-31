# ✂️ radical-simplify

[📚 Docs home](../../../../docs/README.md) › [arnaud-zg](../../README.md) › **✂️ radical-simplify**

A skill that rebuilds a process, product or UI into its simplest, fastest, clearest version. It
works strictly in six steps, Question, Remove, Simplify, Reimagine, Accelerate, Automate, so nothing
gets optimized that should have been removed, and nothing gets automated that should have been
simplified.

## At a glance

- **What is it?** A first-principles method Claude follows, with a fixed output: one section per
  step, then a before → after count
- **What does it work on?** A described process, a product, a screen, a form, an onboarding, or a
  flow in the code
- **How do I install it?** `/plugin install arnaud-zg --marketplace arnaud-zg/skills`, or
  `npx skills add arnaud-zg/skills --skill radical-simplify` for any agent
- **How do I call it?** Type `/arnaud-zg:radical-simplify <what to simplify>`, or ask Claude to
  _make this flow radically simpler_
- **What does it need?** Nothing. No script, no network, no file written

## Which page do I need?

| If you want to…                     | Go to                            | It gives you                         |
| ----------------------------------- | -------------------------------- | ------------------------------------ |
| simplify a first flow, step by step | 🚀 [Tutorial](tutorial.md)       | a refund flow cut down in one run    |
| point it at a screen, code or a doc | 🛠️ [How-to guides](how-to.md)    | one recipe per kind of target        |
| look up the steps and the output    | 📖 [Reference](reference.md)     | what each step does and returns      |
| understand why the order is strict  | 💡 [Explanation](explanation.md) | why removing comes before automating |

## 🔒 Know what you're installing

- **It is instructions only.** No script, no hook, no MCP server, no `allowed-tools`. Reading the
  files you point it at goes through Claude's usual permission prompts.
- **It proposes; it does not edit.** The result is a written redesign, and it changes code only if
  you ask for that afterwards.

Read [`SKILL.md`](../../skills/radical-simplify/SKILL.md) before installing it. Claude reads
`SKILL.md`, not this page.
