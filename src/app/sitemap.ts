import { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-data";
import { programmaticPages } from "@/lib/programmatic-seo";
import { alternativePages } from "@/lib/alternatives-data";
import { listAllDevicePages } from "@/lib/device-pages-data";
import { howToPages } from "@/lib/how-to-pages-data";
import { glossaryEntries } from "@/lib/glossary-data";
import { mobilePages } from "@/lib/mobile-pages-data";
import { yearPages } from "@/lib/year-pages-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";
  const lastModified = new Date();

  // /youtube-downloader is intentionally excluded — the page now 308s to /
  // while YouTube downloads are disabled. Listing it would cause search
  // engines to crawl the redirect repeatedly and surface "broken" warnings.
  const platformPages = [
    "tiktok-downloader",
    "tiktok-to-mp3",
    "instagram-downloader",
    "twitter-video-downloader",
    "facebook-video-downloader",
    "reddit-video-downloader",
  ];

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...platformPages.map((slug) => ({
      url: `${baseUrl}/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    // MP3 converter — dedicated page for the high-volume "video to mp3"
    // query family. Tool already exists; the dedicated URL gives Google
    // a clean target instead of the homepage tab.
    {
      url: `${baseUrl}/mp3-converter`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    ...blogEntries,
    // Alternative-to-X comparison pages (high-intent comparison queries)
    ...alternativePages.map((p) => ({
      url: `${baseUrl}/alternatives/${p.slug}`,
      lastModified: new Date(p.dateModified),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    // Device / use-case pages (e.g. /tiktok-downloader/iphone)
    ...listAllDevicePages().map(({ toolPath, page }) => ({
      url: `${baseUrl}${toolPath}/${page.slug}`,
      lastModified: new Date(page.dateModified),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...programmaticPages.map((p) => ({
      url: `${baseUrl}/download/${p.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    // How-To long-tail guide pages — high priority because each
    // targets a specific low-competition query with strong intent.
    {
      url: `${baseUrl}/how-to`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...howToPages.map((p) => ({
      url: `${baseUrl}/how-to/${p.slug}`,
      lastModified: new Date(p.dateModified),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    // Glossary — informational definitions. Lower commercial priority
    // than the how-to pages but high LLM-citation value.
    {
      url: `${baseUrl}/glossary`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    ...glossaryEntries.map((e) => ({
      url: `${baseUrl}/glossary/${e.slug}`,
      lastModified: new Date(e.dateModified),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // Mobile-specific commercial landing pages — high priority,
    // matched to the "video downloader iphone/android" head queries.
    ...mobilePages.map((m) => ({
      url: `${baseUrl}/${m.slug}`,
      lastModified: new Date(m.dateModified),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    // Year-specific "best of" listicles — high freshness signal,
    // strong commercial intent. Bumped to weekly because we expect
    // to refresh rankings/dateModified throughout the year.
    ...yearPages.map((y) => ({
      url: `${baseUrl}/${y.slug}`,
      lastModified: new Date(y.dateModified),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/dmca`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
