# 📚 Documentation: Claude Code Agent Skills and plugins

Every skill in the `arnaud-zg-skills` marketplace, what it does, how it works, and where to read
more. The docs follow [Diataxis](https://diataxis.fr/): each topic has four pages, one per reader
need, so you can go straight to the kind of page you want.

- **[Find a skill](#skills-catalogue)**: what each skill is for and when it fires.
- **[Use a skill](#docs-for-each-skill)**: its tutorial, how-to guides, reference and explanation.
- **[Write a plugin](#write-a-plugin-in-this-repository)**: add your own skill to this marketplace.

## Which page do I need?

| I want to…                       | Read             | It gives me                            |
| -------------------------------- | ---------------- | -------------------------------------- |
| learn by doing, from scratch     | 🚀 Tutorial      | one guided run, start to finish        |
| get a specific task done         | 🛠️ How-to guides | short recipes for one goal each        |
| look up an option or a rule      | 📖 Reference     | every command, flag, field and default |
| understand why it works that way | 💡 Explanation   | the design and the trade-offs          |

## Skills catalogue

| Skill                                                       | Plugin      | Purpose                                                                                     | Fires when you ask to…                                                    |
| ----------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [`hexagonal-skill-builder`](../plugins/arnaud-zg/README.md) | `arnaud-zg` | Lint and write Agent Skills (`SKILL.md`) against four rules: named, small, resolves, tested | _create a skill_, _check the skills_, _lint my skills_, edit a `SKILL.md` |

### hexagonal-skill-builder: a linter for Agent Skills

- **What it is**: a linter and writing guide for the `SKILL.md` folders that Claude Code and other
  coding agents load.
- **Purpose**: catch the mistakes a model would follow to the letter: a vague description, an entry
  too long to load cheaply, a link that leads nowhere, a script no test runs.
- **How it works**: a Node script reads every skill under `.claude/skills`, `.agents/skills`,
  `skills/` and `plugins/*/skills`, checks four rules, and prints each finding with its file, line
  and fix. It exits `0` when every skill holds and `1` on a finding, so it gates CI and commit hooks
  as is. It reads only, needs no dependency and opens no connection.
- **Call it**: ask Claude to _check the skills_, type `/arnaud-zg:hexagonal-skill-builder check`, or
  run `node <skill folder>/scripts/check.mjs` without any agent.
- **Install**: `/plugin install arnaud-zg --marketplace arnaud-zg/skills`, or
  `npx skills add arnaud-zg/skills --skill hexagonal-skill-builder` for any agent.

## Docs for each skill

| Skill                                                       | 🚀 Tutorial                                                        | 🛠️ How-to guides                                       | 📖 Reference                                                | 💡 Explanation                                             |
| ----------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------- |
| [`hexagonal-skill-builder`](../plugins/arnaud-zg/README.md) | [Your first skill, checked](../plugins/arnaud-zg/docs/tutorial.md) | [CI, hooks, JSON](../plugins/arnaud-zg/docs/how-to.md) | [Command and rules](../plugins/arnaud-zg/docs/reference.md) | [Why four rules](../plugins/arnaud-zg/docs/explanation.md) |

## Write a plugin in this repository

These pages cover building and shipping plugins here, not using them.

| 🚀 Tutorial                            | 🛠️ How-to guides                                        | 📖 Reference                                           | 💡 Explanation                                  |
| -------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| [Build your first plugin](tutorial.md) | [Add, document, test](how-to.md), [release](release.md) | [Layout, CLI](reference.md), [manifests](manifests.md) | [Skills, plugins, marketplaces](explanation.md) |

A new skill gets a row in the [catalogue](#skills-catalogue), a summary under it, and a row in
[Docs for each skill](#docs-for-each-skill). [Document a plugin](how-to.md#document-a-plugin) says
how.
