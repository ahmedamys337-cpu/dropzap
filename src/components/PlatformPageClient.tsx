"use client";

import PlatformLanding from "@/components/PlatformLanding";
import YoutubeDownloader from "@/components/YoutubeDownloader";
import TikTokDownloader from "@/components/TikTokDownloader";
import InstagramDownloader from "@/components/InstagramDownloader";
import TwitterDownloader from "@/components/TwitterDownloader";
import FacebookDownloader from "@/components/FacebookDownloader";
import RedditDownloader from "@/components/RedditDownloader";
import type { PlatformSEO } from "@/lib/seo-data";

const noop = () => {};

const downloaderMap: Record<string, React.ComponentType<any>> = {
  youtube: YoutubeDownloader,
  tiktok: TikTokDownloader,
  instagram: InstagramDownloader,
  twitter: TwitterDownloader,
  facebook: FacebookDownloader,
  reddit: RedditDownloader,
};

interface Props {
  platform: PlatformSEO;
  platformKey: string;
}

export default function PlatformPageClient({ platform, platformKey }: Props) {
  const Downloader = downloaderMap[platformKey];
  if (!Downloader) return null;

  return (
    <PlatformLanding platform={platform}>
      <Downloader onDownload={noop} />
    </PlatformLanding>
  );
}
