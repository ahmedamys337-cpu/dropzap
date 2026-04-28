"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { isValidTwitterUrl } from "@/lib/utils";
import DownloadCountdown from "@/components/DownloadCountdown";
import { Download, Clipboard, X } from "lucide-react";

export default function TwitterDownloader({
  onDownload,
}: {
  onDownload: (title: string, url: string, type: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [countdown, setCountdown] = useState<{ streamUrl: string; name: string } | null>(null);
  const { toast } = useToast();

  const handleDownload = () => {
    if (!isValidTwitterUrl(url)) {
      toast({ title: "Invalid URL", description: "Please enter a valid Twitter/X post URL", variant: "destructive" });
      return;
    }
    const safeName = "twitter-video.mp4";
    const streamUrl = `/api/stream?url=${encodeURIComponent(url)}&name=${encodeURIComponent(safeName)}`;
    setCountdown({ streamUrl, name: safeName });
    onDownload("Twitter/X Video", url, "Video MP4");
  };

  const paste = async () => {
    try { setUrl(await navigator.clipboard.readText()); } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Paste Twitter/X post URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDownload()}
            className="pr-20 bg-white/5 border-white/10 backdrop-blur-sm"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={paste}>
              <Clipboard className="h-3.5 w-3.5" />
            </Button>
            {url && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setUrl("")}>
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <Button
          onClick={handleDownload}
          disabled={!url}
          className="bg-sky-500 hover:bg-sky-600"
        >
          <Download className="h-4 w-4" />
          <span className="ml-2">Download</span>
        </Button>
      </div>

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
