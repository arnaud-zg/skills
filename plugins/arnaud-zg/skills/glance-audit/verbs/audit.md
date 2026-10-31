# audit

**Read everything the claims rest on, keep only what passes the tests, and say it so the reader can
stop after one line.** The result is checked against the source before anything is rendered.

## Inputs

| Input  | From the caller                                                                          |
| ------ | ---------------------------------------------------------------------------------------- |
| source | what to audit, and which `source` adapter reads it: a document, a pull request, a status |
| target | where the result lands, passed on to the `present` adapter, named by the caller          |
| reader | who the audit is for, so questions addressed to them can be told apart                   |
| extras | anything an adapter asks for, such as the forge's CLI or the commands a status may run   |

If the kind of source is unclear from what was handed, ask one question. Never guess the target: the
`present` adapter asks for it when it is missing.

## Steps

1. **Gather** by the source's adapter. Read the thing, its comments and their replies, its thread,
   and the incidents or documents its claims depend on. Save two plain files in a scratch folder:
   the **source text**, what a comment can be posted on, as the adapter defines it; and the
   **context**, everything else you read. The check reads only the source text. Note what you did
   not read. Keep credentials and personal data out of everything you write.
2. **Audit.** Run all seven lenses in [domain/lenses.md](../domain/lenses.md) and list every
   candidate finding with its evidence. Include what other reviewers already said.
3. **Decide** by the same page: the three tests, the severity, and the keep rule. Then write the
   verdict by [domain/result.md](../domain/result.md).
4. **Sort the reader's own questions out.** A comment that names the reader, or asks them directly,
   is a question for them, not feedback. Each gets a short answer and one Reply.
5. **Write the comments** by [domain/result.md](../domain/result.md): each typed, grouped, and
   anchored on one passage of the source text.
6. **Write the result** as JSON in the scratch folder, by the same page, and check it:

   ```sh
   node ${CLAUDE_SKILL_DIR}/scripts/check-audit.mjs <audit.json> <source.txt>
   ```

   It prints `AUDIT OK` with what was kept, or one line per problem with its field and its fix. Make
   every fix in one pass and run it again. Stop at `AUDIT OK`.

7. **Present** by the `present` adapter, from the checked result and nothing else.
8. **Hand over** in five lines or fewer: where the result is, the critical point in one sentence,
   what it holds, the limits (not read, not tested), and any decision the reader must make. Say that
   nothing was posted.

## Before you hand over

- Read only the verdict. Does the reader know the answer?
- Nothing was posted, commented, approved or edited by the audit.
