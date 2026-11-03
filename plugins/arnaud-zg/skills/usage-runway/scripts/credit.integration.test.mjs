import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";

import { decide } from "./credit.mjs";
import { scan } from "./ledger.claude-code.mjs";

// The verdict comes from the clock alone (2026-10-08, E-04). A token ceiling derived from past
// limit hits read 8.7M, 5.3M and about 804k, an 11x spread, and the window burned past each without
// being limited; the answer the meter actually gave was already the clock's.

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const NOW = Date.parse("2026-10-08T18:00:00Z");

describe("whether the next unit of work fits before the window resets", () => {
  it("given no work to size, then it goes and says how to ask", () => {
    const { verdict, because } = decide({ headroomMs: HOUR, resetAt: NOW + HOUR });
    assert.equal(verdict, "GO");
    assert.match(because, /--need/);
  });

  it("given more of the window left than the work takes with its margin, then it goes", () => {
    const { verdict } = decide({ needMinutes: 60, headroomMs: 91 * MINUTE, resetAt: NOW });
    assert.equal(verdict, "GO");
  });

  it("given the window resets before the work and its margin could finish, then it parks until the reset", () => {
    const resetAt = NOW + 80 * MINUTE;
    const { verdict, because } = decide({ needMinutes: 60, headroomMs: 80 * MINUTE, resetAt });
    assert.equal(verdict, "PARK");
    assert.match(because, /1h20/);
  });

  it("given several lanes are asked for, then the answer is the one lane's: lanes do not change the clock", () => {
    const one = decide({ needMinutes: 60, headroomMs: 80 * MINUTE, resetAt: NOW });
    const four = decide({ needMinutes: 60, agents: 4, headroomMs: 80 * MINUTE, resetAt: NOW });
    assert.equal(four.verdict, one.verdict);
  });

  it("given a limit was hit and its reset is still ahead, then it parks however roomy the window looks", () => {
    const { verdict, because } = decide({
      needMinutes: 5,
      headroomMs: 3 * HOUR,
      resetAt: NOW + 3 * HOUR,
      limited: true,
    });
    assert.equal(verdict, "PARK");
    assert.match(because, /limit/);
  });
});

describe("a weekly limit", () => {
  it("given the weekly limit was hit and lifts in three days, then it parks and names the day", () => {
    const resetAt = NOW + 3 * 24 * HOUR;
    const { verdict, because } = decide({
      needMinutes: 5,
      headroomMs: 3 * HOUR,
      resetAt,
      limited: "seven_day",
      now: NOW,
    });
    assert.equal(verdict, "PARK");
    assert.match(
      because,
      new RegExp(`weekly limit .*${new Date(resetAt).toDateString().slice(0, 10)}`),
    );
  });
});

describe("the ledger reads only what a window can hold", () => {
  const root = mkdtempSync(join(tmpdir(), "ledger-"));
  after(() => rmSync(root, { recursive: true, force: true }));

  /** @param {number} at */
  const turn = (at) =>
    `${JSON.stringify({ timestamp: new Date(at).toISOString(), message: { usage: { input_tokens: 10, output_tokens: 5 } } })}\n`;
  /** @param {string} name @param {number} at @param {number} touched */
  const transcript = (name, at, touched) => {
    mkdirSync(join(root, "project"), { recursive: true });
    const path = join(root, "project", `${name}.jsonl`);
    writeFileSync(path, turn(at));
    utimesSync(path, touched / 1000, touched / 1000);
  };

  it("given a weekly 429 in a transcript last touched four days ago, then its limit is still read", () => {
    const path = join(root, "project", "weekly.jsonl");
    mkdirSync(join(root, "project"), { recursive: true });
    const at = NOW - 4 * 24 * HOUR;
    const reset = (NOW + 3 * 24 * HOUR) / 1000;
    writeFileSync(
      path,
      `${JSON.stringify({ timestamp: new Date(at).toISOString(), quotaLimits: { resetsAt: reset, rateLimitType: "seven_day" } })}\n`,
    );
    utimesSync(path, at / 1000, at / 1000);
    const { limits } = scan({ root, now: NOW });
    assert.deepEqual(
      limits.map((limit) => limit.type),
      ["seven_day"],
    );
  });

  it("given a transcript last touched eight days ago, then its turns are not read", () => {
    transcript("fresh", NOW - HOUR, NOW - HOUR);
    transcript("stale", NOW - 8 * 24 * HOUR, NOW - 8 * 24 * HOUR);
    const { turns } = scan({ root, now: NOW });
    assert.equal(turns.length, 1);
    assert.equal(turns[0].billed, 15);
  });
});
