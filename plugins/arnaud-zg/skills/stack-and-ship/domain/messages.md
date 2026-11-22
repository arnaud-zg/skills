# Branches, commits and titles

**Every name says the value delivered, never the technical action.** The phase id format is the
project adapter's (`phaseId`), and a project without one leaves it out; the examples here use `S14`.

## Branch

`type/<PHASE-ID>-short-business-description` during planned phase work,
`type/short-business-description` outside it:

- ✅ `chore/S14-offline-catalog-plan`, `feat/S14-01-offline-schema`,
  `fix/S3-webhook-duplicate-event`, `fix/webhook-duplicate-event`

One branch per plan step during execution. The first step of a phase branches from the default
branch, each next step from the previous step's branch.

## Commit

`type(scope): [PHASE-ID] business value description`

- `scope` is required and names the domain or feature (`search`, `auth`, `config`), never the phase
  number.
- `[PHASE-ID]` only for phase work (`[S14-02]`).
- The subject does not open on a capitalised word, and the whole header stays under 100 characters.
- Types: `feat` (business value), `fix`, `test` (the Red step), `refactor` (no behaviour change),
  `chore` (tooling, dependencies, config), `docs`, `perf`.

Examples:

- ✅ `feat(search): [S1] user receives candidates after a photo upload`
- ❌ `feat(search): [S1] add handler and service`

### The TDD sequence

Each step is its own commit, never mixed; the type follows the step. Before starting, write the
whole sequence down, then proceed and flag a deviation when it happens:

```text
test(search): [S1] given a valid image, when a search starts, then a pending request exists
feat(search): [S1] user can start a search with a valid image
refactor(search): [S1] extract image validation into a value object
```

A docs-only or skill-only change has no Red step. A bug found on the way gets a failing test, then
its own `fix`.

## The words

Commit subjects become the changelog, so write them for the person who uses the change. Write the
subject and the PR body at **standard** level, by
[plain-language](../../plain-language/domain/levels.md) if installed: one idea per sentence, 25
words at most, no filler.

- ✅ `fix(import): an empty line no longer stops the import`
- ❌ `fix(import): updated the parser so that empty lines are now handled correctly`

## Pull request title

The same format as a commit; for an issue, the issue's title.

- ✅ `feat(search): [S1] users can search from a photo`
- ✅ `docs(admin): [S12] lay groundwork for admin item creation and publishing`
- ❌ `docs(12): phase 12 plan, admin item management` (a phase number is not a scope)
- ❌ `feat(admin): add item management CRUD endpoints` (the technical action, not the value)
