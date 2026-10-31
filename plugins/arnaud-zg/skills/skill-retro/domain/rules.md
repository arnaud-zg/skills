# Rules

Every step holds these. Each is said here and nowhere else.

1. **Never fix a skill in the checkout that runs it.** Each fix is made on its own branch in a
   separate worktree, and takes effect only in a later session, after a person merges it.
2. **No evidence, no fix.** Every finding carries what shows it: a quote from the person, a log or
   error line, a count copied from a script's output. A finding without one is dropped, not guessed
   into a fix.
3. **Remove before adding.** A fix that deletes text, a step or a page beats one that adds a rule.
   If a `radical-simplify` skill is on the shelf, run it on the skill being fixed; without it, do
   the same by hand: cut until the next cut would lose a behaviour.
4. **Tokens are friction.** A skill is paid for at three rates, and text said twice is paid twice:

   | Part         | Paid by                                         |
   | ------------ | ----------------------------------------------- |
   | description  | every session, because the host always lists it |
   | entry body   | every session that fires the skill              |
   | another page | only a session that reads it                    |

   Every size is copied from `scripts/weight.mjs`, whose tokens are an estimate (characters / 4).
   Never compute or recall one.
