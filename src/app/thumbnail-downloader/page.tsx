"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { Zap, ImageIcon, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ThumbnailDownloaderPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    platform: string;
    title: string;
    thumbnails: { label: string; url: string; width?: number; height?: number }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const extract = async () => {
    if (!url.trim()) {
      toast({ title: "Enter a URL", variant: "destructive" });
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch thumbnail");
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen gradient-bg animate-gradient">
      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
              DropZap
            </span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-600/20 text-purple-400 px-4 py-1.5 text-sm font-semibold mb-6">
          <ImageIcon className="h-4 w-4" />
          Free Cover Downloader
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Download video thumbnails in HD
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Paste a TikTok, Instagram Reel, or YouTube URL and grab the cover image instantly.
          Great for thumbnails, reaction videos, and reference boards.
        </p>

        <div className="glass rounded-2xl p-6 sm:p-8 text-left">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Input
              placeholder="Paste TikTok, Instagram Reel, or YouTube URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && extract()}
              className="h-14 bg-white/5 border-white/10 backdrop-blur-sm"
            />
            <Button
              onClick={extract}
              disabled={loading}
              className="h-14 px-6 font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-600/30"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5 mr-2" />}
              {loading ? "Extracting..." : "Get Thumbnail"}
            </Button>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <p className="font-semibold">Found {result.platform} thumbnail</p>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{result.title}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.thumbnails.map((t, i) => (
                  <div key={i} className="glass rounded-xl p-3 space-y-3">
                    <a href={t.url} target="_blank" rel="noopener noreferrer" className="block relative aspect-video">
                      <Image
                        src={t.url}
                        alt={t.label}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover rounded-lg bg-muted"
                        unoptimized
                      />
                    </a>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{t.label}</p>
                        {t.width && t.height && (
                          <p className="text-xs text-muted-foreground">
                            {t.width}×{t.height}
                          </p>
                        )}
                      </div>
                      <a
                        href={t.url}
                        download
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Save
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-purple-500/30 bg-purple-600/10 px-4 py-3">
                <p className="text-sm text-purple-200">
                  Want the full video too? Use DropZap's{" "}
                  <Link href="/" className="underline font-semibold">
                    video downloader
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-center mb-6">How to download a video cover</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold mb-2">1. Copy the URL</h3>
            <p className="text-sm text-muted-foreground">Open the TikTok, Instagram Reel, or YouTube video and copy its share link.</p>
          </div>
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold mb-2">2. Paste and extract</h3>
            <p className="text-sm text-muted-foreground">Drop it into the field above and click Get Thumbnail. We fetch the cover image from the platform.</p>
          </div>
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold mb-2">3. Save the image</h3>
            <p className="text-sm text-muted-foreground">Click Save on any thumbnail size to download the JPG/PNG to your device.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
