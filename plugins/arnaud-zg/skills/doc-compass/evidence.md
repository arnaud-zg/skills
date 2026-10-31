# Evidence

**Every rule and guard here was paid for** in the docs of real projects, kept by people and agents
who meant to keep them true.

## E-01 · The index that forgot its pages

A project's docs home was a well-built Diataxis index. Over a few months, 39 of its 66 pages stopped
being reachable from it, including one the agent instructions called a core reference. Nobody
removed them: new pages were simply never added. Counted by `check-docs.mjs docs --json`.

## E-02 · The anchor that moved

A how-to page's table of contents linked a heading that had since been renamed. The project had a
pointer check, but it covered skill folders only, and the docs were not one. The link sat broken
until a reader clicked it.

## E-03 · Callouts piled on top

Pages opened with "Updated in v3.1" callouts while the project moved through four later versions.
The body under each callout stayed as it was, so a reader had to work out which of the two was true.
Corrections written inline, "it said X until then", did the same inside sentences.

## E-04 · One page, three readers

Feature pages each held a states table, the design reasoning and a screenshot workflow. They were
filed under Explanation, though most of each page was reference. A reader looking up a state read
past the reasoning; a reader asking why read past the table.

## E-05 · The page too cited to delete

A spec page was replaced by a newer one, but code comments in dozens of files cited the old path.
Rewriting every comment risked breaking more than it fixed. The project kept a one-page gravestone
at the old path saying where the content went, and every citation kept resolving.

## E-06 · Generated docs that land with their source

Database diagrams were generated from the schema, and a commit hook ran the generator's `:check`
whenever the schema or the diagrams changed. A schema change and its diagrams always landed
together. Hand-written pages next to them, with no such check, drifted.

## E-07 · The lint that never ran

A project defined `lint:md` and configured it carefully, with a reason written next to every ignored
path. It was in no commit hook, no CI job and no verify script, so it had never failed.

## E-08 · One count, three values

The same count of citations was given as three different numbers on three pages, each written from
memory at a different time. None named the command that printed it.

## E-09 · The index that broke the house style

A project's agent instructions banned one punctuation mark everywhere, docs included. Its own docs
index used it 30 times, counted by `check-docs.mjs docs --ban`. A rule nobody checks holds only
where someone remembers it.

## E-10 · Decisions linked both ways

A decision record's status said it superseded parts of an earlier one, and the earlier record
pointed forward to it. A reader landing on either found the other. Records elsewhere that said
"superseded" one way only left the older one looking current.
