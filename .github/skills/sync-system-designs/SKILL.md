---
name: sync-system-designs
description: Syncs root system-designs markdown/mdx files into website/docs/system-designs so https://lelea2.github.io/tech2026/docs/system-designs always reflects tech2026/system-designs. Use when system design docs change, when docs/system-designs is missing content, or when navigation for system-designs needs refresh.
---

# Sync System Designs

## Purpose

Ensure docs under `website/docs/system-designs/**` are generated only from root source `system-designs/**`.

## Required Mapping

Run from repo root:

- `cd website && npm run sync:source-docs -- --docs-subdir system-designs --format "system-designs=."`

Do not include other mappings in this command.

## Source Coverage

This sync includes:

- `system-designs/**/*.md`
- `system-designs/**/*.mdx`

## Output

Generated docs live at:

- `website/docs/system-designs/**`

The page path is:

- `https://lelea2.github.io/tech2026/docs/system-designs`

## Validation

After syncing:

1. Confirm command summary shows updates for the `system-designs` docs subdir.
2. Build docs:
   - `cd website && npm run build`
3. Verify sidebar/nav renders `System Design` successfully.

## Troubleshooting

- If unrelated docs appear under `website/docs/system-designs/**`, rerun with only the required mapping above.
- If a folder/page is missing, confirm the source file exists under root `system-designs/**` and has `.md` or `.mdx` extension.
- If navigation is stale, rerun the same command to regenerate `_index.mdx` folder pages.
