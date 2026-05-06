"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import DownloaderSection from "@/components/DownloaderSection";
import { isValidFacebookUrl } from "@/lib/utils";
import { Facebook, Image as ImageIcon } from "lucide-react";

/**
 * Facebook page exposes two stacked features:
 *   - Video / Reel Downloader → /api/stream     → MP4 in best available quality
 *   - Video Thumbnail         → /api/thumbnail  → cover image as JPG
 */
export default function FacebookDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  const fbButton =
    "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-600/30";
  const fbChip = "bg-blue-600";

  return (
    <div className="space-y-6">
      <DownloaderSection
        icon={<Facebook className="h-5 w-5" />}
        title="Facebook Video & Reel Downloader"
        description="Save public Facebook videos, Reels, and Watch posts in the highest available quality."
        iconBgClassName={fbChip}
        borderColorClassName="border-blue-600/25"
      >
        <SimpleDownloader
          platform="Facebook"
          filePrefix="facebook"
          mediaTypeLabel="HD MP4"
          placeholder="Paste Facebook video, Reel, or Watch URL..."
          validate={isValidFacebookUrl}
          buttonClassName={fbButton}
          help="Public posts only. Login-walled or friends-only content can't be fetched."
          onDownload={onDownload}
        />
      </DownloaderSection>

      <DownloaderSection
        icon={<ImageIcon className="h-5 w-5" />}
        title="Facebook Video Thumbnail Downloader"
        description="Grab the cover image of any public Facebook video or Reel as a high-quality JPG."
        iconBgClassName={fbChip}
        borderColorClassName="border-blue-600/25"
      >
        <SimpleDownloader
          platform="Facebook"
          filePrefix="facebook-thumbnail"
          mediaTypeLabel="Thumbnail JPG"
          placeholder="Paste Facebook video or Reel URL..."
          validate={isValidFacebookUrl}
          buttonClassName={fbButton}
          help="Useful for previews, reaction content, and offline archiving."
          onDownload={onDownload}
          endpoint="/api/thumbnail"
          fileExtension="jpg"
        />
      </DownloaderSection>
    </div>
  );
}
