# Branch and commit

1. **Read the contract.** For an issue, read it through the `forge` port: its body is what "done"
   means. Move it to In progress through the `board` port ([board.md](../domain/board.md)).
2. **Branch** in your own worktree, named by [messages.md](../domain/messages.md#branch): from the
   default branch for a first step, from the previous step's branch otherwise.

   ```sh
   git fetch origin && git checkout -b <type>/<PHASE-ID>-<value> origin/<default branch>
   ```

   Then run the adapter's install command.

3. **Write the commit sequence down** ([the TDD sequence](../domain/messages.md#the-tdd-sequence))
   and proceed. Code follows the project's code shape skill (its Peer skills); tests follow the
   `testing-trophy` skill, if installed.
4. **Commit each step from a message file**, staging only its paths:

   ```sh
   <commit linter> <message-file>
   git add -A -- <paths>
   git commit -F <message-file> -- <paths>
   git log -1 --format=%s
   ```

   The message ends with the attribution line the session gives (`Co-Authored-By: ...`).

5. **Check what you staged** with `git status --short` after each commit: nothing of yours left
   over, nothing of anyone else's taken.
6. **Cross-domain cleanup, or any small obvious change:** one commit, named in its message. Anything
   larger is not done here: it becomes a todo.
7. **A todo is only for work deliberately deferred.** Log it with the adapter's todo command, and in
   the same commit leave its anchor in the most relevant file. Work the person already approved is
   done, not logged.
