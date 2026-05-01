"use client";

import MediaPostDownloader from "@/components/MediaPostDownloader";
import { isValidFacebookUrl } from "@/lib/utils";

export default function FacebookDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  return (
    <MediaPostDownloader
      platform="Facebook"
      filePrefix="facebook"
      placeholder="Paste Facebook video, Reel, or photo URL..."
      validate={isValidFacebookUrl}
      buttonClassName="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-600/30"
      onDownload={onDownload}
      help="Supports Facebook videos, Reels, and photo posts (Public posts only)."
    />
  );
}
