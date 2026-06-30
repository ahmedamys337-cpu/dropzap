import type { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "TikTok Slideshow Downloader — Save TikTok Photo Slideshows Free (2026)",
  description:
    "Download TikTok photo slideshows for free. Save all photos from TikTok slideshows as images. No watermark, no signup, no daily limit. Works on all devices.",
  keywords: [
    "tiktok slideshow downloader",
    "download tiktok slideshow",
    "save tiktok photo slideshow",
    "tiktok photo downloader",
    "tiktok carousel downloader",
    "download tiktok photos",
    "save tiktok images",
  ],
  alternates: { canonical: `${SITE_URL}/tiktok-downloader` },
};

export default function TikTokSlideshowDownloaderPage() {
  redirect("/tiktok-downloader");
}
