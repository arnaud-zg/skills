# Evidence

**Every rule the meter keeps was paid for.** One entry per story.

## E-01 · A rule nobody could follow

Long-running work in this project had always been told to check its remaining credit before opening
a plan it could not finish, and there had never been anything to check it with: no command, no file,
no number. So the check was skipped, and a limit landed mid-plan. The meter exists so the rule can
be obeyed, and it was introduced as `session-credit` on 2026-09-21 (pull request #592).

## E-02 · The window anchored at the oldest turn

Paid for in the script's own first run. It told a live session with four hours of window remaining
to park immediately, because it had taken the oldest turn it could see inside the last five hours as
the window's start.

## E-03 · A ceiling passed without a limit

Measured on 2026-09-22: 11.4M tokens billed in a five-hour window against an "8.7M ceiling" derived
from an earlier 429, with no 429 this time, and the meter answered PARK at every width, including a
60-minute one. Every caller branches on that word, so the run it was meant to protect was told to
sleep for 2h37 instead. Fixed in pull request #600: a ceiling the window has passed reads as
unknown, not as zero left.

## E-04 · A ceiling that spread elevenfold

By 2026-10-08 the ceilings derived from three limit hits read 8.7M (09-11), 5.3M (09-23) and about
804k (10-04), and the window that day burned 2.6M past the smallest with no limit. The meter had
fallen back to "a clock answer only", and a person had overridden a PARK it gave. It now answers
from the clock and from a limit actually hit, and reads two days of transcripts, not 30.
