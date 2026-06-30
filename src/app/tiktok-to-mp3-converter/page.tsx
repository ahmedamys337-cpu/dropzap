import type { Metadata } from "next";
import { redirect } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "TikTok to MP3 Converter — Extract Audio from TikTok Free (2026)",
  description:
    "Convert TikTok videos to MP3 for free. No watermark, no signup, no daily limit. Extract audio from any TikTok on iPhone, Android, PC. Fast and clean.",
  keywords: [
    "tiktok to mp3",
    "tiktok to mp3 converter",
    "convert tiktok to mp3",
    "tiktok mp3 downloader",
    "tiktok audio downloader",
    "extract audio from tiktok",
    "tiktok to mp3 free",
    "tiktok sound downloader",
  ],
  alternates: { canonical: `${SITE_URL}/tiktok-to-mp3` },
};

export default function TikTokToMP3ConverterPage() {
  redirect("/tiktok-to-mp3");
}
