// Main entry point. Runs the three modules in parallel where possible,
// renders the digest, writes it to disk, optionally emails it.
//
// Usage:
//   node scripts/seo-outreach/index.mjs
//
// Env vars (all optional except for brand-mention features):
//   GOOGLE_CSE_API_KEY  - Google Custom Search API key
//   GOOGLE_CSE_CX       - Programmable Search Engine ID
//   RESEND_API_KEY      - Resend.com API key for email delivery
//   SEO_EMAIL_FROM      - From: address (default: onboarding@resend.dev)
//   SEO_EMAIL_TO        - Where to send the daily digest

import { findRedditOpportunities } from "./reddit-finder.mjs";
import { findQuoraOpportunities } from "./quora-finder.mjs";
import { findBrandMentions } from "./brand-mentions.mjs";
import {
  buildMarkdownDigest,
  writeDigestFile,
  sendDigestEmail,
} from "./digest.mjs";

async function main() {
  const startedAt = Date.now();
  console.log("[seo-outreach] starting daily run…");

  // Reddit + brand-mentions are network-bound and independent. Run in
  // parallel. Quora is local (just URL formatting) so it's instant.
  const [reddit, brand] = await Promise.all([
    findRedditOpportunities().catch((err) => {
      console.error("[reddit] module failed:", err);
      return [];
    }),
    findBrandMentions().catch((err) => {
      console.error("[brand] module failed:", err);
      return { skipped: true, reason: err.message, results: [] };
    }),
  ]);
  const quora = findQuoraOpportunities();

  console.log(
    `[seo-outreach] reddit=${reddit.length} quora=${quora.length} brand=${
      brand.skipped ? "skipped" : brand.results.length
    }`
  );

  const markdown = buildMarkdownDigest({ reddit, quora, brand });
  const file = await writeDigestFile(markdown);
  console.log(`[seo-outreach] wrote ${file}`);

  const emailResult = await sendDigestEmail(markdown);
  if (emailResult.sent) {
    console.log("[seo-outreach] email sent");
  } else {
    console.log(`[seo-outreach] email skipped: ${emailResult.reason}`);
  }

  const durationS = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`[seo-outreach] done in ${durationS}s`);
}

main().catch((err) => {
  console.error("[seo-outreach] fatal:", err);
  process.exit(1);
});
