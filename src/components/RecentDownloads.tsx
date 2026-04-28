"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DownloadHistoryItem } from "@/lib/hooks";
import { Trash2, ExternalLink, Clock } from "lucide-react";

export default function RecentDownloads({
  history,
  onClear,
}: {
  history: DownloadHistoryItem[];
  onClear: () => void;
}) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No recent downloads</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">Recent Downloads</h3>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-xs">
          <Trash2 className="h-3 w-3 mr-1" /> Clear
        </Button>
      </div>
      <ScrollArea className="h-60">
        <div className="space-y-2 pr-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.type} • {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
