# Rules

**The answer is the clock's, and the last line is one word the caller acts on** (why: E-04).

## What it measures

| Quantity  | How                                                                | Honesty   |
| --------- | ------------------------------------------------------------------ | --------- |
| **burn**  | every turn records its own usage; the window's turns are summed    | exact     |
| **reset** | while a limit hit is in flight, the moment it records for its lift | exact     |
| **reset** | otherwise, the window's opening plus its length                    | projected |

**Burn is printed, never decided on.** Nothing on disk publishes the account's limit, and a ceiling
derived from past limit hits spread elevenfold (why: E-03, E-04). Cache reads are not counted: they
are most of what a long session moves and almost none of what the limit counts.

## The window is not "the last five hours"

**A rolling window opens on the first turn after a full window of idleness**, runs its length from
there, and then advances in whole windows. **The earliest turn inside the last five hours is the
wrong anchor**, and it reports zero headroom to a session that has hours left (why: E-02). A session
with no turn in the last two days opens a window now.

## The decision

| Verdict  | Means                                                                                    |
| -------- | ---------------------------------------------------------------------------------------- |
| **GO**   | the window has the work's minutes times 1.5 left, and no limit is in flight              |
| **PARK** | it does not, or a limit was hit and has not lifted: wait for the reset, which is printed |

**The need is the estimate times 1.5**: the estimate is what the work should take, the margin is
what it does take when something is wrong. Lanes do not change the answer, because they share one
window.

### The rules it exists to make followable

- **Check before every dispatch, alongside the clock.** Not once at the start.
- **A limit may land between units of work, never inside one.** That is the `x 1.5` margin.
- **Park at a boundary, never mid-flight**, and say how long it waited once it resumes.
- **A real limit error ends the unit's start**: park on it until its own reset, whatever the window
  says. A weekly (`seven_day`) one lifts days later, not at the five-hour reset.

## Never

- Reporting a projected reset as though it were exact
- Opening a unit of work whose `estimate x 1.5` exceeds what is left
- Waiting without printing the time it is waiting until
- Anchoring the window at the earliest turn of the last five hours
