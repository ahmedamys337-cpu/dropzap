"use client";

import MediaPostDownloader from "@/components/MediaPostDownloader";
import { isValidThreadsUrl } from "@/lib/utils";

export default function ThreadsDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  return (
    <MediaPostDownloader
      platform="Threads"
      filePrefix="threads"
      placeholder="Paste Threads post URL (e.g. threads.com/@user/post/...)"
      validate={isValidThreadsUrl}
      buttonClassName="bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border border-white/10 shadow-black/40"
      onDownload={onDownload}
      help="Supports Threads video and image posts. Public posts only."
    />
  );
}
