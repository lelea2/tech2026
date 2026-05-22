import {createHash} from 'crypto';
import {promises as fs} from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');
const defaultDocsSubdir = 'source-sync';
const defaultFormat = 'frontend=frontend;backend=backend;algorithm=algorithm';

const allowedExtensions = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.mdx',
  '.css',
  '.scss',
  '.html',
  '.py',
  '.java',
  '.go',
  '.rs',
  '.sh',
  '.yml',
  '.yaml',
]);

const skippedDirs = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  'coverage',
]);

const languageByExt = {
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.json': 'json',
  '.md': 'markdown',
  '.mdx': 'mdx',
  '.css': 'css',
  '.scss': 'scss',
  '.html': 'html',
  '.py': 'python',
  '.java': 'java',
  '.go': 'go',
  '.rs': 'rust',
  '.sh': 'bash',
  '.yml': 'yaml',
  '.yaml': 'yaml',
};

function toPosix(inputPath) {
  return inputPath.split(path.sep).join('/');
}

function toTitleCase(value) {
  return value
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeRelativePath(value) {
  return toPosix(value).replace(/^\/+|\/+$/g, '');
}

function getArgValue(flagName) {
  const index = process.argv.findIndex((arg) => arg === flagName);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

function parseFolderFormat(rawFormat) {
  const mappings = rawFormat
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((entry, index) => {
      const [sourcePart, docsPart] = entry.split('=').map((value) => value?.trim());

      if (!sourcePart || !docsPart) {
        throw new Error(
          `Invalid --format entry "${entry}". Expected format: source/path=docs/path`,
        );
      }

      const sourceDir = normalizeRelativePath(sourcePart);
      const docDir = docsPart === '.' ? '' : normalizeRelativePath(docsPart);

      if (!sourceDir || (docsPart !== '.' && !docDir)) {
        throw new Error(
          `Invalid --format entry "${entry}". Source and docs path must be non-empty.`,
        );
      }

      if (sourceDir === 'website' || sourceDir.startsWith('website/')) {
        throw new Error(
          `Invalid source path "${sourceDir}". Source must be outside website folder.`,
        );
      }

      return {
        sourceDir,
        docDir,
        label: toTitleCase(path.basename(docDir || sourceDir)),
        position: index + 1,
      };
    });

  if (mappings.length === 0) {
    throw new Error('No mappings provided.');
  }

  return mappings;
}

function hashContent(content) {
  return createHash('sha256').update(content).digest('hex');
}

function labelForExt(ext) {
  if (ext === '.js') {
    return 'JavaScript';
  }
  if (ext === '.py') {
    return 'Python';
  }

  return (languageByExt[ext] || ext.replace('.', '') || 'Code').toUpperCase();
}

function mdxForSources(baseName, variants) {
  if (variants.length === 1) {
    const [only] = variants;
    return `---\ntitle: ${baseName}\n---\n\n# ${baseName}\n\n~~~${only.language}\n${only.source}\n~~~\n`;
  }

  const tabItems = variants
    .map((variant) => {
      const value = variant.label.toLowerCase();
      return `  <TabItem value="${value}" label="${variant.label}">\n\n~~~${variant.language}\n${variant.source}\n~~~\n\n  </TabItem>`;
    })
    .join('\n');

  return `---\ntitle: ${baseName}\n---\n\n# ${baseName}\n\nimport Tabs from '@theme/Tabs';\nimport TabItem from '@theme/TabItem';\n\n<Tabs>\n${tabItems}\n</Tabs>\n`;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(dirPath) {
  const entries = await fs.readdir(dirPath, {withFileTypes: true});
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (skippedDirs.has(entry.name)) {
        continue;
      }
      const nested = await collectFiles(path.join(dirPath, entry.name));
      files.push(...nested);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!allowedExtensions.has(ext)) {
      continue;
    }

    files.push(path.join(dirPath, entry.name));
  }

  return files;
}

async function ensureCategoryFiles(docsRoot, folderMappings, docsSubdir) {
  await fs.mkdir(docsRoot, {recursive: true});

  const rootCategoryPath = path.join(docsRoot, '_category_.json');
  if (!(await pathExists(rootCategoryPath))) {
    const rootLabel = toTitleCase(path.basename(normalizeRelativePath(docsSubdir)) || 'source-sync');
    const rootCategory = {
      label: rootLabel,
      position: 99,
      link: {
        type: 'generated-index',
        title: rootLabel,
        description: 'Auto-synced documentation from mapped source folders.',
        slug: `/${normalizeRelativePath(docsSubdir)}`,
      },
    };

    await fs.writeFile(rootCategoryPath, `${JSON.stringify(rootCategory, null, 2)}\n`, 'utf8');
  }

  const seenDocDirs = new Set();
  for (const folder of folderMappings) {
    if (!folder.docDir) {
      continue;
    }

    if (seenDocDirs.has(folder.docDir)) {
      continue;
    }
    seenDocDirs.add(folder.docDir);

    const categoryPath = path.join(docsRoot, folder.docDir, '_category_.json');
    await fs.mkdir(path.dirname(categoryPath), {recursive: true});

    if (!(await pathExists(categoryPath))) {
      const category = {
        label: folder.label,
        position: folder.position,
        link: {
          type: 'generated-index',
          title: folder.label,
        },
      };
      await fs.writeFile(categoryPath, `${JSON.stringify(category, null, 2)}\n`, 'utf8');
    }
  }
}

async function loadManifest() {
  const manifestPath = path.join(docsRoot, '.sync-manifest.json');
  if (!(await pathExists(manifestPath))) {
    return {files: {}};
  }

  const content = await fs.readFile(manifestPath, 'utf8');
  try {
    const parsed = JSON.parse(content);
    return parsed && parsed.files ? parsed : {files: {}};
  } catch {
    return {files: {}};
  }
}

let docsRoot;

async function main() {
  const docsSubdir =
    normalizeRelativePath(
      getArgValue('--docs-subdir') || process.env.SYNC_DOCS_SUBDIR || defaultDocsSubdir,
    ) || defaultDocsSubdir;

  const format = getArgValue('--format') || process.env.SYNC_FOLDER_FORMAT || defaultFormat;
  const folderMappings = parseFolderFormat(format);

  docsRoot = path.join(repoRoot, 'website', 'docs', docsSubdir);
  const manifestPath = path.join(docsRoot, '.sync-manifest.json');

  await ensureCategoryFiles(docsRoot, folderMappings, docsSubdir);

  const previous = await loadManifest();
  const next = {files: {}};

  let writtenCount = 0;
  let unchangedCount = 0;

  for (const folder of folderMappings) {
    const sourceRoot = path.join(repoRoot, folder.sourceDir);
    if (!(await pathExists(sourceRoot))) {
      continue;
    }

    const files = await collectFiles(sourceRoot);

    const docsByRelative = new Map();
    for (const absFile of files) {
      const relativePath = toPosix(path.relative(repoRoot, absFile));
      const relativeFromSource = toPosix(path.relative(sourceRoot, absFile));
      const sourceExt = path.extname(relativeFromSource).toLowerCase();
      const language = languageByExt[sourceExt] || '';
      const source = await fs.readFile(absFile, 'utf8');
      const sourceHash = hashContent(source);

      const relativeWithoutExt = sourceExt
        ? relativeFromSource.slice(0, -sourceExt.length)
        : relativeFromSource;
      const docRelative = `${toPosix(path.join(folder.docDir, relativeWithoutExt))}.mdx`;

      if (!docsByRelative.has(docRelative)) {
        docsByRelative.set(docRelative, {
          baseName: path.basename(relativeWithoutExt),
          variants: [],
        });
      }

      docsByRelative.get(docRelative).variants.push({
        relativePath,
        source,
        sourceHash,
        language,
        label: labelForExt(sourceExt),
      });
    }

    for (const [docRelative, doc] of docsByRelative.entries()) {
      const outFile = path.join(docsRoot, docRelative);
      const outDir = path.dirname(outFile);

      const variants = [...doc.variants].sort((a, b) => {
        const priority = {'Python': 1, 'JavaScript': 2};
        const pa = priority[a.label] || 99;
        const pb = priority[b.label] || 99;
        if (pa !== pb) {
          return pa - pb;
        }
        return a.relativePath.localeCompare(b.relativePath);
      });

      const docHash = hashContent(
        variants.map((variant) => `${variant.relativePath}:${variant.sourceHash}`).join('|'),
      );

      for (const variant of variants) {
        next.files[variant.relativePath] = {
          hash: docHash,
          docRelative,
        };
      }

      const unchanged =
        (await pathExists(outFile)) &&
        variants.every((variant) => previous.files[variant.relativePath]?.hash === docHash);

      if (unchanged) {
        unchangedCount += 1;
        continue;
      }

      await fs.mkdir(outDir, {recursive: true});
      await fs.writeFile(outFile, mdxForSources(doc.baseName, variants), 'utf8');
      writtenCount += 1;
    }
  }

  let removedCount = 0;
  const previousDocRelatives = new Set(
    Object.values(previous.files)
      .map((meta) => meta?.docRelative)
      .filter(Boolean),
  );
  const nextDocRelatives = new Set(
    Object.values(next.files)
      .map((meta) => meta?.docRelative)
      .filter(Boolean),
  );

  for (const docRelative of previousDocRelatives) {
    if (nextDocRelatives.has(docRelative)) {
      continue;
    }

    const stalePath = path.join(docsRoot, docRelative);
    if (await pathExists(stalePath)) {
      await fs.unlink(stalePath);
      removedCount += 1;
    }
  }

  await fs.writeFile(manifestPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');

  console.log(
    `Source doc sync complete. Updated: ${writtenCount}, removed: ${removedCount}, unchanged: ${unchangedCount}.`,
  );
  console.log(`Docs subdir: ${docsSubdir}`);
  console.log(`Format: ${format}`);
}

main().catch((error) => {
  console.error('Failed to sync source docs.');
  console.error(error);
  process.exitCode = 1;
});
