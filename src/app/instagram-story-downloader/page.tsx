import type { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Instagram Story Downloader — Save Instagram Stories Free (2026)",
  description:
    "Download Instagram Stories for free as MP4 or JPG. No login, no watermark. Save Instagram Stories on iPhone, Android, PC. Fast, clean, unlimited.",
  keywords: [
    "instagram story downloader",
    "download instagram stories",
    "save instagram stories",
    "instagram story saver",
    "instagram story download free",
    "download story from instagram",
    "best instagram story downloader",
  ],
  alternates: { canonical: `${SITE_URL}/instagram-downloader` },
};

export default function InstagramStoryDownloaderPage() {
  redirect("/instagram-downloader");
}
