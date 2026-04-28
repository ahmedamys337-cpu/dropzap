"use client";

import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, Download, Merge } from "lucide-react";

interface DownloadProgressProps {
  status: string;
  progress: number;
  speed: string;
  eta: string;
  fileSize: string;
  error?: string;
}

export default function DownloadProgress({ status, progress, speed, eta, fileSize, error }: DownloadProgressProps) {
  if (status === "idle") return null;

  return (
    <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {status === "starting" && (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            <span className="text-sm font-medium">Starting download...</span>
          </>
        )}
        {status === "downloading" && (
          <>
            <Download className="h-5 w-5 text-blue-400 animate-pulse" />
            <span className="text-sm font-medium">Downloading...</span>
          </>
        )}
        {status === "merging" && (
          <>
            <Merge className="h-5 w-5 text-yellow-400 animate-pulse" />
            <span className="text-sm font-medium">Merging audio & video...</span>
          </>
        )}
        {status === "done" && (
          <>
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium text-green-400">Download complete!</span>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-5 w-5 text-red-400" />
            <span className="text-sm font-medium text-red-400">Failed</span>
          </>
        )}

        {(status === "downloading" || status === "merging") && (
          <span className="text-sm font-bold text-primary ml-auto">{progress}%</span>
        )}
      </div>

      {(status === "downloading" || status === "merging" || status === "done") && (
        <Progress value={progress} className="h-3" />
      )}

      {status === "downloading" && (speed || eta || fileSize) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {speed && <span>Speed: <strong className="text-foreground">{speed}</strong></span>}
          {eta && <span>ETA: <strong className="text-foreground">{eta}</strong></span>}
          {fileSize && <span>Size: <strong className="text-foreground">{fileSize}</strong></span>}
        </div>
      )}

      {status === "error" && error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
