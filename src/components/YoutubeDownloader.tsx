"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { isValidYouTubeUrl, formatDuration } from "@/lib/utils";
import DownloadCountdown from "@/components/DownloadCountdown";
import AdBanner from "@/components/AdBanner";
import {
  Download,
  Loader2,
  Music,
  Clipboard,
  X,
  Play,
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

const QUALITY_LABELS: Record<number, string> = {
  144: "144p",
  240: "240p",
  360: "360p",
  480: "480p",
  720: "720p",
  1080: "1080p",
  1440: "1440p (2K)",
  2160: "2160p (4K)",
};

export default function YoutubeDownloader({
  onDownload,
}: {
  onDownload: (title: string, url: string, type: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [countdown, setCountdown] = useState<{ streamUrl: string; name: string } | null>(null);
  const { toast } = useToast();

  const fetchInfo = async () => {
    if (!isValidYouTubeUrl(url)) {
      toast({ title: "Invalid URL", description: "Please enter a valid YouTube URL", variant: "destructive" });
      return;
    }
    setLoading(true);
    setVideoInfo(null);
    try {
      const res = await fetch("/api/youtube/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch video info");
      setVideoInfo(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (formatId: string, label: string) => {
    const title = videoInfo?.title || "video";
    const safeName = title.replace(/[^a-zA-Z0-9 _-]/g, "").slice(0, 80) + ".mp4";
    const fmt = videoInfo?.formats.find((f) => f.format_id === formatId);
    const sizeParam = fmt?.filesize ? `&size=${fmt.filesize}` : "";
    const streamUrl = `/api/stream?url=${encodeURIComponent(url)}&f=${encodeURIComponent(formatId)}&name=${encodeURIComponent(safeName)}${sizeParam}`;
    setCountdown({ streamUrl, name: safeName });
    onDownload(title, url, `Video ${label}`);
  };

  const handleAudioDownload = () => {
    const title = videoInfo?.title || "audio";
    const safeName = title.replace(/[^a-zA-Z0-9 _-]/g, "").slice(0, 80) + ".m4a";
    const streamUrl = `/api/stream?url=${encodeURIComponent(url)}&audio=1&name=${encodeURIComponent(safeName)}`;
    setCountdown({ streamUrl, name: safeName });
    onDownload(title, url, "Audio");
  };

  const paste = async () => {
    try { setUrl(await navigator.clipboard.readText()); } catch {}
  };

  const isExtracting = false;

  const availableQualities = videoInfo
    ? Object.keys(QUALITY_LABELS)
        .map(Number)
        .filter((h) => videoInfo.formats.some((f) => f.height === h))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchInfo()}
            className="pr-20 bg-white/5 border-white/10 backdrop-blur-sm"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={paste}>
              <Clipboard className="h-3.5 w-3.5" />
            </Button>
            {url && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setUrl(""); setVideoInfo(null); }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <Button onClick={fetchInfo} disabled={loading || !url} className="bg-red-600 hover:bg-red-700">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          <span className="ml-2">Fetch</span>
        </Button>
      </div>

      {loading && (
        <div className="space-y-4 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex gap-4">
            <Skeleton className="w-48 h-28 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Fetching video info from YouTube… first request can take ~10s. Retries are instant (cached).
          </p>
        </div>
      )}

      {videoInfo && (
        <div className="space-y-4 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <img
              src={videoInfo.thumbnail}
              alt={videoInfo.title}
              className="w-full sm:w-48 h-auto rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{videoInfo.title}</h3>
              <p className="text-sm text-muted-foreground">{videoInfo.uploader}</p>
              <p className="text-sm text-muted-foreground">
                Duration: {formatDuration(videoInfo.duration)} • {videoInfo.view_count?.toLocaleString()} views
              </p>
            </div>
          </div>

          <AdBanner slot="middle" className="my-3" />

          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Video Qualities</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableQualities.map((h) => {
                const fmt = videoInfo.formats.find((f) => f.height === h);
                const key = fmt?.format_id || String(h);
                return (
                  <Button
                    key={h}
                    variant="outline"
                    className="justify-between bg-white/5 border-white/10 hover:bg-white/10"
                    onClick={() => handleDownload(key, QUALITY_LABELS[h])}
                  >
                    <span>{QUALITY_LABELS[h]}</span>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Audio Only</h4>
            <Button
              variant="outline"
              className="justify-between bg-white/5 border-white/10 hover:bg-white/10 w-full sm:w-auto"
              onClick={handleAudioDownload}
            >
              <span className="flex items-center gap-2">
                <Music className="h-3.5 w-3.5" />
                Download Audio (M4A)
              </span>
              <Download className="h-3.5 w-3.5 ml-2" />
            </Button>
          </div>

        </div>
      )}

      {countdown && (
        <DownloadCountdown
          streamUrl={countdown.streamUrl}
          filename={countdown.name}
          onClose={() => setCountdown(null)}
        />
      )}
    </div>
  );
}
