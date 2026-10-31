# 🧭 doc-compass

[📚 Docs home](../../../../docs/README.md) › **🧭 doc-compass**

A skill that writes [Diataxis](https://diataxis.fr/) documentation and keeps it true. It starts a
docs set from templates, sorts content into the right quadrant, says what to update after a code
change, and checks the docs for the breaks that make them go stale: pages no index reaches, links
and anchors to nothing, and decisions superseded one way only.

## At a glance

- **What is it?** A Diataxis writing guide Claude follows, page templates, and a docs checker
- **What does it check?** Seven rules: `indexed`, `resolves`, `framed`, `superseded`, `generated`,
  `small`, and `banned` when given strings to ban
- **How do I install it?** `/plugin install arnaud-zg --marketplace arnaud-zg/skills`, or
  `npx skills add arnaud-zg/skills --skill doc-compass` for any agent
- **How do I call it?** Ask Claude to _document this feature_ or _check the docs_, or type
  `/arnaud-zg:doc-compass audit docs`
- **How do I run it in CI?** `node <skill folder>/scripts/check-docs.mjs docs`, which exits `1` on a
  finding
- **What does it need?** Node. No dependencies, no network, and the check never writes a file

## Which page do I need?

| If you want to…                         | Go to                            | It gives you                              |
| --------------------------------------- | -------------------------------- | ----------------------------------------- |
| start docs for a project, step by step  | 🚀 [Tutorial](tutorial.md)       | a checked docs set in ten minutes         |
| gate a build, ban a style, audit a mess | 🛠️ [How-to guides](how-to.md)    | one recipe per task                       |
| look up the command or a rule           | 📖 [Reference](reference.md)     | options, exit codes, what each rule reads |
| understand why it is built this way     | 💡 [Explanation](explanation.md) | Diataxis, and why these seven rules       |

## 🔒 Know what you're installing

- **The check reads, and never writes.** It reads the Markdown under the folder you give it, and
  opens no connection.
- **It pre-approves one command**: `node ${CLAUDE_SKILL_DIR}/scripts/check-docs.mjs`, through the
  skill's `allowed-tools`. Writing pages goes through Claude's usual permission prompts.

Read [`SKILL.md`](../../skills/doc-compass/SKILL.md) and
[`scripts/`](../../skills/doc-compass/scripts/) before installing it. Claude reads `SKILL.md`, not
this page.
