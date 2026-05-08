"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { isValidYouTubeUrl, formatDuration } from "@/lib/utils";
import { triggerNativeDownload, safeFilename } from "@/lib/download";
import AdCountdown from "@/components/AdCountdown";
import AdBanner from "@/components/AdBanner";
import {
  Download,
  Loader2,
  Music,
  Clipboard,
  X,
  CheckCircle2,
} from "lucide-react";

interface VideoFormat {
  format_id: string;
  ext: string;
  resolution: string;
  height: number;
  filesize: number | null;
  vcodec: string;
  acodec: string;
  format_note: string;
}

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  view_count: number;
  formats: VideoFormat[];
}

// Map any height value to a friendly tier label. Falls back to "<h>p" so
// vertical Shorts (e.g. height=1920) and other non-standard sizes still show.
function qualityLabel(height: number): string {
  if (height >= 4320) return "8K";
  if (height >= 2160) return `${height}p 4K`;
  if (height >= 1440) return `${height}p 2K`;
  if (height >= 1080) return `${height}p Full HD`;
  if (height >= 720) return `${height}p HD`;
  return `${height}p`;
}

type Phase = "idle" | "loading" | "ready";

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default function YoutubeDownloader({
  onDownload,
}: {
  onDownload: (title: string, url: string, type: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  // Both must be true before resolution buttons appear. Lets the 5s ad and
  // the format-info fetch run in PARALLEL so the user never waits twice.
  const [adDone, setAdDone] = useState(false);
  const [fetchDone, setFetchDone] = useState(false);
  // Per-button state. Each format_id (or "audio") can be in one of:
  //   not present     → idle (default Download button)
  //   downloadingSet  → 3s spinner state right after the click
  //   downloadedSet   → permanent green Downloaded state (until reset)
  const [downloadingSet, setDownloadingSet] = useState<Set<string>>(new Set());
  const [downloadedSet, setDownloadedSet] = useState<Set<string>>(new Set());
  const downloadingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Used by the auto-scroll effect so the quality grid is brought into view
  // as soon as it renders.
  const qualityRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  // When both the ad timer and the API fetch are complete (and we got formats),
  // transition into the "ready" state where resolution buttons render.
  useEffect(() => {
    if (phase === "loading" && adDone && fetchDone && videoInfo) {
      setPhase("ready");
    }
  }, [phase, adDone, fetchDone, videoInfo]);

  // Once the quality buttons render, smooth-scroll them into view so the user
  // doesn't miss them below the ad / fold.
  useEffect(() => {
    if (phase === "ready" && qualityRef.current) {
      qualityRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [phase]);

  // Cleanup any pending per-button "downloading" timers on unmount.
  useEffect(() => () => {
    downloadingTimers.current.forEach((t) => clearTimeout(t));
    downloadingTimers.current.clear();
  }, []);

  const startDownload = () => {
    if (!url || !isValidYouTubeUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Paste a YouTube video, Shorts, or youtu.be link.",
        variant: "destructive",
      });
      return;
    }
    // Reset state and begin BOTH the ad timer and the fetch simultaneously.
    setVideoInfo(null);
    setAdDone(false);
    setFetchDone(false);
    setPhase("loading");

    fetch("/api/youtube/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch video info");
        if (!data.formats?.length) throw new Error("No downloadable formats found");
        setVideoInfo(data);
        setFetchDone(true);
      })
      .catch((err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
        // Cancel the in-flight ad/loader so the form returns to idle.
        setPhase("idle");
        setAdDone(false);
        setFetchDone(false);
      });
  };

  // Mark a button as downloading, then promote it to downloaded after a
  // short buffer. With the live ffmpeg streaming path (/api/stream), the
  // browser's native download dialog opens within ~1-2s of the click and
  // the file finishes in roughly 8-15s for HD videos / 5-8s for audio.
  // We give a small safety margin so the green "Downloaded" state lands
  // shortly after the file actually does. Both states stick until reset.
  const beginDownloadingFlow = (key: string, holdMs = 12000) => {
    setDownloadingSet((s) => {
      const next = new Set(s);
      next.add(key);
      return next;
    });
    const existing = downloadingTimers.current.get(key);
    if (existing) clearTimeout(existing);
    const t = setTimeout(() => {
      setDownloadingSet((s) => {
        const next = new Set(s);
        next.delete(key);
        return next;
      });
      setDownloadedSet((s) => {
        const next = new Set(s);
        next.add(key);
        return next;
      });
      downloadingTimers.current.delete(key);
    }, holdMs);
    downloadingTimers.current.set(key, t);
  };

  const downloadVideo = (
    formatId: string,
    label: string,
    height: number,
    filesize: number | null,
  ) => {
    if (!videoInfo) return;
    const base = safeFilename(videoInfo.title, "youtube-video");
    const name = `${base}-${height}p.mp4`;
    // Server picks bv*[height<=h]+ba so audio is always merged. We do NOT
    // send filesize because once we ask yt-dlp to merge two streams the
    // resulting bytes no longer match either source's reported size.
    const streamUrl =
      `/api/stream?url=${encodeURIComponent(url)}` +
      `&h=${height}` +
      `&name=${encodeURIComponent(name)}`;
    triggerNativeDownload(streamUrl, name);
    onDownload(videoInfo.title, url, `Video ${label}`);
    beginDownloadingFlow(formatId);
  };

  const downloadAudio = () => {
    if (!videoInfo) return;
    const base = safeFilename(videoInfo.title, "youtube-audio");
    const name = `${base}.mp3`;
    const streamUrl = `/api/stream?url=${encodeURIComponent(url)}&audio=1&name=${encodeURIComponent(name)}`;
    triggerNativeDownload(streamUrl, name);
    onDownload(videoInfo.title, url, "Audio MP3");
    // Audio streams direct via ffmpeg → mp3 transcode → stdout. Bytes start
    // arriving within ~1-2s; the file fully lands in 5-8s.
    beginDownloadingFlow("audio", 8000);
  };

  const paste = async () => {
    try {
      setUrl(await navigator.clipboard.readText());
    } catch {}
  };

  const reset = () => {
    downloadingTimers.current.forEach((t) => clearTimeout(t));
    downloadingTimers.current.clear();
    setUrl("");
    setVideoInfo(null);
    setPhase("idle");
    setAdDone(false);
    setFetchDone(false);
    setDownloadingSet(new Set());
    setDownloadedSet(new Set());
  };

  // Server already dedupes by height, but defend client-side too and sort high → low.
  const availableFormats = videoInfo
    ? [...videoInfo.formats].sort((a, b) => b.height - a.height)
    : [];

  const isLoading = phase === "loading";

  return (
    <div className="space-y-5">
      {/* URL input */}
      <div className="relative">
        <Input
          placeholder="Paste YouTube URL (video, Shorts, or youtu.be)..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isLoading && startDownload()}
          disabled={isLoading}
          className="h-14 text-base pr-20 bg-white/5 border-white/10 backdrop-blur-sm transition-shadow focus-visible:ring-red-500"
          aria-label="YouTube URL"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={paste}
            disabled={isLoading}
            aria-label="Paste from clipboard"
          >
            <Clipboard className="h-4 w-4" />
          </Button>
          {url && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={reset}
              disabled={isLoading}
              aria-label="Clear URL"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Output-format pills mirroring the Instagram/Facebook treatment so
          users see exactly what file the YouTube tool delivers. */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-red-500/10 text-red-700 dark:text-red-300">
          <span aria-hidden="true">🎬</span> Output: MP4 HD
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-red-500/10 text-red-700 dark:text-red-300">
          <span aria-hidden="true">🎵</span> Audio: MP3
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-red-500/10 text-red-700 dark:text-red-300">
          <span aria-hidden="true">📺</span> Up to 8K
        </span>
      </div>

      {/* Single large Download button. Intentionally NOT disabled on empty
          URL so the gradient + lift hover state stays visible at all
          times — startDownload() handles invalid input via toast. */}
      <Button
        onClick={startDownload}
        disabled={isLoading}
        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-lg shadow-red-600/30 disabled:opacity-60 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.99]"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Download className="h-5 w-5 mr-2" />
            Download
          </>
        )}
      </Button>

      {/* Ad runs in parallel with the format-info fetch */}
      {isLoading && (
        <AdCountdown
          // 10s (vs the default 5s used by other platforms) because YouTube
          // info extraction runs a recovery chain (cookies + alternate
          // clients) for videos where the primary call returns a thin
          // ladder. That chain can take 6-9s total; a 10s ad means the
          // resolution picker is ready the moment the ad closes.
          seconds={10}
          message={
            !fetchDone
              ? "Processing the link to download. Stay on the page."
              : "Almost ready..."
          }
          onComplete={() => setAdDone(true)}
        />
      )}

      {/* If the ad finished but the API call is still pending, keep the user
          informed without re-opening another modal. */}
      {isLoading && adDone && !fetchDone && (
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 text-center space-y-2 animate-in fade-in duration-200">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="font-medium">Still extracting video info…</p>
          <p className="text-sm text-muted-foreground">Almost done. Hang tight.</p>
        </div>
      )}

      {/* Resolution selection, shown once both ad + fetch complete */}
      {phase === "ready" && videoInfo && (
        <div className="space-y-5 p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row gap-4">
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className="w-full sm:w-56 aspect-video rounded-lg object-cover border border-white/10"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg line-clamp-2">{videoInfo.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{videoInfo.uploader}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDuration(videoInfo.duration)}
                {videoInfo.view_count ? ` · ${videoInfo.view_count.toLocaleString()} views` : ""}
              </p>
            </div>
          </div>

          {/* Persistent confirmation banner — appears once any quality has
              promoted from "downloading" to "downloaded". */}
          {downloadedSet.size > 0 && (
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

          {/* Quality grid moved ABOVE the in-card ad so users see the
              actionable buttons first instead of having to scroll past an
              advertisement. */}
          <div ref={qualityRef} className="scroll-mt-24">
            <h4 className="text-sm font-semibold mb-3">Choose Video Quality</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableFormats.map((fmt) => {
                const label = qualityLabel(fmt.height);
                const size = formatSize(fmt.filesize);
                const downloading = downloadingSet.has(fmt.format_id);
                const done = downloadedSet.has(fmt.format_id);
                return (
                  <Button
                    key={fmt.format_id}
                    onClick={() => downloadVideo(fmt.format_id, label, fmt.height, fmt.filesize)}
                    disabled={downloading || done}
                    className={`h-auto py-3 px-4 justify-between text-white font-semibold shadow-md transition-all ${
                      done
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/30 disabled:opacity-100"
                        : downloading
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30 disabled:opacity-100"
                          : "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-red-600/20 hover:shadow-red-600/40 hover:scale-[1.02]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : downloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <span>
                        {done
                          ? `Downloaded ${label} MP4`
                          : downloading
                            ? `Downloading ${label}...`
                            : `Download ${label} MP4`}
                      </span>
                    </span>
                    {size && !done && !downloading && (
                      <span className="text-[11px] font-normal opacity-90">{size}</span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Audio Only</h4>
            <Button
              onClick={downloadAudio}
              disabled={downloadingSet.has("audio") || downloadedSet.has("audio")}
              className={`w-full h-12 text-white font-semibold shadow-md transition-all ${
                downloadedSet.has("audio")
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/30 disabled:opacity-100"
                  : downloadingSet.has("audio")
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30 disabled:opacity-100"
                    : "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-red-600/20 hover:shadow-red-600/40 hover:scale-[1.01]"
              }`}
            >
              {downloadedSet.has("audio") ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Downloaded Audio (MP3)
                </>
              ) : downloadingSet.has("audio") ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Downloading Audio...
                </>
              ) : (
                <>
                  <Music className="h-4 w-4 mr-2" />
                  Download Audio (MP3 High Quality)
                </>
              )}
            </Button>
          </div>

          {/* Ad now sits AFTER the quality buttons so users see the actionable
              options first. */}
          <AdBanner slot="middle" className="my-2" />
        </div>
      )}
    </div>
  );
}
