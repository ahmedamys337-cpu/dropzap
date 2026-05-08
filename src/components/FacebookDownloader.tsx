"use client";

import SimpleDownloader from "@/components/SimpleDownloader";
import DownloaderSection from "@/components/DownloaderSection";
import { isValidFacebookUrl } from "@/lib/utils";
import { Facebook, Images } from "lucide-react";

/**
 * Facebook exposes two side-by-side downloaders, mirroring Instagram:
 *   - Video / Reel Downloader → /api/stream  → MP4
 *   - Photo / Album Downloader → /api/photos → single JPG or ZIP of slides
 *
 * Two URL fields visible at once means users grabbing both a video and a
 * photo from the same FB page don't have to switch contexts.
 */
export default function FacebookDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  // Mirrors the Instagram page's two-theme split so the same visual
  // language ("cool = video, warm = photo") holds across the site.
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
        icon={<Facebook className="h-5 w-5" />}
        title="Facebook Video & Reel Downloader"
        description="Save public FB videos, Reels, and Watch posts in HD."
        iconBgClassName={reelTheme.icon}
        borderColorClassName={reelTheme.border}
        borderLeftAccentClassName={reelTheme.leftAccent}
        hoverShadowClassName={reelTheme.hoverShadow}
      >
        <SimpleDownloader
          platform="Facebook"
          filePrefix="facebook"
          mediaTypeLabel="HD MP4"
          placeholder="Paste Facebook video or Reel URL..."
          validate={isValidFacebookUrl}
          buttonClassName={reelTheme.button}
          inputFocusRingClassName={reelTheme.inputRing}
          badges={[{ icon: "🎬", label: "Output: MP4 HD" }]}
          badgeClassName={reelTheme.badge}
          help="Public posts only. Login-walled content can't be fetched."
          onDownload={onDownload}
        />
      </DownloaderSection>

      <DownloaderSection
        icon={<Images className="h-5 w-5" />}
        title="Facebook Photo & Album Downloader"
        description="Single photo → JPG. Multi-photo album → ZIP of all images."
        iconBgClassName={photoTheme.icon}
        borderColorClassName={photoTheme.border}
        borderLeftAccentClassName={photoTheme.leftAccent}
        hoverShadowClassName={photoTheme.hoverShadow}
      >
        <SimpleDownloader
          platform="Facebook"
          filePrefix="facebook-photo"
          mediaTypeLabel="Photo / Album"
          placeholder="Paste Facebook photo or album URL..."
          validate={isValidFacebookUrl}
          buttonClassName={photoTheme.button}
          inputFocusRingClassName={photoTheme.inputRing}
          badges={[
            { icon: "🖼️", label: "Output: JPG" },
            { icon: "📦", label: "Album → ZIP" },
          ]}
          badgeClassName={photoTheme.badge}
          help="Pulls every image of an album in original quality."
          onDownload={onDownload}
          endpoint="/api/photos"
          fileExtension="zip"
        />
      </DownloaderSection>
    </div>
  );
}
