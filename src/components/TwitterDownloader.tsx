"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import { isValidTwitterUrl } from "@/lib/utils";

/**
 * Twitter/X uses a single URL field that auto-detects whether the post is
 * a video, an image, or a multi-image gallery. The /api/auto endpoint
 * does the detection by letting yt-dlp download whatever exists into a
 * temp dir then deciding the response shape:
 *   - video tweet         → MP4 attachment
 *   - single image tweet  → JPG attachment
 *   - gallery (2-4 imgs)  → ZIP of every image
 */
export default function TwitterDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  return (
    <SimpleDownloader
      platform="Twitter/X"
      filePrefix="twitter"
      mediaTypeLabel="Video / Image"
      placeholder="Paste Twitter / X post URL here..."
      validate={isValidTwitterUrl}
      buttonClassName="bg-gradient-to-r from-sky-500 to-zinc-900 hover:from-sky-400 hover:to-black shadow-sky-500/30"
      inputFocusRingClassName="focus-visible:ring-sky-500"
      badges={[
        { icon: "🎬", label: "Video → MP4" },
        { icon: "🖼️", label: "Image → JPG" },
        { icon: "📦", label: "Gallery → ZIP" },
      ]}
      badgeClassName="bg-sky-500/10 text-sky-700 dark:text-sky-300"
      help="Auto-detects videos and images. Works on twitter.com and x.com URLs."
      onDownload={onDownload}
      endpoint="/api/auto"
      fileExtension="mp4"
    />
  );
}
