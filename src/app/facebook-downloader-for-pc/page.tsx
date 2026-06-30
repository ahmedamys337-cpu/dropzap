import type { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Facebook Downloader for PC — Save Facebook Videos on Windows & Mac (2026)",
  description:
    "Download Facebook videos and Reels on PC. No login, no watermark. Save Facebook on Windows and Mac in 3 steps. Works in any browser. Free.",
  keywords: [
    "facebook downloader for pc",
    "facebook downloader for windows",
    "facebook downloader for mac",
    "download facebook on pc",
    "save facebook on computer",
    "facebook video downloader pc",
    "how to download facebook on pc",
  ],
  alternates: { canonical: `${SITE_URL}/facebook-video-downloader` },
};

export default function FacebookDownloaderForPCPage() {
  redirect("/facebook-video-downloader");
}
