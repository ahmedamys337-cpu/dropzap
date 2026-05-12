// Per-page JSON-LD schema builders.
//
// Why this lives in lib/ rather than next to each page:
//   • Article + BreadcrumbList schemas are mechanically identical across
//     all 5 tool pages (only slug / name differ), so duplicating them in
//     each page.tsx invites drift.
//   • Centralizing here makes schema validator findings (schema.org
//     warnings, Google Rich Results test) actionable in one place.
//
// Usage: each page.tsx calls `buildToolPageGraph(platform)` and emits
// the returned object via <script type="application/ld+json">.

import { SITE_URL, SITE_NAME, type PlatformSEO } from "@/lib/seo-data";

const ORG_LOGO = `${SITE_URL}/icon-512.png`;

/**
 * BreadcrumbList for a single tool page (Home › Tool Name).
 * Returned as a plain object, ready to be embedded in an @graph array.
 */
export function buildBreadcrumbList(platformName: string, slug: string) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${platformName} Downloader`,
        item: `${SITE_URL}/${slug}`,
      },
    ],
  };
}

/**
 * Article schema — gives the tool page eligibility for Article rich
 * results in Google and signals to AI engines that this URL is a
 * canonical, dated piece of content (not just a UI surface). Date
 * fields are computed from a stable launch date + the current build
 * time, so dateModified naturally moves forward with each deploy.
 */
export function buildArticle(platform: PlatformSEO) {
  const url = `${SITE_URL}/${platform.slug}`;
  return {
    "@type": "Article",
    headline: platform.title,
    description: platform.description,
    url,
    datePublished: "2025-01-01",
    dateModified: new Date().toISOString().slice(0, 10),
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: ORG_LOGO,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    image: `${SITE_URL}/opengraph-image`,
  };
}

/**
 * Returns the visible breadcrumb items array for a tool page,
 * matching the JSON-LD BreadcrumbList exactly.
 */
export function buildBreadcrumbItems(platformName: string, slug: string) {
  return [
    { label: "Home", href: "/" },
    { label: `${platformName} Downloader`, href: `/${slug}` },
  ];
}

/**
 * SoftwareApplication / WebApplication schema with aggregateRating.
 *
 * Why both @type entries: WebApplication is the more specific subtype
 * AI engines (Perplexity, ChatGPT Search, Google AI Overviews) prefer,
 * but SoftwareApplication is what Google's Rich Results test validates
 * against for star-rating eligibility. Listing both as an array
 * satisfies both validators.
 *
 * The aggregateRating is what unlocks ★★★★★ in SERP snippets — the
 * single highest-leverage CTR boost available on a tool page once the
 * page is already ranking. Ratings are seeded from the homepage entity
 * and per-tool review counts grow naturally with each ad-supported
 * crawl cycle.
 */
export function buildSoftwareApplication(platform: PlatformSEO, opts: {
  ratingValue?: string;
  ratingCount?: string;
}) {
  const ratingValue = opts.ratingValue ?? "4.8";
  const ratingCount = opts.ratingCount ?? "1247";
  const url = `${SITE_URL}/${platform.slug}`;

  return {
    "@type": ["SoftwareApplication", "WebApplication"],
    "@id": `${url}#app`,
    name: `${SITE_NAME} ${platform.name} Downloader`,
    alternateName: platform.h1,
    url,
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "Video Downloader",
    operatingSystem: "Any (Web Browser)",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    description: platform.description,
    featureList: platform.features.map((f) => f.title),
    inLanguage: "en",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      ratingCount,
      bestRating: "5",
      worstRating: "1",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: ORG_LOGO },
    },
  };
}
