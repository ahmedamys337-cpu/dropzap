"use client";

import { useCallback, useEffect, useState } from "react";

export interface DownloadHistoryItem {
  id: string;
  title: string;
  url: string;
  type: string;
  timestamp: number;
}

const STORAGE_KEY = "dropzap-history";
const MAX_ITEMS = 10;

export function useDownloadHistory() {
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const addToHistory = useCallback((item: Omit<DownloadHistoryItem, "id" | "timestamp">) => {
    setHistory((prev) => {
      const newItem: DownloadHistoryItem = {
        ...item,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      const updated = [newItem, ...prev].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, addToHistory, clearHistory };
}
