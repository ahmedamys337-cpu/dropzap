import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    // `host:` is a deprecated Yandex-only directive that Google has never
    // supported and that Bing dropped in 2018. Keeping it can produce
    // "unrecognized directive" warnings in some crawler audits, so we
    // omit it. Canonical host is enforced via the canonical <link> tag
    // (see SITE_URL in @/lib/seo-data) and HTTPS-only Vercel routing.
  };
}
