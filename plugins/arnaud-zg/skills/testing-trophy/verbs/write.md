# Write the tests

1. **Start from the plan**, or make one with [plan.md](plan.md).
2. **One file per layer and subject**, named by [domain/trophy.md](../domain/trophy.md):
   `limits.integration.test.ts`, not `limits.test.ts`.
3. **Name every test by its behaviour**: "given …, when …, then …".
4. **Use the real thing where it is cheap**: a temp folder, a spawned process, an in-memory
   database. Mock only what the project does not own.
5. **For a bug, write the failing test first**, run it, see it fail for the reason the bug gives,
   then fix the code in its own change.
6. **Run the suite and the check**; stop when both pass.
