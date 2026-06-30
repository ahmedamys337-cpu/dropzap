import type { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Instagram Downloader for PC — Save Instagram on Windows & Mac (2026)",
  description:
    "Download Instagram Reels, photos, and carousels on PC. No login, no watermark. Save Instagram on Windows and Mac in 3 steps. Works in any browser. Free.",
  keywords: [
    "instagram downloader for pc",
    "instagram downloader for windows",
    "instagram downloader for mac",
    "download instagram on pc",
    "save instagram on computer",
    "instagram video downloader pc",
    "how to download instagram on pc",
  ],
  alternates: { canonical: `${SITE_URL}/instagram-downloader` },
};

export default function InstagramDownloaderForPCPage() {
  redirect("/instagram-downloader");
}
