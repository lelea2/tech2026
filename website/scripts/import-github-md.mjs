#!/usr/bin/env node
/**
 * import-github-md.mjs
 *
 * Downloads all Markdown files from a public GitHub directory and converts
 * them to Docusaurus-compatible MDX pages, then generates _category_.json
 * and _index.mdx navigation files.
 *
 * Usage (run from website/):
 *   node scripts/import-github-md.mjs \
 *     --source "https://github.com/owner/repo/blob/main/path/to/dir" \
 *     --dest "docs/frontend/react" \
 *     --label "React" \
 *     --description "React interview prep" \
 *     --position 4
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEBSITE_DIR = join(__dirname, '..');

// ─── CLI args ────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      result[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }
  return result;
}

// ─── GitHub URL helpers ──────────────────────────────────────────────────────

function parseGithubUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/);
  if (!match) throw new Error(`Invalid GitHub blob URL: ${url}`);
  const [, owner, repo, branch, path] = match;
  return { owner, repo, branch, path };
}

function apiUrl({ owner, repo, path }) {
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
}

function rawUrl({ owner, repo, branch, path }, filename) {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}/${filename}`;
}

function treeUrl({ owner, repo, branch, path }) {
  return `https://github.com/${owner}/${repo}/tree/${branch}/${path}`;
}

function blobUrl({ owner, repo, branch, path }, filename) {
  return `https://github.com/${owner}/${repo}/blob/${branch}/${path}/${filename}`;
}

// ─── Fetch helpers ───────────────────────────────────────────────────────────

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'import-github-md/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'import-github-md/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

// ─── MD → MDX conversion ─────────────────────────────────────────────────────

/**
 * Escape MDX-incompatible syntax in a plain-text segment:
 *   • curly braces  {…}  →  \{…\}
 *   • ALL angle brackets  <  →  &lt;
 *
 * Escaping ALL < is the safest strategy for these React interview-prep files,
 * which freely reference HTML element names (<a>, <tr>, <br>, <details>, etc.)
 * in plain text and sometimes have unbalanced HTML blocks.
 * Code blocks (handled by the caller) are left untouched, so JSX/HTML
 * inside code examples is never affected.
 */
function escapeTextSegment(text) {
  return text
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/</g, '&lt;');
}

/**
 * Walk content, escaping MDX-incompatible syntax only in plain-text regions
 * (outside fenced code blocks and inline code spans).
 */
function escapeMdxSyntax(content) {
  // Split on fenced code blocks first
  const fenceParts = content.split(/(```[\s\S]*?```)/g);

  return fenceParts
    .map((segment, idx) => {
      if (idx % 2 === 1) return segment; // inside fenced block — leave as-is

      // Now split on inline code spans
      const inlineParts = segment.split(/(`[^`\n]+`)/g);
      return inlineParts
        .map((part, i) => (i % 2 === 1 ? part : escapeTextSegment(part)))
        .join('');
    })
    .join('');
}

function extractTitle(content) {
  const m = content.match(/^#\s+(.+)$/m);
  if (!m) return null;
  // Strip markdown formatting from title for YAML
  return m[1].replace(/[*_`]/g, '').replace(/"/g, "'");
}

function mdToMdx(content, filename, position, sourceInfo) {
  const title = extractTitle(content) ?? filename.replace(/\.md$/, '');
  const escaped = escapeMdxSyntax(content);
  const attribution = [
    '',
    '---',
    '',
    `> Source: [${filename}](${blobUrl(sourceInfo, filename)})`,
  ].join('\n');

  return `---
title: "${title}"
sidebar_position: ${position}
---

${escaped}
${attribution}
`;
}

// ─── Category / index files ──────────────────────────────────────────────────

function makeCategoryJson(label, description, slug, position) {
  return JSON.stringify(
    {
      label,
      position: Number(position),
      link: {
        type: 'generated-index',
        title: label,
        description,
        slug,
      },
    },
    null,
    2,
  );
}

function makeIndexMdx(label, description, sourceInfo, entries) {
  const rows = entries
    .map(({ filename, title }) => {
      const link = './' + filename.replace(/\.mdx$/, '');
      return `| [${title}](${link}) |`;
    })
    .join('\n');

  return `---
title: "${label} Overview"
sidebar_position: 0
---

# ${label}

> ${description}

> Content sourced from [maurya-sachin/Frontend-Master-Prep-Series](https://github.com/maurya-sachin/Frontend-Master-Prep-Series/) — see the [${sourceInfo.path.split('/').pop()} directory](${treeUrl(sourceInfo)}) for original files.

---

## Topics

| Topic |
|-------|
${rows}
`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const {
    source,
    dest,
    label = 'React',
    description = 'React interview preparation questions and answers.',
    position = '4',
  } = parseArgs();

  if (!source || !dest) {
    console.error('Usage: node scripts/import-github-md.mjs --source <github-url> --dest <docs-relative-path>');
    process.exit(1);
  }

  const sourceInfo = parseGithubUrl(source);
  const destDir = join(WEBSITE_DIR, dest);
  const slug = '/' + dest.replace(/^docs\//, '');

  console.log(`Source: ${treeUrl(sourceInfo)}`);
  console.log(`Destination: ${destDir}`);

  // List files via GitHub API
  console.log('\nFetching file list from GitHub API...');
  const items = await fetchJson(apiUrl(sourceInfo));
  const mdFiles = items
    .filter((f) => f.type === 'file' && f.name.endsWith('.md') && f.name !== 'README.md')
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log(`Found ${mdFiles.length} Markdown files (excluding README.md)\n`);

  mkdirSync(destDir, { recursive: true });

  // Write _category_.json
  writeFileSync(join(destDir, '_category_.json'), makeCategoryJson(label, description, slug, position));
  console.log('✓ _category_.json');

  // Download, convert, write each file
  const entries = [];
  for (let i = 0; i < mdFiles.length; i++) {
    const { name } = mdFiles[i];
    process.stdout.write(`[${String(i + 1).padStart(2)}/${mdFiles.length}] ${name} ... `);

    const content = await fetchText(rawUrl(sourceInfo, name));
    const mdxContent = mdToMdx(content, name, i + 1, sourceInfo);
    const mdxName = name.replace(/\.md$/, '.mdx');
    writeFileSync(join(destDir, mdxName), mdxContent);

    const title = extractTitle(content) ?? name.replace(/\.md$/, '');
    entries.push({ filename: mdxName, title });
    console.log('✓');
  }

  // Write _index.mdx
  writeFileSync(join(destDir, '_index.mdx'), makeIndexMdx(label, description, sourceInfo, entries));
  console.log('✓ _index.mdx');

  console.log(`\nDone — ${entries.length} files written to ${destDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
