// How this marketplace releases its plugins, with shiplane: `pnpm shiplane` opens the release PR,
// and once it merges, tags each plugin `<name>--v<version>` and publishes its changelog section as
// the GitHub release. Nothing deploys a plugin: merging the release PR is what ships it.
import { changesetsVersioning } from "@shiplane/changesets";
import { gitSourceControl } from "@shiplane/git";
import { gitHubActionsCiPipeline, gitHubCodeHost } from "@shiplane/github";
import { agentPlugin, defineRelease, releaseFlow } from "shiplane";

export default defineRelease({
  units: ["plugins/*"],
  tag: "plugin",
  // `pnpm release` alone releases: each commit since the last tag sets the bump and its changelog
  // line. A pending changeset takes over for the plugins it names.
  commitsWithoutChangeset: "release",
  flow: releaseFlow({
    sourceControl: gitSourceControl(),
    codeHost: gitHubCodeHost(),
    ciPipeline: gitHubActionsCiPipeline(),
    versioning: changesetsVersioning(),
  }),
  // Changesets bumps each plugin's package.json; agentPlugin() writes the new version into its
  // agent manifests (.claude-plugin, .codex-plugin, .cursor-plugin) in the same release PR.
  modules: [agentPlugin()],
});
