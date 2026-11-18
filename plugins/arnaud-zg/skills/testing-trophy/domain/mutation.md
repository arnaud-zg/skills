# Mutation testing (optional)

**Only when the project already runs a mutation tester** (Stryker, mutmut, PIT…). It changes the
code a little, a `>` into a `>=`, an `if` into `if (true)`, and reruns the tests. A change no test
notices is a surviving mutant, which shows a behaviour the suite does not prove.

- **Run it by hand, never from a hook or on every push.** It reruns the suite once per mutant, which
  takes minutes, sometimes an hour.
- **Fail under a break threshold**, 70% of mutants killed. Raise a package to it; never lower it.
- **Kill a survivor with a behaviour test** at the layer [trophy.md](trophy.md) gives it, named by
  what a user would see break. Never assert an internal detail just to kill a mutant.
- **Leave an equivalent mutant**, one no user could tell apart, with a disable comment that gives
  the reason: `// Stryker disable next-line <Mutator>: <reason>`.
- **Guard a mutant that could act on the real world**: one that drops a `cwd` or an option, and then
  runs git, a deploy or an install in the real repository. Disable it with its reason, and give
  every test that runs commands a temp folder.
- **Trust a full run for the score**, not an incremental one, and mutate one package at a time when
  the tool rewrites the files in place.
