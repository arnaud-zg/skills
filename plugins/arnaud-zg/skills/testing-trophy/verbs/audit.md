# Audit a test suite

1. **Run the check** on the folder and keep its output:

   ```sh
   node ${CLAUDE_SKILL_DIR}/scripts/check-trophy.mjs <folder>
   ```

2. **Report the layer counts as printed**, then each finding with its file and line. Never round or
   recall a count.
3. **Read for what the check cannot see**, by
   [domain/trophy.md](../domain/trophy.md#what-the-check-cannot-see): tests that assert nothing,
   integration tests that mock every seam.
4. **Fix in this order**: own-module mocks, then unlayered files, then the shape.
