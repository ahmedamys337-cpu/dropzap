"use client";

import { useState, useCallback } from "react";

export interface ExtractResult {
  downloadUrl: string;
  title: string;
  filename: string;
}

export interface DownloadState {
  status: "idle" | "extracting" | "ready" | "error";
  error?: string;
  result?: ExtractResult;
}

export function useDownload() {
  const [state, setState] = useState<DownloadState>({ status: "idle" });

  const extract = useCallback(async (opts: {
    url: string;
    formatId?: string;
    audioOnly?: boolean;
  }): Promise<ExtractResult | null> => {
    setState({ status: "extracting" });

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opts),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to extract link");

      const ext = opts.audioOnly ? "m4a" : "mp4";
      const filename = `${(data.title || "download").replace(/[^a-zA-Z0-9 _-]/g, "").slice(0, 80)}.${ext}`;

      const result: ExtractResult = {
        downloadUrl: data.downloadUrl,
        title: data.title,
        filename,
      };

      setState({ status: "ready", result });
      return result;
    } catch (err: any) {
      setState({ status: "error", error: err.message });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { ...state, extract, reset };
}
