---
name: sync-source-docs
description: Use when frontend, backend, or algorithm source files changed and docs need to be synced into website docs automatically. Also use when a custom folder format/path mapping is provided and document paths must be generated accordingly, including frontend/jsfunction, frontend/array, and separate algorithm navigation. Trigger phrases: sync docs, update documentation, refresh source docs, frontend changed, backend changed, algorithm changed, folder format mapping, jsfunction docs sync, algorithm docs sync, py js compare docs.
---

# Sync Source Docs

## Purpose

Keep documentation in sync when files change under frontend, backend, or algorithm-related folders outside website.

## Scope

- Monitor source folders:
  - frontend
  - backend
  - algorithm
- Ignore website as a source of truth
- Write auto-generated docs to:
  - website/docs/source-sync
- Support custom source-to-doc path mapping format
- If mapped docs folder path does not exist, create it under website/docs first
- Folder names should map to navigation names automatically

## Workflow

1. Confirm changed files in source folders only.
2. Build a complete mapping list for the target docs subdir.
3. Prefer parent-folder mappings (example: `frontend/jsfunction=jsfunction`) so newly added `.js` files in nested folders are auto-included.
4. Run source sync script once with all mappings for that docs subdir.
5. Verify docs update summary.
6. Run docs build to validate output.

### Post-hook behavior (new)

- After syncing source files, the script now runs a post-hook that auto-creates folder navigation pages:
  - `.../<folder>/_index.mdx`
- This happens for newly discovered nested folders too (for example `algorithm/two-pointers`, `frontend/jsfunction/spreadSheet`, `frontend/jsfunction/prismaORM`).
- This also applies to folders that contain multiple files (for example `frontend/jsfunction/textSearch/*` and `frontend/jsfunction/deepClone/*`), generating:
  - `.../textSearch/_index.mdx` + one page per file
  - `.../deepClone/_index.mdx` + one page per file
- These nav pages are generated automatically and tracked in the sync manifest.
- If a source folder disappears, the corresponding generated nav page is removed on the next sync.

## Commands

From repository root:

- cd website && npm run sync:source-docs
- npm run build

With custom mapping format:

- cd website && npm run sync:source-docs -- --format "frontend/jsfunction/hooks=frontend/jsfunction/hooks;backend/system-design=backend/system-design"

Preferred pattern for ongoing maintenance (map parent folders, not only leaf folders):

- cd website && npm run sync:source-docs -- --docs-subdir frontend --format "frontend/jsfunction=jsfunction"

This ensures newly added files under `frontend/jsfunction/**` are synced automatically in the next run.

Canonical FrontEnd sync command (includes folders like `getElementBy`, `hooks`, `promise`, `array` automatically):

- cd website && npm run sync:source-docs -- --docs-subdir frontend --format "frontend/jsfunction=jsfunction"

Sync algorithm docs as a separate navigation section:

- cd website && npm run sync:source-docs -- --docs-subdir algorithm --format "algorithm=."

This creates/updates:

- website/docs/algorithm

Algorithm root-file entry rule (important):

- Use `algorithm=.` (not `algorithm=algorithm`) so files directly under `algorithm/` are generated directly under `website/docs/algorithm/`.
- Example root files:
  - `algorithm/mostCommonElement.js` -> `website/docs/algorithm/mostCommonElement.mdx`
  - `algorithm/countIslandOnGrid.js` -> `website/docs/algorithm/countIslandOnGrid.mdx`
- Subfolder files stay in their own subfolder pages (not mixed into root file entries):
  - `algorithm/array/*` -> `website/docs/algorithm/array/*`
  - `algorithm/two-pointers/*` -> `website/docs/algorithm/two-pointers/*`

Run FrontEnd + Algorithm sync as two commands (separate docs subdirs):

- cd website && npm run sync:source-docs -- --docs-subdir frontend --format "frontend/jsfunction=jsfunction"
- cd website && npm run sync:source-docs -- --docs-subdir algorithm --format "algorithm=."

