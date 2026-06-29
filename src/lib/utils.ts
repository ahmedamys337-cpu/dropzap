import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function isValidYouTubeUrl(url: string): boolean {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/;
  return pattern.test(url);
}

export function isValidInstagramUrl(url: string): boolean {
  const pattern = /^(https?:\/\/)?(www\.)?instagram\.com\/(reel|p|tv)\//;
  return pattern.test(url);
}

export function isValidTwitterUrl(url: string): boolean {
  const pattern = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/\w+\/status\//;
  return pattern.test(url);
}

export function isValidTikTokUrl(url: string): boolean {
  const pattern = /^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com)\//;
  return pattern.test(url);
}

export function isValidRedditUrl(url: string): boolean {
  const pattern = /^(https?:\/\/)?(www\.|old\.)?(reddit\.com|redd\.it)\//;
  return pattern.test(url);
}

export function isValidFacebookUrl(url: string): boolean {
  const pattern = /^(https?:\/\/)?(www\.|m\.)?(facebook\.com|fb\.watch)\//;
  return pattern.test(url);
}

export function isValidPinterestUrl(url: string): boolean {
  // Covers pinterest.com, country TLDs (pinterest.co.uk, .de, etc.) and pin.it short links.
  const pattern = /^(https?:\/\/)?(www\.)?(pinterest\.[a-z.]+|pin\.it)\//;
  return pattern.test(url);
}

export function isValidThreadsUrl(url: string): boolean {
  // threads.net (legacy) and threads.com (current). Post path: /@user/post/CODE
  const pattern = /^(https?:\/\/)?(www\.)?threads\.(net|com)\//;
  return pattern.test(url);
}
