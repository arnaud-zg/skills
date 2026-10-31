---
fulfils: stack
delivers: the base to cut from, then a draft pull request on it
takes: skills-prefix, feature-prefix, base
binds: git worktree, gh pr, gh stack
---

# stack: gh stack

## The worktree

```sh
gh pr list --state open --limit 200 --json number,headRefName,baseRefName,isDraft,state |
  node ${CLAUDE_SKILL_DIR}/scripts/stack-base.mjs \
    --skills-prefix <skills-prefix> --feature-prefix <feature-prefix> --base <base>
```

It prints one branch: the top of the open skills chain, or the base when none is open. A `REFUSE`
line (exit 1) means the chain is wrong: book nothing, and copy that line into the report for a
person. Otherwise cut the fix from the printed branch, in a folder outside the running checkout:

```sh
git fetch origin <branch>
git worktree add <dir> -b <skills-prefix><n>-<slug> origin/<branch>
```

## The pull request

Commit the fix in `<dir>`, saying what the next session gains in plain words. Then:

```sh
git -C <dir> push -u origin <skills-prefix><n>-<slug>
gh pr create --draft --base <branch> --head <skills-prefix><n>-<slug> --title <...> --body <...>
gh stack link <the skills chain's pull requests, bottom to top, then the new one>
```

Pass pull request numbers to `gh stack link`, and never `--open`. Never run `gh stack sync` or
`gh stack rebase`: both force-push. Remove the worktree once the pull request is open.
