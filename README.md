# algorithm-prep

Interview preparation curated for my experience

## Docusaurus GitHub Pages

This repository now includes a Docusaurus site in `website` configured for GitHub Pages.

- Local dev: `cd website && npm start`, then open `http://localhost:3000/algorithm-prep/`
- Production build: `cd website && npm run build`
- Source docs sync: `cd website && npm run sync:source-docs`
- GitHub Pages deploy: push to `main` to trigger the workflow in `.github/workflows/deploy-docusaurus.yml`

Expected site URL:

https://lelea2.github.io/algorithm-prep/

## Copilot Skill: Sync Source Docs

Workspace skill location:

- `.github/skills/sync-source-docs/SKILL.md`

Use this skill when `frontend`, `backend`, or `algorithm` changes and you want docs refreshed automatically in docs subdirs such as:

- `website/docs/frontend`
- `website/docs/backend`
- `website/docs/algorithm`
- `website/docs/frontend-system-design`
- `website/docs/system-designs`
- `website/docs/behavioral`
- `website/docs/ai-coding`
- `website/docs/low-level-design`
- `website/docs/source-sync` (optional catch-all)

### How To Run `sync-source-docs`

From repository root:

1. `cd website`
2. Run one or more targeted sync commands:
   - `npm run sync:source-docs -- --docs-subdir frontend --format "frontend/jsfunction=jsfunction"`
   - `npm run sync:source-docs -- --docs-subdir backend --format "backend=."`
   - `npm run sync:source-docs -- --docs-subdir company --format "company=."`
   - `npm run sync:source-docs -- --docs-subdir algorithm --format "algorithm=."`
   - `npm run sync:frontend-system-design`
   - `npm run sync:source-docs -- --docs-subdir system-designs --format "system-designs=."`
   - `npm run sync:source-docs -- --docs-subdir behavioral --format "behavorial=."`
   - `npm run sync:source-docs -- --docs-subdir ai-coding --format "ai-coding=."` (or `npm run sync:ai-coding`)
   - `npm run sync:source-docs -- --docs-subdir low-level-design --format "low-level-design=."`
3. `npm run build`

Note: the source folder is currently spelled `behavorial`, but the generated docs route is `website/docs/behavioral`.

Optional: use catch-all output folder.

- `npm run sync:source-docs -- --docs-subdir source-sync --format "frontend=frontend;backend=backend;algorithm=algorithm"`

Optional: pass custom folder mapping format.

- `npm run sync:source-docs -- --format "frontend/jsfunction=frontend/jsfunction;backend=backend"`

Optional: pass custom docs output subfolder.

- `npm run sync:source-docs -- --docs-subdir source-sync-custom --format "frontend=frontend;backend=backend"`

Copilot Chat usage:

- Ask: `Run sync-source-docs skill` after source updates.
- Ask with mapping: `Run sync-source-docs with format frontend=frontend;backend=backend`.
