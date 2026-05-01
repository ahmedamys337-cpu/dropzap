"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import { isValidTwitterUrl } from "@/lib/utils";

export default function TwitterDownloader({
  onDownload,
}: {
  onDownload: (title: string, url: string, type: string) => void;
}) {
  return (
    <SimpleDownloader
      platform="Twitter/X"
      filePrefix="twitter"
      mediaTypeLabel="Video MP4"
      placeholder="Paste Twitter/X post URL here..."
      validate={isValidTwitterUrl}
      buttonClassName="bg-gradient-to-r from-sky-500 to-black hover:from-sky-600 hover:to-zinc-900 shadow-sky-500/30"
      help="Downloads Twitter/X videos in the highest available quality."
      onDownload={onDownload}
    />
  );
}
