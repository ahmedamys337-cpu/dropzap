"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import { isValidTikTokUrl } from "@/lib/utils";

/**
 * TikTok URL → MP3 audio downloader. Reuses the shared SimpleDownloader
 * shell but points at /api/stream?audio=1 so yt-dlp extracts the audio
 * track as MP3 instead of returning the full watermark-free MP4.
 */
export default function TikTokToMp3({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  return (
    <SimpleDownloader
      platform="TikTok"
      filePrefix="tiktok-audio"
      mediaTypeLabel="MP3 Audio"
      placeholder="Paste TikTok video URL here..."
      validate={isValidTikTokUrl}
      buttonClassName="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 shadow-pink-500/30"
      inputFocusRingClassName="focus-visible:ring-pink-500"
      badges={[
        { icon: "🎵", label: "Output: MP3" },
        { icon: "🔊", label: "Up to 320kbps" },
      ]}
      badgeClassName="bg-pink-500/10 text-pink-700 dark:text-pink-300"
      help="Extracts the audio from any TikTok video and saves it as a high-quality MP3 file."
      endpoint="/api/stream?audio=1"
      fileExtension="mp3"
      onDownload={onDownload}
    />
  );
}
