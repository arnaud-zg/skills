// The audit check as a reader of the audit needs it: a finding is kept only when it passes the three
// tests, the critical one is never trimmed, and every comment is anchored on a passage the source
// really holds. Then the same check as a person runs it, a file in and an exit code out.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { validateAudit } from "./check-audit.mjs";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "check-audit.mjs");
const folder = mkdtempSync(join(tmpdir(), "glance-audit-"));
after(() => rmSync(folder, { recursive: true, force: true }));

const source = [
  "# Release gate",
  "",
  "The build check makes a breaking change between the two apps impossible, because it compares",
  "their schemas before merge. Both incidents last quarter would have been stopped.",
  "Nothing else changes between the two apps.",
  "",
  "Reviewer: could the reader say whether the registry keeps two versions?",
].join("\n");

const critical = {
  title: "The check runs too early",
  severity: "critical",
  evidence: "Both incidents broke at release, after the merge check had passed.",
  tests: { real: true, covered: false, raised: false },
  kept: true,
};

const raised = {
  title: "No pilot is planned",
  severity: "medium",
  evidence: "The plan lists no pilot.",
  tests: { real: true, covered: false, raised: true },
  kept: false,
  tag: "already raised",
};

const good = {
  subject: "Release gate",
  verdict: "Good idea. One thing to fix.",
  good: ["It names the two incidents it answers."],
  findings: [critical, raised],
  comments: [
    {
      type: "Challenge",
      group: "post first",
      quote: "makes a breaking change between the two apps impossible",
      text: "Does this hold when the two apps are released on different days? Both incidents broke at release.",
    },
    {
      type: "Suggest",
      group: "post first",
      quote: "compares their schemas before merge",
      text: "Say which version the check compares against.",
      after: "compares their schemas with the version live in production, before each release",
    },
    {
      type: "Reply",
      group: "reply",
      quote: "could the reader say whether the registry keeps two versions?",
      text: "It keeps two. Not checked on our setup.",
    },
  ],
  questions: [{ asked: "Does the registry keep two versions?", answer: "Yes, two" }],
  sources: { read: ["the proposal"], notRead: [], notTested: "My judgement, nothing was run." },
};

/** @param {{ field: string }[]} findings */
const fieldsOf = (findings) => findings.map(({ field }) => field);
/** @param {Record<string, unknown>} changes */
const withAudit = (changes) => ({ ...good, ...changes });

describe("an audit that holds", () => {
  it("given a kept critical finding and anchored comments, then nothing is left to fix", () => {
    assert.deepEqual(validateAudit(good, source), []);
  });

  it("given nothing worth raising, then an audit with no finding and no comment holds", () => {
    const quiet = withAudit({
      verdict: "Good idea. Nothing blocks it.",
      findings: [],
      comments: [],
      questions: [],
    });
    assert.deepEqual(validateAudit(quiet, source), []);
  });

  it("given a quote that the source wraps across two lines, then it is still found", () => {
    const wrapped = structuredClone(good);
    wrapped.comments[0].quote =
      "between the two apps impossible, because it compares their schemas";
    assert.deepEqual(validateAudit(wrapped, source), []);
  });
});

describe("the verdict", () => {
  it("given no verdict, then it is asked for", () => {
    assert.deepEqual(fieldsOf(validateAudit(withAudit({ verdict: "" }), source)), ["verdict"]);
  });

  it("given a verdict over two lines, then it must be one line", () => {
    const findings = validateAudit(withAudit({ verdict: "Good idea.\nOne thing." }), source);
    assert.deepEqual(fieldsOf(findings), ["verdict"]);
  });
});

