"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import DownloaderSection from "@/components/DownloaderSection";
import { isValidTwitterUrl } from "@/lib/utils";
import { Twitter, Image as ImageIcon } from "lucide-react";

/**
 * Twitter/X page exposes two stacked features:
 *   - Video Downloader   → /api/stream     → MP4 in best available quality
 *   - Video Thumbnail    → /api/thumbnail  → cover/preview image as JPG
 */
export default function TwitterDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  const twButton =
    "bg-gradient-to-r from-sky-500 to-black hover:from-sky-600 hover:to-zinc-900 shadow-sky-500/30";
  const twChip = "bg-gradient-to-br from-sky-500 to-black";

  return (
    <div className="space-y-6">
      <DownloaderSection
        icon={<Twitter className="h-5 w-5" />}
        title="Twitter / X Video Downloader"
        description="Save videos from Twitter / X posts in the highest available quality."
        iconBgClassName={twChip}
        borderColorClassName="border-sky-500/25"
      >
        <SimpleDownloader
          platform="Twitter/X"
          filePrefix="twitter"
          mediaTypeLabel="Video MP4"
          placeholder="Paste Twitter/X post URL here..."
          validate={isValidTwitterUrl}
          buttonClassName={twButton}
          help="Works on twitter.com and x.com URLs. Public posts only."
          onDownload={onDownload}
        />
      </DownloaderSection>

      <DownloaderSection
        icon={<ImageIcon className="h-5 w-5" />}
        title="Twitter / X Video Thumbnail Downloader"
        description="Grab the cover image of any public Twitter / X video as a high-quality JPG."
        iconBgClassName={twChip}
        borderColorClassName="border-sky-500/25"
      >
        <SimpleDownloader
          platform="Twitter/X"
          filePrefix="twitter-thumbnail"
          mediaTypeLabel="Thumbnail JPG"
          placeholder="Paste Twitter/X video post URL..."
          validate={isValidTwitterUrl}
          buttonClassName={twButton}
          help="Useful for previews, reaction content, and offline archiving."
          onDownload={onDownload}
          endpoint="/api/thumbnail"
          fileExtension="jpg"
        />
      </DownloaderSection>
    </div>
  );
}
