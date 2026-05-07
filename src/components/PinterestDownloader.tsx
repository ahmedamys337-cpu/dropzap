"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import { isValidPinterestUrl } from "@/lib/utils";

export default function PinterestDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  return (
    <SimpleDownloader
      platform="Pinterest"
      filePrefix="pinterest"
      mediaTypeLabel="Pin Media"
      placeholder="Paste Pinterest pin URL or pin.it short link..."
      validate={isValidPinterestUrl}
      buttonClassName="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-600/30"
      help="Downloads Pinterest pin images and videos in their original quality."
      onDownload={onDownload}
      endpoint="/api/auto"
    />
  );
}
