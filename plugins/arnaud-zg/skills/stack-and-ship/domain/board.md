# The project board

**Every issue and PR is on the board with a status and an estimate.** The `board` port puts an item
there and sets its fields; the project adapter's Board section holds the board's ids and status
names. With no board bound, this page is skipped and the step says so.

| When                                      | Move                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------- |
| work on an issue starts                   | the issue to In progress                                              |
| its PR is open                            | the PR on the board with the issue's estimate, the issue to In review |
| it is done but a person must configure it | the issue to Waiting, with a comment naming what to do                |

Labels: every issue and PR gets its type label. Never apply a review label yourself: it records a
human review.
