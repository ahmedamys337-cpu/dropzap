import type { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "TikTok Downloader for iPhone — Save TikToks Without Watermark (2026)",
  description:
    "Download TikTok videos on iPhone without watermark. No app, no signup. Save TikToks to Camera Roll in 3 steps. Works on iOS Safari. Free, unlimited.",
  keywords: [
    "tiktok downloader for iphone",
    "tiktok downloader ios",
    "download tiktok on iphone",
    "save tiktok to camera roll",
    "tiktok video downloader iphone",
    "tiktok without watermark iphone",
    "how to download tiktok on iphone",
    "best tiktok downloader for iphone",
  ],
  alternates: { canonical: `${SITE_URL}/tiktok-downloader/iphone` },
};

export default function TikTokDownloaderForIPhonePage() {
  redirect("/tiktok-downloader/iphone");
}
