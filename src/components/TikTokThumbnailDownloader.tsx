"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Download, Loader2, Clipboard, X, Image as ImageIcon, Sparkles } from "lucide-react";

interface Thumb {
  label: string;
  url: string;
  width?: number;
  height?: number;
}

interface Result {
  platform: string;
  title: string;
  thumbnails: Thumb[];
}

export default function TikTokThumbnailDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Result | null>(null);
  const { toast } = useToast();

  const isValid = (u: string) => /tiktok\.com/i.test(u);

  const fetchThumbnail = async () => {
    if (!url || !isValid(url)) {
      toast({
        title: "Invalid URL",
        description: "Please paste a valid TikTok video URL.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch thumbnail");
      setData(json);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const download = (thumb: Thumb) => {
    const a = document.createElement("a");
    a.href = thumb.url;
    a.download = `tiktok-thumbnail-${thumb.width || 0}x${thumb.height || 0}.jpg`;
    a.target = "_blank";
    a.click();
  };

  const paste = async () => {
    try {
      setUrl(await navigator.clipboard.readText());
    } catch {}
  };

  const reset = () => {
    setUrl("");
    setData(null);
  };

  return (
    <div className="space-y-5">
      <div className="relative">
        <Input
          placeholder="Paste TikTok video URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && fetchThumbnail()}
          disabled={loading}
          className="h-14 text-base pr-20 bg-white/5 border-white/10 backdrop-blur-sm transition-shadow focus-visible:ring-pink-500"
          aria-label="TikTok URL"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={paste} disabled={loading} aria-label="Paste">
            <Clipboard className="h-4 w-4" />
          </Button>
          {url && (
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={reset} disabled={loading} aria-label="Clear">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
          <span aria-hidden="true">🖼️</span> Output: JPG
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-pink-500/10 text-pink-700 dark:text-pink-300">
          <span aria-hidden="true">✨</span> Portrait 9:16 Cover
        </span>
      </div>

      <Button
        onClick={fetchThumbnail}
        disabled={loading}
        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white shadow-lg shadow-pink-500/30 disabled:opacity-60 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.99]"
      >
        {loading ? (
          <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Processing...</>
        ) : (
          <><ImageIcon className="h-5 w-5 mr-2" />Get Thumbnail</>
        )}
      </Button>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="aspect-[9/16] w-1/2 mx-auto rounded-xl" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      )}

      {data && data.thumbnails[0] && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="font-semibold text-lg line-clamp-2">{data.title}</h3>
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg max-w-md mx-auto">
            <div className="relative bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.thumbnails[0].url}
                alt="TikTok thumbnail"
                className="w-full h-auto"
              />
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                <Sparkles className="h-3 w-3" />
                TikTok Cover
              </span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div>
                <p className="font-semibold">{data.thumbnails[0].label}</p>
                {data.thumbnails[0].width && data.thumbnails[0].height && (
                  <p className="text-sm text-muted-foreground">
                    {data.thumbnails[0].width} × {data.thumbnails[0].height}
                  </p>
                )}
              </div>
              <Button
                onClick={() => download(data.thumbnails[0])}
                className="h-12 w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-semibold shadow-md shadow-pink-500/20 transition-all hover:scale-[1.02]"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Cover
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
