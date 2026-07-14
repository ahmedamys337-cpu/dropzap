"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { fetchWithProgress, formatBytes, type DownloadProgress as ProgressInfo } from "@/lib/download";
import { Download, Loader2, Plus, Trash2, Play, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";

interface QueueItem {
  id: string;
  url: string;
  status: "pending" | "extracting" | "ready" | "error";
  downloadUrl?: string;
  filename?: string;
  error?: string;
  progress?: ProgressInfo | null;
}

const VALID_URL_PATTERN = /^https?:\/\/(www\.)?(instagram\.com|tiktok\.com|twitter\.com|x\.com|facebook\.com|reddit\.com|pinterest\.com|threads\.net)\//i;

export default function BulkDownloader() {
  const [input, setInput] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [running, setRunning] = useState(false);
  const { toast } = useToast();

  const addUrl = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!VALID_URL_PATTERN.test(trimmed)) {
      toast({ title: "Invalid URL", description: "Only Instagram, TikTok, Twitter/X, Facebook, Reddit, Pinterest, and Threads URLs are supported.", variant: "destructive" });
      return;
    }
    if (queue.some((q) => q.url === trimmed)) {
      toast({ title: "Duplicate", description: "This URL is already in the queue", variant: "destructive" });
      return;
    }
    setQueue((prev) => [
      ...prev,
      { id: crypto.randomUUID(), url: trimmed, status: "pending" },
    ]);
    setInput("");
  };

  const removeItem = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const extractOne = useCallback(async (item: QueueItem) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: "extracting", progress: null } : q))
    );

    try {
      const filename = `download-${item.id.slice(0, 8)}.mp4`;
      const streamUrl = `/api/stream?url=${encodeURIComponent(item.url)}&name=${encodeURIComponent(filename)}`;

      const { blob } = await fetchWithProgress(streamUrl, (p) => {
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, progress: p } : q))
        );
      });

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try { document.body.removeChild(a); } catch {}
        URL.revokeObjectURL(blobUrl);
      }, 1000);

      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: "ready", downloadUrl: item.url, filename, progress: null } : q
        )
      );
    } catch (err: any) {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: "error", error: err.message, progress: null } : q
        )
      );
    }
  }, []);

  const downloadAll = useCallback(async () => {
    setRunning(true);
    const pending = queue.filter((q) => q.status === "pending" || q.status === "error");
    for (const item of pending) {
      await extractOne(item);
      // Small delay between downloads to avoid rate limiting
      await new Promise((r) => setTimeout(r, 1500));
    }
    setRunning(false);
    toast({ title: "All links extracted!" });
  }, [queue, toast, extractOne]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="Add a URL to the queue..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addUrl()}
          className="bg-white/5 border-white/10 backdrop-blur-sm"
        />
        <Button onClick={addUrl} variant="outline" className="bg-white/5 border-white/10">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {queue.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{queue.length} items in queue</span>
            <Button
              onClick={downloadAll}
              disabled={running}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Download All
            </Button>
          </div>

          <ScrollArea className="h-80">
            <div className="space-y-2 pr-4">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex-shrink-0">
                    {item.status === "pending" && <Clock className="h-4 w-4 text-muted-foreground" />}
                    {item.status === "extracting" && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
                    {item.status === "ready" && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                    {item.status === "error" && <XCircle className="h-4 w-4 text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.url}</p>
                    {item.status === "extracting" && item.progress && (
                      <div className="mt-1.5 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-blue-400 font-medium">
                            {item.progress.percent !== null && item.progress.percent !== undefined ? `${item.progress.percent}%` : "Downloading…"}
                          </span>
                          <span className="text-muted-foreground">
                            {item.progress.speed > 0 ? `${formatBytes(item.progress.speed)}/s` : ""}
                            {item.progress.eta !== null && item.progress.eta !== undefined && item.progress.eta > 0 ? ` · ~${Math.round(item.progress.eta)}s left` : ""}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${item.progress.percent ?? 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {item.status === "extracting" && !item.progress && (
                      <p className="text-xs text-blue-400 mt-1">Starting download…</p>
                    )}
                    {item.status === "ready" && item.downloadUrl && (
                      <a
                        href={`/api/stream?url=${encodeURIComponent(item.downloadUrl)}&name=${encodeURIComponent(item.filename || "download.mp4")}`}
                        className="text-xs text-green-400 mt-1 flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> Download again
                      </a>
                    )}
                    {item.error && (
                      <p className="text-xs text-red-400 mt-1">{item.error}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => removeItem(item.id)}
                    disabled={item.status === "extracting"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {queue.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Download className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Add URLs above to start bulk downloading</p>
          <p className="text-xs mt-1">Supports Instagram, TikTok, Twitter/X, Facebook, Reddit, Pinterest, and Threads URLs</p>
        </div>
      )}
    </div>
  );
}

