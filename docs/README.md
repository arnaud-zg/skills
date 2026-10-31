# 📚 Documentation: Claude Code Agent Skills and plugins

How to use the skills in the `arnaud-zg-skills` marketplace, and how to add your own. The docs
follow [Diataxis](https://diataxis.fr/): each topic has four pages, one per reader need, so you can
go straight to the kind of page you want.

- **[Find and use a skill](../plugins/arnaud-zg/README.md#skills)**: the one list of skills; each
  links its tutorial, how-to guides, reference and explanation.
- **[Write a plugin](#write-a-plugin-in-this-repository)**: add your own skill to this marketplace.

## Which page do I need?

| I want to…                       | Read             | It gives me                            |
| -------------------------------- | ---------------- | -------------------------------------- |
| learn by doing, from scratch     | 🚀 Tutorial      | one guided run, start to finish        |
| get a specific task done         | 🛠️ How-to guides | short recipes for one goal each        |
| look up an option or a rule      | 📖 Reference     | every command, flag, field and default |
| understand why it works that way | 💡 Explanation   | the design and the trade-offs          |

## Write a plugin in this repository

These pages cover building and shipping plugins here, not using them.

| 🚀 Tutorial                            | 🛠️ How-to guides                                                                | 📖 Reference                                           | 💡 Explanation                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| [Build your first plugin](tutorial.md) | [Add](how-to.md), [test, document](test-and-document.md), [release](release.md) | [Layout, CLI](reference.md), [manifests](manifests.md) | [Skills, plugins, marketplaces](explanation.md), [composition](composition.md) |

A new skill gets one row in its plugin README's skills table, and its own README for the summary.
[Document a plugin](test-and-document.md#document-a-plugin) says how.
