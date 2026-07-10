"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Share2, Download, Smartphone, Puzzle, CheckCircle2 } from "lucide-react";

interface Props {
  platform: string;
}

export default function DownloadSuccessActions({ platform }: Props) {
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Capture the PWA install prompt so we can show it on demand.
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Detect if already installed as a PWA.
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://www.dropzap.digital";
  const shareText = `I just downloaded a ${platform} video with DropZap — no watermark, no signup, free.`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "DropZap", text: shareText, url: shareUrl });
        return;
      } catch {}
    }
    // Fallback to copy
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({ title: "Link copied", description: "Share it with your friends." });
    } catch {}
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Install DropZap",
        description: "Tap your browser menu and choose 'Add to Home Screen' for instant access.",
      });
      return;
    }
    try {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } catch {}
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        What would you like to do next?
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-auto py-2.5 flex flex-col items-center gap-1.5 border-white/10 bg-white/5 hover:bg-white/10"
          onClick={handleNativeShare}
        >
          <Share2 className="h-4 w-4" />
          <span className="text-xs">Share DropZap</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-auto py-2.5 flex flex-col items-center gap-1.5 border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => {
            const a = document.createElement("a");
            a.href = "/extension";
            a.click();
          }}
        >
          <Puzzle className="h-4 w-4" />
          <span className="text-xs">Extension</span>
        </Button>

        {!isInstalled && (
          <Button
            variant="outline"
            size="sm"
            className="h-auto py-2.5 flex flex-col items-center gap-1.5 border-white/10 bg-white/5 hover:bg-white/10"
            onClick={handleInstallPWA}
          >
            <Smartphone className="h-4 w-4" />
            <span className="text-xs">Add to Home</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="h-auto py-2.5 flex flex-col items-center gap-1.5 border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>("input[aria-label^='Paste']");
            if (input) {
              input.focus();
              input.select();
            }
          }}
        >
          <Download className="h-4 w-4" />
          <span className="text-xs">Download More</span>
        </Button>
      </div>
      {isInstalled && (
        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>DropZap is installed on your device.</span>
        </div>
      )}
    </div>
  );
}
