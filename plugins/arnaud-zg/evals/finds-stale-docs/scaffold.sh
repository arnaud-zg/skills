#!/usr/bin/env bash
# A docs folder with two breaks: a page the index never links, and an anchor to a renamed heading.
set -euo pipefail
mkdir -p docs
printf -- '# Docs\n\n- [How-to guides](how-to.md)\n' > docs/README.md
printf -- '# How-to guides\n\n[Home](README.md) · **How-to**\n\n- [Deploy](#deploy-the-app)\n\n## Ship the app\n\nRun `make ship`.\n' > docs/how-to.md
printf -- '# Testing\n\n[Home](README.md) · **Testing**\n\nRun `make test`.\n' > docs/testing.md
