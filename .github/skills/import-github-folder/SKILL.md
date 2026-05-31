---
name: import-github-folder
description: >
  Imports a folder of MD or MDX files from a GitHub directory, converts them to
  MDX pages, and writes them under any website/docs/ path with full Docusaurus
  navigation (_category_.json + _index.mdx). Every generated file includes a
  footer linking back to the original GitHub source folder.
  Use when the user says "import docs from GitHub into <path>", "create a section
  under <docs-path> from <GitHub URL>", "copy this GitHub folder into website/docs",
  "add a new navigation section from <GitHub link>", or "pull MD files from GitHub
  into <website/docs/...>".
  Always takes two required inputs: the target docs path (e.g. "frontend/performance"
  or "backend/caching") and the GitHub directory URL to import from.
---

# import-github-folder

Imports a GitHub folder of `.md`/`.mdx` files into any `website/docs/` path,
creates Docusaurus navigation, and adds source attribution to every file.

---

## Parameters

| Parameter | Example | Description |
|-----------|---------|-------------|
| `docs_path` | `frontend/performance` | Path under `website/docs/` where files will be written. The last segment becomes the folder name. |
| `github_dir_url` | `https://github.com/owner/repo/tree/main/07-performance` | GitHub URL (tree view) of the directory containing `.md` / `.mdx` files. |

Ask for both if not already provided:

```
Target docs path (under website/docs/): e.g. frontend/performance
GitHub directory URL:                   e.g. https://github.com/.../tree/main/07-performance
```

---

## What this skill does

1. **Discover files** — Calls the GitHub Contents API to list `.md` and `.mdx` files in the given directory.
2. **Download content** — Fetches each file in parallel via `raw.githubusercontent.com`.
3. **Convert to MDX** — Applies MDX compatibility transforms (see Step 4).
4. **Write files** — Creates `website/docs/<docs_path>/` with `_category_.json`, `_index.mdx`, and one `.mdx` per source file.
5. **Source attribution** — Every generated file has a footer linking back to `<github_dir_url>`.
6. **Build validation** — Runs `cd website && npm run build` and reports pass or first error.

---

## Workflow

### Step 0 — Gather inputs

Ensure both parameters are known. If the user provided a GitHub URL but not a
`docs_path`, infer a sensible default from the directory name (e.g. `07-performance`
→ `frontend/performance`) and confirm with the user before writing.

### Step 1 — Resolve the output directory and sidebar position

```bash
ls website/docs/<parent>/
```

Where `<parent>` is everything in `docs_path` except the last segment
(e.g. for `frontend/performance`, parent is `frontend`).

- If the parent does not exist, create it and give the new section `position: 1`.
- If it exists, read the `position` field from each `_category_.json` in
  `website/docs/<parent>/*/`. The new section gets `max(positions) + 1`.
- If the target folder already exists, overwrite its files (do not delete files
  that are no longer in the source; warn the user instead).

### Step 2 — List files via GitHub Contents API

Convert the tree URL to an API URL:

```
https://github.com/{owner}/{repo}/tree/{branch}/{path}
→
https://api.github.com/repos/{owner}/{repo}/contents/{path}
```

Fetch that URL. Parse the JSON array; collect items where:
- `type == "file"`
- `name` ends with `.md` or `.mdx`

Each item has a `download_url` pointing to `raw.githubusercontent.com`.

> If the API returns a 403, inform the user they've hit the unauthenticated rate
> limit (60 req/hr) and to try again in a minute.

### Step 3 — Download all files in parallel

Issue all `WebFetch` calls in a **single message** (parallel). Use the prompt:

> "Return the full raw markdown content exactly as-is, no summarization."

If a file is summarized (>40 KB), write the MDX from the summary — do not retry.

### Step 4 — Convert each file to MDX

Apply all transforms in order:

#### 4a. Strip `<details>` / `<summary>` blocks

MDX 3 treats these as JSX and does not process Markdown inside them.
Convert collapsible sections to regular headings:

```
<details>
<summary>🔍 <strong>Deep Dive: Foo Bar</strong></summary>
...content...
</details>
```

→

```
### 🔍 Deep Dive: Foo Bar

...content...
```

Strip inner HTML tags (like `<strong>`) from the summary text.
Remove the closing `</details>` tag.

#### 4b. Escape bare `{` and `}` outside code fences