Create a new FrontEnd subtab from folder name (example: `array`):

- cd website && npm run sync:source-docs -- --docs-subdir frontend --format "frontend/jsfunction/hooks=array"

This creates/updates:

- website/docs/frontend/array

And the sidebar subtab name is mapped from the folder name (`array`).

Generate jsfunction docs page with all jsfunction tabs plus array subnavigation:

- cd website && npm run sync:source-docs -- --docs-subdir frontend --format "frontend/jsfunction=jsfunction;frontend/jsfunction/array=array"

This creates/updates:

- website/docs/frontend/jsfunction
- website/docs/frontend/array

With custom docs output root:

- cd website && npm run sync:source-docs -- --docs-subdir source-sync-custom --format "frontend=frontend;backend=backend"

Mapping format rules:

- Pattern: source/path=docs/path;source2/path=docs2/path
- Separator between mappings: semicolon (;)
- Left side must be outside website folder
- Right side is relative to website/docs/<docs-subdir>
- Missing mapped folder paths are created automatically
- Important: only mapped paths are kept for the selected docs subdir. Include all mappings you want to preserve in the same command.
- To capture new files reliably, map stable parent folders (for example `frontend/jsfunction`) instead of many narrow subfolder mappings.

## Troubleshooting: New `.js` files not appearing

- Confirm the new file is inside a mapped source path.
- If you mapped only a leaf path, replace it with a parent mapping (example: `frontend/jsfunction=jsfunction`).
- For `frontend/jsfunction/getElementBy/**`, do not map only `hooks`/`array`/`promise`; include `frontend/jsfunction=jsfunction` in the same command.
- Re-run sync with all mappings for the same docs subdir in one command.
- Confirm parent mapping is broad enough so new folders are inside scope (for example `algorithm=.` or `frontend/jsfunction=jsfunction`).
- Check summary output: `Updated` should increase when new files are detected.
- Run docs build after sync to verify generated pages are included.

## Troubleshooting: New subfolder not visible in navigation

- Use a parent mapping, not only leaf mappings:
  - Good: `algorithm=.`
  - Good: `frontend/jsfunction=jsfunction`
  - Risky: mapping only selected leaves (new siblings will be missed)
- Re-run sync; post-hook should generate `/_index.mdx` pages for new folders automatically.
- Verify generated path exists under docs, for example:
  - `website/docs/algorithm/mostCommonElement.mdx`
  - `website/docs/algorithm/countIslandOnGrid.mdx`
  - `website/docs/algorithm/two-pointers/_index.mdx`
  - `website/docs/frontend/jsfunction/spreadSheet/_index.mdx`
  - `website/docs/frontend/jsfunction/textSearch/_index.mdx`
  - `website/docs/frontend/jsfunction/deepClone/_index.mdx`

## Expected Output

The sync command prints a summary in this format:

- Source doc sync complete. Updated: X, removed: Y, unchanged: Z.
- Docs subdir: <value>
- Format: <value>

## Notes

- Every synced source file is rendered as an MDX page with a code block.
- If both `.py` and `.js` files share the same relative basename (for example `kRowPascalTriangle.py` + `kRowPascalTriangle.js`), they are merged into one MDX page with language tabs so readers can compare side-by-side in a single page.
- Output filenames strip the source extension: `useBoolean.js` → `useBoolean.mdx` (never `useBoolean.js.mdx`).
- Titles and headings also use the base name without extension (e.g. `useBoolean`, not `useBoolean.js`).
- Removed source files are also removed from generated docs.
- Docs that are no longer represented by current mappings can be removed from the same docs subdir.
- Generated docs are deterministic and can be committed.
- Do NOT manually create `.mdx` files alongside synced docs — the script owns all `.mdx` files in mapped output dirs and will overwrite or orphan them.
