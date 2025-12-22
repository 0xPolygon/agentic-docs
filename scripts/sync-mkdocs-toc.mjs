import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

/**
 * Syncs docs ordering + titles from old-docs/mkdocs.yml.
 *
 * What it does:
 * - Reads mkdocs.yml nav
 * - For each internal markdown page reference (pos/, zkEVM/, tools/, security/):
 *   - updates the corresponding MDX frontmatter `title` to match the nav label
 *   - updates/creates meta.json in each folder to match the nav-derived ordering
 *
 * What it does NOT do:
 * - Attempt to represent MkDocs "group headings" (Fumadocs meta.json only supports string entries)
 * - Add external links to sidebar
 */

const repoRoot = process.cwd();
const mkdocsPath = path.join(repoRoot, 'old-docs', 'mkdocs.yml');
const docsRoot = path.join(repoRoot, 'content', 'docs');

const WRITE = process.argv.includes('--write');
const QUIET = process.argv.includes('--quiet');

function log(...args) {
  if (!QUIET) console.log(...args);
}

/** @typedef {{ title: string, oldPath: string }} PageRef */

function isHttpUrl(s) {
  return typeof s === 'string' && /^https?:\/\//i.test(s);
}

function isMarkdownFile(s) {
  return typeof s === 'string' && (s.endsWith('.md') || s.endsWith('.mdx'));
}

/**
 * Map a mkdocs path (relative to old-docs/docs) to a new docs path (relative to content/docs).
 * Returns null for unsupported paths.
 */
function mapOldToNewRel(oldRel) {
  if (!oldRel || typeof oldRel !== 'string') return null;
  if (isHttpUrl(oldRel)) return null;
  if (!isMarkdownFile(oldRel)) return null;

  // Ignore top-level home
  if (oldRel === 'index.md') return null;

  // Context root folders
  if (oldRel.startsWith('pos/')) return oldRel.replace(/\.mdx?$/, '.mdx');

  if (oldRel.startsWith('zkEVM/')) {
    // Old docs use capitalized directory; new uses `zkevm`
    return ('zkevm/' + oldRel.slice('zkEVM/'.length)).replace(/\.mdx?$/, '.mdx');
  }

  if (oldRel.startsWith('tools/')) return oldRel.replace(/\.mdx?$/, '.mdx');

  // Old security content lived under security/security/*
  if (oldRel.startsWith('security/security/')) {
    return ('security/' + oldRel.slice('security/security/'.length)).replace(
      /\.mdx?$/,
      '.mdx',
    );
  }

  return null;
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function ensureDir(p) {
  if (!exists(p)) fs.mkdirSync(p, { recursive: true });
}

function readUtf8(p) {
  return fs.readFileSync(p, 'utf8');
}

function writeUtf8(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, 'utf8');
}

function parseFrontmatter(mdx) {
  if (!mdx.startsWith('---\n')) return { data: null, body: mdx };
  const end = mdx.indexOf('\n---\n', 4);
  if (end === -1) return { data: null, body: mdx };
  const fmRaw = mdx.slice(4, end + 1); // include trailing newline for YAML parser
  const body = mdx.slice(end + '\n---\n'.length);
  try {
    const data = YAML.parse(fmRaw);
    return { data: data ?? {}, body };
  } catch {
    return { data: null, body: mdx };
  }
}

function formatFrontmatter(data, body) {
  const fm = YAML.stringify(data ?? {}).trimEnd();
  return `---\n${fm}\n---\n\n${body.replace(/^\n+/, '')}`;
}

/**
 * Walk mkdocs nav and return PageRef[] in the order they appear.
 *
 * `node` can be:
 * - string (path or url)
 * - array of nodes
 * - object { "Title": <node> }
 */
function flattenNav(node, currentTitle = null, out = []) {
  if (Array.isArray(node)) {
    for (const item of node) flattenNav(item, currentTitle, out);
    return out;
  }

  if (typeof node === 'string') {
    if (currentTitle && typeof currentTitle === 'string') {
      out.push({ title: currentTitle, oldPath: node });
    }
    return out;
  }

  if (node && typeof node === 'object') {
    for (const [title, value] of Object.entries(node)) {
      flattenNav(value, title, out);
    }
    return out;
  }

  return out;
}

/**
 * Given a relative file path like `pos/how-to/bridging/x.mdx`, add ordering entries
 * for every parent directory: parent -> child (file slug or folder name).
 */
function addOrder(orderMap, relFile) {
  const parts = relFile.split('/').filter(Boolean);
  if (parts.length < 2) return;

  const file = parts[parts.length - 1];
  const isIndex = file.toLowerCase() === 'index.mdx';
  const fileSlug = file.replace(/\.mdx$/, '');

  // For each parent folder (including context root), insert the immediate child.
  for (let i = 0; i < parts.length - 1; i++) {
    const folder = parts.slice(0, i + 1).join('/');
    const childPart = parts[i + 1];
    const child = i === parts.length - 2 ? fileSlug : childPart;

    // We generally want index pages to be listed as "index" (slug) not file name.
    const childId = i === parts.length - 2 && isIndex ? 'index' : child;

    if (!orderMap.has(folder)) orderMap.set(folder, []);
    const arr = orderMap.get(folder);
    if (!arr.includes(childId)) arr.push(childId);
  }
}

function sortByOrder(existingChildren, desiredOrder) {
  const desiredIdx = new Map(desiredOrder.map((v, i) => [v, i]));
  const max = desiredOrder.length + 1000;
  return [...existingChildren].sort((a, b) => {
    const ai = desiredIdx.has(a) ? desiredIdx.get(a) : max;
    const bi = desiredIdx.has(b) ? desiredIdx.get(b) : max;
    if (ai !== bi) return ai - bi;
    return a.localeCompare(b);
  });
}

