# Stack a phase's pull requests

**One PR per plan step, each based on the previous step's branch, all of a phase in one stack on the
forge.** Continue with the next step without waiting for a review or a merge.

1. **Branch each step from the previous one** and open its PR with `--base <previous branch>`. The
   step boundary is the PR boundary. Planning a phase is one PR for the whole phase; documenting and
   testing packages is one stacked PR per package.
2. **Register the stack through the `forge` port**, with its calls that never push (a stacking
   tool's submit force-pushes, which is never allowed):
   - create it once two PRs exist, bottom to top;
   - append each next PR, bottom to top;
   - read the order back and check it;
   - comment the stack number once on the phase's parent issue.

3. **Update a lower PR by merging up, never by rebasing.** Commit the fix on the lower branch, push
   it, then for each branch above, in order:

   ```sh
   git switch <upper> && git merge --no-edit <lower>
   <install from the lockfile>
   git push
   ```

   A merge commit needs a scope too (`chore(<scope>): merge <lower> into <upper>`).

4. **Merging stays the person's call.** A stack is merged bottom first, and only when the person
   asks for it at that moment.
