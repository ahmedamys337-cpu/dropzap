"use client";

import TikTokDownloader from "@/components/TikTokDownloader";
import InstagramDownloader from "@/components/InstagramDownloader";
import TwitterDownloader from "@/components/TwitterDownloader";
import FacebookDownloader from "@/components/FacebookDownloader";
import RedditDownloader from "@/components/RedditDownloader";
import TikTokToMp3 from "@/components/TikTokToMp3";

const noop = () => {};

const downloaderMap: Record<string, React.ComponentType<any>> = {
  tiktok: TikTokDownloader,
  tiktokToMp3: TikTokToMp3,
  instagram: InstagramDownloader,
  twitter: TwitterDownloader,
  facebook: FacebookDownloader,
  reddit: RedditDownloader,
};

interface Props {
  platformKey: string;
}

export default function PlatformDownloader({ platformKey }: Props) {
  const Downloader = downloaderMap[platformKey];
  if (!Downloader) return null;

  return <Downloader onDownload={noop} />;
}
