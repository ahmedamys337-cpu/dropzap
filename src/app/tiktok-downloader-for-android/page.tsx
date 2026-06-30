import type { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "TikTok Downloader for Android — Save TikToks Without Watermark (2026)",
  description:
    "Download TikTok videos on Android without watermark. No app, no signup. Save TikToks to Gallery in 3 steps. Works on Chrome. Free, unlimited.",
  keywords: [
    "tiktok downloader for android",
    "tiktok downloader apk",
    "download tiktok on android",
    "save tiktok to gallery",
    "tiktok video downloader android",
    "tiktok without watermark android",
    "how to download tiktok on android",
    "best tiktok downloader for android",
  ],
  alternates: { canonical: `${SITE_URL}/tiktok-downloader/android` },
};

export default function TikTokDownloaderForAndroidPage() {
  redirect("/tiktok-downloader/android");
}
