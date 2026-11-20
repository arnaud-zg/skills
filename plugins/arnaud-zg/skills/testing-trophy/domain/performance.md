# Performance budgets (optional)

**Only when the project already runs performance budgets**: tests that fail when a render count, a
frame rate or a time goes over its limit. They sit beside the trophy, not in it: a budget proves the
code is fast enough, the trophy proves it works.

- **One north star per app**, on the path a user feels most: the list row drawn hundreds of times,
  the table every page uses, the page scrolled on a phone. Never one per component.
- **Prefer a count to a clock.** A render count gives the same answer on every machine; a time or a
  frame rate measures the machine that runs it.
- **Set the budget from a measure.** Run once, then budget the count itself, about five times a
  time, and the rate a screen needs for frames (55 fps for a 60 Hz screen).
- **Ratchet what wastes today**: budget today's number, lower it with each fix, never raise it.
- **Budget what a test can move.** A re-render with the same props always commits; budget the update
  a user sees, such as one render when a photo arrives.
- **Name it by what a user feels**: "given the home page on a phone, when scrolled top to bottom,
  then it holds 55 fps".
- **Keep it out of the suite**: its own file name (`*.perf.ts`), run by hand or in a job of its own,
  one file at a time, never cached and never from a hook.
- **Measure frames in a real browser.** On React Native, count renders; read frames on a device.
- **A miss is measured again before it fails.** A budget that still flakes is set wrong: move it, or
  count instead of timing.
