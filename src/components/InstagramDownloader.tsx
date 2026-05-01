"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import { isValidInstagramUrl } from "@/lib/utils";

export default function InstagramDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  return (
    <SimpleDownloader
      platform="Instagram"
      filePrefix="instagram"
      mediaTypeLabel="Reel / Post MP4"
      placeholder="Paste Instagram Reel, post, or photo URL..."
      validate={isValidInstagramUrl}
      buttonClassName="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 shadow-pink-600/30"
      help="Downloads Instagram Reels, video posts, and photos in their best quality."
      onDownload={onDownload}
    />
  );
}
