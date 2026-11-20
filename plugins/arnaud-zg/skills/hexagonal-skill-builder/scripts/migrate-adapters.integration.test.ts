import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

// The migration and the adapters check as a person runs them, on a git repository shaped like a
// real project: five skills, each with its own `.<skill>/adapters/` folder at the root.

const MIGRATE = path.join(import.meta.dirname, "migrate-adapters.mjs");
const CHECK = path.join(import.meta.dirname, "check.mjs");
const SKILLS = [
  "api-endpoint-foundry",
  "domain-first",
  "seen-on-device",
  "smooth-on-device",
  "stack-and-ship",
];

let project: string | undefined;
afterEach(() => {
  if (project) rmSync(project, { recursive: true, force: true });
  project = undefined;
});

const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.com", ...args], {
    cwd,
    encoding: "utf8",
  });

const ports =
  "# Ports\n\n| Port | Count | Default |\n| --- | --- | --- |\n| `project` | 1 | none |\n";

function legacyProject() {
  project = realpathSync(mkdtempSync(path.join(os.tmpdir(), "migrate-adapters-")));
  const files: Record<string, string> = {
    "CLAUDE.md":
      "Project rules live in [`.stack-and-ship/adapters/`](.stack-and-ship/adapters/project.acme.md).\n",
  };
  for (const skill of SKILLS) {
    files[`.${skill}/adapters/project.acme.md`] = `---\nfulfils: project\n---\n# ${skill}\n`;
    files[`.claude/skills/${skill}/SKILL.md`] =
      `---\nname: ${skill}\ndescription: Does one thing. Use when asked.\n---\nRead \`.${skill}/adapters/project.<name>.md\`.\n`;
    files[`.claude/skills/${skill}/ports/PORTS.md`] = ports;
  }
  files[".claude/skills/domain-first/scripts/review.mjs"] =
    'export const folder = join(root, ".domain-first", "adapters");\n';
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(project, file)), { recursive: true });
    writeFileSync(path.join(project, file), text);
  }
  git(project, "init", "-q");
  git(project, "add", ".");
  git(project, "commit", "-qm", "init");
  return project;
}

const run = (script: string, cwd: string, ...args: string[]) =>
  spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: "utf8",
    env: { NO_COLOR: "1", PATH: process.env.PATH },
  });

