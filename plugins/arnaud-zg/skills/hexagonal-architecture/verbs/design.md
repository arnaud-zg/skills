# design

**Name the job, then what it needs, then who answers.** Never start from the database or the
framework.

1. **Name the use case** in the user's words: "place an order", "audit a plan". One use case per
   job; it goes in `application/` (or `verbs/` in a skill).
2. **Write the rule it protects** in `domain/`: the values and the decisions that stay true
   whichever tool answers. No I/O there.
3. **List what it needs from the world**: data to read or keep, time, a message out, a model, a
   person. Each is a driven port, named for the need (`OrderStore`, `Clock`), with what it receives,
   delivers and never does, by [the contract](../domain/contract.md#a-port).
4. **Pick a default adapter for each port**, the simplest that works: in memory for tests, the
   project's own tool for the run. Mark a port optional only when its step can be skipped.
5. **Wire it in the composition root**: `main` builds the adapters and passes them in. A skill's
   entry and its `bind` do the same.
6. **Check the plan against [the smells](../domain/smells.md)** before writing code: a port per
   class and a port shaped like its adapter are cheapest to fix now.
7. **Write it, then run the check** on the folder. Fix each finding by moving the dependency behind
   a port.

Hand back the use cases, the ports table and the folder tree, each new file marked.

An architecture choice a team will want to remember, such as "the store is a port", is a decision
record: write it as one (the doc-compass skill has the template).
