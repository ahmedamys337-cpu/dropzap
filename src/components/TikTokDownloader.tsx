"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import { isValidTikTokUrl } from "@/lib/utils";

export default function TikTokDownloader({
  onDownload,
}: {
  onDownload: (title: string, url: string, type: string) => void;
}) {
  return (
    <SimpleDownloader
      platform="TikTok"
      filePrefix="tiktok"
      mediaTypeLabel="No Watermark MP4"
      placeholder="Paste TikTok URL here..."
      validate={isValidTikTokUrl}
      buttonClassName="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 shadow-pink-500/30"
      help="Downloads TikTok videos without watermark."
      onDownload={onDownload}
    />
  );
}