describe("given a project with an adapter folder per skill at its root", () => {
  test("when the migration runs without --write, then it prints every move and rewrite and changes nothing", () => {
    const root = legacyProject();
    const { status, stdout } = run(MIGRATE, root);
    expect(status).toBe(0);
    expect(stdout).toContain(
      "move     .stack-and-ship/adapters/project.acme.md → .agents/adapters/stack-and-ship/project.acme.md",
    );
    expect(stdout).toContain("rewrite  CLAUDE.md (2 mentions)");
    expect(stdout).toContain(
      '.claude/skills/domain-first/scripts/review.mjs:1  export const folder = join(root, ".domain-first", "adapters");',
    );
    expect(git(root, "status", "--porcelain").stdout).toBe("");
  });

  test("when it runs with --write, then every adapter moves with its history, links follow, the root is clean and the check passes", () => {
    const root = legacyProject();
    expect(run(MIGRATE, root, "--write").status).toBe(0);

    for (const skill of SKILLS) {
      expect(existsSync(path.join(root, `.${skill}`)), skill).toBe(false);
      expect(existsSync(path.join(root, `.agents/adapters/${skill}/project.acme.md`)), skill).toBe(
        true,
      );
    }
    expect(readFileSync(path.join(root, "CLAUDE.md"), "utf8")).toBe(
      "Project rules live in [`.agents/adapters/stack-and-ship/`](.agents/adapters/stack-and-ship/project.acme.md).\n",
    );
    expect(
      readFileSync(path.join(root, ".claude/skills/seen-on-device/SKILL.md"), "utf8"),
    ).toContain("Read `.agents/adapters/seen-on-device/project.<name>.md`.");
    expect(git(root, "status", "--porcelain").stdout).toContain(
      "R  .stack-and-ship/adapters/project.acme.md -> .agents/adapters/stack-and-ship/project.acme.md",
    );
    const check = run(CHECK, root, "--adapters");
    expect(check.stdout).toContain("✓ every adapter holds.");
    expect(check.status).toBe(0);
  });

  test("when it runs with --skill, then only that skill's folder moves and the others stay untouched", () => {
    const root = legacyProject();
    expect(run(MIGRATE, root, "--skill", "domain-first", "--write").status).toBe(0);

    expect(existsSync(path.join(root, ".agents/adapters/domain-first/project.acme.md"))).toBe(true);
    expect(existsSync(path.join(root, ".domain-first"))).toBe(false);
    expect(existsSync(path.join(root, ".stack-and-ship/adapters/project.acme.md"))).toBe(true);
    expect(readFileSync(path.join(root, "CLAUDE.md"), "utf8")).toContain(
      ".stack-and-ship/adapters/",
    );
  });

  test("when a tool's own dot-folder holds adapters/ and a skill folder holds a README, then neither is touched and both are said", () => {
    const root = legacyProject();
    mkdirSync(path.join(root, ".storybook/adapters"), { recursive: true });
    writeFileSync(path.join(root, ".storybook/adapters/msw.md"), "# msw\n");
    writeFileSync(path.join(root, ".domain-first/adapters/README.md"), "# notes\n");
    const { status, stdout } = run(MIGRATE, root, "--write");

    expect(status).toBe(0);
    expect(existsSync(path.join(root, ".storybook/adapters/msw.md"))).toBe(true);
    expect(existsSync(path.join(root, ".domain-first/adapters/README.md"))).toBe(true);
    expect(stdout).toContain(
      "skipped  .storybook/adapters/: no installed skill is named storybook",
    );
    expect(stdout).toContain("  .domain-first/adapters/README.md");
    expect(run(CHECK, root, "--adapters").status).toBe(0);
  });

  test("when --skill names an old alias, then it maps to the skill; when it names no folder, then it exits 2", () => {
    const root = legacyProject();
    mkdirSync(path.join(root, ".big-o/adapters"), { recursive: true });
    writeFileSync(
      path.join(root, ".big-o/adapters/language.rust.md"),
      "---\nfulfils: language\n---\n",
    );
    expect(run(MIGRATE, root, "--skill", "big-o").stdout).toContain(
      "move     .big-o/adapters/language.rust.md → .agents/adapters/big-o-optimizer/language.rust.md",
    );
    const missing = run(MIGRATE, root, "--skill", "domain-frist");
    expect(missing.stderr).toContain("No .<skill>/adapters/ folder for domain-frist");
    expect(missing.status).toBe(2);
  });

  test("when it runs a second time, then there is nothing left to do", () => {
    const root = legacyProject();
    run(MIGRATE, root, "--write");
    const { status, stdout } = run(MIGRATE, root, "--write");
    expect(stdout).toContain("Nothing to migrate");
    expect(status).toBe(0);
  });

  test("when the home already holds a different file of the same name, then it refuses and writes nothing", () => {
    const root = legacyProject();
    mkdirSync(path.join(root, ".agents/adapters/stack-and-ship"), { recursive: true });
    writeFileSync(
      path.join(root, ".agents/adapters/stack-and-ship/project.acme.md"),
      "---\nfulfils: project\n---\nnewer\n",
    );
    const { status, stdout } = run(MIGRATE, root, "--write");
    expect(stdout).toContain("refused  .stack-and-ship/adapters/project.acme.md");
    expect(status).toBe(1);
    expect(existsSync(path.join(root, ".domain-first/adapters/project.acme.md"))).toBe(true);
  });

  test("when the adapters check runs before the migration, then every legacy folder is a finding naming the migration", () => {
    const root = legacyProject();
    const { status, stdout } = run(CHECK, root, "--adapters");
    expect(stdout.match(/ {2}legacy$/gm)).toHaveLength(SKILLS.length);
    expect(stdout).toContain("migrate-adapters.mjs --write");
    expect(status).toBe(1);
  });
});

describe("given a migrated project with files that sit beside its adapters", () => {
  test("when the adapters check runs, then a .DS_Store and a README pass, and a root that is a file exits 2", () => {
    const root = legacyProject();
    run(MIGRATE, root, "--write");
    writeFileSync(path.join(root, ".agents/adapters/stack-and-ship/.DS_Store"), "");
    writeFileSync(path.join(root, ".agents/adapters/README.md"), "# Adapters\n");

    expect(run(CHECK, root, "--adapters").status).toBe(0);
    const file = run(CHECK, root, "--adapters", "CLAUDE.md");
    expect(file.stderr).toContain("is not a folder");
    expect(file.status).toBe(2);
  });
});

describe("given a project with no adapters at all", () => {
  test("when the adapters check runs, then it exits 2: there is nothing to check", () => {
    project = realpathSync(mkdtempSync(path.join(os.tmpdir(), "migrate-adapters-")));
    const { status, stderr } = run(CHECK, project, "--adapters");
    expect(stderr).toContain("No adapters under");
    expect(status).toBe(2);
  });
});
