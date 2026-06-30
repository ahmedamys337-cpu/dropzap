import type { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "TikTok Video Downloader — Save TikTok Videos Without Watermark (2026)",
  description:
    "Download TikTok videos for free without watermark. No signup, no daily limit. Save TikTok videos on iPhone, Android, PC, and Mac. Fast and clean.",
  keywords: [
    "tiktok video downloader",
    "download tiktok videos",
    "save tiktok videos",
    "tiktok video saver",
    "tiktok video download free",
    "download video from tiktok",
    "best tiktok video downloader",
  ],
  alternates: { canonical: `${SITE_URL}/tiktok-downloader` },
};

export default function TikTokVideoDownloaderPage() {
  redirect("/tiktok-downloader");
}
