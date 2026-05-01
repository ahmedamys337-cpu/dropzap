"use client";

import MediaPostDownloader from "@/components/MediaPostDownloader";
import { isValidPinterestUrl } from "@/lib/utils";

export default function PinterestDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  return (
    <MediaPostDownloader
      platform="Pinterest"
      filePrefix="pinterest"
      placeholder="Paste Pinterest pin URL or pin.it short link..."
      validate={isValidPinterestUrl}
      buttonClassName="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-600/30"
      onDownload={onDownload}
      help="Supports Pinterest pin images and videos (Idea Pins + standard pins)."
    />
  );
}
