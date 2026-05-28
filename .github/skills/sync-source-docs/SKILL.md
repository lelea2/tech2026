---
name: sync-source-docs
description: Use when frontend, backend, or algorithm source files changed and docs need to be synced into website docs automatically. Also use when a custom folder format/path mapping is provided and document paths must be generated accordingly, including frontend/jsfunction, frontend/array, backend/quizzes, backend markdown/mdx content, and separate algorithm navigation. Trigger phrases: sync docs, update documentation, refresh source docs, frontend changed, backend changed, algorithm changed, folder format mapping, jsfunction docs sync, backend quizzes sync, backend md sync, algorithm docs sync, py js compare docs.
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
2. Build a complete, stable parent mapping list for the target docs subdir (not only changed leaf folders).
3. Prefer parent-folder mappings (example: `frontend/jsfunction=jsfunction`) so newly added `.js` files in nested folders are auto-included.
4. For each docs subdir, run source sync once with the full mapping set that should exist after the run.
5. Verify docs update summary.
6. Run docs build to validate output.

### Mapping stability rule (required)

- Do not generate mappings from only the currently changed files.
- Do not map only selected child folders when a stable parent exists.
- If any file under `frontend/jsfunction/**` is in scope, include `frontend/jsfunction=jsfunction`.
- If any file under `backend/**` is in scope (including `backend/quizzes/**` and backend `.md`/`.mdx`), include `backend=.` for backend docs.
- If any file under `algorithm/**` is in scope, include `algorithm=.` for algorithm docs.
- This guarantees new sibling folders and moved files are reflected correctly on the next sync.

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

- cd website && npm run sync:source-docs -- --format "frontend/jsfunction=frontend/jsfunction;backend/system-design=backend/system-design"

Preferred pattern for ongoing maintenance (map parent folders, not only leaf folders):

- cd website && npm run sync:source-docs -- --docs-subdir frontend --format "frontend/jsfunction=jsfunction"

This ensures newly added files under `frontend/jsfunction/**` are synced automatically in the next run.

Moved-file safety (same docs subdir):

- Keep using the same stable parent mapping(s) on each run.
- The script removes stale docs from old locations and writes docs at the new locations.

Canonical FrontEnd sync command (includes folders like `getElementBy`, `hooks`, `promise`, `array` automatically):

- cd website && npm run sync:source-docs -- --docs-subdir frontend --format "frontend/jsfunction=jsfunction"

Sync backend docs as a separate navigation section (includes `backend/quizzes/**`, `backend/system-design/**`, and backend root `.md`/`.mdx` files):

- cd website && npm run sync:source-docs -- --docs-subdir backend --format "backend=."

This creates/updates:

- website/docs/backend

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

Run Backend sync as a separate command (recommended):

- cd website && npm run sync:source-docs -- --docs-subdir backend --format "backend=."

Avoid narrow leaf-only mapping for main sync runs:

- Risky example: `frontend/jsfunction/array=array`
- Preferred: `frontend/jsfunction=jsfunction`
- If a separate curated subtab is truly needed, include the stable parent mapping in the same command.

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
- Rule of thumb: one stable parent mapping per source domain is preferred over many leaf mappings.

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
  - Good: `backend=.`
  - Good: `frontend/jsfunction=jsfunction`
  - Risky: mapping only selected leaves (new siblings will be missed)
- Re-run sync; post-hook should generate `/_index.mdx` pages for new folders automatically.
- If files were moved across folders, run sync again with the same stable parent mapping; stale old pages should be removed.
- Verify generated path exists under docs, for example:
  - `website/docs/algorithm/mostCommonElement.mdx`
  - `website/docs/algorithm/countIslandOnGrid.mdx`
  - `website/docs/algorithm/two-pointers/_index.mdx`
  - `website/docs/frontend/jsfunction/spreadSheet/_index.mdx`
  - `website/docs/frontend/jsfunction/textSearch/_index.mdx`
  - `website/docs/frontend/jsfunction/deepClone/_index.mdx`

## Troubleshooting: Backend markdown/mdx or quizzes docs missing

- Use stable parent mapping for backend docs: `--docs-subdir backend --format "backend=."`.
- This includes:
  - `backend/quizzes/**`
  - any backend `.md`/`.mdx` file under `backend/**`
- Source backend markdown and mdx files are generated as `.mdx` docs pages under `website/docs/backend/**`.
- Folder navigation pages (`_index.mdx`) are generated for backend subfolders on sync.
- If files were moved, rerun with the same mapping so stale old paths are removed.

## Expected Output

The sync command prints a summary in this format:

- Source doc sync complete. Updated: X, removed: Y, unchanged: Z.
- Docs subdir: <value>
- Format: <value>

## Notes

- Every synced source file is rendered as an MDX page with a code block.
- Backend markdown sources (`.md`/`.mdx`) are also emitted into MDX output pages and included in backend folder navigation.
- If both `.py` and `.js` files share the same relative basename (for example `kRowPascalTriangle.py` + `kRowPascalTriangle.js`), they are merged into one MDX page with language tabs so readers can compare side-by-side in a single page.
- Output filenames strip the source extension: `useBoolean.js` → `useBoolean.mdx` (never `useBoolean.js.mdx`).
- Titles and headings also use the base name without extension (e.g. `useBoolean`, not `useBoolean.js`).
- Removed source files are also removed from generated docs.
- Docs that are no longer represented by current mappings can be removed from the same docs subdir.
- Generated docs are deterministic and can be committed.
- Do NOT manually create `.mdx` files alongside synced docs — the script owns all `.mdx` files in mapped output dirs and will overwrite or orphan them.
