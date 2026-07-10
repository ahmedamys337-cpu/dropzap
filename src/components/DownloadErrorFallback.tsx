"use client";

import Link from "next/link";
import { Lightbulb, Puzzle, FileQuestion, ArrowRight } from "lucide-react";

interface Props {
  platform: string;
  url: string;
  errorMessage: string;
}

export default function DownloadErrorFallback({ platform, url, errorMessage }: Props) {
  const normalizedError = errorMessage.toLowerCase();
  const isPrivate = normalizedError.includes("private") || normalizedError.includes("not public");
  const isVideo = normalizedError.includes("video") || normalizedError.includes("reel") || normalizedError.includes("mp4");
  const isImage = normalizedError.includes("image") || normalizedError.includes("photo") || normalizedError.includes("jpg") || normalizedError.includes("carousel");
  const isBlocked = normalizedError.includes("block") || normalizedError.includes("ip") || normalizedError.includes("rate");

  // Platform-specific redirect targets.
  const platformMap: Record<string, { reel: string; photo: string; main: string; guide?: string }> = {
    tiktok: { reel: "/tiktok-downloader", photo: "/tiktok-downloader", main: "/tiktok-downloader", guide: "/blog/how-to-download-tiktok-without-watermark" },
    instagram: { reel: "/instagram-reels-downloader", photo: "/instagram-photo-downloader", main: "/instagram-downloader", guide: "/blog/how-to-download-instagram-reels-on-iphone" },
    facebook: { reel: "/facebook-reel-downloader", photo: "/facebook-video-downloader", main: "/facebook-video-downloader", guide: "/blog/facebook-video-downloader-guide" },
    twitter: { reel: "/twitter-video-downloader", photo: "/twitter-video-downloader", main: "/twitter-video-downloader", guide: "/blog/twitter-video-downloader-guide" },
    reddit: { reel: "/reddit-video-downloader", photo: "/reddit-video-downloader", main: "/reddit-video-downloader", guide: "/blog/reddit-video-download-with-sound" },
    pinterest: { reel: "/pinterest-video-downloader", photo: "/pinterest-video-downloader", main: "/pinterest-video-downloader" },
    threads: { reel: "/threads-downloader", photo: "/threads-downloader", main: "/threads-downloader" },
  };

  const targets = platformMap[platform.toLowerCase()] || platformMap.instagram;
  const toolHref = isImage ? targets.photo : isVideo ? targets.reel : targets.main;
  const encodedUrl = encodeURIComponent(url);

  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-600/10 px-4 py-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3 mb-3">
        <Lightbulb className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Try one of these options</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            This download did not finish, but we can probably still help.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Link
          href={`${toolHref}?url=${encodedUrl}`}
          className="flex items-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2.5 text-sm transition-colors"
        >
          <FileQuestion className="h-4 w-4 text-purple-400 flex-shrink-0" />
          <span className="truncate">
            {isImage ? "Try photo/carousel downloader" : isVideo ? "Try reel/video downloader" : `Try ${platform} downloader`}
          </span>
          <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
        </Link>

        <Link
          href={`/extension?url=${encodedUrl}`}
          className="flex items-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2.5 text-sm transition-colors"
        >
          <Puzzle className="h-4 w-4 text-purple-400 flex-shrink-0" />
          <span>Get the DropZap extension</span>
          <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
        </Link>

        {targets.guide && (
          <Link
            href={targets.guide}
            className="flex items-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2.5 text-sm transition-colors sm:col-span-2"
          >
            <FileQuestion className="h-4 w-4 text-purple-400 flex-shrink-0" />
            <span>Read the {platform} download troubleshooting guide</span>
            <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
          </Link>
        )}
      </div>

      {isPrivate && (
        <p className="text-xs text-muted-foreground mt-3">
          This post looks private. DropZap can only download publicly visible content.
        </p>
      )}
      {isBlocked && (
        <p className="text-xs text-muted-foreground mt-3">
          The platform may be temporarily blocking this server. Try again in a few minutes or use the browser extension.
        </p>
      )}
    </div>
  );
}