describe("the findings", () => {
  it("given the list is missing, then it asks for one, empty when nothing was found", () => {
    const findings = validateAudit(withAudit({ findings: undefined }), source);
    assert.deepEqual(fieldsOf(findings), ["findings"]);
  });

  it("given an unknown severity, then it names the three", () => {
    const findings = validateAudit(
      withAudit({ findings: [{ ...critical, severity: "huge" }] }),
      source,
    );
    assert.deepEqual(fieldsOf(findings), ["findings[0].severity"]);
  });

  it("given a finding with no evidence, then it is a hunch until evidence is written", () => {
    const findings = validateAudit(
      withAudit({ findings: [{ ...critical, evidence: "" }] }),
      source,
    );
    assert.deepEqual(fieldsOf(findings), ["findings[0].evidence"]);
  });

  it("given a finding that is not real, or already covered, then it is dropped from the list", () => {
    const hunch = { ...raised, tests: { real: false, covered: false, raised: false } };
    const covered = { ...raised, tests: { real: true, covered: true, raised: false } };
    const findings = validateAudit(withAudit({ findings: [critical, hunch, covered] }), source);
    assert.deepEqual(fieldsOf(findings), ["findings[1]", "findings[2]"]);
  });

  it("given a kept finding a reviewer already raised, then it cannot be kept", () => {
    const findings = validateAudit(
      withAudit({ findings: [critical, { ...raised, kept: true }] }),
      source,
    );
    assert.deepEqual(fieldsOf(findings), ["findings[1].kept"]);
  });

  it("given a critical finding left out for a medium one, then the critical is kept instead", () => {
    const trimmed = { ...critical, kept: false, tag: "can wait" };
    const medium = { ...critical, severity: "medium", title: "No measure", kept: true };
    const findings = validateAudit(withAudit({ findings: [trimmed, medium] }), source);
    assert.deepEqual(fieldsOf(findings), ["findings[0].kept", "findings[1].kept"]);
  });

  it("given findings that pass the tests and none kept, then at least one is kept", () => {
    const medium = { ...critical, severity: "medium", kept: false, tag: "can wait" };
    const findings = validateAudit(withAudit({ findings: [medium] }), source);
    assert.deepEqual(fieldsOf(findings), ["findings"]);
  });

  it("given three critical findings, then all three are kept and the audit holds", () => {
    const findings = validateAudit(withAudit({ findings: [critical, critical, critical] }), source);
    assert.deepEqual(findings, []);
  });

  it("given a kept low point beside a kept critical one, then the low one is left out", () => {
    const low = { ...critical, severity: "low", title: "A preference" };
    const findings = validateAudit(withAudit({ findings: [critical, low] }), source);
    assert.deepEqual(fieldsOf(findings), ["findings[1].kept"]);
  });

  it("given a kept low point while a medium one passed, then the medium one leads", () => {
    const low = { ...critical, severity: "low", title: "A preference" };
    const medium = { ...critical, severity: "medium", kept: false, tag: "can wait" };
    const findings = validateAudit(withAudit({ findings: [low, medium] }), source);
    assert.deepEqual(fieldsOf(findings), ["findings[0].kept"]);
  });

  it("given two equally severe medium points and nothing critical, then both may be kept", () => {
    const medium = { ...critical, severity: "medium" };
    const findings = validateAudit(withAudit({ findings: [medium, medium] }), source);
    assert.deepEqual(findings, []);
  });

  it("given three kept medium points and nothing critical, then two at most are kept", () => {
    const medium = { ...critical, severity: "medium" };
    const findings = validateAudit(withAudit({ findings: [medium, medium, medium] }), source);
    assert.deepEqual(fieldsOf(findings), ["findings"]);
  });

  it("given a critical point a reviewer already raised, then leaving it out with its tag holds", () => {
    const raisedCritical = { ...raised, severity: "critical" };
    const findings = validateAudit(withAudit({ findings: [critical, raisedCritical] }), source);
    assert.deepEqual(findings, []);
  });

  it("given a finding with no title, then it is named", () => {
    const findings = validateAudit(withAudit({ findings: [{ ...critical, title: "" }] }), source);
    assert.deepEqual(fieldsOf(findings), ["findings[0].title"]);
  });

  it("given a point left out with no tag, then it is tagged already raised or can wait", () => {
    const findings = validateAudit(
      withAudit({ findings: [critical, { ...raised, tag: undefined }] }),
      source,
    );
    assert.deepEqual(fieldsOf(findings), ["findings[1].tag"]);
  });
});

