# Mutation testing (optional)

**Only when the project already runs a mutation tester.** It changes the code a little, a `>` into a
`>=`, an `if` into `if (true)`, and reruns the tests. A change no test notices is a surviving
mutant, which shows a behaviour the suite does not prove.

- **Run it by hand, never from a hook or on every push.** It reruns the suite once per mutant, which
  takes minutes, sometimes an hour.
- **Fail under a break threshold**, 70% of mutants killed. Raise a package to it; never lower it.
- **Kill a survivor with a behaviour test** at the layer [trophy.md](trophy.md) gives it, named by
  what a user would see break. Never assert an internal detail just to kill a mutant.
- **Ignore only an equivalent mutant**, one no user could tell apart, with the reason next to it.
- **Start every test in an empty temp folder.** A mutant that drops a `cwd` then runs git, a deploy
  or an install there, not in the real repository: the command fails and the mutant is killed.
  Prefer this to ignoring such mutants one line at a time.
- **Trust a full run for the score**, not an incremental one, and mutate one package at a time when
  the tool rewrites the files in place.
