// Quora opportunity finder.
//
// Quora has no public API and aggressive anti-scraping (Cloudflare +
// behavioural fingerprinting). Trying to scrape it directly = banned IP
// in 24h. So instead we build pre-filtered Google search URLs the
// operator clicks through manually.
//
// This is intentionally lower-tech than the Reddit module. The operator
// gets a list of links like:
//   https://www.google.com/search?q=site%3Aquora.com+%22tiktok+no+watermark%22&tbs=qdr:w
// Each link, when clicked, shows the freshest Quora threads matching
// that exact phrase. The operator picks 1-2 worth answering.
//
// Why pre-filtered Google links work better than scraping:
//   - Google's relevance ranking already filters noise
//   - `&tbs=qdr:w` constrains to last-week results
//   - `site:quora.com` scopes to Quora exclusively
//   - Zero ToS risk (just generates URLs, doesn't fetch them)

import { KEYWORDS } from "./config.mjs";

export function findQuoraOpportunities() {
  return KEYWORDS.map((keyword) => {
    const exactPhrase = `"${keyword}"`;
    const q = encodeURIComponent(`site:quora.com ${exactPhrase}`);
    return {
      keyword,
      // qdr:w = past week. Change to qdr:d (day) for higher recency or
      // qdr:m (month) for higher volume.
      googleSearchUrl: `https://www.google.com/search?q=${q}&tbs=qdr:w`,
      // A direct Quora-search URL as a backup. Quora's own search
      // doesn't have date filters but is sometimes useful.
      quoraSearchUrl: `https://www.quora.com/search?q=${encodeURIComponent(keyword)}`,
    };
  });
}
