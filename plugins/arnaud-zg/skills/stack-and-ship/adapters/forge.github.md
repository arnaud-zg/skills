---
fulfils: forge
delivers:
  an issue's body, a pull request opened or updated, a comment, a stack created, appended and read
takes: repo (owner/name, from the project adapter's Repository section)
binds: the GitHub CLI, gh, and GitHub's stacks REST API
---

# forge: GitHub

## Issues and pull requests

| The step says           | Run                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| read the issue          | `gh issue view <N>`                                                                                      |
| open the pull request   | `gh pr create --base <base> --head <branch> --title "<title>" --label "<type label>" --body-file <file>` |
| update its body         | `gh pr edit <PR> --body-file <file>`                                                                     |
| comment                 | `gh issue comment <N> --body-file <file>` (`gh pr comment` for a pull request)                           |
| the issue's or PR's URL | `gh issue view <N> --json url --jq .url`, `gh pr view <PR> --json url --jq .url`                         |

## Stacks

A stack is registered through the REST API only. `gh stack submit` and every `gh stack` command that
pushes force-push, which is never allowed.

- Create it once two pull requests exist, bottom to top (a one-PR create returns 422):

  ```sh
  echo '{"pull_requests": [<first PR>, <second PR>]}' \
    | gh api -X POST repos/<owner>/<repo>/stacks --input - --jq .number
  ```

- Append each next pull request, bottom to top:

  ```sh
  echo '{"pull_requests": [<PR>]}' \
    | gh api -X POST repos/<owner>/<repo>/stacks/<stack>/add --input -
  ```

- Read the order: `gh api repos/<owner>/<repo>/stacks/<stack> --jq '[.pull_requests[].number]'`.

## Rendering

GitHub's Mermaid refuses `A & B` edges and `\n` inside a node label; `scripts/check-pr.mjs` flags
both.
