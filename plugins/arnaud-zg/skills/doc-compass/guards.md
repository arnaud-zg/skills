# What the words must guard against

**The check holds the docs' shape. These hold their words, and no check can.** Read them before
writing a page, because a clean check says nothing about any of them.

| Guard                          | Says                                                                                                                 | Why         |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------- |
| **one reader per page**        | A page serves one quadrant. Content for another reader moves to that reader's page, and the two link                 | (why: E-04) |
| **say it once, link the rest** | A list or fact that several pages need lives on one page. The others link to it, never copy it                       | (why: E-11) |
| **one path in a tutorial**     | A tutorial never offers a choice. "Or you could" belongs in a how-to                                                 | (why: E-04) |
| **tasks, not topics**          | A how-to heading is a task as an imperative verb: "Rotate the API key", never "API keys"                             | (why: E-04) |
| **rewrite, never annotate**    | A page says what is true now. History goes to the CHANGELOG and the ADRs, never into callouts or asides              | (why: E-03) |
| **numbers name their source**  | Every count, size or time is copied from the command or file that prints it, and the page names it                   | (why: E-08) |
| **output from a real run**     | Every "You should see" and every example output is copied from a run, never composed                                 | (why: E-08) |
| **the code is the source**     | Reference names the code that defines each table. When they disagree, say so and fix one deliberately                | (why: E-06) |
| **copy, never link a chat**    | A decision from a chat, a ticket or a call is written into the docs. A link to a conversation is not documentation   | (why: E-10) |
| **the house style holds here** | The project's style rules apply to docs as to code. Every rule a script can hold is passed to the check with `--ban` | (why: E-09) |

**Guidance, not rules, on purpose.** A script can see a link to nothing; it cannot see a tutorial
with a fork in it or a number written from memory. When one of these becomes checkable, it moves
into `scripts/rules.mjs` with its test, in the same change.
