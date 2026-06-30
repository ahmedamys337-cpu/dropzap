import type { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Instagram Reels Downloader for Android — Save Reels as MP4 (2026)",
  description:
    "Download Instagram Reels on Android without login. Save Reels to Gallery in 3 steps. No app, no watermark. Works on Chrome. Free.",
  keywords: [
    "instagram reels downloader android",
    "download instagram reels on android",
    "save instagram reels to gallery",
    "instagram reels downloader apk",
    "how to download instagram reels on android",
    "instagram reels saver android",
  ],
  alternates: { canonical: `${SITE_URL}/instagram-downloader/android` },
};

export default function InstagramReelsDownloaderForAndroidPage() {
  redirect("/instagram-downloader/android");
}
