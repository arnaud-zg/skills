# Changesets

This folder is shiplane's. `pnpm release` writes a changeset here from the commits since each
plugin's last tag, and `changeset version` consumes it in the release PR, so it stays empty between
releases and nothing here is written by hand. Plugins are private packages: changesets versions them
and writes their changelogs, and never publishes them to npm.
