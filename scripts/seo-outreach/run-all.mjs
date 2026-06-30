/**
 * DropZap — Master SEO Backlink Automation Script
 *
 * Runs ALL backlink publishers in a coordinated sequence:
 *
 *  Platform          DA   Method
 *  ─────────────────────────────────────────────────────────────────────
 *  GitHub Gists      96   REST API   → GITHUB_GIST_TOKEN
 *  DEV.to            93   REST API   → DEVTO_API_KEY
 *  Medium            93   REST API   → MEDIUM_INTEGRATION_TOKEN
 *  HackMD            91   REST API   → HACKMD_API_TOKEN
 *  Diigo             92   REST API   → DIIGO_USERNAME + DIIGO_API_KEY
 *  Reddit            91   OAuth 2.0  → REDDIT_* (4 vars)
 *  Tumblr            75   OAuth 1.0a → TUMBLR_* (5 vars)
 *
 * Usage:
 *   node scripts/seo-outreach/run-all.mjs [--dry-run] [--only=<platform>]
 *
 * Flags:
 *   --dry-run         Simulate everything without posting
 *   --only=github     Run only GitHub Gists
 *   --only=devto      Run only DEV.to
 *   --only=medium     Run only Medium
 *   --only=hackmd     Run only HackMD
 *   --only=diigo      Run only Diigo bookmarks
 *   --only=reddit     Run only Reddit poster
 *   --only=tumblr     Run only Tumblr
 *   --only=articles   Run only DEV.to + Medium + HackMD (original publish-articles.mjs)
 *
 * Set env vars in .env.local (dev) or GitHub Actions / Render secrets (CI/prod).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── load .env.local ────────────────────────────────────────────────────────
(function loadEnv() {
  const envFile = path.join(__dirname, "../../.env.local");
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
})();

// ─── imports ────────────────────────────────────────────────────────────────
import { publishAllGists } from "./github-gists.mjs";
import { publishAllTumblr } from "./tumblr.mjs";
import { runDiigoBookmarks } from "./diigo.mjs";
import { runRedditPoster } from "./reddit-poster.mjs";

// ─── article loader (same as publish-articles.mjs) ──────────────────────────
const CONTENT_DIR = path.join(__dirname, "../../seo-content");

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split("\n")) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      let val = rest.join(":").trim().replace(/^["']|["']$/g, "");
      if (val.startsWith("[")) {
        try { meta[key.trim()] = JSON.parse(val); } catch { meta[key.trim()] = val; }
      } else {
        meta[key.trim()] = val;
      }
    }
  }
  return meta;
}

function loadArticles() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      const meta = parseFrontmatter(raw);
      const body = raw.replace(/^---[\s\S]*?---\n/, "").trim();
      return { file, meta, body };
    });
}

// ─── DEV.to / Medium / HackMD (re-use existing publisher) ──────────────────
async function runArticlePublishers(articles, dryRun, filter) {
  const { default: publishModule } = await import(
    path.join(__dirname, "publish-articles.mjs").replace(/\\/g, "/")
  ).catch(() => ({ default: null }));

  // publish-articles.mjs is not designed to be imported; call it as child process instead
  // to avoid duplicating all its logic.  We just spawn it with the right flags.
  const { spawn } = await import("child_process");
  return new Promise((resolve) => {
    const args = ["scripts/seo-outreach/publish-articles.mjs"];
    if (filter && filter !== "articles") args.push(`--platform=${filter}`);
    if (dryRun) args.push("--dry-run");

    const child = spawn("node", args, {
      cwd: path.join(__dirname, "../.."),
      stdio: "inherit",
      env: process.env,
    });
    child.on("close", resolve);
    child.on("error", (e) => {
      console.error("publish-articles.mjs failed:", e.message);
      resolve(1);
    });
  });
}

// ─── args ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const onlyArg = args.find((a) => a.startsWith("--only="))?.split("=")[1] ?? "all";

if (dryRun) console.log("🔍  DRY RUN — no posts will actually be made.\n");

// ─── main ────────────────────────────────────────────────────────────────────
async function main() {
  const started = Date.now();
  console.log(`\n🚀  DropZap SEO Backlink Automation — ${new Date().toUTCString()}\n`);

  const articles = loadArticles();
  console.log(`📄  Loaded ${articles.length} articles from seo-content/\n`);

  const run = (platform) => onlyArg === "all" || onlyArg === platform;

  // 1. GitHub Gists (DA 96) — fastest, no rate limit issues
  if (run("github")) {
    await publishAllGists(articles, dryRun);
  }

  // 2. DEV.to + Medium + HackMD — delegated to existing publisher
  if (run("devto") || run("medium") || run("hackmd") || run("articles")) {
    console.log("\n📝  Running DEV.to / Medium / HackMD publisher…");
    await runArticlePublishers(articles, dryRun, run("articles") ? "all" : onlyArg);
  }

  // 3. Tumblr (DA 75)
  if (run("tumblr")) {
    await publishAllTumblr(articles, dryRun);
  }

  // 4. Diigo bookmarks (DA 92) — runs once, bookmarks all DropZap URLs
  if (run("diigo")) {
    await runDiigoBookmarks(dryRun);
  }

  // 5. Reddit poster (DA 91)
  if (run("reddit")) {
    await runRedditPoster(dryRun);
  }

  const duration = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`\n✅  All done in ${duration}s`);
  console.log("────────────────────────────────────────────────────────────");
  console.log("Next steps:");
  console.log("  • Check your DEV.to drafts and publish manually when ready");
  console.log("  • Review Medium + Tumblr drafts for quality before publishing");
  console.log("  • Submit sitemap to GSC: https://search.google.com/search-console");
  console.log("────────────────────────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("\n❌  Fatal error:", err.message);
  process.exit(1);
});
