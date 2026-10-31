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

| Skill                                                                                    | Plugin      | Purpose                                                                                       | Fires when you ask to…                                                    |
| ---------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [`hexagonal-skill-builder`](../plugins/arnaud-zg/docs/hexagonal-skill-builder/README.md) | `arnaud-zg` | Lint and write Agent Skills (`SKILL.md`) against four rules: named, small, resolves, tested   | _create a skill_, _check the skills_, _lint my skills_, edit a `SKILL.md` |
| [`doc-compass`](../plugins/arnaud-zg/docs/doc-compass/README.md)                         | `arnaud-zg` | Write and check Diataxis docs: orphan pages, broken links, stale decisions                    | _document this feature_, _check the docs_, _where should this doc go_     |
| [`radical-simplify`](../plugins/arnaud-zg/docs/radical-simplify/README.md)               | `arnaud-zg` | Rebuild a process, product or UI: Question, Remove, Simplify, Reimagine, Accelerate, Automate | _make this radically simpler_, _streamline this flow_, _cut the steps_    |

## Docs for each skill

- **[`hexagonal-skill-builder`](../plugins/arnaud-zg/docs/hexagonal-skill-builder/README.md)**: 🚀
  [Your first skill, checked](../plugins/arnaud-zg/docs/hexagonal-skill-builder/tutorial.md) · 🛠️
  [CI, hooks, JSON](../plugins/arnaud-zg/docs/hexagonal-skill-builder/how-to.md) · 📖
  [Command and rules](../plugins/arnaud-zg/docs/hexagonal-skill-builder/reference.md) · 💡
  [Why four rules](../plugins/arnaud-zg/docs/hexagonal-skill-builder/explanation.md)
- **[`doc-compass`](../plugins/arnaud-zg/docs/doc-compass/README.md)**: 🚀
  [A checked docs set](../plugins/arnaud-zg/docs/doc-compass/tutorial.md) · 🛠️
  [CI, style, audits](../plugins/arnaud-zg/docs/doc-compass/how-to.md) · 📖
  [Command and rules](../plugins/arnaud-zg/docs/doc-compass/reference.md) · 💡
  [Why a compass](../plugins/arnaud-zg/docs/doc-compass/explanation.md)
- **[`radical-simplify`](../plugins/arnaud-zg/docs/radical-simplify/README.md)**: 🚀
  [A refund flow, cut down](../plugins/arnaud-zg/docs/radical-simplify/tutorial.md) · 🛠️
  [Screens, code, docs](../plugins/arnaud-zg/docs/radical-simplify/how-to.md) · 📖
  [Steps and output](../plugins/arnaud-zg/docs/radical-simplify/reference.md) · 💡
  [Why the order is strict](../plugins/arnaud-zg/docs/radical-simplify/explanation.md)

## Write a plugin in this repository

These pages cover building and shipping plugins here, not using them.

| 🚀 Tutorial                            | 🛠️ How-to guides                                                                | 📖 Reference                                           | 💡 Explanation                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| [Build your first plugin](tutorial.md) | [Add](how-to.md), [test, document](test-and-document.md), [release](release.md) | [Layout, CLI](reference.md), [manifests](manifests.md) | [Skills, plugins, marketplaces](explanation.md), [composition](composition.md) |

A new skill gets a row in the [catalogue](#skills-catalogue), its own README for the summary, and a
line in [Docs for each skill](#docs-for-each-skill).
[Document a plugin](test-and-document.md#document-a-plugin) says how.
