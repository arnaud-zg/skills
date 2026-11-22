# Push and open a pull request

1. **Run the checks** in the adapter's Checks table, each row that applies, and read each result,
   never a summary of it. Always the affected tests, the code shape review and format on touched
   files. A test that times out under load is rerun alone before it counts as a failure.
2. **Configuration.** If the issue names configuration, register what it needs in this PR, where the
   adapter's Conventions say. When values are missing, comment on the issue with the exact command
   and the dashboard steps, and set the issue to Waiting.
3. **Changelog.** A PR that changes an app, or a package worth a changelog line, adds an entry the
   way the adapter says, written for the person using it.
4. **Push** from the branch itself: `git switch <branch>`, then `git push -u origin <branch>`. Ask
   the person first unless they approved pushing for this run. Never force.
5. **Write the body** from the project's PR template into a file, never a blank body, at standard
   level by [plain-language](../../plain-language/SKILL.md), if installed:
   - the value first, then what changed with concrete numbers (tests, lines, timings), shaped by the
     adapter's PR body section and by the `glance-first` skill, if installed;
   - the issue linked the way the adapter's PR rules require;
   - screenshots for a UI change (the project's UI verify skill), or a line saying there is none;
   - a Mermaid diagram, if any, with explicit edges (`A --> C`, no `&`, no `\n` in labels);
   - nothing the adapter's PR rules ban.
6. **Check it**, then open it through the `forge` port with its type label (base = the previous
   step's branch in a stack):

   ```sh
   node ${CLAUDE_SKILL_DIR}/scripts/check-pr.mjs --title "<title>" --branch <branch> --body <file>
   ```

   Fix each `plain:` note it prints under the result. A note never fails the check.

7. **Register it** through the `board` port: the PR with the issue's estimate, the issue to In
   review ([board.md](../domain/board.md)); in a phase, append it to the stack
   ([stack.md](stack.md)). Comments on issues and PRs follow the adapter's Conventions.
8. **CI by hand.** When the adapter names a CI command, the project runs its checks by hand: a PR
   gets none on its own, and a run is started with that command when one is wanted.
9. **Never merge** unless the person asks for that merge at that moment.
