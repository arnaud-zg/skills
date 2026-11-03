# 🚢 How to release a Claude Code plugin version

[📚 Docs home](README.md) › Writing plugins › [🛠️ How-to](how-to.md) › **Release**

One command releases every plugin, and you never edit a version, a changelog or a tag by hand.

```sh
pnpm release    # opens the release PR, waits for its merge, then tags and creates the GitHub releases
```

`pnpm release` runs [shiplane](https://github.com/arnaud-zg/packages/tree/main/packages/shiplane),
configured in `shiplane.config.ts`. Each plugin has its own version, changelog
(`plugins/<name>/CHANGELOG.md`) and `<name>--v<version>` tag.

## 1. Write the commit subject

Pull requests are squash merged, so a PR's title is its commit subject, and that subject sets the
release. Only commits touching `plugins/<name>/` count.

| Subject                              | Moves the plugin | Changelog line                          |
| ------------------------------------ | ---------------- | --------------------------------------- |
| `fix(scope): …`, `perf(scope): …`    | patch            | yes                                     |
| `feat(scope): …`                     | minor            | yes                                     |
| `feat(scope)!: …`, any type with `!` | major            | yes                                     |
| `docs`, `test`, `chore`, `refactor`… | patch            | the latest one, if nothing else has one |

The biggest move wins. Write the subject for users: without its type and PR number, it is what they
read. Mark a breaking change with `!`, because a `BREAKING CHANGE:` footer is not read.

When a release needs better words or another bump, add a changeset. It takes over for the plugins it
names: their commits are skipped.

```sh
pnpm changeset add --minor @arnaud-zg/plugin-hello-tools -m "Add the audit-deps skill"
```

Plugins appear as `@arnaud-zg/plugin-<name>`, because each one has a private `package.json` beside
its `plugin.json` (see [why](#why-plugins-carry-a-packagejson)).

A new plugin is the exception: it starts at `0.0.0` and needs a changeset for its first version, so
it has a changelog from day one and its first GitHub release has real notes. Add the changeset in
the PR that adds the plugin (`minor` for `0.1.0`). shiplane never tags a `0.0.0`, and
`marketplace.unit.test.ts` fails on a plugin with no changelog and no pending changeset.

## 2. Release

Run `pnpm release` from an up-to-date `main` with a clean working tree; it refuses anything else. It
reads where things stand first, so each run picks up where the last one stopped:

| Where things stand                           | What `pnpm release` does                                                            |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| commits or changesets pending, no release PR | shows each plugin's bump, asks which to release, then opens the release PR          |
| a release PR is open                         | waits for its merge: merge it on GitHub, or press `m` to merge it from the terminal |
| merged, not tagged yet                       | tags each plugin `<name>--v<version>` and creates its GitHub release                |
| nothing pending                              | says so and stops                                                                   |

To hold a plugin back, untick it at that first question: its commits wait for the next release.

The release PR branches off `main`, because `main` is protected. It holds each plugin's new version,
in `package.json` and every agent manifest, and its changelog.

Once it merges, shiplane tags each version on the commit that brought it, pushes the tags, and
creates each GitHub release with the plugin's changelog section as its notes. A failed step undoes
what it ran and says so; fix whatever stopped it and run `pnpm release` again. To see where each
plugin stands without changing anything, run `pnpm shiplane status`.

Run `claude plugin validate . --strict` before merging the release PR. shiplane tags with git, so
nothing else validates the plugin at release time.

Leave `version` out of the plugin's marketplace entry. Claude Code reads `plugin.json` first, so a
version there is ignored at install time and can only go stale. `marketplace.unit.test.ts` fails if
one appears.

The tag format, and how each agent pins a release, are in [tags.md](tags.md).

## What a plugin release actually ships

Nothing is uploaded anywhere, because the marketplace _is_ this git repository. But merging a plugin
change to `main` does not ship it. Claude Code decides whether an installed plugin has an update by
comparing versions, and it reads the version from `plugin.json` first. Until that string changes,
`claude plugin update` reports the plugin as already at the latest version, however many commits
land.

The release PR is what ships a plugin: merging it changes the version in `plugin.json`. Users then
get the new code with `claude plugin update <name>`, or on their next auto-update if they turned it
on for this marketplace. It is off by default for marketplaces not run by Anthropic. Updates apply
on restart or `/reload-plugins`.

Two consequences:

- A plugin change merged to `main` waits for the next release PR, so several can ship together.
- Someone who installs the plugin in that window gets the new code under the old version number.
  Keep the window short.

Catalogue edits in `marketplace.json` (descriptions, categories) carry no version and reach users on
their next `claude plugin marketplace update`.

The tag does a narrower job: it makes the plugin resolvable by a dependency range like
`ts-base@^1.2.0`, and gives a `git-subdir` entry something to pin.

## Why plugins carry a package.json

A plugin's real manifest is `.claude-plugin/plugin.json`. The `package.json` beside it is private,
never published, and exists only so changesets can see the plugin as a workspace package and version
it; shiplane's `agentPlugin()` copies the result into every agent manifest in the same release PR,
so nothing has to keep them in step by hand.
