"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Timer, X, CheckCircle2, Loader2 } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

interface DownloadCountdownProps {
  streamUrl: string;
  filename: string;
  onClose: () => void;
}

export default function DownloadCountdown({ streamUrl, filename, onClose }: DownloadCountdownProps) {
  const [seconds, setSeconds] = useState(5);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<"waiting" | "preparing" | "downloading" | "done" | "error">("waiting");
  const [progress, setProgress] = useState(0);
  const [received, setReceived] = useState(0);
  const [total, setTotal] = useState(0);
  const [speed, setSpeed] = useState("");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef(0);
  const estimateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (seconds <= 0) {
      setReady(true);
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  // Estimated progress timer — smoothly increments throughout the entire download
  const startEstimatedProgress = useCallback(() => {
    startTimeRef.current = Date.now();
    estimateTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      // Smooth curve: approaches 95% asymptotically
      // ~10% at 5s, ~28% at 15s, ~49% at 30s, ~74% at 60s, ~86% at 90s
      const est = Math.min(95, Math.round(100 * (1 - Math.exp(-elapsed / 45))));
      setProgress(est);
    }, 500);
  }, []);

  const stopEstimatedProgress = useCallback(() => {
    if (estimateTimerRef.current) {
      clearInterval(estimateTimerRef.current);
      estimateTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopEstimatedProgress();
  }, [stopEstimatedProgress]);

  const triggerDownload = useCallback(async () => {
    setPhase("preparing");
    setProgress(0);
    setReceived(0);
    setTotal(0);
    setSpeed("");
    startEstimatedProgress();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(streamUrl, { signal: controller.signal });

      if (!res.ok || !res.body) {
        stopEstimatedProgress();
        throw new Error("Download failed — server returned an error");
      }

      const contentLength = parseInt(res.headers.get("content-length") || "0", 10);
      setTotal(contentLength);

      // Switch to downloading phase once we get the response
      setPhase("downloading");

      // Only stop estimated timer if we have real Content-Length
      if (contentLength > 0) {
        stopEstimatedProgress();
      }

      const reader = res.body.getReader();
      const chunks: BlobPart[] = [];
      let loadedBytes = 0;
      let lastTime = Date.now();
      let lastLoaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loadedBytes += value.length;
        setReceived(loadedBytes);

        if (contentLength > 0) {
          // Real progress from Content-Length
          setProgress(Math.min(Math.round((loadedBytes / contentLength) * 100), 99));
        }
        // When no Content-Length, the estimated timer keeps running

        // Calculate speed every 500ms
        const now = Date.now();
        if (now - lastTime >= 500) {
          const bytesPerSec = ((loadedBytes - lastLoaded) / (now - lastTime)) * 1000;
          setSpeed(formatBytes(bytesPerSec) + "/s");
          lastTime = now;
          lastLoaded = loadedBytes;
        }
      }

      // Build blob and trigger save
      const blob = new Blob(chunks);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setProgress(100);
      setPhase("done");
    } catch (err: any) {
      stopEstimatedProgress();
      if (err.name === "AbortError") return;
      setError(err.message || "Download failed");
      setPhase("error");
    }
  }, [streamUrl, filename, startEstimatedProgress, stopEstimatedProgress]);

  const handleClose = () => {
    stopEstimatedProgress();
    if (abortRef.current) abortRef.current.abort();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 p-6 rounded-2xl bg-background border border-white/10 shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="text-center space-y-4">
          <h3 className="text-lg font-bold">
            {phase === "done" ? "Download Complete!" :
             phase === "preparing" ? "Preparing Download..." :
             phase === "downloading" ? "Downloading..." :
             phase === "error" ? "Download Failed" :
             "Your download is ready!"}
          </h3>
          <p className="text-sm text-muted-foreground truncate px-4">{filename}</p>

          {/* === AD ZONE: Interstitial Ad === */}
          <div className="w-full min-h-[200px] bg-white/5 rounded-lg border border-dashed border-white/20 flex items-center justify-center">
            <div id="ad-interstitial" className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Advertisement</span>
            </div>
          </div>
          {/* === END AD ZONE === */}

          {/* Countdown timer */}
          {!ready && phase === "waiting" && (
            <div className="space-y-3">
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
                  <circle
                    cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4"
                    className="text-primary transition-all duration-1000 ease-linear"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (seconds / 5)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{seconds}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Timer className="h-4 w-4" />
                Please wait...
              </p>
            </div>
          )}

          {/* Download button */}
          {ready && phase === "waiting" && (
            <Button
              onClick={triggerDownload}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-bold"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Now
            </Button>
          )}

          {/* Preparing phase */}
          {phase === "preparing" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    <span className="font-medium">{progress}%</span>
                  </span>
                  <span className="text-muted-foreground text-xs">Fetching video...</span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-muted-foreground">Connecting to server and preparing your file...</p>
              </div>
            </div>
          )}

          {/* Downloading phase */}
          {phase === "downloading" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-green-400" />
                    <span className="font-medium text-green-400">{progress}%</span>
                  </span>
                  <span className="text-muted-foreground">{speed || "calculating..."}</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatBytes(received)} downloaded</span>
                  {total > 0 && <span>of {formatBytes(total)}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Done */}
          {phase === "done" && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <CheckCircle2 className="h-6 w-6" />
                <span className="font-medium">Saved to your downloads!</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatBytes(received)} downloaded
              </p>
              <Button onClick={handleClose} className="bg-green-600 hover:bg-green-700 text-white">
                Close
              </Button>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="space-y-3">
              <p className="text-sm text-red-400">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={triggerDownload} variant="outline" className="bg-white/5 border-white/10">
                  Try Again
                </Button>
                <Button onClick={handleClose} variant="ghost">
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
