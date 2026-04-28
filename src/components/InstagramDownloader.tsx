"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { isValidInstagramUrl } from "@/lib/utils";
import DownloadCountdown from "@/components/DownloadCountdown";
import { Download, Clipboard, X } from "lucide-react";

export default function InstagramDownloader({
  onDownload,
}: {
  onDownload: (title: string, url: string, type: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [countdown, setCountdown] = useState<{ streamUrl: string; name: string } | null>(null);
  const { toast } = useToast();

  const handleVideoDownload = () => {
    if (!isValidInstagramUrl(url)) {
      toast({ title: "Invalid URL", description: "Please enter a valid Instagram Reel URL", variant: "destructive" });
      return;
    }
    const safeName = "instagram-reel.mp4";
    const streamUrl = `/api/stream?url=${encodeURIComponent(url)}&name=${encodeURIComponent(safeName)}`;
    setCountdown({ streamUrl, name: safeName });
    onDownload("Instagram Reel", url, "Video MP4");
  };

  const paste = async () => {
    try { setUrl(await navigator.clipboard.readText()); } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Paste Instagram Reel URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
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
      </div>

      <Button
        onClick={handleVideoDownload}
        disabled={!url}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12"
      >
        <Download className="h-4 w-4 mr-2" />
        Download Reel (MP4)
      </Button>

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
