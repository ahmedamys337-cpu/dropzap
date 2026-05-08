"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import { isValidTikTokUrl } from "@/lib/utils";

/**
 * TikTok keeps a single, focused video downloader: paste any TikTok URL,
 * get the watermark-free MP4 back via /api/stream. We deliberately don't
 * surface a thumbnail downloader here — TikTok's preview frames are tiny
 * and rarely useful, and a single CTA converts better than two.
 */
export default function TikTokDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  return (
    <SimpleDownloader
      platform="TikTok"
      filePrefix="tiktok"
      mediaTypeLabel="No Watermark MP4"
      placeholder="Paste TikTok video URL here..."
      validate={isValidTikTokUrl}
      buttonClassName="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 shadow-pink-500/30"
      inputFocusRingClassName="focus-visible:ring-pink-500"
      badges={[
        { icon: "🎬", label: "Output: MP4 HD" },
        { icon: "🚫", label: "No Watermark" },
      ]}
      badgeClassName="bg-pink-500/10 text-pink-700 dark:text-pink-300"
      help="Downloads TikTok videos without the watermark, in HD."
      onDownload={onDownload}
    />
  );
}
