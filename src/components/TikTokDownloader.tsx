"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import DownloaderSection from "@/components/DownloaderSection";
import { isValidTikTokUrl } from "@/lib/utils";
import { Music2, Image as ImageIcon } from "lucide-react";

/**
 * TikTok page exposes two stacked features so users always know exactly
 * which file they'll get for the URL they're pasting:
 *   - Video Downloader      → /api/stream     → watermark-free MP4
 *   - Video Thumbnail       → /api/thumbnail  → cover image as JPG
 *
 * Stacked cards (rather than tabs) so a user grabbing both files for the
 * same TikTok only has to paste the URL twice instead of switching tabs.
 */
export default function TikTokDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  const ttButton =
    "bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 shadow-pink-500/30";
  const ttChip = "bg-gradient-to-br from-cyan-500 to-pink-500";

  return (
    <div className="space-y-6">
      <DownloaderSection
        icon={<Music2 className="h-5 w-5" />}
        title="TikTok Video Downloader"
        description="Save TikTok videos in original HD quality with the watermark removed."
        iconBgClassName={ttChip}
        borderColorClassName="border-pink-500/25"
      >
        <SimpleDownloader
          platform="TikTok"
          filePrefix="tiktok"
          mediaTypeLabel="No Watermark MP4"
          placeholder="Paste TikTok video URL here..."
          validate={isValidTikTokUrl}
          buttonClassName={ttButton}
          help="Works with public TikTok videos, including slideshows and live replays."
          onDownload={onDownload}
        />
      </DownloaderSection>

      <DownloaderSection
        icon={<ImageIcon className="h-5 w-5" />}
        title="TikTok Video Thumbnail Downloader"
        description="Grab the cover image of any public TikTok video as a high-quality JPG."
        iconBgClassName={ttChip}
        borderColorClassName="border-pink-500/25"
      >
        <SimpleDownloader
          platform="TikTok"
          filePrefix="tiktok-thumbnail"
          mediaTypeLabel="Thumbnail JPG"
          placeholder="Paste TikTok video URL here..."
          validate={isValidTikTokUrl}
          buttonClassName={ttButton}
          help="Perfect for thumbnails on YouTube reaction videos or content reposts."
          onDownload={onDownload}
          endpoint="/api/thumbnail"
          fileExtension="jpg"
        />
      </DownloaderSection>
    </div>
  );
}
