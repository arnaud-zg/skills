# Lenses, tests and proof

**How a source becomes a short review a reader can trust.** The verb owns the order of work; this
page owns how to judge.

## The seven lenses

Run all of them. Most find nothing. Keep only what matters.

1. **Claims against reality.** Pull out every strong word ("any", "impossible", "never", "no
   longer", "always", "done", "all green") and test it. A common failure: a type or schema guarantee
   presented as a behaviour guarantee.
2. **Walk the incidents.** For each incident, bug or failure the source cites, replay it with the
   proposal in place. Which check fails, and at what point: build, merge, release or run? If none
   fails, the proposal does not cover that incident.
3. **Time.** What is true at build time, at merge, at release, at run time? A check at one point
   does not protect another. Parts released separately can land in the wrong order.
4. **Premises.** List the facts the design relies on, such as "the registry can serve two versions".
   Check each against the thread, the code or the files. If you cannot, turn it into an Ask.
5. **Scope and cost.** What is in and what is out? Does the effort match what the design needs?
6. **Gaps.** Alternatives considered, what the thing contains, versioning, a pilot, a success
   measure, behaviour when parts do not match.
7. **Others.** What the comments and the thread already say. Credit it instead of repeating it.

## The three tests

A candidate is kept only if it passes all three:

| Test           | Asks                                           | Fails when                      |
| -------------- | ---------------------------------------------- | ------------------------------- |
| real           | is there evidence in the sources, not a hunch? | nothing read shows it           |
| not covered    | does the source leave it unanswered?           | the source already answers it   |
| not raised yet | has no reviewer said it already?               | a comment or the thread says it |

A point that is not real, or is covered, is dropped. A point already raised is left out with the tag
_already raised_, and the reviewer is credited.

## Severity

| Severity | When                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| critical | real, not covered, and it hits the incidents the source cites, or its users   |
| medium   | real and not covered, and it can be fixed while the source is still in review |
| low      | a question or a preference                                                    |

Rate by the table, never up: nothing is critical by default, and a critical point is never invented
to fill the page.

## The keep rule

This page owns it, and [scripts/check-audit.mjs](../scripts/check-audit.mjs) holds it.

- Every critical point that passed the tests is kept, however much else is trimmed.
- When none is critical, keep the single most severe point that passed. Keep two only when both are
  equally severe.
- A kept point is never less severe than one that passed and was left out.
- Every other point that passed is left out with the tag _can wait_.

## Proof

- Every claim in the result traces to a source you read, or says it is your judgement.
- Comments quote the source text, by the rules in [result.md](result.md#comments).
- Numbers come from the sources, copied, never rounded or estimated.
- What you did not read, and what you did not test, is written down for the result.

## Worked example

A proposal says a build check will stop breaking changes between two apps that are released
separately. It links two incidents.

- Lens 2: replaying both incidents shows each broke at release, after the check had passed.
- Lens 3 agrees: the sender and the receiver are released on their own schedules.
- Tests: real (both incidents), not covered (the proposal never says which version the check
  compares against), not raised (one reviewer hinted at time, never at versions).
- Verdict: "Good idea. One thing to fix." The critical point: "it checks too early". The fix: a gate
  that checks what is live before each release.
- Three other points were already raised by reviewers, so they are left out with their tag.
- Two questions were addressed to the reader, so each gets a short answer and a Reply.
