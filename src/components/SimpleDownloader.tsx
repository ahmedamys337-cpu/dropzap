"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { triggerNativeDownload, safeFilename } from "@/lib/download";
import AdCountdown from "@/components/AdCountdown";
import { Download, Loader2, Clipboard, X, CheckCircle2 } from "lucide-react";

/**
 * Single-button downloader used by every "non-YouTube" platform (TikTok,
 * Twitter, Reddit, Instagram, Facebook, Pinterest, Threads).
 *
 * Flow:
 *   1. User pastes a URL and clicks the platform-coloured Download button.
 *   2. The 5-second ad overlay opens AND we kick off /api/stream by writing
 *      its URL to an invisible <a download> element (the request begins as
 *      soon as the browser starts the download, which the click triggers
 *      immediately so server-side yt-dlp warm-up runs in parallel with the
 *      ad timer rather than after it).
 *   3. When the ad timer finishes the overlay closes and the page shows a
 *      "Your video is downloaded!" confirmation. The button text flips to
 *      "Downloaded ✓" for a few seconds.
 *
 * The /api/stream endpoint already requests yt-dlp's best-quality format,
 * so callers do NOT need to expose a quality picker.
 */
interface SimpleDownloaderProps {
  /** Friendly platform name used in toast/history (e.g. "TikTok"). */
  platform: string;
  /** Filename prefix for the downloaded file (e.g. "tiktok-video"). */
  filePrefix: string;
  /** Description rendered in the toast/history when a download begins. */
  mediaTypeLabel: string;
  /** Placeholder text for the URL input. */
  placeholder: string;
  /** Returns true when the URL is valid for this platform. */
  validate: (url: string) => boolean;
  /** Tailwind class string for the Download button background/colors. */
  buttonClassName: string;
  /** Optional helper text rendered below the form. */
  help?: string;
  /** Called when a download begins so the page can record it in history. */
  onDownload?: (title: string, url: string, type: string) => void;
}

export default function SimpleDownloader({
  platform,
  filePrefix,
  mediaTypeLabel,
  placeholder,
  validate,
  buttonClassName,
  help,
  onDownload,
}: SimpleDownloaderProps) {
  const [url, setUrl] = useState("");
  // Phase machine:
  //   idle        → user can paste a URL and click Download.
  //   ad          → 5s ad overlay is up; native download has already fired so
  //                 the server is warming yt-dlp in parallel.
  //   downloading → ad finished, but we keep showing a spinner for 3 more
  //                 seconds to mask the 2–4s gap between ad-close and the
  //                 file actually appearing in the browser's download bar.
  //   downloaded  → success state. PERSISTENT: stays until the URL is cleared
  //                 or the page is refreshed.
  const [phase, setPhase] = useState<"idle" | "ad" | "downloading" | "downloaded">("idle");
  const downloadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  useEffect(() => () => {
    if (downloadingTimer.current) clearTimeout(downloadingTimer.current);
  }, []);

  const start = () => {
    if (!validate(url)) {
      toast({
        title: "Invalid URL",
        description: `Please enter a valid ${platform} URL.`,
        variant: "destructive",
      });
      return;
    }

    // Fire the native download IMMEDIATELY so the server starts working
    // (yt-dlp warm-up, format selection, transcoding) while the user watches
    // the 5-second ad. By the time the ad closes the file is usually already
    // streaming into the browser's download bar.
    const name = `${safeFilename(`${filePrefix}-video`, filePrefix)}.mp4`;
    const streamUrl = `/api/stream?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
    triggerNativeDownload(streamUrl, name);
    onDownload?.(`${platform} ${mediaTypeLabel}`, url, mediaTypeLabel);

    setPhase("ad");
  };

  const finishAd = () => {
    // Ad ended → enter the explicit "Downloading…" stage for 3s before
    // claiming "Downloaded". This covers the typical server-side latency so
    // by the time the success state appears, the file genuinely is in the
    // browser's download bar.
    setPhase("downloading");
    if (downloadingTimer.current) clearTimeout(downloadingTimer.current);
    downloadingTimer.current = setTimeout(() => setPhase("downloaded"), 3000);
  };

  const paste = async () => {
    try {
      setUrl(await navigator.clipboard.readText());
    } catch {}
  };

  const clearUrl = () => {
    if (downloadingTimer.current) clearTimeout(downloadingTimer.current);
    setUrl("");
    setPhase("idle");
  };

  const isAd = phase === "ad";
  const isDownloading = phase === "downloading";
  const isBusy = isAd || isDownloading;
  const isDone = phase === "downloaded";

  return (
    <div className="space-y-5">
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isBusy && !isDone && start()}
          disabled={isBusy}
          className="h-14 text-base pr-20 bg-white/5 border-white/10 backdrop-blur-sm"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={paste}
            disabled={isBusy}
          >
            <Clipboard className="h-4 w-4" />
          </Button>
          {url && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={clearUrl}
              disabled={isBusy}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Button
        onClick={start}
        disabled={!url || isBusy || isDone}
        className={
          isDone
            ? "w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 transition-all"
            : isDownloading
              ? "w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 transition-all"
              : `w-full h-14 text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] ${buttonClassName}`
        }
      >
        {isAd ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : isDownloading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Downloading...
          </>
        ) : isDone ? (
          <>
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Downloaded ✓
          </>
        ) : (
          <>
            <Download className="h-5 w-5 mr-2" />
            Download
          </>
        )}
      </Button>

      {/* Inline downloading hint while the 3s buffer runs after the ad. */}
      {isDownloading && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/15 dark:bg-amber-500/10 px-4 py-3 animate-in fade-in duration-200">
          <Loader2 className="h-4 w-4 animate-spin text-amber-700 dark:text-amber-300" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Downloading… your file will appear in the browser&apos;s download bar in a moment.
          </p>
        </div>
      )}

      {/* Persistent confirmation banner — stays until URL is cleared or page reloads. */}
      {isDone && (
        <div className="flex items-center gap-3 rounded-lg border-2 border-emerald-500/50 bg-emerald-500/15 dark:bg-emerald-500/10 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">
              Your video is downloaded!
            </p>
            <p className="text-xs text-emerald-700/90 dark:text-emerald-300/90">
              Check your browser&apos;s download bar. Click ✕ on the URL field to download another.
            </p>
          </div>
        </div>
      )}

      {help && !isDone && !isBusy && (
        <p className="text-xs text-muted-foreground text-center">{help}</p>
      )}

      {/* Ad runs in parallel with the server's yt-dlp warm-up + stream start. */}
      {isAd && (
        <AdCountdown
          seconds={5}
          message="Starting your download. Stay on the page."
          onComplete={finishAd}
        />
      )}
    </div>
  );
}
