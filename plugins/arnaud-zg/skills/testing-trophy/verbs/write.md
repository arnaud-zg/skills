# Write the tests

1. **Start from the plan**, or make one with [plan.md](plan.md).
2. **One file per layer and subject**, named by [domain/trophy.md](../domain/trophy.md):
   `limits.integration.test.ts`, not `limits.test.ts`.
3. **Name every test by its behaviour**: "given …, when …, then …". Name the `describe` after the
   feature and the `it` after the outcome a user sees: "rejects an expired coupon at checkout", not
   "validateCoupon returns false".
4. **Lay out the body as Given / When / Then**: set up the state, do one action, assert its outcome.
   A second action is a second test.
5. **Use the real thing where it is cheap**: a temp folder, a spawned process, an in-memory
   database. Mock only what the project does not own.
6. **For a bug, write the failing test first**, run it, see it fail for the reason the bug gives,
   then fix the code in its own change.
7. **Run the suite and the check**; stop when both pass. If the project runs mutation testing, its
   survivors are the next tests to write, by [domain/mutation.md](../domain/mutation.md). If it
   holds performance budgets, a change on a hot path keeps or lowers its budget, by
   [domain/performance.md](../domain/performance.md).
