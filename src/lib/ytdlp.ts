// Import types from separate file for build safety
import type { VideoInfo, Format, Thumbnail, PickedFormat } from "./ytdlp-types";

// Re-export types for consumers
export type { VideoInfo, Format, Thumbnail, PickedFormat };

// Build-safe stubs - these will be replaced with real implementation at runtime
const isBuildTime = typeof window !== "undefined" || process.env.NEXT_PHASE === "phase-production-build";

let _impl: any = null;

function getImpl() {
  if (_impl) return _impl;
  if (isBuildTime) return null;
  _impl = require("./ytdlp-impl");
  return _impl;
}

export function getGenericCookiesArgs(): string[] {
  const impl = getImpl();
  return impl ? impl.getGenericCookiesArgs() : [];
}

export function getCookieHeader(hostname: string): string {
  const impl = getImpl();
  return impl ? impl.getCookieHeader(hostname) : "";
}

export function getProxyArgs(): string[] {
  const impl = getImpl();
  return impl ? impl.getProxyArgs() : [];
}

export function getSafeProxyListForLogging(): string[] {
  const impl = getImpl();
  return impl ? impl.getSafeProxyListForLogging() : [];
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  const impl = getImpl();
  return impl ? impl.getVideoInfo(url) : {} as VideoInfo;
}

export function pickFormats(
  info: VideoInfo,
  heightCap: number | null,
  audioOnly: boolean,
): { video: PickedFormat | null; audio: PickedFormat | null } {
  const impl = getImpl();
  return impl ? impl.pickFormats(info, heightCap, audioOnly) : { video: null, audio: null };
}

export async function getVideoInfoSkipDownload(url: string): Promise<VideoInfo> {
  const impl = getImpl();
  return impl ? impl.getVideoInfoSkipDownload(url) : {} as VideoInfo;
}
