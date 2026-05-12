// YouTube downloads are temporarily disabled site-wide while we work around
// YouTube's intensified anti-bot extraction (datacenter IPs are limited to
// 360p even with cookies + residential proxy). The original SEO landing
// page lives in `platforms.youtube` inside `@/lib/seo-data` and the
// `YoutubeDownloader` component is still in the repo, so reviving this
// page is a single-commit revert once we have a working backend (cobalt
// API key, self-hosted cobalt, or a fix for yt-dlp HD extraction).
//
// While disabled we 308-redirect any inbound /youtube-downloader request
// to the homepage so:
//   • Users never see a broken / 360p-only experience.
//   • Search engines drop the URL from rankings (robots: noindex).
//   • Old backlinks still resolve to a useful destination instead of 404.
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { buildArticle, buildBreadcrumbList } from "@/lib/schemas";
import { SITE_URL } from "@/lib/seo-data";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: SITE_URL },
};

export default function YouTubeDownloaderPage() {
  redirect("/");
}
