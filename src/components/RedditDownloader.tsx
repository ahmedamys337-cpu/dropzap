"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { isValidRedditUrl } from "@/lib/utils";
import { triggerNativeDownload, safeFilename } from "@/lib/download";
import AdCountdown from "@/components/AdCountdown";
import { Download, Clipboard, X, Loader2 } from "lucide-react";

type Phase = "idle" | "ad";

export default function RedditDownloader({
  onDownload,
}: {
  onDownload?: (title: string, url: string, type: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const { toast } = useToast();

  const start = () => {
    if (!isValidRedditUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Reddit post URL.",
        variant: "destructive",
      });
      return;
    }
    setPhase("ad");
  };

  const fireDownload = () => {
    const name = `${safeFilename("reddit-video", "reddit")}.mp4`;
    const streamUrl = `/api/stream?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
    triggerNativeDownload(streamUrl, name);
    onDownload?.("Reddit Video", url, "MP4 with Audio");
    setPhase("idle");
  };

  const paste = async () => {
    try {
      setUrl(await navigator.clipboard.readText());
    } catch {}
  };

  return (
    <div className="space-y-5">
      <div className="relative">
        <Input
          placeholder="Paste Reddit post URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && start()}
          className="h-14 text-base pr-20 bg-white/5 border-white/10 backdrop-blur-sm"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={paste}>
            <Clipboard className="h-4 w-4" />
          </Button>
          {url && (
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setUrl("")}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Button
        onClick={start}
        disabled={!url || phase !== "idle"}
        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg shadow-orange-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        {phase === "ad" ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Download className="h-5 w-5 mr-2" />
            Download (With Audio)
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Downloads Reddit videos with audio merged automatically.
      </p>

      {phase === "ad" && (
        <AdCountdown seconds={5} onComplete={fireDownload} onClose={() => setPhase("idle")} />
      )}
    </div>
  );
}
