import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

// 2026-10-25: a night run booked until 08:00 said nothing from 02:22 to 08:54, and the retro could
// not see it: the conversation it reads carries no clock. The host's transcript does.

const SCRIPT = fileURLToPath(new URL("./gaps.mjs", import.meta.url));
const base = mkdtempSync(join(tmpdir(), "skill-retro-gaps-"));
after(() => rmSync(base, { recursive: true, force: true }));

/** @param {string} clock */
const at = (clock) => `2026-10-25T${clock}:00.000Z`;
/** @param {string} clock @param {string} [text] */
const said = (clock, text = "working") => ({
  type: "assistant",
  timestamp: at(clock),
  message: { content: [{ type: "text", text }] },
});
/** @param {string} clock */
const quiet = (clock) => ({ type: "system", subtype: "compact_boundary", timestamp: at(clock) });

/** @param {object[]} entries @param {string} [name] */
function transcript(entries, name = "session.jsonl") {
  const folder = mkdtempSync(join(base, "t-"));
  writeFileSync(join(folder, name), entries.map((entry) => JSON.stringify(entry)).join("\n"));
  return folder;
}

/** @param {string} start @param {string} end */
function window(start, end) {
  const path = join(mkdtempSync(join(base, "w-")), "state.json");
  writeFileSync(path, JSON.stringify({ bookedAt: at(start), end: at(end) }));
  return path;
}

/** @param {string[]} args */
const run = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });

describe("the time a session's budget paid for and nothing used", () => {
  it("given a booked night, when the model said nothing for hours, then the silence inside the budget is reported with the last thing it said", () => {
    const folder = transcript([
      said("00:00"),
      said("01:22", "every rung is empty; waiting on the pass"),
      quiet("02:17"),
      said("07:54", "anything running?"),
    ]);
    const result = run(join(folder, "session.jsonl"), "--window", window("00:00", "07:00"));
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /^IDLE .* 5h38 inside the budget/m);
    assert.match(result.stdout, /every rung is empty; waiting on the pass/);
  });

  it("given a run whose resumer spoke every twenty minutes, then nothing is reported", () => {
    const ticks = ["00:00", "00:20", "00:41", "01:02", "01:22"].map((clock) => said(clock));
    const result = run(
      join(transcript(ticks), "session.jsonl"),
      "--window",
      window("00:00", "01:40"),
    );
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /^IDLE none/m);
  });

  it("given a silence after the budget ended, then it is the session waiting on its person, not a finding", () => {
    const folder = transcript([said("06:00"), said("09:00")]);
    const result = run(join(folder, "session.jsonl"), "--window", window("00:00", "06:10"));
    assert.match(result.stdout, /^IDLE none/m);
  });

  it("given a folder of transcripts, then the newest is measured", () => {
    const folder = transcript([said("00:00"), said("03:00")], "new.jsonl");
    writeFileSync(join(folder, "old.jsonl"), JSON.stringify(said("00:00")));
    utimesSync(join(folder, "old.jsonl"), new Date(0), new Date(0));
    const result = run(folder, "--window", window("00:00", "04:00"));
    assert.match(result.stdout, /new\.jsonl/);
    assert.match(result.stdout, /^IDLE .* 3h00 inside the budget/m);
  });

  it("given a session that died mid-budget and a new one that found it, then the silence between the two is measured", () => {
    const folder = transcript([said("00:00"), said("01:00", "pass started")], "dead.jsonl");
    writeFileSync(join(folder, "next.jsonl"), JSON.stringify(said("05:00", "resuming")));
    const result = run(folder, "--window", window("00:00", "06:00"));
    assert.match(result.stdout, /^IDLE .* 4h00 inside the budget .*pass started/m);
  });

  it("given no transcript, then there is nothing to measure", () => {
    const empty = join(base, "none");
    mkdirSync(empty);
    assert.equal(run(empty).status, 2);
  });

  it("given a session with subagents, when its spend is asked, then the whole session and each agent are counted once per message, costliest agent first", () => {
    /** @param {string} clock @param {string} id @param {number} read */
    const spent = (clock, id, read) => ({
      ...said(clock),
      message: { id, content: [], usage: { cache_read_input_tokens: read, output_tokens: 1000 } },
    });
    const folder = transcript([spent("00:00", "m1", 1e6), spent("00:00", "m1", 1e6)]);
    const agents = join(folder, "session", "subagents");
    mkdirSync(agents, { recursive: true });
    /** @type {[string, number][]} */
    const costs = [
      ["cheap", 2e6],
      ["dear", 5e6],
    ];
    for (const [name, read] of costs) {
      writeFileSync(
        join(agents, `agent-${name}.jsonl`),
        JSON.stringify(spent("01:00", name, read)),
      );
      writeFileSync(
        join(agents, `agent-${name}.meta.json`),
        JSON.stringify({ agentType: "code-reviewer", description: `Review ${name}` }),
      );
    }
    const result = run(join(folder, "session.jsonl"), "--spend");
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /^SPEND session, 2 subagents: read 8\.0M .* out 3k over 1h00/m);
    assert.match(
      result.stdout,
      /^AGENT read 5\.0M[^\n]*Review dear\nAGENT read 2\.0M[^\n]*Review cheap/m,
    );
  });
});
