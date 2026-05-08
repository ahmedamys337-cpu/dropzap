"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import { isValidThreadsUrl } from "@/lib/utils";

export default function ThreadsDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  return (
    <SimpleDownloader
      platform="Threads"
      filePrefix="threads"
      mediaTypeLabel="Post Media"
      placeholder="Paste Threads post URL (e.g. threads.com/@user/post/...)"
      validate={isValidThreadsUrl}
      buttonClassName="bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 shadow-black/40 border border-white/10"
      inputFocusRingClassName="focus-visible:ring-zinc-500"
      badges={[
        { icon: "🎬", label: "Video → MP4" },
        { icon: "🖼️", label: "Image → JPG" },
        { icon: "📦", label: "Carousel → ZIP" },
      ]}
      badgeClassName="bg-zinc-500/15 text-zinc-700 dark:text-zinc-200"
      help="Downloads Threads videos and images from public posts."
      onDownload={onDownload}
      endpoint="/api/auto"
    />
  );
}
