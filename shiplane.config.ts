// How this marketplace releases its plugins, with shiplane: `pnpm shiplane` opens the release PR,
// and once it merges, tags each plugin `<name>--v<version>` and publishes its changelog section as
// the GitHub release. Nothing deploys a plugin: merging the release PR is what ships it.
import { changesetsVersioning } from "@shiplane/changesets";
import { gitSourceControl } from "@shiplane/git";
import { gitHubActionsCiPipeline, gitHubCodeHost } from "@shiplane/github";
import { defineRelease, internalTool, releaseFlow } from "shiplane";

export default defineRelease({
  units: ["plugins/*"],
  tag: "plugin",
  flow: releaseFlow({
    sourceControl: gitSourceControl(),
    codeHost: gitHubCodeHost(),
    ciPipeline: gitHubActionsCiPipeline(),
    // Changesets bumps each plugin's package.json; sync-versions copies the version into its agent
    // manifests (.claude-plugin, .codex-plugin, .cursor-plugin), which changesets knows nothing of.
    versioning: changesetsVersioning({
      version: ["sh", "-c", "pnpm exec changeset version && node scripts/sync-versions.mjs"],
    }),
  }),
  modules: [internalTool()],
});
