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
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  useEffect(() => () => {
    if (doneTimer.current) clearTimeout(doneTimer.current);
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

    setPhase("loading");
  };

  const finishAd = () => {
    setPhase("done");
    if (doneTimer.current) clearTimeout(doneTimer.current);
    doneTimer.current = setTimeout(() => setPhase("idle"), 8000);
  };

  const paste = async () => {
    try {
      setUrl(await navigator.clipboard.readText());
    } catch {}
  };

  const isLoading = phase === "loading";
  const isDone = phase === "done";

  return (
    <div className="space-y-5">
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isLoading && start()}
          disabled={isLoading}
          className="h-14 text-base pr-20 bg-white/5 border-white/10 backdrop-blur-sm"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={paste}
            disabled={isLoading}
          >
            <Clipboard className="h-4 w-4" />
          </Button>
          {url && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setUrl("")}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Button
        onClick={start}
        disabled={!url || isLoading}
        className={
          isDone
            ? "w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            : `w-full h-14 text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] ${buttonClassName}`
        }
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing...
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

      {/* Confirmation banner remains visible for ~8s after download fires. */}
      {isDone && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-emerald-300">Your video is downloaded!</p>
            <p className="text-xs text-emerald-200/80">
              Check your browser&apos;s download bar. The file may take a moment to start.
            </p>
          </div>
        </div>
      )}

      {help && !isDone && (
        <p className="text-xs text-muted-foreground text-center">{help}</p>
      )}

      {/* Ad runs in parallel with the server's yt-dlp warm-up + stream start. */}
      {isLoading && (
        <AdCountdown
          seconds={5}
          message="Starting your download. Stay on the page."
          onComplete={finishAd}
        />
      )}
    </div>
  );
}
