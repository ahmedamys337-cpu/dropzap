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
  /**
   * Override the API endpoint hit on click. Defaults to the unified video
   * pipeline (`/api/stream`); the Instagram photos tab points it at
   * `/api/instagram/photos` so a single component drives both reels and
   * carousel-zip downloads.
   */
  endpoint?: string;
  /**
   * File extension for the downloaded asset. Defaults to "mp4" so every
   * existing video caller keeps working unchanged. Photo carousels pass
   * "zip", single photos pass "jpg".
   */
  fileExtension?: string;
  /**
   * Optional pill/badge tags rendered between the URL input and the
   * Download button. Used on Instagram/Facebook to spell out output
   * format (e.g. "MP4 HD", "JPG", "Carousel → ZIP") so the user
   * picks the right card without reading the description text.
   */
  badges?: { icon: string; label: string }[];
  /**
   * Tailwind class string applied to each badge for tinted background +
   * text color matching the card's accent. Example:
   * "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300".
   */
  badgeClassName?: string;
  /**
   * Tailwind class for the input's focus ring color (e.g.
   * "focus-visible:ring-indigo-500"). Lets each card's URL field echo
   * its accent color when active.
   */
  inputFocusRingClassName?: string;
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
  endpoint = "/api/stream",
  fileExtension = "mp4",
  badges,
  badgeClassName,
  inputFocusRingClassName,
}: SimpleDownloaderProps) {
  const [url, setUrl] = useState("");
  // Phase machine:
  //   idle        → user can paste a URL and click Download.
  //   ad          → 5s ad overlay is up; native download has already fired so
  //                 the server is warming yt-dlp in parallel.
  //   downloading → ad finished, but we keep showing a spinner for 4 more
  //                 seconds to mask the 3–5s gap between ad-close and the
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
    if (!url || !validate(url)) {
      toast({
        title: "Invalid URL",
        description: `Please enter a valid ${platform} URL.`,
        variant: "destructive",
      });
      return;
    }

    // Fire the native download IMMEDIATELY so the server starts working
    // (yt-dlp warm-up, format selection, transcoding) while the user watches
    // the 3-second ad. By the time the ad closes the file is usually already
    // streaming into the browser's download bar.
    //
    // The filename here is just the BROWSER FALLBACK shown in the download
    // bar before the response arrives; the server always overrides via its
    // Content-Disposition header (e.g. "instagram-photos.zip"). Keeping it
    // consistent with the platform makes the briefly-flashed name correct
    // for both video and photo downloads.
    const name = `${safeFilename(filePrefix, filePrefix)}.${fileExtension}`;
    // Merge with any query params already on the endpoint (e.g. /api/stream?audio=1)
    const [basePath, baseQuery] = endpoint.split("?");
    const params = new URLSearchParams(baseQuery);
    params.set("url", url);
    params.set("name", name);
    const streamUrl = `${basePath}?${params.toString()}`;
    triggerNativeDownload(streamUrl, name);
    onDownload?.(`${platform} ${mediaTypeLabel}`, url, mediaTypeLabel);

    setPhase("ad");
  };

  const finishAd = () => {
    // Ad ended → enter the explicit "Downloading…" stage for 4s before
    // claiming "Downloaded". This covers the typical server-side latency so
    // by the time the success state appears, the file genuinely is in the
    // browser's download bar.
    setPhase("downloading");
    if (downloadingTimer.current) clearTimeout(downloadingTimer.current);
    // Server downloads the file to a temp path, then streams it with a real
    // Content-Length so the browser shows accurate progress. 5s is a safe
    // cap for IG/TikTok-class clips: if the file arrives earlier the browser
    // progress bar is already showing it; if it arrives later the user
    // still sees bytes landing in their downloads list. Was 10s but felt
    // unnecessarily slow for the (common) sub-1s server response.
    downloadingTimer.current = setTimeout(() => setPhase("downloaded"), 5000);
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
          // a11y: visible <Input> has only a placeholder (which screen
          // readers may or may not announce depending on assistive
          // tech), so an explicit aria-label guarantees the field's
          // purpose is announced. Maps to the Lighthouse audit
          // "form-field-multiple-labels" / "label" rule.
          aria-label={`Paste ${platform} URL here`}
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          className={`h-14 text-base pr-20 bg-white/5 border-white/10 backdrop-blur-sm transition-shadow ${inputFocusRingClassName ?? ""}`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={paste}
            disabled={isBusy}
            aria-label="Paste URL from clipboard"
            title="Paste from clipboard"
          >
            <Clipboard className="h-4 w-4" aria-hidden="true" />
          </Button>
          {url && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={clearUrl}
              disabled={isBusy}
              aria-label="Clear URL"
              title="Clear"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      {/* Output-format pills. Sit between input + button so users see
          "what file will I get?" right where they're about to commit. */}
      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((b, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badgeClassName ?? "bg-foreground/5 text-foreground/80"}`}
            >
              <span aria-hidden="true">{b.icon}</span>
              {b.label}
            </span>
          ))}
        </div>
      )}

      <Button
        onClick={start}
        // Intentionally NOT disabling on empty URL: keeps the button
        // visually "alive" (hover gradient, lift) before the user has
        // pasted anything. validate() handles empty/invalid URLs and
        // surfaces a toast so the click isn't silently ignored.
        disabled={isBusy || isDone}
        // Per-platform descriptive label so screen readers announce
        // "Download Instagram Reel" / "Download TikTok video without
        // watermark" rather than the generic word "Download".
        aria-label={`Download ${platform} ${mediaTypeLabel}`}
        className={
          isDone
            ? "w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 transition-all"
            : isDownloading
              ? "w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 transition-all"
              : `w-full h-14 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.99] ${buttonClassName}`
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

      {/* Inline downloading hint while the 4s buffer runs after the ad. */}
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
