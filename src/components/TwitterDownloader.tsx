"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { isValidTwitterUrl } from "@/lib/utils";
import { triggerNativeDownload, safeFilename } from "@/lib/download";
import AdCountdown from "@/components/AdCountdown";
import { Download, Clipboard, X, Loader2 } from "lucide-react";

type Phase = "idle" | "ad";

export default function TwitterDownloader({
  onDownload,
}: {
  onDownload: (title: string, url: string, type: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const { toast } = useToast();

  const start = () => {
    if (!isValidTwitterUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Twitter/X post URL.",
        variant: "destructive",
      });
      return;
    }
    setPhase("ad");
  };

  const fireDownload = () => {
    const name = `${safeFilename("twitter-video", "twitter")}.mp4`;
    const streamUrl = `/api/stream?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
    triggerNativeDownload(streamUrl, name);
    onDownload("Twitter/X Video", url, "Video MP4");
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
          placeholder="Paste Twitter/X post URL here..."
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
        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-sky-500 to-black hover:from-sky-600 hover:to-zinc-900 text-white shadow-lg shadow-sky-500/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        {phase === "ad" ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Download className="h-5 w-5 mr-2" />
            Download
          </>
        )}
      </Button>

      {phase === "ad" && (
        <AdCountdown seconds={5} onComplete={fireDownload} onClose={() => setPhase("idle")} />
      )}
    </div>
  );
}
