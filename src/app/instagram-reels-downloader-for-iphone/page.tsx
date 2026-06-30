import type { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Instagram Reels Downloader for iPhone — Save Reels to Camera Roll (2026)",
  description:
    "Download Instagram Reels on iPhone without login. Save Reels to Camera Roll in 3 steps. No app, no watermark. Works on iOS Safari. Free.",
  keywords: [
    "instagram reels downloader iphone",
    "download instagram reels on iphone",
    "save instagram reels to camera roll",
    "instagram reels downloader ios",
    "how to download instagram reels on iphone",
    "instagram reels saver iphone",
  ],
  alternates: { canonical: `${SITE_URL}/instagram-downloader/iphone` },
};

export default function InstagramReelsDownloaderForIPhonePage() {
  redirect("/instagram-downloader/iphone");
}
