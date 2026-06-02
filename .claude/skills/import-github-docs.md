# import-github-docs

Import Markdown files from a public GitHub directory into `website/docs/` as MDX pages with Docusaurus navigation.

## When to invoke

Use when the user says things like:
- "create a subnavigation from \<GitHub URL>"
- "import docs from GitHub"
- "add a new section under frontend from \<URL>"
- "copy docs from \<GitHub URL> into \<destination>"

## Required inputs

1. **GitHub blob URL** — URL to the directory on GitHub, in the form:
   `https://github.com/owner/repo/blob/main/path/to/dir`
2. **Destination path** — relative path inside `website/`, e.g. `docs/frontend/react`
3. **Label** — display name for the navigation section (e.g. `React`)
4. **Description** — one-sentence description for the generated-index page
5. **Position** — sidebar position number (integer, defaults to 4)

If the user doesn't provide some of these, infer them from context or ask.

## How to execute

Run from the `website/` directory:

```bash
cd website && node scripts/import-github-md.mjs \
  --source "<github-blob-url>" \
  --dest "<docs-relative-path>" \
  --label "<Label>" \
  --description "<Description>" \
  --position <number>
```

### Example

```bash
cd website && node scripts/import-github-md.mjs \
  --source "https://github.com/maurya-sachin/Frontend-Master-Prep-Series/blob/main/03-react" \
  --dest "docs/frontend/react" \
  --label "React" \
  --description "React interview preparation — hooks, patterns, state management, rendering, testing, and more." \
  --position 4
```

## What the script does

1. Calls the GitHub API to list `.md` files in the directory (skips `README.md`)
2. Downloads each file from the GitHub raw CDN
3. Converts each MD file to MDX:
   - Adds Docusaurus frontmatter (`title`, `sidebar_position`)
   - Escapes MDX-incompatible syntax in plain text (curly braces → `\{`, angle brackets → `&lt;`)
   - Preserves code blocks and inline code untouched
   - Appends an attribution link to the source file
4. Writes `_category_.json` for sidebar navigation
5. Writes `_index.mdx` as the section overview page

## After running

Always validate the build:

```bash
cd website && npm run build
```

If there are MDX parse errors, they'll be reported per-file. Common causes:
- The script escapes ALL `<` outside code blocks to avoid JSX parse errors; this is intentional
- `{` and `}` are escaped to `\{` and `\}` in text

## Navigation wiring

The `_category_.json` file wires the new section into the Docusaurus sidebar automatically. To adjust the position relative to other sections, check sibling `_category_.json` files:

```
website/docs/frontend/
├── _category_.json          ← parent (position 1)
├── accessibility/           ← position 2
├── performance/             ← position 3
├── react/                   ← position 4 (new)
├── jsfunction/
└── quizzes/
```

## Script location

`website/scripts/import-github-md.mjs`

This script is reusable for any public GitHub Markdown directory. The only requirement is that files follow standard Markdown conventions (` ``` ` fenced code blocks, `#` headings, etc.).
