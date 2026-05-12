import type { Metadata } from "next";
import { platforms, SITE_URL, SITE_NAME } from "@/lib/seo-data";
import { buildArticle, buildBreadcrumbList, buildSoftwareApplication } from "@/lib/schemas";
import PlatformPageClient from "@/components/PlatformPageClient";

const p = platforms.reddit;

export const metadata: Metadata = {
  title: p.title,
  description: p.description,
  keywords: p.keywords,
  alternates: { canonical: `${SITE_URL}/${p.slug}` },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${SITE_URL}/${p.slug}`,
    siteName: SITE_NAME,
    title: p.title,
    description: p.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: p.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: p.title,
    description: p.description,
    images: ["/opengraph-image"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${p.slug}`,
      url: `${SITE_URL}/${p.slug}`,
      name: p.title,
      description: p.description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    buildSoftwareApplication(p, { ratingValue: "4.8", ratingCount: "1493" }),
    {
      "@type": "HowTo",
      name: `How to download ${p.name} videos with ${SITE_NAME}`,
      description: `Download ${p.name} videos for free in 3 easy steps.`,
      totalTime: "PT1M",
      step: p.howTo.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.step,
        text: s.desc,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: p.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    buildArticle(p),
    buildBreadcrumbList(p.name, p.slug),
  ],
};

export default function RedditDownloaderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PlatformPageClient platform={p} platformKey="reddit" />
    </>
  );
}
