/**
 * DropZap — SEO Article Publisher
 *
 * Publishes the articles in seo-content/ to:
 *   - Dev.to      (full API — publishes immediately or as draft)
 *   - Medium.com  (Integration Token API — creates draft in your account)
 *   - HackMD.io   (API — creates a new note)
 *
 * For Substack, HubPages, Wattpad, Vocal, DZone, SlideServe, WriteupcaFe —
 * which have no usable public publishing API — this script prints the
 * formatted content to the console so you can copy-paste it.
 *
 * Usage:
 *   node scripts/seo-outreach/publish-articles.mjs [--platform=<name>] [--dry-run]
 *
 * Flags:
 *   --platform=devto|medium|hackmd|substack|hubpages|wattpad|vocal|dzone|slideserve|writeupcafe|all
 *   --dry-run   Print what would be published without actually posting
 *
 * Required env vars (set in .env.local or export before running):
 *   DEVTO_API_KEY              — from https://dev.to/settings/extensions
 *   MEDIUM_INTEGRATION_TOKEN   — from https://medium.com/me/settings (under Integration tokens)
 *   HACKMD_API_TOKEN           — from https://hackmd.io/settings#api (HackMD account → Settings → API)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { publishToGitHubGist } from './github-gists.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Load .env.local (Next.js convention) into process.env so this script can
// be run standalone with `node` without needing `dotenv` installed.
// ---------------------------------------------------------------------------
(function loadEnvLocal() {
  const envFile = path.join(__dirname, '../../.env.local');
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
})();

const CONTENT_DIR = path.join(__dirname, '../../seo-content');

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const platformArg = args.find(a => a.startsWith('--platform='))?.split('=')[1] ?? 'all';
const dryRun = args.includes('--dry-run');

if (dryRun) console.log('🔍 DRY RUN — no requests will be made.\n');

// ---------------------------------------------------------------------------
// Load all articles from seo-content/
// ---------------------------------------------------------------------------
function loadArticles() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  return files.map(file => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const meta = parseFrontmatter(raw);
    const body = raw.replace(/^---[\s\S]*?---\n/, '').trim();
    return { file, meta, body };
  });
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      let val = rest.join(':').trim();
      // Strip surrounding quotes
      val = val.replace(/^["']|["']$/g, '');
      // Parse arrays like ["a", "b"]
      if (val.startsWith('[')) {
        try { meta[key.trim()] = JSON.parse(val); } catch { meta[key.trim()] = val; }
      } else {
        meta[key.trim()] = val;
      }
    }
  }
  return meta;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Dev.to publisher  (with retry on 429 / "Retry later")
// ---------------------------------------------------------------------------
async function publishToDevTo(article, attempt = 1) {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) {
    console.error('❌ Dev.to: DEVTO_API_KEY not set. Get it from https://dev.to/settings/extensions');
    return;
  }

  const payload = {
    article: {
      title: article.meta.title,
      body_markdown: article.body,
      published: false, // creates as draft first — change to true to publish immediately
      tags: (article.meta.tags || []).slice(0, 4), // Dev.to max 4 tags
      canonical_url: article.meta.canonical_url || '',
    }
  };

  if (dryRun) {
    console.log(`[Dev.to DRY RUN] Would publish: "${article.meta.title}" (draft)`);
    return;
  }

  const res = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  // Dev.to returns "Retry later" plain text when rate limited
  if (!res.ok || text.startsWith('Retry')) {
    if (attempt <= 4) {
      const wait = attempt * 15_000; // 15s, 30s, 45s, 60s
      console.log(`  ⏳ Dev.to rate limited — waiting ${wait / 1000}s then retrying (attempt ${attempt}/4)...`);
      await sleep(wait);
      return publishToDevTo(article, attempt + 1);
    }
    console.error(`❌ Dev.to failed after 4 attempts: ${text.slice(0, 200)}`);
    return;
  }

  try {
    const data = JSON.parse(text);
    console.log(`✅ Dev.to draft created: ${data.url}`);
  } catch {
    console.error(`❌ Dev.to unexpected response: ${text.slice(0, 200)}`);
  }

  // Polite inter-request delay to avoid triggering rate limits on the next article
  await sleep(8_000);
}

// ---------------------------------------------------------------------------
// Medium publisher
// ---------------------------------------------------------------------------
async function publishToMedium(article) {
  const token = process.env.MEDIUM_INTEGRATION_TOKEN;
  if (!token) {
    console.error('❌ Medium: MEDIUM_INTEGRATION_TOKEN not set. Get it from https://medium.com/me/settings (Integration tokens section)');
    return;
  }

  // First get your Medium user ID
  const meRes = await fetch('https://api.medium.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meData = await meRes.json();
  if (!meRes.ok) {
    console.error(`❌ Medium auth error: ${JSON.stringify(meData)}`);
    return;
  }
  const userId = meData.data.id;

  const payload = {
    title: article.meta.title,
    contentFormat: 'markdown',
    content: article.body,
    tags: Array.isArray(article.meta.tags) ? article.meta.tags.slice(0, 5) : [],
    canonicalUrl: article.meta.canonical_url || '',
    publishStatus: 'draft', // 'draft' | 'public' | 'unlisted'
  };

  if (dryRun) {
    console.log(`[Medium DRY RUN] Would create draft: "${article.meta.title}" for user ${userId}`);
    return;
  }

  const res = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (res.ok) {
    console.log(`✅ Medium draft created: ${data.data.url}`);
  } else {
    console.error(`❌ Medium error: ${JSON.stringify(data)}`);
  }
}

// ---------------------------------------------------------------------------
// HackMD publisher
// ---------------------------------------------------------------------------
async function publishToHackMD(article) {
  const token = process.env.HACKMD_API_TOKEN;
  if (!token) {
    console.error('❌ HackMD: HACKMD_API_TOKEN not set. Get it from https://hackmd.io/settings#api');
    return;
  }

  const payload = {
    title: article.meta.title,
    content: article.body,
    readPermission: 'guest',   // 'owner' | 'signed_in' | 'guest'
    writePermission: 'owner',
    commentPermission: 'everyone',
  };

  if (dryRun) {
    console.log(`[HackMD DRY RUN] Would create note: "${article.meta.title}"`);
    return;
  }

  const res = await fetch('https://api.hackmd.io/v1/notes', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (res.ok) {
    console.log(`✅ HackMD note created: https://hackmd.io/${data.id}`);
  } else {
    console.error(`❌ HackMD error: ${JSON.stringify(data)}`);
  }
}

// ---------------------------------------------------------------------------
// Manual-only platforms — print formatted content for copy-paste
// ---------------------------------------------------------------------------
function printManualInstructions(platform, article) {
  const urls = {
    medium: 'https://medium.com/new-story — Click "Write", paste title + content',
    substack: 'https://substack.com/publish/post/new — New post → paste content',
    hubpages: 'https://hubpages.com/hub/new — Create hub → paste into editor',
    wattpad: 'https://www.wattpad.com/myworks/new — New story → paste content',
    vocal: 'https://vocal.media/dashboard/story/new — Create story → paste content',
    dzone: 'https://dzone.com/articles/new — Submit article → paste content',
    slideserve: 'https://www.slideserve.com/upload — Upload as PDF or paste slide text',
    writeupcafe: 'https://writeupcafe.com/write — Write article → paste content',
  };

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📋 MANUAL POST REQUIRED — ${platform.toUpperCase()}`);
  console.log(`${'='.repeat(70)}`);
  console.log(`URL: ${urls[platform] || platform}`);
  console.log(`Title: ${article.meta.title}`);
  if (article.meta.tags) console.log(`Tags: ${Array.isArray(article.meta.tags) ? article.meta.tags.join(', ') : article.meta.tags}`);
  console.log(`\n--- CONTENT START ---\n`);
  console.log(article.body);
  console.log(`\n--- CONTENT END ---\n`);
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------
async function main() {
  const articles = loadArticles();
  console.log(`📄 Found ${articles.length} articles in seo-content/\n`);

  for (const article of articles) {
    // Support both `platform: "devto"` (single) and `platforms: ["devto","hackmd"]` (array)
    const rawPlatform = article.meta.platform;
    const rawPlatforms = article.meta.platforms;
    let targets = [];
    if (Array.isArray(rawPlatforms)) targets = rawPlatforms;
    else if (rawPlatform) targets = [rawPlatform];

    if (targets.length === 0) continue;

    for (const platform of targets) {
      // Filter by --platform flag if specified
      if (platformArg !== 'all' && platform !== platformArg) continue;

      console.log(`\n▶ [${platform}] ${article.meta.title}`);

      switch (platform) {
        case 'medium':
          printManualInstructions('medium', article);
          break;
        case 'devto':
          await publishToDevTo(article);
          break;
        case 'hackmd':
          await publishToHackMD(article);
          break;
        case 'github':
          await publishToGitHubGist(article, dryRun);
          break;
        case 'substack':
        case 'hubpages':
        case 'wattpad':
        case 'vocal':
        case 'dzone':
        case 'slideserve':
        case 'writeupcafe':
          printManualInstructions(platform, article);
          break;
        default:
          console.log(`⚠️  Unknown platform: ${platform} — skipping`);
      }
    }
  }

  console.log('\n✅ Done. Review any drafts before publishing live.\n');
  console.log('💡 Tip: Run with --dry-run first to preview without posting.');
}

main().catch(console.error);
