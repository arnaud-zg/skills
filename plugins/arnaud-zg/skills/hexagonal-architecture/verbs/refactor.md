# refactor

**One port at a time, with the tests green between each step.** A refactor that changes behaviour is
a rewrite; this changes only where the code lives.

1. **Pin the behaviour.** Run the project's tests. If nothing covers the code being moved, write one
   integration test of the use case first, through its public entry, and see it pass.
2. **Pick the one dependency to cut**: the outward import the check printed first, or the tool the
   use case is most tied to (the database, the clock, the network).
3. **Name the port** for what the core needs from that tool, by
   [the contract](../domain/contract.md#a-port). Put it in `ports/`.
4. **Move the tool's code into an adapter** that implements the port, unchanged. Tests green.
5. **Make the use case take the port**, and wire the adapter in the composition root. Tests green.
6. **Add an in-memory adapter** and point the use case's tests at it, so the core is tested without
   the tool. Keep one test of the real adapter.
7. **Run the check.** The import is gone; stop, or pick the next dependency.

Each step is its own commit, so any one can be reverted alone. Hand back the ports added, the files
moved, and the check's counts before and after, each copied from its output.
