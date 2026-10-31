// Two hours of work against forty minutes of window: the answer is PARK, with the time to wait.
import { decide } from "../../skills/usage-runway/scripts/credit.mjs";

const now = Date.UTC(2026, 9, 1, 10, 0);
const { verdict, because } = decide({
  needMinutes: 120,
  headroomMs: 40 * 60 * 1000,
  resetAt: now + 40 * 60 * 1000,
  now,
});
process.stdout.write(`${verdict}: ${because}\n`);
