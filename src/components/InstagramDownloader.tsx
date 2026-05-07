"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import DownloaderSection from "@/components/DownloaderSection";
import { isValidInstagramUrl } from "@/lib/utils";
import { Film, Images } from "lucide-react";

/**
 * Instagram exposes two side-by-side downloaders so the user can see both
 * options at a glance without scrolling:
 *   - Reel & Video Downloader   → /api/stream  → MP4
 *   - Photos & Carousel         → /api/photos  → single JPG or ZIP of slides
 *
 * The two sections share the same Instagram gradient so the page reads as
 * one product, but each has its own URL field + button so users can grab
 * a Reel and a photo carousel without re-pasting links.
 *
 * Side-by-side on md+ screens; stacks on mobile via the responsive grid.
 */
export default function InstagramDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  const igButton =
    "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 shadow-pink-600/30";
  const igChip = "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DownloaderSection
        icon={<Film className="h-5 w-5" />}
        title="Reel & Video Downloader"
        description="Save Instagram Reels, IGTV, and video posts as MP4 in HD."
        iconBgClassName={igChip}
        borderColorClassName="border-pink-600/25"
      >
        <SimpleDownloader
          platform="Instagram"
          filePrefix="instagram-reel"
          mediaTypeLabel="Reel / Video MP4"
          placeholder="Paste Instagram Reel or video URL..."
          validate={isValidInstagramUrl}
          buttonClassName={igButton}
          help="Works on any public Reel, IGTV episode, or video post."
          onDownload={onDownload}
        />
      </DownloaderSection>

      <DownloaderSection
        icon={<Images className="h-5 w-5" />}
        title="Photos & Carousel Downloader"
        description="Single photo → JPG. Multi-slide carousel → ZIP of all images."
        iconBgClassName={igChip}
        borderColorClassName="border-pink-600/25"
      >
        <SimpleDownloader
          platform="Instagram"
          filePrefix="instagram-photo"
          mediaTypeLabel="Photo / Carousel"
          placeholder="Paste Instagram photo or carousel URL..."
          validate={isValidInstagramUrl}
          buttonClassName={igButton}
          help="Pulls every slide of a carousel in original quality."
          onDownload={onDownload}
          endpoint="/api/photos"
          fileExtension="zip"
        />
      </DownloaderSection>
    </div>
  );
}
