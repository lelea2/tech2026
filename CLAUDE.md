# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

Interview prep collection for 2026. Three source directories contain algorithm solutions and frontend/backend reference implementations. A Docusaurus site in `website/` publishes these as browsable docs at https://lelea2.github.io/tech2026/.

## Commands

All website commands run from `website/`:

```bash
cd website && npm start          # local dev server
cd website && npm run build      # production build
cd website && npm run serve      # serve the production build locally
```

Sync source files into docs (run from repo root, then `cd website` first):

```bash
# Sync frontend jsfunction files
cd website && npm run sync:source-docs -- --docs-subdir frontend --format "frontend/jsfunction=jsfunction"

# Sync algorithm files
cd website && npm run sync:source-docs -- --docs-subdir algorithm --format "algorithm=."

# Both together (run as two separate commands)
cd website && npm run sync:source-docs -- --docs-subdir frontend --format "frontend/jsfunction=jsfunction"
cd website && npm run sync:source-docs -- --docs-subdir algorithm --format "algorithm=."
```

After syncing, always run `npm run build` to validate the output.

## Source Directory Layout

- `frontend/jsfunction/` — JavaScript utility implementations (debounce, curry, EventEmitter, hooks, etc.)
- `algorithm/` — Algorithm solutions; root-level files + `array/` and `two-pointers/` subfolders. Many problems have both `.js` and `.py` versions.
- `backend/system-design/` — System design notes

## Docusaurus Site Architecture

The site in `website/` is a standard Docusaurus 3 setup. The key non-standard piece is the sync script at `website/scripts/sync-source-docs.mjs`, which auto-generates `.mdx` pages from source files:

- Each `.js`/`.py` source file becomes an MDX page with a fenced code block.
- If both `.js` and `.py` exist with the same base name (e.g., `kRowPascalTriangle.js` + `kRowPascalTriangle.py`), they are merged into a **single MDX page with language tabs** for side-by-side comparison.
- Nested folders get an auto-generated `_index.mdx` navigation page.
- The script owns all `.mdx` files in mapped output dirs — do not manually create `.mdx` files there.
- Output goes to `website/docs/source-sync` by default, or `website/docs/<docs-subdir>` when `--docs-subdir` is passed.

## Sync Mapping Rules

- `--format` takes `source/path=docs/path` pairs separated by `;`
- Left side: path relative to repo root (must be outside `website/`)
- Right side: path relative to `website/docs/<docs-subdir>`
- Use `algorithm=.` (not `algorithm=algorithm`) so root-level algorithm files land directly under `website/docs/algorithm/`
- Map **parent folders** (e.g., `frontend/jsfunction=jsfunction`) rather than individual leaf folders — this ensures newly added files are picked up automatically on the next sync run

## Code Style

Prettier is configured (`.prettierrc`): 2-space indent, single quotes, trailing commas (ES5), 100-char line width.

## Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy-docusaurus.yml`), which builds and deploys the site to GitHub Pages automatically.
