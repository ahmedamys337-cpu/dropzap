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
  // Two visually distinct themes so the side-by-side cards read as
  // different products at a glance:
  //   • Reel / Video → cool indigo→violet (#4F46E5 → #7C3AED)
  //   • Photos       → warm coral→pink   (#F97316 → #EC4899)
  const reelTheme = {
    icon: "bg-gradient-to-br from-indigo-600 to-violet-600",
    button:
      "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-violet-600/30",
    border: "border-indigo-500/30",
    leftAccent: "border-l-4 border-l-indigo-600",
    hoverShadow: "hover:shadow-indigo-500/30",
    inputRing: "focus-visible:ring-indigo-500",
    badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  };
  const photoTheme = {
    icon: "bg-gradient-to-br from-orange-500 to-pink-500",
    button:
      "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 shadow-pink-500/30",
    border: "border-orange-500/30",
    leftAccent: "border-l-4 border-l-orange-500",
    hoverShadow: "hover:shadow-orange-500/30",
    inputRing: "focus-visible:ring-orange-500",
    badge: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DownloaderSection
        icon={<Film className="h-5 w-5" />}
        title="Reel & Video Downloader"
        description="Save Instagram Reels, IGTV, and video posts as MP4 in HD."
        iconBgClassName={reelTheme.icon}
        borderColorClassName={reelTheme.border}
        borderLeftAccentClassName={reelTheme.leftAccent}
        hoverShadowClassName={reelTheme.hoverShadow}
      >
        <SimpleDownloader
          platform="Instagram"
          filePrefix="instagram-reel"
          mediaTypeLabel="Reel / Video MP4"
          placeholder="Paste Instagram Reel or video URL..."
          validate={isValidInstagramUrl}
          buttonClassName={reelTheme.button}
          inputFocusRingClassName={reelTheme.inputRing}
          badges={[{ icon: "🎬", label: "Output: MP4 HD" }]}
          badgeClassName={reelTheme.badge}
          help="Works on any public Reel, IGTV episode, or video post."
          onDownload={onDownload}
        />
      </DownloaderSection>

      <DownloaderSection
        icon={<Images className="h-5 w-5" />}
        title="Photos & Carousel Downloader"
        description="Single photo → JPG. Multi-slide carousel → ZIP of all images."
        iconBgClassName={photoTheme.icon}
        borderColorClassName={photoTheme.border}
        borderLeftAccentClassName={photoTheme.leftAccent}
        hoverShadowClassName={photoTheme.hoverShadow}
      >
        <SimpleDownloader
          platform="Instagram"
          filePrefix="instagram-photo"
          mediaTypeLabel="Photo / Carousel"
          placeholder="Paste Instagram photo or carousel URL..."
          validate={isValidInstagramUrl}
          buttonClassName={photoTheme.button}
          inputFocusRingClassName={photoTheme.inputRing}
          badges={[
            { icon: "🖼️", label: "Output: JPG" },
            { icon: "📦", label: "Carousel → ZIP" },
          ]}
          badgeClassName={photoTheme.badge}
          help="Pulls every slide of a carousel in original quality."
          onDownload={onDownload}
          endpoint="/api/photos"
          fileExtension="zip"
        />
      </DownloaderSection>
    </div>
  );
}
