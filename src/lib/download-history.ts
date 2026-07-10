export interface DownloadHistoryItem {
  id: string;
  title: string;
  url: string;
  platform: string;
  type: string;
  filename?: string;
  downloadedAt: string;
}

const STORAGE_KEY = "dropzap_download_history";
const MAX_ITEMS = 50;

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function getDownloadHistory(): DownloadHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DownloadHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addDownloadHistory(item: Omit<DownloadHistoryItem, "id" | "downloadedAt">) {
  if (typeof window === "undefined") return;
  try {
    const history = getDownloadHistory();
    const newItem: DownloadHistoryItem = {
      ...item,
      id: generateId(),
      downloadedAt: new Date().toISOString(),
    };
    // Keep most recent first, limit size.
    const updated = [newItem, ...history].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function removeDownloadHistory(id: string) {
  if (typeof window === "undefined") return;
  try {
    const history = getDownloadHistory().filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}

export function clearDownloadHistory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
