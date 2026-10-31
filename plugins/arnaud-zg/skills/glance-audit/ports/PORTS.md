# Ports

**The judgement is the skill's. What it reads and who renders it are two questions the caller
answers.**

| Port      | How many | The one question it answers                        |
| --------- | -------- | -------------------------------------------------- |
| `source`  | one each | what is read for this audit, and how               |
| `present` | one      | who renders the checked result, and where it lands |

## What every `source` adapter holds

It receives what the caller pointed at, and the caller's extras. It delivers two plain files and a
list:

- **the source text**: what a comment can be posted on. The check holds every quote to this file, so
  it holds nothing else
- **the context**: everything else read to judge it, such as other reviewers' comments, the thread,
  linked documents, file excerpts and command output. Read, never quoted
- what was read and what was not

It never posts, comments, approves, edits or sends anything in the source. Each adapter says what
goes in each file for its kind of source, which lens does the most work there, and what counts as an
incident. Another kind of source is another adapter answering the same question.

| Kind           | Adapter                                                      |
| -------------- | ------------------------------------------------------------ |
| a document     | [source.document.md](../adapters/source.document.md)         |
| a pull request | [source.pull-request.md](../adapters/source.pull-request.md) |
| a status       | [source.status.md](../adapters/source.status.md)             |

## What every `present` adapter holds

| Receives                                         | Delivers                                      | Never                                                |
| ------------------------------------------------ | --------------------------------------------- | ---------------------------------------------------- |
| a result that printed `AUDIT OK`, and the target | the result rendered where the caller named it | renders it itself, adds a finding, or posts anything |

The audit never renders itself. The adapter maps the result onto the presenting skill's input and
hands it over; that skill decides the form.

| Presenter    | Adapter                                                        |
| ------------ | -------------------------------------------------------------- |
| glance-first | [present.glance-first.md](../adapters/present.glance-first.md) |
