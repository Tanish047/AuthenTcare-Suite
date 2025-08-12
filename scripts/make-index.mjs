// scripts/make-index.mjs
//
// This script generates a clickable markdown index (INDEX.md) of every tracked
// file in the repository. It walks the directory tree, filters out
// common build/output directories (like node_modules, dist, etc.) and
// system junk files, then writes a simple list of links pointing back to
// the files themselves. Running this script will overwrite any existing
// INDEX.md file in the project root.

import { promises as fs } from 'fs';
import path from 'path';

// Directory to scan; default to the current working directory when the
// script is invoked. You can pass an alternative root path as the first
// CLI argument.
const ROOT = process.argv[2] || '.';

// Directories we want to skip when indexing. These are typically
// auto‑generated or external to the application source.
const IGNORE_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
  '.turbo',
  '.cache',
  '.vscode'
]);

// Files we want to skip; includes OS and editor artifacts.
const IGNORE_FILES = new Set(['.DS_Store']);

// Encode a path for use in a markdown link. Splits on path separators and
// URL‑encodes each segment so spaces and special characters render correctly.
function enc(filePath) {
  return filePath.split(path.sep).map(encodeURIComponent).join('/');
}

// Async generator that yields file paths relative to the root. It sorts
// directories before files to produce a stable ordering across runs.
async function* walk(dir, prefix = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  // Sort directories before files and alphabetically within each group
  entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        yield* walk(fullPath, relPath);
      }
    } else {
      if (!IGNORE_FILES.has(entry.name)) {
        yield relPath;
      }
    }
  }
}

async function buildIndex() {
  const absoluteRoot = path.resolve(ROOT);
  const files = [];
  for await (const f of walk(absoluteRoot)) {
    files.push(f);
  }
  const headerLines = [
    '# Repository File Index',
    '',
    `Generated on ${new Date().toISOString()}`,
    ''
  ];
  const bodyLines = files.map(f => `- [${f}](${enc(f)})`);
  const content = [...headerLines, ...bodyLines].join('\n');
  const outPath = path.join(absoluteRoot, 'INDEX.md');
  await fs.writeFile(outPath, content);
  console.log(`Wrote INDEX.md with ${files.length} files.`);
}

buildIndex().catch((err) => {
  console.error(err);
  process.exit(1);
});
