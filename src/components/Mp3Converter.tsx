"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { formatBytes, type DownloadProgress as ProgressInfo } from "@/lib/download";
import { Upload, Loader2, Download, FileAudio, X } from "lucide-react";

const ACCEPTED_FORMATS = ".mp4,.mkv,.avi,.mov,.webm,.flv,.wmv";
const MAX_SIZE_MB = 500;

export default function Mp3Converter() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dlProgress, setDlProgress] = useState<ProgressInfo | null>(null);
  const [phase, setPhase] = useState<"idle" | "uploading" | "converting" | "downloading" | "done">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({ title: "File too large", description: `Max file size is ${MAX_SIZE_MB}MB`, variant: "destructive" });
      return;
    }
    setFile(f);
  };

  const convert = async () => {
    if (!file) return;
    setConverting(true);
    setProgress(10);
    setPhase("uploading");
    setDlProgress(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setProgress(30);
      setPhase("converting");
      const res = await fetch("/api/convert/mp3", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Conversion failed");
      }

      setPhase("downloading");
      setProgress(60);

      // Read the response body as a stream for real progress tracking
      const contentLength = res.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : null;
      const reader = res.body?.getReader();
      const chunks: Uint8Array[] = [];
      let downloaded = 0;
      const startTime = Date.now();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) { chunks.push(value); downloaded += value.length; }
          const elapsed = (Date.now() - startTime) / 1000;
          const speed = elapsed > 0 ? downloaded / elapsed : 0;
          const percent = total ? Math.min(Math.round((downloaded / total) * 100), 99) : null;
          const eta = total && speed > 0 ? (total - downloaded) / speed : null;
          setDlProgress({ phase: "downloading", downloaded, total, speed, eta, percent });
          if (percent !== null) setProgress(60 + Math.round(percent * 0.4));
        }
      }

      const blob = new Blob(chunks as BlobPart[], { type: "audio/mpeg" });

      const name = file.name.replace(/\.[^.]+$/, ".mp3");
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = name;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try { document.body.removeChild(a); } catch {}
        URL.revokeObjectURL(blobUrl);
      }, 1000);
      setProgress(100);
      setPhase("done");
      toast({ title: "Converted", description: `${name} is ready` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setConverting(false);
      setTimeout(() => {
        setProgress(0);
        setPhase("idle");
        setDlProgress(null);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/*
        Upload card — uses theme-aware tokens (`border-foreground/...`,
        `bg-foreground/...`) instead of hard-coded white so the card
        is visible in both light and dark mode. Adds a meaningful
        hover state (border + bg darken, icon lifts, shadow grows)
        so users get clear feedback that the card is interactive.
      */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a video file to convert to MP3"
        className="group relative border-2 border-dashed border-foreground/25 rounded-2xl p-10 text-center cursor-pointer bg-foreground/[0.03] hover:bg-foreground/[0.06] hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all duration-300"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) setFile(f);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_FORMATS}
          onChange={handleFileChange}
          className="hidden"
        />
        {file ? (
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <FileAudio className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="font-semibold text-foreground break-all px-4">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <X className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <p className="font-bold text-foreground text-lg">
              Drop a video file here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports MP4, MKV, AVI, MOV, WebM, FLV, WMV
              <span className="mx-1.5 text-foreground/30">•</span>
              max {MAX_SIZE_MB} MB
            </p>
            <Button
              type="button"
              size="lg"
              className="mt-2 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold shadow-lg shadow-emerald-500/25"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" /> Choose Video File
            </Button>
          </div>
        )}
      </div>

      {file && (
        <Button
          onClick={convert}
          disabled={converting}
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
        >
          {converting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Convert to MP3
        </Button>
      )}

      {progress > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {phase === "uploading" ? "Uploading file…" :
               phase === "converting" ? "Converting to MP3…" :
               phase === "downloading" ? "Downloading MP3…" :
               "Done!"}
            </span>
            <span className="text-xs text-muted-foreground">
              {phase === "downloading" && dlProgress
                ? `${dlProgress.percent ?? 0}% · ${dlProgress.speed > 0 ? formatBytes(dlProgress.speed) + "/s" : ""}`
                : `${progress}%`}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          {phase === "downloading" && dlProgress && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatBytes(dlProgress.downloaded)}{dlProgress.total ? ` / ${formatBytes(dlProgress.total)}` : ""}</span>
              {dlProgress.eta !== null && dlProgress.eta !== undefined && dlProgress.eta > 0 && (
                <span>~{Math.round(dlProgress.eta)}s remaining</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
