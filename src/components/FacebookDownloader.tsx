"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import { isValidFacebookUrl } from "@/lib/utils";

export default function FacebookDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  return (
    <SimpleDownloader
      platform="Facebook"
      filePrefix="facebook"
      mediaTypeLabel="HD MP4"
      placeholder="Paste Facebook video, Reel, or photo URL..."
      validate={isValidFacebookUrl}
      buttonClassName="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-600/30"
      help="Downloads Facebook videos and Reels in the highest available quality (Public posts only)."
      onDownload={onDownload}
    />
  );
}
