"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { isValidFacebookUrl } from "@/lib/utils";
import DownloadCountdown from "@/components/DownloadCountdown";
import { Download, Clipboard, X } from "lucide-react";

export default function FacebookDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [countdown, setCountdown] = useState<{ streamUrl: string; name: string } | null>(null);
  const { toast } = useToast();

  const handleDownload = () => {
    if (!isValidFacebookUrl(url)) {
      toast({ title: "Invalid URL", description: "Please enter a valid Facebook video URL", variant: "destructive" });
      return;
    }
    const safeName = "facebook-video.mp4";
    const streamUrl = `/api/stream?url=${encodeURIComponent(url)}&name=${encodeURIComponent(safeName)}`;
    setCountdown({ streamUrl, name: safeName });
    onDownload?.("Facebook Video", url, "HD MP4");
  };

  const paste = async () => {
    try { setUrl(await navigator.clipboard.readText()); } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Paste Facebook video URL here..."
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
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="h-4 w-4" />
          <span className="ml-2">Download</span>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Downloads Facebook videos in HD quality
      </p>

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
