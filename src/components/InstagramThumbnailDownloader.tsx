"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Download, Loader2, Clipboard, X, Image as ImageIcon, Sparkles, AlertCircle } from "lucide-react";
import { downloadImageClientSide, proxyDownloadUrl } from "@/lib/download";

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

export default function InstagramThumbnailDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const isValid = (u: string) => /instagram\.com/i.test(u);

  const fetchThumbnail = async () => {
    if (!url || !isValid(url)) {
      toast({
        title: "Invalid URL",
        description: "Please paste a valid Instagram Reel or post URL.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setData(null);
    setError(null);
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
      const msg = err.message || "Failed to fetch thumbnail";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const download = async (thumb: Thumb) => {
    setDownloading(true);
    const filename = `instagram-thumbnail-${thumb.width || 0}x${thumb.height || 0}.jpg`;
    try {
      const res = await fetch("/api/thumbnail/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, platform: "instagram" }),
      });

      const contentType = res.headers.get("content-type") || "";

      // Server streamed the image bytes successfully
      if (res.ok && !contentType.includes("application/json")) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        a.rel = "noopener";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { try { document.body.removeChild(a); } catch {}; URL.revokeObjectURL(blobUrl); }, 1000);
        return;
      }

      // Server couldn't proxy it; try downloading from the browser instead
      const json = await res.json().catch(() => ({}));
      const imageUrl = json?.url || thumb.url;
      const ok = await downloadImageClientSide(imageUrl, filename);
      if (!ok) {
        toast({ title: "Download started", description: "The image opened in a new tab — right-click and Save As.", variant: "default" });
      }
    } catch (e: any) {
      toast({ title: "Download failed", description: e?.message || "Could not download thumbnail", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const paste = async () => {
    try {
      setUrl(await navigator.clipboard.readText());
    } catch {}
  };

  const reset = () => {
    setUrl("");
    setData(null);
    setError(null);
  };

  return (
    <div className="space-y-5">
      <div className="relative">
        <Input
          placeholder="Paste Instagram Reel or post URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && fetchThumbnail()}
          disabled={loading}
          className="h-14 text-base pr-20 bg-white/5 border-white/10 backdrop-blur-sm transition-shadow focus-visible:ring-pink-500"
          aria-label="Instagram URL"
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
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-pink-500/10 text-pink-700 dark:text-pink-300">
          <span aria-hidden="true">🖼️</span> Output: JPG
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-pink-500/10 text-pink-700 dark:text-pink-300">
          <span aria-hidden="true">✨</span> Original Quality
        </span>
      </div>

      <Button
        onClick={fetchThumbnail}
        disabled={loading}
        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-pink-600/30 disabled:opacity-60 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.99]"
      >
        {loading ? (
          <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Processing...</>
        ) : (
          <><ImageIcon className="h-5 w-5 mr-2" />Get Thumbnail</>
        )}
      </Button>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border-2 border-red-500/50 bg-red-500/15 dark:bg-red-500/10 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-5 w-5 text-red-700 dark:text-red-300 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-800 dark:text-red-200">Thumbnail fetch failed</p>
            <p className="text-xs text-red-700/90 dark:text-red-300/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {data && data.thumbnails[0] && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="font-semibold text-lg line-clamp-2">{data.title}</h3>
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg">
            <div className="relative bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proxyDownloadUrl(data.thumbnails[0].url, "ig-thumb.jpg") + "&inline=1"}
                alt="Instagram thumbnail"
                className="w-full h-auto"
                onError={(e) => { (e.target as HTMLImageElement).src = data!.thumbnails[0].url; }}
              />
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                <Sparkles className="h-3 w-3" />
                Original Cover
              </span>
            </div>
            <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
                className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md shadow-pink-600/20 transition-all hover:scale-[1.02]"
              >
                {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                {downloading ? "Downloading…" : "Download Cover"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
