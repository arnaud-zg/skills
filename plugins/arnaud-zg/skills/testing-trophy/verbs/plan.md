# Plan the tests for a package

1. **List what a user of the package does with it**: the public API, the commands, the config keys.
   Each is a behaviour to prove.
2. **Run the check** on the package to see the suite's shape today.
3. **Place each behaviour on a layer** by [domain/trophy.md](../domain/trophy.md): integration by
   default, unit only for pure logic with many cases, end to end for the one or two paths a user
   cannot lose.
4. **Name the seams**: what is real (files, a local database) and what is mocked (only what the
   project does not own).
5. **Hand over the plan as a table**: behaviour, layer, file, real or mocked. Write nothing yet.