describe("the comments", () => {
  /** @param {Record<string, unknown>} changes @param {number} [index] */
  const withComment = (changes, index = 0) => {
    const audit = structuredClone(good);
    audit.comments[index] = { ...audit.comments[index], ...changes };
    return audit;
  };

  it("given the list is missing, then it asks for one, empty when there is nothing to say", () => {
    const findings = validateAudit(withAudit({ comments: undefined }), source);
    assert.deepEqual(fieldsOf(findings), ["comments"]);
  });

  it("given a comment of no known type, then it names the four", () => {
    const findings = validateAudit(withComment({ type: "Praise" }), source);
    assert.deepEqual(fieldsOf(findings), ["comments[0].type"]);
  });

  it("given a quote the source does not hold, then it names the quote to copy again", () => {
    const findings = validateAudit(
      withComment({ quote: "makes breaking changes impossible" }),
      source,
    );
    assert.deepEqual(fieldsOf(findings), ["comments[0].quote"]);
    assert.match(findings[0].message, /makes breaking changes impossible/);
  });

  it("given a quote with other capitals, or a comma dropped, then it is not the source's", () => {
    const capitals = "Makes a breaking change between the two apps impossible";
    const comma = "the two apps impossible because it compares";
    for (const quote of [capitals, comma]) {
      const findings = validateAudit(withComment({ quote }), source);
      assert.deepEqual(fieldsOf(findings), ["comments[0].quote"], quote);
    }
  });

  it("given no quote, then the passage is asked for", () => {
    const findings = validateAudit(withComment({ quote: "" }), source);
    assert.deepEqual(fieldsOf(findings), ["comments[0].quote"]);
  });

  it("given a quote too short to place, then a longer passage is asked for", () => {
    for (const quote of [".", "t", "the", "the two apps"]) {
      const findings = validateAudit(withComment({ quote }), source);
      assert.deepEqual(fieldsOf(findings), ["comments[0].quote"], quote);
      assert.match(findings[0].message, /too short/, quote);
    }
  });

  it("given a quote of three words, then it places a passage only at 20 characters or more", () => {
    const long = validateAudit(withComment({ quote: "compares their schemas" }), source);
    assert.deepEqual(long, []);
    const short = validateAudit(withComment({ quote: "Both incidents last" }), source);
    assert.deepEqual(fieldsOf(short), ["comments[0].quote"]);
    assert.match(short[0].message, /too short/);
  });

  it("given a quote the source holds twice, then a passage that occurs once is asked for", () => {
    const findings = validateAudit(withComment({ quote: "between the two apps" }), source);
    assert.deepEqual(fieldsOf(findings), ["comments[0].quote"]);
    assert.match(findings[0].message, /2 times/);
  });

  it("given a comment with no text, then it is asked for", () => {
    const findings = validateAudit(withComment({ text: "" }), source);
    assert.deepEqual(fieldsOf(findings), ["comments[0].text"]);
  });

  it("given a comment in no known group, then it names where it belongs", () => {
    const findings = validateAudit(withComment({ group: "later" }), source);
    assert.deepEqual(fieldsOf(findings), ["comments[0].group"]);
  });

  it("given a comment of five sentences, then it is cut to four", () => {
    const findings = validateAudit(withComment({ text: "One. Two. Three. Four. Five." }), source);
    assert.deepEqual(fieldsOf(findings), ["comments[0].text"]);
  });

  it("given five sentences split by line breaks, then they still count as five", () => {
    const findings = validateAudit(withComment({ text: "One\nTwo\nThree\nFour\nFive" }), source);
    assert.deepEqual(fieldsOf(findings), ["comments[0].text"]);
  });

  it("given five sentences ending in an ellipsis character, then they still count as five", () => {
    const text = "One… Two… Three… Four… Five…";
    const findings = validateAudit(withComment({ text }), source);
    assert.deepEqual(fieldsOf(findings), ["comments[0].text"]);
  });

  it("given five sentences ending inside quotes or brackets, then they still count as five", () => {
    const text = 'It says "one." It says "two." It says (three.) It says four. It says five.';
    const findings = validateAudit(withComment({ text }), source);
    assert.deepEqual(fieldsOf(findings), ["comments[0].text"]);
  });

  it("given an ask under post first, then post first holds only a challenge and its edit", () => {
    const findings = validateAudit(withComment({ type: "Ask" }), source);
    assert.deepEqual(fieldsOf(findings), ["comments[0].group"]);
  });

  it("given two challenges to post first for one kept finding, then one is moved", () => {
    const audit = structuredClone(good);
    audit.comments.push({ ...good.comments[0], quote: "compares their schemas before merge" });
    assert.deepEqual(fieldsOf(validateAudit(audit, source)), ["comments"]);
  });

  it("given a challenge to post first and nothing kept, then there is nothing to post first", () => {
    const audit = withAudit({ findings: [], comments: [good.comments[0]], questions: [] });
    assert.deepEqual(fieldsOf(validateAudit(audit, source)), ["comments"]);
  });

  it("given two questions for the reader and one reply, then each question gets one", () => {
    const second = { asked: "Is a pilot planned?", answer: "Not today" };
    const audit = withAudit({ questions: [...good.questions, second] });
    assert.deepEqual(fieldsOf(validateAudit(audit, source)), ["comments"]);
  });

  it("given a reply and no question for the reader, then the reply has nothing to answer", () => {
    const audit = withAudit({ questions: [] });
    assert.deepEqual(fieldsOf(validateAudit(audit, source)), ["comments"]);
  });

  it("given a suggested edit with no new wording, then the after is asked for", () => {
    const findings = validateAudit(withComment({ after: "" }, 1), source);
    assert.deepEqual(fieldsOf(findings), ["comments[1].after"]);
  });

  it("given a reply outside the reply group, then it is moved there", () => {
    const findings = validateAudit(withComment({ group: "good to ask" }, 2), source);
    assert.deepEqual(fieldsOf(findings), ["comments[2].group"]);
  });

  it("given four comments good to ask, then three at most are kept there", () => {
    const ask = { ...good.comments[0], type: "Ask", group: "good to ask" };
    const audit = withAudit({ comments: [ask, ask, ask, ask], questions: [] });
    const findings = validateAudit(audit, source);
    assert.deepEqual(fieldsOf(findings), ["comments"]);
  });
});

