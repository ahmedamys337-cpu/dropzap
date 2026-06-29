"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { safeFilename } from "@/lib/download";
import AdCountdown from "@/components/AdCountdown";
import { Download, Loader2, Clipboard, X, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Single-button downloader used by every "non-YouTube" platform (TikTok,
 * Twitter, Reddit, Instagram, Facebook, Pinterest, Threads).
 *
 * Flow:
 *   1. User pastes a URL and clicks the platform-coloured Download button.
 *   2. The 5-second ad overlay opens AND a fetch() to /api/stream starts
 *      in the background (server-side yt-dlp warm-up runs in parallel).
 *   3. When the fetch completes the response blob is turned into a local
 *      object-URL and a native download is triggered automatically.
 *   4. If the server returns an error (e.g. private post, IP block) the
 *      banner shows the actual error text instead of a browser "site
 *      unavailable" message — the user knows exactly what went wrong and
 *      can retry.
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
  //   ad          → 5s ad overlay is up; fetch() to the API is running in
  //                 parallel so server-side yt-dlp warms up during the ad.
  //   downloading → ad finished but the server fetch is still running.
  //   downloaded  → blob received, object-URL clicked, success banner shown.
  //   error       → server returned non-200 or network failed; banner shows
  //                 the actual error. Button is re-enabled for retry.
  const [phase, setPhase] = useState<"idle" | "ad" | "downloading" | "downloaded" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();

  const adDoneRef = useRef(false);
  const fetchDoneRef = useRef(false);
  const fetchBlobRef = useRef<{ blob: Blob; name: string } | null>(null);
  const fetchErrRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => {
    abortRef.current?.abort();
  }, []);

  const doDownload = (blob: Blob, name: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = name;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try { document.body.removeChild(a); } catch {}
      URL.revokeObjectURL(objectUrl);
    }, 1000);
    setPhase("downloaded");
  };

  const start = () => {
    if (!url || !validate(url)) {
      toast({
        title: "Invalid URL",
        description: `Please enter a valid ${platform} URL.`,
        variant: "destructive",
      });
      return;
    }

    const name = `${safeFilename(filePrefix, filePrefix)}.${fileExtension}`;
    const [basePath, baseQuery] = endpoint.split("?");
    const params = new URLSearchParams(baseQuery || "");
    params.set("url", url);
    params.set("name", name);
    const streamUrl = `${basePath}?${params.toString()}`;

    adDoneRef.current = false;
    fetchDoneRef.current = false;
    fetchBlobRef.current = null;
    fetchErrRef.current = null;

    setErrorMsg(null);
    setPhase("ad");
    onDownload?.(`${platform} ${mediaTypeLabel}`, url, mediaTypeLabel);

    const controller = new AbortController();
    abortRef.current = controller;

    fetch(streamUrl, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => `Server error (${res.status})`);
          const msg = text?.trim() || `Download failed (${res.status})`;
          fetchErrRef.current = msg;
          fetchDoneRef.current = true;
          if (adDoneRef.current) {
            setErrorMsg(msg);
            setPhase("error");
          }
          return;
        }
        const blob = await res.blob();
        fetchBlobRef.current = { blob, name };
        fetchDoneRef.current = true;
        if (adDoneRef.current) {
          doDownload(blob, name);
        }
      })
      .catch((err: any) => {
        if (err?.name === "AbortError") return;
        const msg = "Network error. Check your connection and try again.";
        fetchErrRef.current = msg;
        fetchDoneRef.current = true;
        if (adDoneRef.current) {
          setErrorMsg(msg);
          setPhase("error");
        }
      });
  };

  const finishAd = () => {
    adDoneRef.current = true;
    if (!fetchDoneRef.current) {
      setPhase("downloading");
      return;
    }
    if (fetchBlobRef.current) {
      doDownload(fetchBlobRef.current.blob, fetchBlobRef.current.name);
    } else if (fetchErrRef.current) {
      setErrorMsg(fetchErrRef.current);
      setPhase("error");
    }
  };

  const paste = async () => {
    try {
      setUrl(await navigator.clipboard.readText());
    } catch {}
  };

  const clearUrl = () => {
    abortRef.current?.abort();
    setUrl("");
    setPhase("idle");
    setErrorMsg(null);
  };

  const isAd = phase === "ad";
  const isDownloading = phase === "downloading";
  const isBusy = isAd || isDownloading;
  const isDone = phase === "downloaded";
  const isError = phase === "error";

  return (
    <div className="space-y-5">
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isBusy && !isDone && start()}
          disabled={isBusy}
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

      {/* Output-format pills */}
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
        disabled={isBusy || isDone}
        aria-label={`Download ${platform} ${mediaTypeLabel}`}
        className={
          isDone
            ? "w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 transition-all"
            : isDownloading
              ? "w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 transition-all"
              : isError
                ? `w-full h-14 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.99] ${buttonClassName}`
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

      {/* Inline downloading hint while fetch is still running after ad. */}
      {isDownloading && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/15 dark:bg-amber-500/10 px-4 py-3 animate-in fade-in duration-200">
          <Loader2 className="h-4 w-4 animate-spin text-amber-700 dark:text-amber-300" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Downloading… your file will appear in the browser&apos;s download bar in a moment.
          </p>
        </div>
      )}

      {/* Error banner — shows server error text so user knows exactly what failed. */}
      {isError && errorMsg && (
        <div className="flex items-start gap-3 rounded-lg border-2 border-red-500/50 bg-red-500/15 dark:bg-red-500/10 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-5 w-5 text-red-700 dark:text-red-300 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-800 dark:text-red-200">Download failed</p>
            <p className="text-xs text-red-700/90 dark:text-red-300/90 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Persistent confirmation banner */}
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

      {help && !isDone && !isBusy && !isError && (
        <p className="text-xs text-muted-foreground text-center">{help}</p>
      )}

      {/* Ad runs in parallel with the server fetch. */}
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