function loadMetaJson(metaPath) {
  if (!exists(metaPath)) return null;
  try {
    return JSON.parse(readUtf8(metaPath));
  } catch {
    return null;
  }
}

function writeMetaJson(metaPath, meta) {
  const formatted = JSON.stringify(meta, null, 2) + '\n';
  if (WRITE) writeUtf8(metaPath, formatted);
}

function main() {
  if (!exists(mkdocsPath)) {
    console.error(`Missing ${mkdocsPath}`);
    process.exit(1);
  }

  const mk = YAML.parse(readUtf8(mkdocsPath));
  const nav = mk?.nav;
  if (!Array.isArray(nav)) {
    console.error('mkdocs.yml: nav is missing or not an array');
    process.exit(1);
  }

  /** @type {PageRef[]} */
  const refs = flattenNav(nav);

  // 1) Build mapping old->new and collect ordering
  /** @type {Map<string, string>} */
  const titleByNewRel = new Map();
  /** @type {Map<string, string[]>} */
  const orderMap = new Map();

  const missingNewFiles = [];

  for (const { title, oldPath } of refs) {
    const newRel = mapOldToNewRel(oldPath);
    if (!newRel) continue;

    const newAbs = path.join(docsRoot, newRel);
    if (!exists(newAbs)) {
      missingNewFiles.push({ oldPath, newRel, title });
      continue;
    }

    // Store title for that file path
    titleByNewRel.set(newRel, title);
    addOrder(orderMap, newRel);
  }

  // 2) Update MDX titles
  let changedTitles = 0;
  for (const [newRel, title] of titleByNewRel) {
    const abs = path.join(docsRoot, newRel);
    const before = readUtf8(abs);
    const { data, body } = parseFrontmatter(before);
    if (data == null) {
      // If frontmatter is malformed, skip — we don't want to destroy content.
      continue;
    }
    const prevTitle = data.title;
    if (prevTitle === title) continue;

    const next = formatFrontmatter({ ...data, title }, body);
    if (next !== before) {
      changedTitles++;
      if (WRITE) writeUtf8(abs, next);
    }
  }

  // 3) Update meta.json ordering (folders referenced by nav)
  let changedMeta = 0;
  for (const [folderRel, desiredOrder] of orderMap) {
    const folderAbs = path.join(docsRoot, folderRel);
    if (!exists(folderAbs) || !fs.statSync(folderAbs).isDirectory()) continue;

    const metaPath = path.join(folderAbs, 'meta.json');
    const existing = loadMetaJson(metaPath) ?? {};

    // Determine current children that exist (folders + mdx files) and appear in desiredOrder
    const dirents = fs.readdirSync(folderAbs, { withFileTypes: true });
    const children = [];
    for (const d of dirents) {
      if (d.name === 'meta.json') continue;
      if (d.isDirectory()) children.push(d.name);
      if (d.isFile() && d.name.endsWith('.mdx')) {
        children.push(d.name.replace(/\.mdx$/, ''));
      }
    }

    // Only keep items that are in desiredOrder (strict sync). This prevents "extra" new pages
    // from appearing in the sidebar order when they don't exist in MkDocs nav.
    const desiredSet = new Set(desiredOrder);
    const filtered = children.filter((c) => desiredSet.has(c));

    const pages = sortByOrder(filtered, desiredOrder);

    // If nothing in this folder is referenced, don't touch.
    if (pages.length === 0) continue;

    const nextMeta = {
      ...existing,
      pages,
    };

    const beforeStr = exists(metaPath) ? readUtf8(metaPath) : null;
    const nextStr = JSON.stringify(nextMeta, null, 2) + '\n';
    if (beforeStr !== nextStr) {
      changedMeta++;
      writeMetaJson(metaPath, nextMeta);
    }
  }

  // 4) Root context titles: align to mkdocs section names where possible.
  // We do a simple mapping based on top-level keys.
  const contextTitles = new Map([
    ['pos', 'PoS'],
    ['zkevm', 'zkEVM'],
    ['tools', 'Developer Tools'],
    ['security', 'Security'],
  ]);

  let changedContextMeta = 0;
  for (const [ctx, title] of contextTitles) {
    const metaPath = path.join(docsRoot, ctx, 'meta.json');
    if (!exists(metaPath)) continue;
    const meta = loadMetaJson(metaPath);
    if (!meta) continue;
    if (meta.title === title) continue;

    const next = { ...meta, title };
    const beforeStr = readUtf8(metaPath);
    const nextStr = JSON.stringify(next, null, 2) + '\n';
    if (beforeStr !== nextStr) {
      changedContextMeta++;
      if (WRITE) writeUtf8(metaPath, nextStr);
    }
  }

  // Report
  log(`WRITE=${WRITE ? 'yes' : 'no'}`);
  log(`Updated MDX titles: ${changedTitles}`);
  log(`Updated meta.json pages: ${changedMeta}`);
  log(`Updated context titles: ${changedContextMeta}`);

  if (missingNewFiles.length) {
    log(`Missing mapped files (${missingNewFiles.length}):`);
    for (const m of missingNewFiles.slice(0, 50)) {
      log(`- ${m.oldPath} -> ${m.newRel} (${m.title})`);
    }
    if (missingNewFiles.length > 50) log(`... and ${missingNewFiles.length - 50} more`);
  }
}

main();

