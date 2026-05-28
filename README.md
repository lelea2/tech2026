# tech2026
Interview prep for 2026

## Docusaurus GitHub Pages

This repository now includes a Docusaurus site in `website` configured for GitHub Pages.

- Local dev: `cd website && npm start`
- Production build: `cd website && npm run build`
- Source docs sync: `cd website && npm run sync:source-docs`
- GitHub Pages deploy: push to `main` to trigger the workflow in `.github/workflows/deploy-docusaurus.yml`

Expected site URL:

https://lelea2.github.io/tech2026/

## Copilot Skill: Sync Source Docs

Workspace skill location:

- `.github/skills/sync-source-docs/SKILL.md`

Use this skill when `frontend`, `backend`, or `algorithm` changes and you want docs refreshed automatically in docs subdirs such as:

- `website/docs/frontend`
- `website/docs/backend`
- `website/docs/algorithm`
- `website/docs/source-sync` (optional catch-all)

### How To Run `sync-source-docs`

From repository root:

1. `cd website`
2. Run one or more targeted sync commands:
   - `npm run sync:source-docs -- --docs-subdir frontend --format "frontend/jsfunction=jsfunction"`
   - `npm run sync:source-docs -- --docs-subdir backend --format "backend=."`
   - `npm run sync:source-docs -- --docs-subdir algorithm --format "algorithm=."`
3. `npm run build`

Optional: use catch-all output folder.

- `npm run sync:source-docs -- --docs-subdir source-sync --format "frontend=frontend;backend=backend;algorithm=algorithm"`

Optional: pass custom folder mapping format.

- `npm run sync:source-docs -- --format "frontend/jsfunction=frontend/jsfunction;backend=backend"`

Optional: pass custom docs output subfolder.

- `npm run sync:source-docs -- --docs-subdir source-sync-custom --format "frontend=frontend;backend=backend"`

Copilot Chat usage:

- Ask: `Run sync-source-docs skill` after source updates.
- Ask with mapping: `Run sync-source-docs with format frontend=frontend;backend=backend`.
