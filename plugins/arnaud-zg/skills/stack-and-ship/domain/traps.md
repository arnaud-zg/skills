# Traps

**Each line here cost a session a wrong commit or a lost hour.** Read once before the first commit,
with the adapter's Traps section, which adds what this project's own hooks and tools do.

| Trap                                                                                            | Do instead                                                                                          |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Peer sessions switch branches in a shared checkout under you                                    | work in a worktree, and check `git branch --show-current` before any amend                          |
| A command-rewriting shell hook changes words inside an inline `-m "..."`                        | write the message to a file, `git commit -F <file>`                                                 |
| A rejected commit keeps its files staged, so the next commit takes them under the wrong message | validate with the commit linter first; commit with `-- <paths>`                                     |
| `--amend` chained after a commit that can fail amends the previous commit                       | amend only after `git log -1 --format=%s` shows the commit just made                                |
| A repo-wide format script rewrites every file in the repository                                 | check or write format on the files you touched only                                                 |
| `git add -A` stages that drift and other lanes' files                                           | stage explicit paths: `git add -A -- <paths>`                                                       |
| zsh does not word-split `$FILES`                                                                | list paths inline, or use `${=FILES}`                                                               |
| The pre-push hook checks the working tree, not the branch being pushed                          | switch to the branch before pushing it; never push in a loop while switching                        |
| A stacking tool's submit command may force-push every branch of the stack                       | register the stack with the forge's calls that never push; push each branch yourself, without force |
| A merge brings dependencies the checkout has not installed                                      | install from the lockfile after the merge, before the push                                          |
