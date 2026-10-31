---
fulfils: feedback
delivers: findings, each with its skill, kind and evidence
binds: the rows a run deferred, parked or set aside, wherever the run records them
takes: tag (optional)
---

# feedback: deferred rows

A run that set work aside because a skill or its tooling could not carry it left a row saying so.
Read the rows added this session.

With a `tag` bound, also read every row carrying that tag, whichever session added it. The caller
says when such a row is ready to book, and takes the tag off once its fix is booked. With no tag
bound, only this session's rows are read.

- A row that names a skill, a skill's script or a skill's check is a finding against that skill. The
  evidence is the row, quoted.
- Its kind is the row's own reason: a script that misdraws or a check that lets a fault through is
  `wrong`; a step too slow to finish in the time it had is `slow`.
- A row deferred for a reason outside every skill, such as a question for a person, is not a
  finding.
