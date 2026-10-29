# Changesets

This folder holds [changesets](https://github.com/changesets/changesets): one Markdown file per
unreleased change, describing which plugins it affects and how much to bump them.

Create one with `pnpm changeset` for any change to a plugin worth releasing. Plugins are private
packages: changesets versions them and writes their changelogs, and never publishes them to npm.
