"use client";

import MediaPostDownloader from "@/components/MediaPostDownloader";
import { isValidInstagramUrl } from "@/lib/utils";

export default function InstagramDownloader({
  onDownload,
}: {
  onDownload: (title: string, url: string, type: string) => void;
}) {
  return (
    <MediaPostDownloader
      platform="Instagram"
      filePrefix="instagram"
      placeholder="Paste Instagram Reel, Post, or Photo URL..."
      validate={isValidInstagramUrl}
      buttonClassName="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 shadow-pink-600/30"
      onDownload={onDownload}
      help="Supports Reels, single photos, and carousel posts (Public posts only)."
    />
  );
}
