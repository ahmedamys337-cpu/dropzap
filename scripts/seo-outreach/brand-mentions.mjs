// Brand mention tracker.
//
// Uses Google Programmable Search (Custom Search JSON API) to find
// pages that mention "DropZap" but DON'T link to dropzap.digital.
// Those are the highest-leverage outreach targets — the author already
// liked us enough to write the name; we just need to ask for the link.
//
// API docs: https://developers.google.com/custom-search/v1/overview
// Free tier: 100 queries/day, $5 per 1000 above that.
//
// Algorithm:
//   1. For each brand variant, run a Google CSE query
//   2. For each result page, fetch the HTML and check whether it
//      already links to dropzap.digital
//   3. If it doesn't, flag as an "unlinked mention" outreach target
//   4. Try to extract a contact email from the page (mailto: hrefs)
//
// Gracefully no-ops if API key/cx aren't set — the rest of the digest
// still runs.

import { BRAND, GOOGLE_CSE, USER_AGENT } from "./config.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function googleSearch(query, page = 1) {
  // Custom Search returns 10 results/page max. `start` is 1-indexed.
  const start = (page - 1) * 10 + 1;
  const url =
    `https://www.googleapis.com/customsearch/v1` +
    `?key=${encodeURIComponent(GOOGLE_CSE.apiKey)}` +
    `&cx=${encodeURIComponent(GOOGLE_CSE.cx)}` +
    `&q=${encodeURIComponent(query)}` +
    `&start=${start}` +
    `&num=10` +
    // dateRestrict=w1 = last week. Keeps the digest focused on fresh
    // mentions instead of re-surfacing the same old pages every day.
    `&dateRestrict=w1`;

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.warn(`[cse] ${res.status}: ${body.slice(0, 200)}`);
    return null;
  }
  return res.json();
}

// Fetch the page HTML and check for any link to our domain. We're
// generous: any href containing the bare domain counts, since people
// link with/without www, with/without https, etc.
async function pageLinksToUs(pageUrl) {
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
      // 8s timeout — some pages hang forever and we can't let one
      // bad page block the daily run.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { linked: null, html: "" };
    const html = await res.text();
    const linked = html.includes(BRAND.domain);
    return { linked, html };
  } catch (err) {
    return { linked: null, html: "", error: err.message };
  }
}

// Best-effort contact-email extraction. Pulls the first mailto: link,
// falling back to a regex over the page text. Many sites don't expose
// their email this way (using a contact form instead) — we just leave
// the field null in that case.
function extractEmail(html) {
  if (!html) return null;
  const mailto = html.match(/mailto:([^"'\s>]+)/i);
  if (mailto) return mailto[1].split("?")[0];
  const generic = html.match(
    /([a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,})/i
  );
  if (generic) {
    const e = generic[1].toLowerCase();
    // Filter out obvious junk (sentry, wixpress, example.com, etc.)
    if (
      e.endsWith("@sentry.io") ||
      e.includes("example.") ||
      e.includes("wixpress.") ||
      e.includes("@2x") ||
      e.length > 60
    ) {
      return null;
    }
    return e;
  }
  return null;
}

export async function findBrandMentions() {
  if (!GOOGLE_CSE.apiKey || !GOOGLE_CSE.cx) {
    return {
      skipped: true,
      reason:
        "GOOGLE_CSE_API_KEY or GOOGLE_CSE_CX not set — see scripts/seo-outreach/README.md for setup",
      results: [],
    };
  }

  const seen = new Set();
  const all = [];

  for (const variant of BRAND.variants) {
    // We exclude our own domain from the results so we don't waste
    // queries on our own pages.
    const query = `"${variant}" -site:${BRAND.domain}`;

    for (let page = 1; page <= GOOGLE_CSE.pagesPerQuery; page++) {
      const json = await googleSearch(query, page);
      if (!json?.items) break; // no more results

      for (const item of json.items) {
        if (seen.has(item.link)) continue;
        seen.add(item.link);
        all.push({
          variant,
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          displayLink: item.displayLink,
        });
      }

      // Brief pause between pages — CSE quota is per-day not per-second
      // but this keeps logs readable.
      await sleep(200);
    }
  }

  // Now check each candidate page for an existing link back to us.
  // Done sequentially with a small delay to avoid hammering any one
  // host. ~30 candidates × 1s = 30s — fine inside a daily cron.
  const results = [];
  for (const c of all) {
    const { linked, html, error } = await pageLinksToUs(c.link);
    const email = linked === false ? extractEmail(html) : null;
    results.push({
      ...c,
      alreadyLinks: linked,
      contactEmail: email,
      fetchError: error || null,
    });
    await sleep(500);
  }

  // Most-actionable first: unlinked mentions with a contact email.
  results.sort((a, b) => {
    const score = (r) =>
      (r.alreadyLinks === false ? 2 : 0) + (r.contactEmail ? 1 : 0);
    return score(b) - score(a);
  });

  return { skipped: false, results };
}
