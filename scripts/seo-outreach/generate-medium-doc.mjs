/**
 * Generates a single styled HTML document from all Medium-targeted articles.
 * Open the output in Chrome → Ctrl+P → Save as PDF.
 *
 * Usage: node scripts/seo-outreach/generate-medium-doc.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, '../../seo-content');
const OUTPUT = path.join(CONTENT_DIR, 'Medium-Articles-All.html');

// ---------------------------------------------------------------------------
// Parse frontmatter
// ---------------------------------------------------------------------------
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { meta: {}, body: raw.trim() };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const eqIdx = line.indexOf(':');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (val.startsWith('[')) {
      try { meta[key] = JSON.parse(val); } catch { meta[key] = val; }
    } else {
      meta[key] = val;
    }
  }
  const body = raw.replace(/^---[\s\S]*?---\n/, '').trim();
  return { meta, body };
}

// ---------------------------------------------------------------------------
// Minimal Markdown → HTML converter (covers everything used in these articles)
// ---------------------------------------------------------------------------
function mdToHtml(md) {
  let html = md;

  // Escape HTML entities first (before we add tags)
  html = html.replace(/&(?!amp;|lt;|gt;|quot;)/g, '&amp;');

  // Fenced code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code class="language-${lang}">${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Tables
  html = html.replace(/\n(\|.+\|\n)((?:\|.+\|\n)*)/g, (_, header, rows) => {
    const parseRow = (row) =>
      row.trim().split('|').filter((_, i, a) => i > 0 && i < a.length - 1)
        .map(c => c.trim());
    const headers = parseRow(header);
    const rowLines = rows.trim().split('\n').filter(r => !r.match(/^[\s|:-]+$/));
    let table = '<table><thead><tr>' +
      headers.map(h => `<th>${h}</th>`).join('') +
      '</tr></thead><tbody>';
    for (const row of rowLines) {
      table += '<tr>' + parseRow(row).map(c => `<td>${c}</td>`).join('') + '</tr>';
    }
    table += '</tbody></table>';
    return '\n' + table + '\n';
  });

  // HR
  html = html.replace(/^---+$/gm, '<hr>');

  // Headings
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold + italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Unordered lists
  html = html.replace(/((?:^- .+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l => `<li>${l.replace(/^- /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  // Paragraphs (lines not already wrapped in a block element)
  const blockTags = ['<h1', '<h2', '<h3', '<h4', '<ul', '<ol', '<li', '<table', '<pre', '<hr', '<blockquote'];
  html = html.split('\n\n').map(chunk => {
    chunk = chunk.trim();
    if (!chunk) return '';
    if (blockTags.some(t => chunk.startsWith(t))) return chunk;
    return `<p>${chunk.replace(/\n/g, ' ')}</p>`;
  }).join('\n');

  return html;
}

// ---------------------------------------------------------------------------
// Load Medium-targeted articles
// ---------------------------------------------------------------------------
function loadMediumArticles() {
  return fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(file => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
      return { file, ...parseFrontmatter(raw) };
    })
    .filter(({ meta }) => {
      if (meta.platform === 'medium') return true;
      if (Array.isArray(meta.platforms) && meta.platforms.includes('medium')) return true;
      return false;
    });
}

// ---------------------------------------------------------------------------
// Build HTML document
// ---------------------------------------------------------------------------
const articles = loadMediumArticles();
console.log(`Found ${articles.length} Medium articles.`);

const articleHtml = articles.map((a, i) => `
  <div class="article" id="article-${i + 1}">
    <div class="article-meta">
      <span class="article-num">Article ${i + 1} of ${articles.length}</span>
      <span class="article-tags">${(Array.isArray(a.meta.tags) ? a.meta.tags : (a.meta.tags || '').split(',')).map(t => `<span class="tag">${t.trim()}</span>`).join(' ')}</span>
    </div>
    ${mdToHtml(a.body)}
    <div class="copy-instructions">
      <strong>📋 Post to Medium:</strong> Go to <a href="https://medium.com/new-story">medium.com/new-story</a>
      → Click in the title area → Type the title above → Click below → Paste the article body.
      Add tags: <code>${(Array.isArray(a.meta.tags) ? a.meta.tags : (a.meta.tags || '').split(',')).join(', ')}</code>
    </div>
    <div class="page-break"></div>
  </div>
`).join('\n');

const toc = articles.map((a, i) =>
  `<li><a href="#article-${i + 1}">${a.meta.title}</a></li>`
).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DropZap — Medium Articles (${articles.length} posts)</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.7; color: #1a1a1a; background: #fff; max-width: 780px; margin: 0 auto; padding: 40px 24px; }
  h1 { font-size: 2em; margin: 0.8em 0 0.4em; line-height: 1.25; }
  h2 { font-size: 1.45em; margin: 1.4em 0 0.5em; border-bottom: 2px solid #f0f0f0; padding-bottom: 4px; }
  h3 { font-size: 1.2em; margin: 1.2em 0 0.4em; }
  h4 { font-size: 1.05em; margin: 1em 0 0.4em; }
  p { margin: 0.9em 0; }
  a { color: #1a8917; }
  strong { font-weight: 700; }
  em { font-style: italic; }
  code { font-family: 'Courier New', monospace; font-size: 0.88em; background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
  pre { background: #f4f4f4; border-left: 4px solid #ccc; padding: 16px; overflow-x: auto; margin: 1.2em 0; border-radius: 4px; }
  pre code { background: none; padding: 0; font-size: 0.85em; }
  ul, ol { padding-left: 1.8em; margin: 0.8em 0; }
  li { margin: 0.3em 0; }
  hr { border: none; border-top: 2px solid #eee; margin: 2em 0; }
  table { border-collapse: collapse; width: 100%; margin: 1.2em 0; font-size: 0.92em; }
  th { background: #f4f4f4; font-weight: 700; text-align: left; padding: 8px 12px; border: 1px solid #ddd; }
  td { padding: 7px 12px; border: 1px solid #ddd; }
  tr:nth-child(even) td { background: #fafafa; }

  /* Cover page */
  .cover { text-align: center; padding: 60px 0 40px; border-bottom: 3px solid #1a8917; margin-bottom: 40px; }
  .cover h1 { font-size: 2.4em; color: #1a8917; }
  .cover p { color: #666; margin-top: 10px; font-size: 1.05em; }
  .cover .site { font-size: 1.1em; font-weight: bold; margin-top: 16px; }

  /* TOC */
  .toc { background: #f9f9f9; border: 1px solid #eee; border-radius: 6px; padding: 24px 32px; margin-bottom: 40px; }
  .toc h2 { border: none; margin-top: 0; color: #1a8917; }
  .toc ol { counter-reset: toc; padding-left: 1.4em; }
  .toc li { margin: 6px 0; font-size: 0.97em; }
  .toc a { text-decoration: none; color: #333; }
  .toc a:hover { color: #1a8917; text-decoration: underline; }

  /* Article container */
  .article { margin-bottom: 20px; }
  .article-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
  .article-num { font-size: 0.78em; font-family: sans-serif; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .tag { font-size: 0.75em; font-family: sans-serif; background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 20px; font-weight: 600; }

  /* Copy instructions box */
  .copy-instructions { background: #fff8e1; border: 1px solid #ffe082; border-radius: 6px; padding: 14px 18px; margin: 28px 0 16px; font-family: sans-serif; font-size: 0.88em; line-height: 1.5; }
  .copy-instructions strong { color: #e65100; }

  /* Page break for print */
  .page-break { page-break-after: always; height: 1px; }

  @media print {
    body { padding: 0; max-width: 100%; font-size: 13px; }
    .page-break { page-break-after: always; }
    .copy-instructions { border: 1px solid #aaa; background: #fffde7; }
    a { color: #1a8917; }
    pre { font-size: 11px; }
  }
</style>
</head>
<body>

<div class="cover">
  <h1>DropZap — Medium Articles</h1>
  <p>${articles.length} ready-to-post articles for <strong>medium.com</strong></p>
  <p class="site">dropzap.digital · Instagram &amp; TikTok Downloader</p>
  <p style="color:#999;font-size:0.85em;margin-top:8px;">Generated ${new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</p>
</div>

<div class="toc">
  <h2>📋 Table of Contents</h2>
  <ol>${toc}</ol>
</div>

${articleHtml}

</body>
</html>`;

fs.writeFileSync(OUTPUT, html, 'utf-8');
console.log(`\n✅ HTML document saved to:\n   ${OUTPUT}`);
console.log('\n📌 How to create PDF:');
console.log('   1. Open the file in Chrome');
console.log('   2. Press Ctrl+P (or Cmd+P on Mac)');
console.log('   3. Set "Destination" to "Save as PDF"');
console.log('   4. Click Save\n');
