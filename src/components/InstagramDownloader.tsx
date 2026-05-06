"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import DownloaderSection from "@/components/DownloaderSection";
import { isValidInstagramUrl } from "@/lib/utils";
import { Film, Image as ImageIcon, Images } from "lucide-react";

/**
 * Instagram has THREE distinct content types that each want their own URL
 * input + dedicated download button on the page. We render them as three
 * stacked cards rather than tabs because:
 *   - users frequently grab a Reel link AND a photo link from the same
 *     creator; tabs forced them to switch back and forth and re-paste,
 *   - each card can carry a precise placeholder + helper text describing
 *     exactly what file the user gets (MP4 / JPG / ZIP), removing the
 *     confusion of pasting a photo URL into the video flow,
 *   - SEO benefits from each feature being a discoverable H3 on the page.
 *
 * Each card wires SimpleDownloader to the correct backend endpoint:
 *   - Reels / video posts        → /api/stream            → MP4
 *   - Reel / post thumbnail      → /api/thumbnail         → JPG
 *   - Photos / carousel slides   → /api/instagram/photos  → JPG or ZIP
 */
export default function InstagramDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  // Shared button gradient — reused by all 3 sections so the page reads as
  // one coherent Instagram product even though each card targets a
  // different pipeline.
  const igButton =
    "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 shadow-pink-600/30";
  const igChip =
    "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500";

  return (
    <div className="space-y-6">
      <DownloaderSection
        icon={<Film className="h-5 w-5" />}
        title="Reel & Video Downloader"
        description="Save Instagram Reels, IGTV, and video posts as MP4 in original HD quality."
        iconBgClassName={igChip}
        borderColorClassName="border-pink-600/25"
      >
        <SimpleDownloader
          platform="Instagram"
          filePrefix="instagram-reel"
          mediaTypeLabel="Reel / Video MP4"
          placeholder="Paste Instagram Reel, video post, or IGTV URL..."
          validate={isValidInstagramUrl}
          buttonClassName={igButton}
          help="Works on any public Reel, IGTV episode, or video feed post."
          onDownload={onDownload}
        />
      </DownloaderSection>

      <DownloaderSection
        icon={<ImageIcon className="h-5 w-5" />}
        title="Reel Thumbnail Downloader"
        description="Grab the cover image of any Reel or video post as a high-resolution JPG."
        iconBgClassName={igChip}
        borderColorClassName="border-pink-600/25"
      >
        <SimpleDownloader
          platform="Instagram"
          filePrefix="instagram-thumbnail"
          mediaTypeLabel="Thumbnail JPG"
          placeholder="Paste Instagram Reel or video post URL..."
          validate={isValidInstagramUrl}
          buttonClassName={igButton}
          help="Useful for content repurposing, reaction videos, or saving covers for moodboards."
          onDownload={onDownload}
          endpoint="/api/thumbnail"
          fileExtension="jpg"
        />
      </DownloaderSection>

      <DownloaderSection
        icon={<Images className="h-5 w-5" />}
        title="Photos & Carousel Downloader"
        description="Single photo → JPG. Multi-image carousel → ZIP with every slide named in order."
        iconBgClassName={igChip}
        borderColorClassName="border-pink-600/25"
      >
        <SimpleDownloader
          platform="Instagram"
          filePrefix="instagram-photo"
          mediaTypeLabel="Photo / Carousel"
          placeholder="Paste Instagram photo or carousel post URL..."
          validate={isValidInstagramUrl}
          buttonClassName={igButton}
          help="Pulls every slide of a carousel in original quality, packed into one zip."
          onDownload={onDownload}
          endpoint="/api/instagram/photos"
          fileExtension="zip"
        />
      </DownloaderSection>
    </div>
  );
}
