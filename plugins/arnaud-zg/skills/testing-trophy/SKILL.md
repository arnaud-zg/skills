---
name: testing-trophy
description:
  Plans, writes and audits tests by the testing trophy (Kent C. Dodds), with static checks, a few
  unit tests, mostly integration tests, a few end to end, each named by the behaviour it proves. A
  script counts the tests per layer and flags an inverted trophy, mocks of the project's own modules
  and tests named after functions. Use when asked to "write the tests", "test this package", "use
  the testing trophy", "is our test suite shaped right", "audit the tests", or when a bug needs a
  failing test before its fix.
argument-hint: "[plan|write|audit] [<folder>]"
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/check-trophy.mjs *)
---

# testing-trophy

**Write tests that resemble how the code is used: most confidence per test comes from integration.**
The trophy has four layers, bottom to top:

| Layer       | Proves                                 | Share     |
| ----------- | -------------------------------------- | --------- |
| static      | types and lint catch typos and misuse  | always on |
| unit        | one pure function, alone               | a few     |
| integration | modules together, real I/O where cheap | the most  |
| end to end  | the product as a user drives it        | a handful |

Why each layer and what counts as which: [domain/trophy.md](domain/trophy.md).

## Pick the verb

| The person wants to…                        | Read                             |
| ------------------------------------------- | -------------------------------- |
| decide what to test in a package, and where | [verbs/plan.md](verbs/plan.md)   |
| write the tests, or a test for a bug        | [verbs/write.md](verbs/write.md) |
| check a suite's shape                       | [verbs/audit.md](verbs/audit.md) |

With no verb, infer it from the request. Every verb ends with the check.

## Check

```sh
node ${CLAUDE_SKILL_DIR}/scripts/check-trophy.mjs [<folder>] [--json]
```

It exits 0 when the suite holds, 1 on a finding, 2 when there is no test to read. Show the findings
as printed and fix them. **Never rename a test's layer to make the check pass**: move what it tests.
