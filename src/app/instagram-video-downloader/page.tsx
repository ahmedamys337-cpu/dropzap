import type { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Instagram Video Downloader — Save Instagram Videos Free (2026)",
  description:
    "Download Instagram videos for free as MP4. No login, no watermark. Save Instagram videos on iPhone, Android, PC, and Mac. Fast, clean, unlimited.",
  keywords: [
    "instagram video downloader",
    "download instagram videos",
    "save instagram videos",
    "instagram video saver",
    "instagram video download free",
    "download video from instagram",
    "best instagram video downloader",
  ],
  alternates: { canonical: `${SITE_URL}/instagram-downloader` },
};

export default function InstagramVideoDownloaderPage() {
  redirect("/instagram-downloader");
}
