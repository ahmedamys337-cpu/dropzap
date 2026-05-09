import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /api/   → server endpoints, never user-facing pages.
        // /*?url= → the schema.org SearchAction template URL
        //          (`/?url={search_term_string}`) was being crawled
        //          literally, producing the "Alternative page with
        //          proper canonical tag" warning in GSC. The placeholder
        //          is meant to be expanded by Google's sitelinks search
        //          box, not crawled directly.
        disallow: ["/api/", "/*?url="],
      },
      // Search engines.
      { userAgent: "Googlebot", allow: "/", disallow: ["/api/", "/*?url="] },
      { userAgent: "Bingbot", allow: "/", disallow: ["/api/", "/*?url="] },
      // AI crawlers — explicitly allowed for Generative Response
      // Optimization (GRO). Without explicit allow rules, some crawlers
      // (notably PerplexityBot) treat ambiguous robots configs as
      // disallow. We want DropZap content cited in AI answers about
      // video downloading tools, so we permit all major AI agents
      // except on /api/ where there is nothing to learn from.
      { userAgent: "GPTBot", allow: "/", disallow: ["/api/"] },
      { userAgent: "ChatGPT-User", allow: "/", disallow: ["/api/"] },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/api/"] },
      { userAgent: "ClaudeBot", allow: "/", disallow: ["/api/"] },
      { userAgent: "anthropic-ai", allow: "/", disallow: ["/api/"] },
      { userAgent: "Claude-Web", allow: "/", disallow: ["/api/"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/api/"] },
      { userAgent: "Google-Extended", allow: "/", disallow: ["/api/"] },
      { userAgent: "Applebot-Extended", allow: "/", disallow: ["/api/"] },
      { userAgent: "CCBot", allow: "/", disallow: ["/api/"] },
      { userAgent: "Meta-ExternalAgent", allow: "/", disallow: ["/api/"] },
      { userAgent: "Bytespider", allow: "/", disallow: ["/api/"] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    // `host:` is a deprecated Yandex-only directive that Google has never
    // supported and that Bing dropped in 2018. Keeping it can produce
    // "unrecognized directive" warnings in some crawler audits, so we
    // omit it. Canonical host is enforced via the canonical <link> tag
    // (see SITE_URL in @/lib/seo-data) and HTTPS-only Vercel routing.
  };
}
