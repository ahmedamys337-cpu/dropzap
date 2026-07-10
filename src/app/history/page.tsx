"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { getDownloadHistory, clearDownloadHistory, removeDownloadHistory, type DownloadHistoryItem } from "@/lib/download-history";
import { Zap, Trash2, Download, ExternalLink, History, ArrowRight } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    setHistory(getDownloadHistory());
  }, []);

  const handleRemove = (id: string) => {
    removeDownloadHistory(id);
    setHistory(getDownloadHistory());
  };

  const handleClear = () => {
    clearDownloadHistory();
    setHistory([]);
    toast({ title: "History cleared", description: "Your download history has been removed from this device." });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

      <section className="max-w-3xl mx-auto px-4 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <History className="h-6 w-6 text-purple-400" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Download History</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Your last 50 downloads are saved locally on this device. No account needed.
        </p>

        {mounted && history.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No downloads yet</h2>
            <p className="text-muted-foreground mb-6">
              Once you download a video, it will appear here so you can grab it again quickly.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-600/30 hover:scale-[1.02] transition-transform"
            >
              Start Downloading
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {mounted && history.map((item) => (
              <div
                key={item.id}
                className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground mb-1.5">{formatDate(item.downloadedAt)}</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:underline inline-flex items-center gap-1 truncate max-w-full"
                  >
                    {item.url}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => {
                      // Try to send user back to the matching tool page.
                      const url = new URL(window.location.origin);
                      const map: Record<string, string> = {
                        TikTok: "/tiktok-downloader",
                        Instagram: "/instagram-downloader",
                        Facebook: "/facebook-video-downloader",
                        "Twitter/X": "/twitter-video-downloader",
                        Twitter: "/twitter-video-downloader",
                        X: "/twitter-video-downloader",
                        Reddit: "/reddit-video-downloader",
                        Pinterest: "/pinterest-video-downloader",
                        Threads: "/threads-downloader",
                      };
                      url.pathname = map[item.platform] || "/";
                      url.searchParams.set("url", item.url);
                      window.location.href = url.toString();
                    }}
                  >
                    <Download className="h-4 w-4 mr-1.5" />
                    Re-download
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-red-400"
                    onClick={() => handleRemove(item.id)}
                    aria-label="Remove from history"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {mounted && history.length > 0 && (
              <div className="pt-4 text-center">
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={handleClear}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear history
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
