# DropZap SEO Outreach Automation

Automated daily digest of **legitimate** backlink opportunities. Finds Reddit threads, Quora questions, and unlinked brand mentions you can act on. Does **not** post anything automatically — every reply / email is sent by you, manually, after reading the context. This is the only safe approach: Google's SpamBrain detects automated link-building patterns and penalizes the source site.

## What it does

| Module | What it finds | How |
|---|---|---|
| **Reddit finder** | Threads from the last 48h asking about your keywords (e.g. "tiktok no watermark", "snapinsta not working") | Public Reddit JSON API — no auth, no scraping |
| **Quora finder** | Pre-filtered Google search URLs to the freshest Quora threads matching each keyword | URL generation only — Quora has no API |
| **Brand mention tracker** | Pages that mention "DropZap" but don't link back to dropzap.digital, with the contact email if findable | Google Custom Search API + page HTML check |

Output: `seo-reports/YYYY-MM-DD.md` and `seo-reports/latest.md`. Optionally also emailed to you via Resend.

## Daily workflow

1. Open `seo-reports/latest.md`
2. Pick **2-3 Reddit threads** with real questions you can genuinely help with
3. Click **1-2 Quora search URLs**, find a question worth answering
4. For each unlinked brand mention with a contact email, send a short polite outreach email
5. Total time: ~20-30 minutes/day

**The supplied reply templates are starting drafts only.** Read each thread first, rewrite the template in your own voice, and only mention DropZap if it genuinely answers the question. Reddit/Quora mods detect copy-paste, and so does Google.

## Setup

### 1. Run it locally first (no setup needed for Reddit + Quora)

```powershell
node scripts/seo-outreach/index.mjs
```

You'll see a digest written to `seo-reports/<today>.md`. The Reddit and Quora modules work with zero config.

### 2. Enable brand-mention tracking (optional but recommended)

Sign up for **Google Programmable Search** (free, 100 queries/day):

1. Create a search engine: https://programmablesearchengine.google.com/
   - Toggle "Search the entire web"
   - Copy the **Search engine ID** (`cx`)
2. Create an API key: https://console.cloud.google.com/apis/credentials
   - Restrict the key to **Custom Search API**
   - Copy the API key
3. Set the env vars locally (PowerShell):

   ```powershell
   $env:GOOGLE_CSE_API_KEY = "your-key-here"
   $env:GOOGLE_CSE_CX = "your-cx-here"
   node scripts/seo-outreach/index.mjs
   ```

### 3. Enable email delivery (optional)

Sign up at https://resend.com (free, no credit card, 100 emails/day):

1. Create an API key
2. Either verify your own domain (preferred) or use the default `onboarding@resend.dev`
3. Set env vars:

   ```powershell
   $env:RESEND_API_KEY = "re_..."
   $env:SEO_EMAIL_FROM = "seo@dropzap.digital"   # only if your domain is verified
   $env:SEO_EMAIL_TO = "you@yourgmail.com"
   ```

### 4. Schedule the daily run on GitHub Actions

The workflow is already at `.github/workflows/seo-outreach.yml`. To activate it:

1. Push your code (the workflow runs automatically once it's on the default branch)
2. Add the secrets (GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**):
   - `GOOGLE_CSE_API_KEY`
   - `GOOGLE_CSE_CX`
   - `RESEND_API_KEY` *(optional)*
   - `SEO_EMAIL_FROM` *(optional)*
   - `SEO_EMAIL_TO` *(optional)*
3. The workflow runs daily at **06:00 UTC** (11:00 AM Karachi). Edit the `cron` line in the YAML if you want a different time.
4. You can also trigger it on-demand from the **Actions** tab → **SEO Outreach Daily Digest** → **Run workflow**.

The workflow auto-commits the new digest back to `seo-reports/`, so your repo is your archive.

## Troubleshooting

### Reddit returns lots of 429s on local runs

Reddit heavily rate-limits `*.reddit.com` JSON endpoints for unauthenticated callers from the same IP. If you run the script 3-4 times in a row locally, your home IP gets a ~1 hour cooldown. This is **not** a bug and **not** a problem in production:

- GitHub Actions runs get fresh IPs from Azure's pool each time, so the scheduled daily run never collides with itself
- The script gracefully logs `429` warnings and returns whatever results it did get — no crash
- If you want to test locally multiple times, use a VPN between runs to get a fresh IP, or just trust the production schedule

### Brand mentions returns "skipped"

You haven't set `GOOGLE_CSE_API_KEY` + `GOOGLE_CSE_CX`. See "Setup" above. The Reddit + Quora modules will still work without these.

### Email says "skipped"

You haven't set `RESEND_API_KEY` + `SEO_EMAIL_TO`. The digest is still written to `seo-reports/` — email is purely a notification convenience.

## Tuning the keyword + subreddit list

Edit `scripts/seo-outreach/config.mjs`:

- `KEYWORDS` — phrases to search across Reddit + Quora
- `SUBREDDITS` — high-priority subs to scope per-keyword
- `MIN_REDDIT_SCORE` — raise to filter low-engagement threads
- `MAX_THREAD_AGE_HOURS` — lower for fresher results, raise for higher volume

Edit `scripts/seo-outreach/templates.mjs` to change the suggested reply drafts. The `pickTemplate()` function picks one based on title keywords; add more cases as you find common patterns.

## Why no automatic posting?

**Because that would destroy your site.** Google's SpamBrain detects automated link-building footprints and applies sitewide penalties — losing all your existing rankings. Reddit and Quora also ban accounts that post bot-pattern content, and a banned account = lost backlinks.

This tool is the **most aggressive legitimate** approach: maximum opportunity surface, zero spam footprint. The 30 min/day of human-in-the-loop work is the entire reason it's safe.

## Cost

| Service | Free tier | Cost above |
|---|---|---|
| Reddit API | Unlimited (rate-limited) | n/a |
| Google Custom Search | 100 queries/day | $5 / 1000 |
| Resend email | 100/day, 3000/month | $20/month for 50k |
| GitHub Actions | 2000 min/month free | $0.008/min |

A daily run uses ~10 CSE queries, ~1 email, and ~30 seconds of Actions time. **Realistic monthly cost: $0.**
