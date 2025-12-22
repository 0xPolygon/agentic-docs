import fs from 'node:fs';
import path from 'node:path';

const repo = process.cwd();
const srcRoot = path.join(repo, 'old-docs', 'docs', 'zkEVM');
const destRoot = path.join(repo, 'content', 'docs', 'zkevm');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function stripFrontmatter(s) {
  if (!s.startsWith('---')) return { frontmatter: '', body: s };
  const end = s.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: '', body: s };
  const after = s.indexOf('\n', end + 4);
  return { frontmatter: s.slice(0, after + 1), body: s.slice(after + 1) };
}

function titleFromFrontmatter(fm) {
  const m = fm.match(/^title:\s*(.+)$/m);
  if (!m) return null;
  return m[1].trim().replace(/^['\"]|['\"]$/g, '');
}

function titleize(slug) {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\bLxLy\b/g, 'LxLy')
    .replace(/\bzkEVM\b/g, 'zkEVM')
    .replace(/\bZkEVM\b/g, 'zkEVM')
    .replace(/\bEVM\b/g, 'EVM')
    .replace(/\bRPC\b/g, 'RPC')
    .replace(/\bPIL\b/g, 'PIL')
    .replace(/\bzkASM\b/g, 'zkASM')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
}

function extractTitleAndBody(raw, fallbackTitle) {
  const { frontmatter, body: body0 } = stripFrontmatter(raw);
  const fmTitle = titleFromFrontmatter(frontmatter);
  let body = body0;

  // Remove leading HTML style blocks (common in old landing pages)
  body = body.replace(/^\s*<style>[\s\S]*?<\/style>\s*/m, '');

  // Title from first H1
  const h1 = body.match(/^#\s+(.+)\s*$/m);
  const title = fmTitle || (h1 ? h1[1].trim() : fallbackTitle);
  if (h1) {
    body = body.replace(h1[0], '').replace(/^\s*\n/, '');
  }

  return { title, body };
}

function inferDescription(body) {
  const cleaned = body
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return '';
  return cleaned.slice(0, 160);
}

function splitByFences(s) {
  const parts = [];
  const re = /^```.*$[\s\S]*?^```\s*$/gm;
  let last = 0;
  let m;
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push({ type: 'text', value: s.slice(last, m.index) });
    parts.push({ type: 'code', value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < s.length) parts.push({ type: 'text', value: s.slice(last) });
  return parts;
}

function removeHtmlComments(s) {
  return s.replace(/<!--([\s\S]*?)-->/g, '');
}

function fixHtmlAttrsOutsideCode(s) {
  return splitByFences(s)
    .map((p) => {
      if (p.type === 'code') return p.value;
      let t = p.value;

      // JSX doesn't accept style="..." strings
      t = t.replace(/\sstyle=\"[^\"]*\"/g, '');
      t = t.replace(/\sstyle=\'[^\']*\'/g, '');

      // class -> className
      t = t.replace(/\bclass=\"/g, 'className="');
      t = t.replace(/\bclass=\'/g, "className='");

      // Self-close void elements in JSX
      t = t.replace(/<img\b([^>]*?)>/g, (full, attrs) => (full.endsWith('/>') ? full : `<img${attrs} />`));
      t = t.replace(/<embed\b([^>]*?)>/g, (full, attrs) => (full.endsWith('/>') ? full : `<embed${attrs} />`));

      // Normalize a few common void tags
      t = t.replace(/<br\s*>/g, '<br />');
      t = t.replace(/<br\s*\/\s*>/g, '<br />');
      t = t.replace(/<\/br\s*>/g, '<br />');
      t = t.replace(/<hr\s*>/g, '<hr />');

      return t;
    })
    .join('');
}

function normalizeFenceLang(s) {
  return s.replace(/^```(\w+)/gm, (m, lang) => {
    const map = {
      golang: 'go',
      curl: 'bash',
      shell: 'bash',
      console: 'bash',
      plaintext: 'text',
    };
    return '```' + (map[lang] || lang);
  });
}

function convertWidthAttrs(s) {
  // ![alt](url){width=400px}
  return s.replace(/!\[([^\]]*)\]\(([^)]+)\)\{\s*width\s*=\s*([^}]+)\s*\}/g, (m, alt, url, w) => {
    const width = w.trim().replace(/^['\"]|['\"]$/g, '');
    return `<img src=\"${url}\" alt=\"${alt}\" maxWidth=\"${width}\" />`;
  });
}

function fixImagePaths(s) {
  // normalize references to old img/zkEVM folder
  return s
    .replace(/\.{1,8}\/img\/zkEVM\//g, '/img/zkEVM/')
    .replace(/\.{1,8}\/img\/zkEVM\b/g, '/img/zkEVM');
}

function fixContextLinks(s) {
  // Turn links like ../zkEVM/... or ../../zkEVM/... into /zkevm/...
  return s
    .replace(/\]\((?:\.\.\/)+zkEVM\//g, '](/zkevm/')
    .replace(/\]\((?:\.\.\/)+zkevm\//g, '](/zkevm/');
}

function stripMdExtFromLinks(s) {
  return s.replace(/\]\(([^)]+?)\.md(#[^)]+)?\)/g, (m, url, hash) => {
    if (/^https?:\/\//.test(url)) return m;
    return `](${url}${hash || ''})`;
  });
}

function escapeBracePlaceholders(s) {
  const parts = splitByFences(s);
  return parts
    .map((p) => {
      if (p.type === 'code') return p.value;
      return p.value.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (m) => `\`${m}\``);
    })
    .join('');
}

function convertMkDocsAdmonitions(s) {
  const lines = s.split(/\r?\n/);
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^\s*!!!\s+(\w+)(?:\s+\"([^\"]+)\")?\s*$/);
    if (!m) {
      out.push(line);
      continue;
    }

    const rawType = m[1].toLowerCase();
    const title = m[2] || '';
    const typeMap = {
      note: 'info',
      info: 'info',
      tip: 'tip',
      warning: 'warn',
      danger: 'error',
      important: 'warn',
      caution: 'warn',
      success: 'success',
      example: 'info',
      idea: 'idea',
    };
    const type = typeMap[rawType] || 'info';

    // collect indented content
    const content = [];
    i++;
    while (i < lines.length && (lines[i].startsWith('    ') || lines[i].trim() === '')) {
      const l = lines[i];
      content.push(l.startsWith('    ') ? l.slice(4) : l);
      i++;
    }
    i--; // step back because for-loop increments

    out.push(`<Callout type=\"${type}\"${title ? ` title=\"${title.replace(/\"/g, '\\\"')}\"` : ''}>`);
    out.push('');
    out.push(...content);
    out.push('');
    out.push('</Callout>');
    out.push('');
  }

  return out.join('\n');
}

function writeMdx(destPath, title, description, body) {
  const fm = `---\ntitle: \"${title.replace(/\"/g, '\\\"')}\"\ndescription: \"${description.replace(/\"/g, '\\\"')}\"\n---\n\n`;
  ensureDir(path.dirname(destPath));
  fs.writeFileSync(destPath, fm + body.trim() + '\n', 'utf8');
}

function migrateMarkdownFile(absPath, relPath) {
  const raw = fs.readFileSync(absPath, 'utf8');
  const baseTitle = titleize(path.basename(absPath, '.md'));
  let { title, body } = extractTitleAndBody(raw, baseTitle);

  body = removeHtmlComments(body);
  body = normalizeFenceLang(body);
  body = convertMkDocsAdmonitions(body);
  body = convertWidthAttrs(body);
  body = fixImagePaths(body);
  body = fixContextLinks(body);
  body = stripMdExtFromLinks(body);
  body = fixHtmlAttrsOutsideCode(body);
  body = escapeBracePlaceholders(body);

  const description = inferDescription(body) || title;

  const outRel = relPath.replace(/\.md$/i, '.mdx');
  const destPath = path.join(destRoot, outRel);
  writeMdx(destPath, title, description, body);
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    const rel = path.relative(srcRoot, abs).split(path.sep).join('/');

    if (ent.isDirectory()) {
      walk(abs);
      continue;
    }

    if (!ent.isFile()) continue;
    if (path.extname(ent.name).toLowerCase() !== '.md') continue;

    // Skip the old HTML-heavy landing page; we'll provide a new index.mdx.
    if (rel === 'index.md') continue;

    migrateMarkdownFile(abs, rel);
  }
}

ensureDir(destRoot);
walk(srcRoot);
console.log(`Migrated zkEVM markdown to ${destRoot}`);
