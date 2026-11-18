---
fulfils: board
delivers: an issue or pull request on the board, with its status and estimate set
takes:
  number, owner, project id, status field and its option ids, estimate field (from the project
  adapter's Board section)
binds: the GitHub CLI, gh project
---

# board: GitHub Projects

Every id comes from the project adapter's Board section, never from memory.

```sh
ITEM=$(gh project item-add <number> --owner <owner> --url <issue-or-pr-url> --format json --jq .id)
gh project item-edit --id "$ITEM" --project-id <project id> \
  --field-id <status field> --single-select-option-id <status id>
gh project item-edit --id "$ITEM" --project-id <project id> \
  --field-id <estimate field> --number <points>
```

`item-add` on an item already on the board returns its existing id, so the add is safe to repeat.

To read the ids once for a new project adapter:

```sh
gh project view <number> --owner <owner> --format json --jq .id
gh project field-list <number> --owner <owner> --format json \
  --jq '.fields[] | "\(.id) \(.name) \((.options // []) | map("\(.id)=\(.name)") | join(" "))"'
```
