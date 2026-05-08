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
      mediaTypeLabel="Video / Image"
      placeholder="Paste Reddit post URL here..."
      validate={isValidRedditUrl}
      buttonClassName="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-600/30"
      inputFocusRingClassName="focus-visible:ring-orange-600"
      badges={[
        { icon: "🎬", label: "Video → MP4 (with sound)" },
        { icon: "🖼️", label: "Image → JPG" },
        { icon: "📦", label: "Gallery → ZIP" },
      ]}
      badgeClassName="bg-orange-600/10 text-orange-700 dark:text-orange-300"
      help="Auto-detects videos (with sound), single images, and gallery posts."
      onDownload={onDownload}
      endpoint="/api/auto"
    />
  );
}
