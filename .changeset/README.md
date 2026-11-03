# Changesets

This folder holds [changesets](https://github.com/changesets/changesets): one Markdown file per
unreleased change, describing which plugins it affects and how much to bump them.

Optional: `pnpm release` works from commit subjects alone. Add one with `pnpm changeset` when a
release needs better words or another bump than its commits give, and for a new plugin's first
version. Plugins are private packages: changesets versions them and writes their changelogs, and
never publishes them to npm.
