"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Loader2, Download, FileAudio, X } from "lucide-react";

const ACCEPTED_FORMATS = ".mp4,.mkv,.avi,.mov,.webm,.flv,.wmv";
const MAX_SIZE_MB = 500;

export default function Mp3Converter() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
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
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setProgress(40);
      const res = await fetch("/api/convert/mp3", {
        method: "POST",
        body: formData,
      });

      setProgress(80);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Conversion failed");
      }

      const blob = await res.blob();
      const name = file.name.replace(/\.[^.]+$/, ".mp3");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
      setProgress(100);
      toast({ title: "Converted", description: `${name} is ready` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setConverting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-white/40 transition-colors bg-white/5 backdrop-blur-sm"
        onClick={() => inputRef.current?.click()}
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
          <div className="space-y-2">
            <FileAudio className="h-12 w-12 mx-auto text-primary" />
            <p className="font-medium">{file.name}</p>
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
          <div className="space-y-2">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="font-medium">Drop a video file here or click to browse</p>
            <p className="text-sm text-muted-foreground">
              Supports MP4, MKV, AVI, MOV, WebM, FLV, WMV (max {MAX_SIZE_MB}MB)
            </p>
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
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {progress < 100 ? "Converting..." : "Done!"}
          </p>
        </div>
      )}
    </div>
  );
}
