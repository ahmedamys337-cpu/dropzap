import type { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "TikTok Downloader for PC — Save TikToks on Windows & Mac (2026)",
  description:
    "Download TikTok videos on PC without watermark. No software, no extension. Save TikToks on Windows and Mac in 3 steps. Works in any browser. Free.",
  keywords: [
    "tiktok downloader for pc",
    "tiktok downloader for laptop",
    "tiktok downloader for windows",
    "tiktok downloader for mac",
    "download tiktok on pc",
    "save tiktok on computer",
    "tiktok video downloader pc",
    "how to download tiktok on pc",
  ],
  alternates: { canonical: `${SITE_URL}/blog/tiktok-downloader-pc-laptop` },
};

export default function TikTokDownloaderForPCPage() {
  redirect("/blog/tiktok-downloader-pc-laptop");
}
