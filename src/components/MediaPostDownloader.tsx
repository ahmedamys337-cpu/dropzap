"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { triggerNativeDownload, proxyDownloadUrl, safeFilename } from "@/lib/download";
import AdCountdown from "@/components/AdCountdown";
import {
  Download,
  Loader2,
  Clipboard,
  X,
  Video as VideoIcon,
  Image as ImageIcon,
} from "lucide-react";

/**
 * Shared downloader for platforms whose posts can contain video, a single
 * image, or a carousel of both (Instagram, Facebook, Pinterest, Threads).
 *
 * Flow: paste URL → click Download → "Processing" message → 5-second ad
 * overlay → render a preview for each media item with its own native-download
 * button. Videos route through /api/stream (yt-dlp re-resolves at download
 * time because CDN URLs expire). Images route through /api/proxy-download so
 * the Content-Disposition: attachment header forces a save dialog instead of
 * rendering the image inline.
 */

interface MediaItem {
  type: "video" | "image";
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  ext?: string;
}

interface MediaInfo {
  title: string;
  platform: string;
  items: MediaItem[];
}

type Phase = "idle" | "processing" | "ad" | "ready";

export interface MediaPostDownloaderProps {
  /** Display name for the platform, e.g. "Instagram". Shown in error toasts. */
  platform: string;
  /** Filename prefix fallback, e.g. "instagram". */
  filePrefix: string;
  /** Input placeholder text. */
  placeholder: string;
  /** Client-side URL validator so we don't round-trip bad links. */
  validate: (url: string) => boolean;
  /** Tailwind classes for the themed Download button gradient. */
  buttonClassName?: string;
  /** History-tracking hook. */
  onDownload?: (title: string, url: string, type: string) => void;
  /** Optional helper line under the input. */
  help?: string;
}

export default function MediaPostDownloader({
  platform,
  filePrefix,
  placeholder,
  validate,
  buttonClassName = "bg-primary hover:bg-primary/90",
  onDownload,
  help,
}: MediaPostDownloaderProps) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [info, setInfo] = useState<MediaInfo | null>(null);
  const { toast } = useToast();

  const start = async () => {
    if (!validate(url)) {
      toast({
        title: "Invalid URL",
        description: `Please paste a valid ${platform} post link.`,
        variant: "destructive",
      });
      return;
    }
    setPhase("processing");
    setInfo(null);
    try {
      const res = await fetch("/api/media-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not fetch media");
      if (!data.items?.length) throw new Error("No media found at that URL");
      setInfo(data);
      setPhase("ad");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setPhase("idle");
    }
  };

  const downloadItem = (item: MediaItem, idx: number) => {
    if (!info) return;
    const base = safeFilename(info.title || filePrefix, filePrefix);
    const suffix = info.items.length > 1 ? `-${idx + 1}` : "";
    const ext = item.ext || (item.type === "image" ? "jpg" : "mp4");
    const name = `${base}${suffix}.${ext}`;

    if (item.type === "video") {
      // Videos always go through /api/stream so yt-dlp re-resolves the CDN URL
      // (they expire) and we get the correct Content-Disposition header.
      const streamUrl = `/api/stream?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
      triggerNativeDownload(streamUrl, name);
    } else {
      // Images: our proxy-download route re-headers the response so the browser
      // saves instead of displaying inline.
      triggerNativeDownload(proxyDownloadUrl(item.url, name), name);
    }

    onDownload?.(
      info.title || `${platform} Media`,
      url,
      item.type === "video" ? "Video MP4" : "Image",
    );
  };

  const paste = async () => {
    try {
      setUrl(await navigator.clipboard.readText());
    } catch {}
  };

  const reset = () => {
    setUrl("");
    setInfo(null);
    setPhase("idle");
  };

  const isProcessing = phase === "processing";

  return (
    <div className="space-y-5">
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isProcessing && start()}
          disabled={isProcessing}
          className="h-14 text-base pr-20 bg-white/5 border-white/10 backdrop-blur-sm"
          aria-label={`${platform} URL`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={paste}
            disabled={isProcessing}
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
              disabled={isProcessing}
              aria-label="Clear URL"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Button
        onClick={start}
        disabled={!url || isProcessing}
        className={`w-full h-14 text-lg font-bold text-white shadow-lg disabled:opacity-60 transition-all hover:scale-[1.01] active:scale-[0.99] ${buttonClassName}`}
      >
        {isProcessing ? (
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

      {help && !isProcessing && phase === "idle" && (
        <p className="text-xs text-muted-foreground text-center">{help}</p>
      )}

      {isProcessing && (
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 text-center space-y-2 animate-in fade-in duration-200">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="font-medium">Processing the link to download.</p>
          <p className="text-sm text-muted-foreground">Stay on the page.</p>
        </div>
      )}

      {phase === "ad" && (
        <AdCountdown
          seconds={3}
          onComplete={() => setPhase("ready")}
          onClose={() => setPhase("ready")}
        />
      )}

      {phase === "ready" && info && (
        <div className="space-y-4 p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {info.title && <h3 className="font-semibold line-clamp-2">{info.title}</h3>}
          <div
            className={`grid gap-4 ${
              info.items.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            {info.items.map((item, idx) => {
              const dims = item.width && item.height ? `${item.width}×${item.height}` : "";
              return (
                <div
                  key={idx}
                  className="rounded-xl overflow-hidden border border-white/10 bg-white/5 flex flex-col"
                >
                  <div className="relative bg-black">
                    {item.type === "video" ? (
                      item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={`Item ${idx + 1}`}
                          className="w-full aspect-video object-cover"
                        />
                      ) : (
                        <div className="aspect-video flex items-center justify-center text-muted-foreground">
                          <VideoIcon className="h-10 w-10" />
                        </div>
                      )
                    ) : (
                      <img
                        src={item.url}
                        alt={`Item ${idx + 1}`}
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    )}
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white">
                      {item.type === "video" ? (
                        <VideoIcon className="h-3 w-3" />
                      ) : (
                        <ImageIcon className="h-3 w-3" />
                      )}
                      {item.type === "video" ? "Video" : "Image"}
                      {dims ? ` · ${dims}` : ""}
                    </span>
                  </div>
                  <div className="p-3">
                    <Button
                      onClick={() => downloadItem(item, idx)}
                      className={`w-full font-semibold text-white transition-all hover:scale-[1.02] ${buttonClassName}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download {item.type === "video" ? "Video" : "Image"}
                      {info.items.length > 1 ? ` ${idx + 1}` : ""}
                      {dims ? ` (${dims})` : ""}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
