"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import { isValidRedditUrl } from "@/lib/utils";

export default function RedditDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  return (
    <SimpleDownloader
      platform="Reddit"
      filePrefix="reddit"
      mediaTypeLabel="MP4 with Audio"
      placeholder="Paste Reddit post URL here..."
      validate={isValidRedditUrl}
      buttonClassName="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-orange-600/30"
      help="Downloads Reddit videos with audio merged automatically."
      onDownload={onDownload}
    />
  );
}
