# 🛠️ How to test, evaluate and document a Claude Code plugin

[📚 Docs home](README.md) › Writing plugins › [🛠️ How-to](how-to.md) › **Test and document**

## Test locally before pushing

```sh
claude plugin validate . --strict            # marketplace + every listed plugin
claude plugin marketplace add ./             # from the repo root
claude plugin install <plugin>@arnaud-zg-skills
claude plugin details <plugin>               # inventory + projected token cost
```

Iterating on an installed plugin: `/reload-plugins` picks up changes without restarting the session.

Undo:

```sh
claude plugin uninstall <plugin>
claude plugin marketplace remove arnaud-zg-skills
```

## Draft a skill without packaging it

```sh
claude plugin init <name> --with skills agents hooks mcp
```

This scaffolds `~/.claude/skills/<name>/`, which auto-loads next session as `<name>@skills-dir` — no
marketplace, no install, no version. Iterate there, then move the directory into `plugins/` when it
is worth publishing.

## Evaluate a skill

```sh
claude plugin eval init --bare <case>   # blank case under the plugin's evals/
claude plugin eval <name>               # scored run
claude plugin details <name>            # inventory + projected token cost
```

A case is a directory under `evals/` inside the plugin. `prompt.md` is the prompt to send, with
`max_turns` and `allowed_tools` in its frontmatter. Each `graders/*.md` is one grading criterion,
with `type: llm` and a `weight` in its frontmatter. Start from the two or three prompts that should
trigger the skill.

By default every case also runs without the plugin, and the report shows the score difference, so
you can tell whether the skill changes anything. Results land in `evals/results/<timestamp>/`; don't
commit them.

Evals run on your machine, as you. Only evaluate plugins you trust.

## Document a plugin

Every plugin carries a `README.md` and a `docs/` folder with four pages, one per
[Diataxis](https://diataxis.fr/) type. Copy the shape of `plugins/arnaud-zg/`:

```
plugins/<name>/
├── README.md            # what it is, install, a short FAQ, links to the four pages
└── docs/
    ├── tutorial.md      # learning: one guided first run that always works
    ├── how-to.md        # a task: goal-titled recipes for someone who knows the basics
    ├── reference.md     # looking up: every command, flag, field and exit code, nothing else
    └── explanation.md   # understanding: why it is shaped this way, trade-offs, history
```

1. Write the tutorial first, and run every command in it. It has one path, no choices and no theory;
   a reader who follows it ends with something that works.
2. Title each how-to with the task it solves ("Fail a build when a skill breaks"), not a topic
   ("CI"). Start from the goal, skip what the tutorial taught, link to reference for details.
3. Organise the reference like the thing it describes: by command, by field, by rule. Keep it dry,
   complete and free of advice.
4. Put every "why" in the explanation, and nowhere else. When a how-to needs a reason, link to it.
5. Open each page with one line that says what kind of page it is and who it is for, and link to the
   sibling page a reader probably wanted instead.
6. Keep `README.md` and `docs/` outside the skill folder: the agent loads the skill, people read the
   docs, and neither should pay for the other's text.
7. `pnpm lint:md` checks the Markdown and every relative link.
