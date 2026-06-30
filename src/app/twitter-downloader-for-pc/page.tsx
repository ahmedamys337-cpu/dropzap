import type { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Twitter Downloader for PC — Save Twitter Videos on Windows & Mac (2026)",
  description:
    "Download Twitter/X videos and GIFs on PC. No login, no watermark. Save Twitter on Windows and Mac in 3 steps. Works in any browser. Free.",
  keywords: [
    "twitter downloader for pc",
    "twitter downloader for windows",
    "twitter downloader for mac",
    "download twitter on pc",
    "save twitter on computer",
    "twitter video downloader pc",
    "how to download twitter on pc",
  ],
  alternates: { canonical: `${SITE_URL}/twitter-video-downloader` },
};

export default function TwitterDownloaderForPCPage() {
  redirect("/twitter-video-downloader");
}
