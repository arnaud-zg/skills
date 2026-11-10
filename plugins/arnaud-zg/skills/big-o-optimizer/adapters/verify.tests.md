---
fulfils: verify
---

# verify · tests

**The project's own tests, run before and after.**

1. Find the test command: the `test` script in `package.json`, `pytest`, `go test ./...`,
   `cargo test`, or what the README says. Run only the tests that reach the target when the runner
   can filter.
2. If no test reaches the target, write one small test from the current behaviour first: the normal
   case, empty input, one item, duplicates. It must pass before the rewrite.
3. Run it before and after. Copy the pass count from the runner's output.

If nothing can run (no runner, no permission), report "not verified" with the reason. Never report a
pass that did not print.
