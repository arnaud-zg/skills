# Retro

Gather and Rank run once. Trim, Check and Book run once per fix, top of the ranking first, so each
fix stacks on the one booked before it.

## 1. Gather

1. List the skills the session fired, or only those named as arguments.
2. Read each bound `feedback` adapter and write one line per friction. An adapter with nothing to
   read writes `<adapter>: nothing recorded`, which is not a zero.

   ```text
   FINDING <skill> | slow, wrong or expensive | <evidence> | <adapter>
   ```

3. Run `node ${CLAUDE_SKILL_DIR}/scripts/weight.mjs <skills-folder>` once. Every `REPEAT` line
   naming a listed skill is an `expensive` finding, its lines the evidence. A size alone is not.
4. Merge findings with one cause into one.

Nothing left: report `RETRO 0 findings` and stop.

## 2. Rank

`wrong` findings first: each one cost a rerun. Then `expensive` and `slow` ones, by how often their
cost is paid at the rates in rule 4; a slow step is paid each time it runs. Ties go to the finding
with more evidence. Write the ranked list down before trimming anything.

Each fix touches one skill, with one exception: a repeat across skills is fixed in both.

## 3. Trim

1. Take the fix's worktree from the `stack` adapter, and run `weight.mjs` on the skills folder
   inside it. That output is the before.
2. Make the smallest change that removes the friction.
3. Text said twice: keep it in the one page whose reader needs it, and point the others there.
4. A description says what the skill does, then "Use when" and the words a person types.
5. A changed script gets its test changed in the same fix.

## 4. Check

1. Run the `shape` adapter on each changed skill in the fix's worktree. A fix that fails is mended
   or dropped, never booked failing.
2. Run `weight.mjs` again on the skills folder inside the fix's worktree. That output is the after;
   copy the before and after of every part the fix touched.
3. Drop a fix that makes a description or an entry heavier, unless a `wrong` finding is behind it.

## 5. Book

Hand the fix to the `stack` adapter: one draft pull request, its body the findings with their
evidence and the before and after. Then take the next fix back to Trim. After the last, report:

```text
RETRO   <n> findings, <m> booked, <k> dropped
BOOKED  <pull request> <skill> <one line> <before -> after>
DROPPED <skill> <why>
```

Before a long retro, a `usage-runway` skill, when installed, says GO or PARK. A `glance-first`
skill, when installed, can present the report.
