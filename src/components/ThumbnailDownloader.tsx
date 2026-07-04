"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { isValidYouTubeUrl } from "@/lib/utils";
import { triggerNativeDownload, proxyDownloadUrl, safeFilename } from "@/lib/download";
import { Download, Loader2, Clipboard, X, Image as ImageIcon, Sparkles } from "lucide-react";

interface Thumb {
  label: string;
  url: string;
  width: number;
  height: number;
}

interface ThumbnailData {
  title: string;
  thumbnails: Thumb[];
}

export default function ThumbnailDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ThumbnailData | null>(null);
  const { toast } = useToast();

  const fetchThumbnails = async () => {
    if (!url || !isValidYouTubeUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please paste a valid YouTube URL.",
        variant: "destructive",
      });
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

  const downloadThumb = (thumb: Thumb) => {
    const base = safeFilename(data?.title || "youtube-thumbnail", "thumbnail");
    const name = `${base}-${thumb.width}x${thumb.height}.jpg`;
    // Route through /api/proxy-download so the response carries
    // Content-Disposition: attachment — this makes the browser save the file
    // via its native download manager instead of opening the image inline.
    triggerNativeDownload(proxyDownloadUrl(thumb.url, name), name);
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

  // Sort by pixel count so the maxres comes first.
  const sorted = data
    ? [...data.thumbnails].sort((a, b) => b.width * b.height - a.width * a.height)
    : [];
  const [hero, ...rest] = sorted;

  return (
    <div className="space-y-5">
      {/* URL field on its own row — matches the layout of the other tools
          so the page reads consistently and gives the input room to breathe. */}
      <div className="relative">
        <Input
          placeholder="Paste YouTube URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && fetchThumbnails()}
          disabled={loading}
          className="h-14 text-base pr-20 bg-white/5 border-white/10 backdrop-blur-sm transition-shadow focus-visible:ring-orange-500"
          aria-label="YouTube URL"
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

      {/* Output-format pills */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-orange-500/10 text-orange-700 dark:text-orange-300">
          <span aria-hidden="true">🖼️</span> Output: JPG
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-orange-500/10 text-orange-700 dark:text-orange-300">
          <span aria-hidden="true">✨</span> All Sizes (up to 4K)
        </span>
      </div>

      {/* Get Thumbnails button — stays clickable on empty URL so the hover
          gradient/lift is always visible; fetchThumbnails() validates. */}
      <Button
        onClick={fetchThumbnails}
        disabled={loading}
        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white shadow-lg shadow-orange-500/30 disabled:opacity-60 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.99]"
      >
        {loading ? (
          <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Processing...</>
        ) : (
          <><ImageIcon className="h-5 w-5 mr-2" />Get Thumbnails</>
        )}
      </Button>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-video rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {data && hero && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="font-semibold text-lg line-clamp-2">{data.title}</h3>

          {/* Hero: highest-resolution thumbnail */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg">
            <div className="relative bg-black">
              <Image
                src={hero.url}
                alt={`${hero.label} thumbnail`}
                width={hero.width}
                height={hero.height}
                className="w-full h-auto"
              />
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                <Sparkles className="h-3 w-3" />
                Max Resolution
              </span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-semibold">{hero.label}</p>
                <p className="text-sm text-muted-foreground">
                  {hero.width} × {hero.height} pixels
                </p>
              </div>
              <Button
                onClick={() => downloadThumb(hero)}
                className="h-12 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
              >
                <Download className="h-4 w-4 mr-2" />
                Download {hero.width}×{hero.height}
              </Button>
            </div>
          </div>

          {/* Smaller sizes grid */}
          {rest.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                Other Sizes ({rest.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rest.map((thumb) => (
                  <div
                    key={thumb.label}
                    className="rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col transition-all hover:border-orange-500/40 hover:shadow-md hover:shadow-orange-500/10"
                  >
                    <Image
                      src={thumb.url}
                      alt={`${thumb.label} thumbnail`}
                      width={thumb.width}
                      height={thumb.height}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="p-3 flex flex-col gap-2 flex-1">
                      <div>
                        <p className="text-sm font-medium">{thumb.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {thumb.width} × {thumb.height}
                        </p>
                      </div>
                      <Button
                        onClick={() => downloadThumb(thumb)}
                        size="sm"
                        className="w-full bg-white/10 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 border border-white/10 hover:border-transparent text-foreground hover:text-white font-medium transition-all"
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Download {thumb.width}×{thumb.height}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
