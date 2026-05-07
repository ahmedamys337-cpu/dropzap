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
  const fbButton =
    "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-600/30";
  const fbChip = "bg-blue-600";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DownloaderSection
        icon={<Facebook className="h-5 w-5" />}
        title="Facebook Video & Reel Downloader"
        description="Save public FB videos, Reels, and Watch posts in HD."
        iconBgClassName={fbChip}
        borderColorClassName="border-blue-600/25"
      >
        <SimpleDownloader
          platform="Facebook"
          filePrefix="facebook"
          mediaTypeLabel="HD MP4"
          placeholder="Paste Facebook video or Reel URL..."
          validate={isValidFacebookUrl}
          buttonClassName={fbButton}
          help="Public posts only. Login-walled content can't be fetched."
          onDownload={onDownload}
        />
      </DownloaderSection>

      <DownloaderSection
        icon={<Images className="h-5 w-5" />}
        title="Facebook Photo & Album Downloader"
        description="Single photo → JPG. Multi-photo album → ZIP of all images."
        iconBgClassName={fbChip}
        borderColorClassName="border-blue-600/25"
      >
        <SimpleDownloader
          platform="Facebook"
          filePrefix="facebook-photo"
          mediaTypeLabel="Photo / Album"
          placeholder="Paste Facebook photo or album URL..."
          validate={isValidFacebookUrl}
          buttonClassName={fbButton}
          help="Pulls every image of an album in original quality."
          onDownload={onDownload}
          endpoint="/api/photos"
          fileExtension="zip"
        />
      </DownloaderSection>
    </div>
  );
}