describe("the rest of the result", () => {
  it("given four good points, then three at most are kept", () => {
    const findings = validateAudit(withAudit({ good: ["a", "b", "c", "d"] }), source);
    assert.deepEqual(fieldsOf(findings), ["good"]);
  });

  it("given a question for the reader with no answer, then the answer is asked for", () => {
    const findings = validateAudit(withAudit({ questions: [{ asked: "Two versions?" }] }), source);
    assert.deepEqual(fieldsOf(findings), ["questions[0]"]);
  });
});

/** @param {string[]} args */
function run(...args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8" });
  return { code: result.status, out: result.stdout, err: result.stderr };
}

/** @param {string} name @param {string} text */
function fileWith(name, text) {
  const path = join(folder, name);
  writeFileSync(path, text);
  return path;
}

describe("checking an audit file against its source", () => {
  const sourceFile = fileWith("source.txt", source);

  it("given an audit that holds, then it prints what it kept and exits 0", () => {
    const { code, out } = run(fileWith("good.json", JSON.stringify(good)), sourceFile);
    assert.equal(code, 0);
    assert.match(out, /^AUDIT OK 1 of 2 findings kept, 3 comments, every quote found$/m);
  });

  it("given an audit with problems, then each names its field and fix, and it exits 1", () => {
    const bad = withAudit({ verdict: "", good: ["a", "b", "c", "d"] });
    const { code, out } = run(fileWith("bad.json", JSON.stringify(bad)), sourceFile);
    assert.equal(code, 1);
    assert.match(out, /^AUDIT 2 to fix$/m);
    assert.match(out, /^ {2}verdict: .+ → .+$/m);
    assert.match(out, /^ {2}good: .+ → .+$/m);
  });

  it("given an audit that is not JSON, then it says so and exits 1", () => {
    const { code, out } = run(fileWith("broken.json", "{ not json"), sourceFile);
    assert.equal(code, 1);
    assert.match(out, /^ {2}\(audit\): .+ → .+$/m);
  });

  it("given a source file that cannot be read, then it says so and exits 1", () => {
    const { code, out } = run(fileWith("good2.json", JSON.stringify(good)), join(folder, "gone"));
    assert.equal(code, 1);
    assert.match(out, /^ {2}\(source\): .+ → .+$/m);
  });

  it("given no source file, then it prints the usage and exits 2", () => {
    const { code, err } = run(fileWith("good3.json", JSON.stringify(good)));
    assert.equal(code, 2);
    assert.match(err, /usage: node check-audit\.mjs <audit\.json> <source\.txt>/);
  });
});
