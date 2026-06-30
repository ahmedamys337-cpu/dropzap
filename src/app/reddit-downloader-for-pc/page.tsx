import type { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Reddit Downloader for PC — Save Reddit Videos on Windows & Mac (2026)",
  description:
    "Download Reddit videos with sound on PC. No login, no watermark. Save Reddit on Windows and Mac in 3 steps. Works in any browser. Free.",
  keywords: [
    "reddit downloader for pc",
    "reddit downloader for windows",
    "reddit downloader for mac",
    "download reddit on pc",
    "save reddit on computer",
    "reddit video downloader pc",
    "how to download reddit on pc",
  ],
  alternates: { canonical: `${SITE_URL}/reddit-video-downloader` },
};

export default function RedditDownloaderForPCPage() {
  redirect("/reddit-video-downloader");
}
