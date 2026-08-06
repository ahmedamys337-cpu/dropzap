// Type definitions for yt-dlp - safe to import anywhere including during build

export interface VideoInfo {
  title?: string;
  fulltitle?: string;
  extractor?: string;
  extractor_key?: string;
  formats?: Format[];
  thumbnails?: Thumbnail[];
  url?: string;
  ext?: string;
  width?: number;
  height?: number;
  display_url?: string;
  video_url?: string;
  _type?: string;
  entries?: VideoInfo[];
  [key: string]: unknown;
}

export interface Format {
  url?: string;
  ext?: string;
  vcodec?: string;
  acodec?: string;
  height?: number;
  width?: number;
  filesize?: number;
  abr?: number;
  tbr?: number;
  http_headers?: Record<string, string>;
  [key: string]: unknown;
}

export interface Thumbnail {
  url?: string;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

export type PickedFormat = {
  url?: string;
  http_headers?: Record<string, string>;
  ext?: string;
  vcodec?: string;
  acodec?: string;
  height?: number;
  filesize?: number;
  combined?: boolean;
};