Walk line-by-line. Track fenced code blocks (` ``` ` or `~~~`). Outside fences,
replace lone `{` in prose with `&#123;` and lone `}` with `&#125;`.
Do not touch `{` inside inline backtick spans.

Skip this step if the file has no `{` outside code blocks.

#### 4c. Fix relative links

Replace `.md)` with `.mdx)` in Markdown links:
`[text](./foo.md)` → `[text](./foo.mdx)`

#### 4d. Add YAML frontmatter

Prepend (if none exists):

```yaml
---
title: <Human-readable title derived from filename>
sidebar_position: <1-based index within this section, alphabetical order>
---
```

Derive `title`: replace hyphens/underscores with spaces, strip leading numeric
prefixes and separators, then title-case.
Examples: `01-optimization-techniques.md` → `Optimization Techniques`,
`caching-strategies.md` → `Caching Strategies`.

#### 4e. Add source attribution footer

Append to **every** generated file:

```markdown

---

_Source: [<dir-name>](<github_dir_url>) in [<repo-name>](<main-repo-url>)_
```

Where:
- `<dir-name>` = last path segment of `github_dir_url` (e.g. `07-performance`)
- `<github_dir_url>` = the exact GitHub tree URL the user passed in
- `<repo-name>` = `{owner}/{repo}` derived from the URL
- `<main-repo-url>` = `https://github.com/{owner}/{repo}`

This makes every page traceable back to its original source location.

### Step 5 — Handle README.md

If the directory contains a `README.md`:
- Use it as the source for `_index.mdx`. Apply the same transforms.
- Set `sidebar_position: 0`.

If no README exists, generate a minimal `_index.mdx`:

```markdown
---
title: <Section Title>
sidebar_position: 0
---

# <Section Title>

> Imported from [<dir-name>](<github_dir_url>) in [<repo-name>](<main-repo-url>).

## Topics

- [Topic A](./topic-a.mdx)
- [Topic B](./topic-b.mdx)
...
```

### Step 6 — Write `_category_.json`

Create `website/docs/<docs_path>/_category_.json`:

```json
{
  "label": "<Section Label>",
  "position": <position>,
  "link": {
    "type": "generated-index",
    "title": "<Section Label>",
    "description": "Imported from <github_dir_url>",
    "slug": "/<docs_path>"
  }
}
```

- `<Section Label>` = title-cased last segment of `docs_path`
  (e.g. `frontend/performance` → `Performance`)
- `<position>` = computed in Step 1

### Step 7 — Write all files

Create the directory and write:

- `_category_.json`
- `_index.mdx`
- One `.mdx` per source `.md`/`.mdx` file (see naming rules below)

Do NOT delete pre-existing files that are absent from the source; warn the user
if any stale files are detected.

### Step 8 — Build validation

```bash
cd website && npm run build
```

Report `Build passed` or paste the first error line with the offending file path.

If a build fails on an MDX parse error, show the file and line, then suggest the
fix (usually an unescaped `{` or a JSX-incompatible HTML element like `<br>`
without a closing slash).

---

## File naming conventions

| Source filename | Output filename |
|----------------|----------------|
| `README.md` | `_index.mdx` |
| `01-optimization-techniques.md` | `optimization-techniques.mdx` |
| `caching-01-strategies.md` | `caching-strategies.mdx` |
| `core-vitals.mdx` | `core-vitals.mdx` |
| `myDoc.md` | `my-doc.mdx` |

**Naming rule:** strip leading/trailing numeric prefixes and their separating
hyphens, lowercase, keep hyphens between words, change extension to `.mdx`.
If two source files produce the same output name, append a numeric suffix (`-2`, `-3`).

---

## MDX Compatibility Checklist

Before writing each file:

- [ ] No raw `<` / `>` in prose (use `&lt;` / `&gt;` or a code fence)
- [ ] No `<details>` or `<summary>` tags (converted to `###`)
- [ ] No bare `{` / `}` in prose outside code fences
- [ ] All `<img>` tags without `alt` get `alt=""`
- [ ] Self-closing HTML void elements use JSX syntax: `<br/>`, `<hr/>`, `<img/>`
- [ ] Relative `.md` links rewritten to `.mdx`
- [ ] YAML frontmatter present

---

## Example invocations

### Under frontend
**User:** "Create a performance section under frontend from https://github.com/maurya-sachin/Frontend-Master-Prep-Series/tree/main/07-performance"

**Docs path:** `frontend/performance`
**Output:** `website/docs/frontend/performance/`

### Under backend
**User:** "Import https://github.com/example/prep/tree/main/rest-graphql into backend/api-design"

**Docs path:** `backend/api-design`
**Output:** `website/docs/backend/api-design/`

### New top-level section
**User:** "Add a system-design section at website/docs/system-design from https://github.com/.../tree/main/system-design"

**Docs path:** `system-design`
**Output:** `website/docs/system-design/`

---

## Rate limits

GitHub unauthenticated API: 60 requests/hour. With 5–15 files per directory this
is well within limits for a single run. If a 403 is returned, tell the user to
wait one minute and retry.

---

## Past runs

| Date | Docs path | Source GitHub URL | Files |
|------|-----------|-------------------|-------|
