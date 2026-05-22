---
name: sync-source-docs
description: Use when frontend, backend, or algorithm source files changed and docs need to be synced into website docs automatically. Also use when a custom folder format/path mapping is provided and document paths must be generated accordingly, including frontend/jsfunction, frontend/array, and algorithm navigation. Trigger phrases: sync docs, update documentation, refresh source docs, frontend changed, backend changed, algorithm changed, folder format mapping, jsfunction docs sync, algorithm docs sync.
---

# Sync Source Docs

## Purpose

Keep documentation in sync when files change under frontend, backend, or algorithm-related folders outside website.

## Scope

- Monitor source folders:
  - frontend
  - backend
  - algorithm paths (for example `frontend/algorithm` or `backend/algorithm`)
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

## Commands

From repository root:

- cd website && npm run sync:source-docs
- npm run build

With custom mapping format:

- cd website && npm run sync:source-docs -- --format "frontend/jsfunction/hooks=frontend/jsfunction/hooks;backend/system-design=backend/system-design"

Preferred pattern for ongoing maintenance (map parent folders, not only leaf folders):

- cd website && npm run sync:source-docs -- --docs-subdir frontend --format "frontend/jsfunction=jsfunction;frontend/algorithm=algorithm"

This ensures newly added files under `frontend/jsfunction/**` and `frontend/algorithm/**` are synced automatically in the next run.

Canonical FrontEnd sync command (includes folders like `getElementBy`, `hooks`, `promise`, `array` automatically):

- cd website && npm run sync:source-docs -- --docs-subdir frontend --format "frontend/jsfunction=jsfunction"

Sync algorithm docs (example mapping):

- cd website && npm run sync:source-docs -- --docs-subdir frontend --format "frontend/algorithm=algorithm"

This creates/updates:

- website/docs/frontend/algorithm

Sync jsfunction + algorithm together in one run (recommended to avoid pruning non-mapped paths):

- cd website && npm run sync:source-docs -- --docs-subdir frontend --format "frontend/jsfunction=jsfunction;frontend/jsfunction/array=array;frontend/algorithm=algorithm"

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
- Check summary output: `Updated` should increase when new files are detected.
- Run docs build after sync to verify generated pages are included.

## Expected Output

The sync command prints a summary in this format:

- Source doc sync complete. Updated: X, removed: Y, unchanged: Z.
- Docs subdir: <value>
- Format: <value>

## Notes

- Every synced source file is rendered as an MDX page with a code block.
- Output filenames strip the source extension: `useBoolean.js` → `useBoolean.mdx` (never `useBoolean.js.mdx`).
- Titles and headings also use the base name without extension (e.g. `useBoolean`, not `useBoolean.js`).
- Removed source files are also removed from generated docs.
- Docs that are no longer represented by current mappings can be removed from the same docs subdir.
- Generated docs are deterministic and can be committed.
- Do NOT manually create `.mdx` files alongside synced docs — the script owns all `.mdx` files in mapped output dirs and will overwrite or orphan them.
