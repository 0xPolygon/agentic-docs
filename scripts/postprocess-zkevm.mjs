import fs from 'node:fs';
import path from 'node:path';

const repo = process.cwd();
const root = path.join(repo, 'content', 'docs', 'zkevm');

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

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(abs, out);
    else if (ent.isFile() && abs.endsWith('.mdx')) out.push(abs);
  }
  return out;
}

const files = walk(root);
let changed = 0;

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  const after = splitByFences(before)
    .map((p) => {
      if (p.type === 'code') return p.value;
      let t = p.value;

      // Undo placeholder-escaping that broke KaTeX/LaTeX commands:
      // \texttt`{foo}` -> \texttt{foo}
      t = t.replace(/\\([A-Za-z]+)`\{([^}]+)\}`/g, (m, cmd, inner) => `\\${cmd}{${inner}}`);

      // Normalize old relative image paths to public/ URLs.
      // Handles things like ../..//img/zkEVM/foo.png and ../../img/zkEVM/foo.png
      t = t.replace(/(?:\.\.\/)+\/+img\/zkEVM\//g, '/img/zkEVM/');
      t = t.replace(/(?:\.\.\/)+img\/zkEVM\//g, '/img/zkEVM/');
      t = t.replace(/(?:\.\.\/)+\/+img\/zkEVM\b/g, '/img/zkEVM');
      t = t.replace(/(?:\.\.\/)+img\/zkEVM\b/g, '/img/zkEVM');

      // Some zkEVM pages embed diagrams from the CDK image set.
      t = t.replace(/(?:\.\.\/)+\/+img\/cdk\//g, '/img/cdk/');
      t = t.replace(/(?:\.\.\/)+img\/cdk\//g, '/img/cdk/');
      t = t.replace(/(?:\.\.\/)+\/+img\/cdk\b/g, '/img/cdk');
      t = t.replace(/(?:\.\.\/)+img\/cdk\b/g, '/img/cdk');

      return t;
    })
    .join('');

  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed++;
  }
}

console.log(`Post-processed ${changed}/${files.length} zkEVM MDX files`);
