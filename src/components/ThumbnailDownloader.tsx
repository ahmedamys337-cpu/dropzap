"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { isValidYouTubeUrl } from "@/lib/utils";
import { Download, Loader2, Clipboard, X, Image as ImageIcon } from "lucide-react";

interface ThumbnailData {
  title: string;
  thumbnails: { label: string; url: string; width: number; height: number }[];
}

const THUMBNAIL_SIZES = [
  { key: "default", label: "Default", width: 120, height: 90 },
  { key: "mqdefault", label: "Medium", width: 320, height: 180 },
  { key: "hqdefault", label: "High", width: 480, height: 360 },
  { key: "sddefault", label: "Standard", width: 640, height: 480 },
  { key: "maxresdefault", label: "Max Resolution", width: 1280, height: 720 },
];

export default function ThumbnailDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ThumbnailData | null>(null);
  const { toast } = useToast();

  const fetchThumbnails = async () => {
    if (!isValidYouTubeUrl(url)) {
      toast({ title: "Invalid URL", description: "Please enter a valid YouTube URL", variant: "destructive" });
      return;
    }
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/youtube/thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch thumbnails");
      setData(json);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadThumb = async (thumbUrl: string, label: string) => {
    try {
      const res = await fetch(thumbUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `thumbnail-${label}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast({ title: "Downloaded", description: `${label} thumbnail saved` });
    } catch {
      toast({ title: "Error", description: "Failed to download thumbnail", variant: "destructive" });
    }
  };

  const paste = async () => {
    try { setUrl(await navigator.clipboard.readText()); } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchThumbnails()}
            className="pr-20 bg-white/5 border-white/10 backdrop-blur-sm"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={paste}>
              <Clipboard className="h-3.5 w-3.5" />
            </Button>
            {url && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setUrl(""); setData(null); }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <Button onClick={fetchThumbnails} disabled={loading || !url} className="bg-purple-600 hover:bg-purple-700">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          <span className="ml-2">Get Thumbnails</span>
        </Button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{data.title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.thumbnails.map((thumb) => (
              <div
                key={thumb.label}
                className="group relative rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <img src={thumb.url} alt={thumb.label} className="w-full h-auto" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    size="sm"
                    onClick={() => downloadThumb(thumb.url, thumb.label)}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {thumb.label} ({thumb.width}x{thumb.height})
                  </Button>
                </div>
                <div className="p-2 text-center text-xs text-muted-foreground">
                  {thumb.label} — {thumb.width}x{thumb.height}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
