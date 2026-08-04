"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Download, Loader2, Clipboard, X, Image as ImageIcon, Video as VideoIcon, Sparkles, AlertCircle } from "lucide-react";
import { downloadImageClientSide, proxyDownloadUrl, downloadWithFallback } from "@/lib/download";
import { isInstagramStoryUrl } from "@/lib/instagram";

interface StoryItem {
  type: "image" | "video";
  url: string;
  thumbnail?: string;
}

interface Result {
  username: string;
  stories: StoryItem[];
}

export default function InstagramStoryDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const isValid = (u: string) => /instagram\.com\/stories\//i.test(u);

  const fetchStories = async () => {
    if (!url || !isValid(url)) {
      toast({
        title: "Invalid URL",
        description: "Please paste a valid Instagram Story URL (e.g., instagram.com/stories/username/story_id).",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setData(null);
    setError(null);
    try {
      const res = await fetch("/api/instagram/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch story");
      setData(json);
    } catch (err: any) {
      const msg = err.message || "Failed to fetch story";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const download = async (item: StoryItem, index: number) => {
    setDownloading(true);
    const filename = `instagram-story-${index + 1}.${item.type === "video" ? "mp4" : "jpg"}`;
    try {
      if (item.type === "video") {
        // Use stream API for videos
        const streamUrl = `/api/stream?url=${encodeURIComponent(item.url)}&name=${encodeURIComponent(filename)}`;
        await downloadWithFallback(streamUrl, () => {});
        toast({ title: "Download started", description: "Video is downloading in your browser", variant: "default" });
      } else {
        // Direct download for images
        const ok = await downloadImageClientSide(item.url, filename);
        if (!ok) {
          toast({ title: "Download started", description: "The image opened in a new tab — right-click and Save As.", variant: "default" });
        } else {
          toast({ title: "Download complete", description: "Story saved successfully", variant: "default" });
        }
      }
    } catch (e: any) {
      toast({ title: "Download failed", description: e?.message || "Could not download story", variant: "destructive" });
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
          placeholder="Paste Instagram Story URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && fetchStories()}
          disabled={loading}
          className="h-14 text-base pr-20 bg-white/5 border-white/10 backdrop-blur-sm transition-shadow focus-visible:ring-pink-500"
          aria-label="Instagram Story URL"
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
          <span aria-hidden="true">�</span> Stories
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-pink-500/10 text-pink-700 dark:text-pink-300">
          <span aria-hidden="true">✨</span> Original Quality
        </span>
      </div>

      <Button
        onClick={fetchStories}
        disabled={loading}
        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-pink-600/30 disabled:opacity-60 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.99]"
      >
        {loading ? (
          <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Processing...</>
        ) : (
          <><ImageIcon className="h-5 w-5 mr-2" />Get Stories</>
        )}
      </Button>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="aspect-[9/16] w-full max-w-xs mx-auto rounded-xl" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border-2 border-red-500/50 bg-red-500/15 dark:bg-red-500/10 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-5 w-5 text-red-700 dark:text-red-300 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-800 dark:text-red-200">Story fetch failed</p>
            <p className="text-xs text-red-700/90 dark:text-red-300/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {data && data.stories.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="font-semibold text-lg">@{data.username}'s Stories ({data.stories.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.stories.map((story, index) => (
              <div key={index} className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg">
                <div className="relative aspect-[9/16] bg-black">
                  {story.type === "video" ? (
                    <VideoIcon className="absolute inset-0 m-auto h-12 w-12 text-white/50" />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={story.url}
                      alt={`Story ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                    {story.type === "video" ? <VideoIcon className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                    {index + 1}
                  </span>
                </div>
                <div className="p-3">
                  <Button
                    onClick={() => download(story, index)}
                    disabled={downloading}
                    className="w-full h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md shadow-pink-600/20 transition-all hover:scale-[1.02]"
                  >
                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
