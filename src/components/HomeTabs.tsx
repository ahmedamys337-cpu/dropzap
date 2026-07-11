"use client";

import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InstagramDownloader from "@/components/InstagramDownloader";
import {
  Instagram,
  Twitter,
  Music2,
  FileAudio,
  MessageSquare,
  Facebook,
  Image as ImageIcon,
  AtSign,
} from "lucide-react";

const TabSkeleton = () => (
  <div className="h-40 animate-pulse rounded-lg bg-foreground/[0.04]" />
);

const ThumbnailDownloader = dynamic(
  () => import("@/components/ThumbnailDownloader"),
  { loading: TabSkeleton, ssr: false },
);
const InstagramThumbnailDownloader = dynamic(
  () => import("@/components/InstagramThumbnailDownloader"),
  { loading: TabSkeleton, ssr: false },
);
const TikTokThumbnailDownloader = dynamic(
  () => import("@/components/TikTokThumbnailDownloader"),
  { loading: TabSkeleton, ssr: false },
);
const TwitterDownloader = dynamic(
  () => import("@/components/TwitterDownloader"),
  { loading: TabSkeleton, ssr: false },
);
const TikTokDownloader = dynamic(
  () => import("@/components/TikTokDownloader"),
  { loading: TabSkeleton, ssr: false },
);
const TikTokToMp3 = dynamic(
  () => import("@/components/TikTokToMp3"),
  { loading: TabSkeleton, ssr: false },
);
const RedditDownloader = dynamic(
  () => import("@/components/RedditDownloader"),
  { loading: TabSkeleton, ssr: false },
);
const FacebookDownloader = dynamic(
  () => import("@/components/FacebookDownloader"),
  { loading: TabSkeleton, ssr: false },
);
const PinterestDownloader = dynamic(
  () => import("@/components/PinterestDownloader"),
  { loading: TabSkeleton, ssr: false },
);
const ThreadsDownloader = dynamic(
  () => import("@/components/ThreadsDownloader"),
  { loading: TabSkeleton, ssr: false },
);
const Mp3Converter = dynamic(
  () => import("@/components/Mp3Converter"),
  { loading: TabSkeleton, ssr: false },
);

const noop = () => {};

export default function HomeTabs() {
  return (
    <Tabs defaultValue="instagram" className="space-y-6">
      <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <TabsList className="glass-strong h-auto p-1.5 gap-1 flex w-max lg:w-full justify-start">
          <TabsTrigger
            value="youtube-thumbnail"
            className="lg:flex-1 gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-md bg-foreground/[0.06] border border-foreground/15 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/40 data-[state=active]:bg-orange-500 data-[state=active]:border-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 transition-all duration-300 ease-out"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>YouTube Thumbnail</span>
          </TabsTrigger>
          <TabsTrigger
            value="instagram-thumbnail"
            className="lg:flex-1 gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-md bg-foreground/[0.06] border border-foreground/15 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-pink-600/40 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-600 data-[state=active]:to-orange-500 data-[state=active]:border-transparent data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-600/30 transition-all duration-300 ease-out"
          >
            <Instagram className="h-3.5 w-3.5" />
            <span>IG Thumbnail</span>
          </TabsTrigger>
          <TabsTrigger
            value="tiktok-thumbnail"
            className="lg:flex-1 gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-md bg-foreground/[0.06] border border-foreground/15 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-pink-500 hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/40 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-pink-500 data-[state=active]:border-transparent data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-500/30 transition-all duration-300 ease-out"
          >
            <Music2 className="h-3.5 w-3.5" />
            <span>TikTok Thumbnail</span>
          </TabsTrigger>
          <TabsTrigger
            value="instagram"
            className="lg:flex-1 group gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-md bg-foreground/[0.06] border border-foreground/15 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-pink-600/40 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-600 data-[state=active]:to-orange-500 data-[state=active]:border-transparent data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-600/30 transition-all duration-300 ease-out"
          >
            <Instagram className="h-3.5 w-3.5" />
            <span>Instagram</span>
          </TabsTrigger>
          <TabsTrigger
            value="twitter"
            className="lg:flex-1 gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-md bg-foreground/[0.06] border border-foreground/15 hover:bg-black hover:text-white hover:border-black hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-black/40 data-[state=active]:bg-black data-[state=active]:border-black data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-black/40 transition-all duration-300 ease-out"
          >
            <Twitter className="h-3.5 w-3.5" />
            <span>Twitter/X</span>
          </TabsTrigger>
          <TabsTrigger
            value="tiktok"
            className="lg:flex-1 gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-md bg-foreground/[0.06] border border-foreground/15 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-pink-500 hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/40 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-pink-500 data-[state=active]:border-transparent data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-500/30 transition-all duration-300 ease-out"
          >
            <Music2 className="h-3.5 w-3.5" />
            <span>TikTok</span>
          </TabsTrigger>
          <TabsTrigger
            value="tiktok-mp3"
            className="lg:flex-1 gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-md bg-foreground/[0.06] border border-foreground/15 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-pink-500 hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/40 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-pink-500 data-[state=active]:border-transparent data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-pink-500/30 transition-all duration-300 ease-out"
          >
            <FileAudio className="h-3.5 w-3.5" />
            <span>TikTok to MP3</span>
          </TabsTrigger>
          <TabsTrigger
            value="reddit"
            className="lg:flex-1 gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-md bg-foreground/[0.06] border border-foreground/15 hover:bg-orange-600 hover:text-white hover:border-orange-600 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-orange-600/40 data-[state=active]:bg-orange-600 data-[state=active]:border-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-600/30 transition-all duration-300 ease-out"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Reddit</span>
          </TabsTrigger>
          <TabsTrigger
            value="facebook"
            className="lg:flex-1 gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-md bg-foreground/[0.06] border border-foreground/15 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/40 data-[state=active]:bg-blue-600 data-[state=active]:border-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/30 transition-all duration-300 ease-out"
          >
            <Facebook className="h-3.5 w-3.5" />
            <span>Facebook</span>
          </TabsTrigger>
          <TabsTrigger
            value="pinterest"
            className="lg:flex-1 gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-md bg-foreground/[0.06] border border-foreground/15 hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-red-600/40 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-rose-600 data-[state=active]:border-transparent data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-600/30 transition-all duration-300 ease-out"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Pinterest</span>
          </TabsTrigger>
          <TabsTrigger
            value="threads"
            className="lg:flex-1 gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-md bg-foreground/[0.06] border border-foreground/15 hover:bg-gradient-to-r hover:from-zinc-800 hover:to-zinc-900 hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-black/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-zinc-800 data-[state=active]:to-zinc-900 data-[state=active]:border-transparent data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-black/40 transition-all duration-300 ease-out"
          >
            <AtSign className="h-3.5 w-3.5" />
            <span>Threads</span>
          </TabsTrigger>
          <TabsTrigger
            value="mp3"
            className="lg:flex-1 gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-md bg-foreground/[0.06] border border-foreground/15 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-emerald-600/40 data-[state=active]:bg-emerald-600 data-[state=active]:border-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-600/30 transition-all duration-300 ease-out"
          >
            <FileAudio className="h-3.5 w-3.5" />
            <span>Video to MP3</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="space-y-6">
        <div>
          <TabsContent value="youtube-thumbnail" className="mt-0">
            <div className="glass rounded-2xl p-6 space-y-4 border-l-4 border-l-orange-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/30">
              <div className="flex items-center gap-3 pb-2 border-b border-orange-500/20">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">YouTube Thumbnail Downloader</h2>
                  <p className="text-sm text-muted-foreground">
                    Download thumbnails in all available sizes
                  </p>
                </div>
              </div>
              <ThumbnailDownloader />
            </div>
          </TabsContent>

          <TabsContent value="instagram-thumbnail" className="mt-0">
            <div className="glass rounded-2xl p-6 space-y-4 border-l-4 border-l-pink-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-600/30">
              <div className="flex items-center gap-3 pb-2 border-b border-pink-600/20">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-lg shadow-pink-600/30">
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Instagram Thumbnail Downloader</h2>
                  <p className="text-sm text-muted-foreground">
                    Download Instagram Reel and post cover images in original quality
                  </p>
                </div>
              </div>
              <InstagramThumbnailDownloader />
            </div>
          </TabsContent>

          <TabsContent value="tiktok-thumbnail" className="mt-0">
            <div className="glass rounded-2xl p-6 space-y-4 border-l-4 border-l-pink-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-500/30">
              <div className="flex items-center gap-3 pb-2 border-b border-pink-500/20">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <Music2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">TikTok Thumbnail Downloader</h2>
                  <p className="text-sm text-muted-foreground">
                    Grab TikTok video cover images in portrait 9:16 format
                  </p>
                </div>
              </div>
              <TikTokThumbnailDownloader />
            </div>
          </TabsContent>

          <TabsContent value="instagram" className="mt-0">
            <div className="glass rounded-2xl p-6 space-y-4 border-l-4 border-l-pink-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-600/30">
              <div className="flex items-center gap-3 pb-2 border-b border-pink-600/20">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-lg shadow-pink-600/30">
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Instagram Downloader</h2>
                  <p className="text-sm text-muted-foreground">
                    Download Reels, photos, and carousel posts in original quality
                  </p>
                </div>
              </div>
              <InstagramDownloader onDownload={noop} />
            </div>
          </TabsContent>

          <TabsContent value="twitter" className="mt-0">
            <div className="glass rounded-2xl p-6 space-y-4 border-l-4 border-l-sky-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/30">
              <div className="flex items-center gap-3 pb-2 border-b border-sky-500/20">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 to-zinc-900 flex items-center justify-center shadow-lg shadow-sky-500/30 border border-white/20">
                  <Twitter className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Twitter/X Video Downloader</h2>
                  <p className="text-sm text-muted-foreground">
                    Download videos from Twitter/X posts
                  </p>
                </div>
              </div>
              <TwitterDownloader onDownload={noop} />
            </div>
          </TabsContent>

          <TabsContent value="tiktok" className="mt-0">
            <div className="glass rounded-2xl p-6 space-y-4 border-l-4 border-l-pink-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-500/30">
              <div className="flex items-center gap-3 pb-2 border-b border-pink-500/20">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <Music2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">TikTok Downloader</h2>
                  <p className="text-sm text-muted-foreground">
                    Download TikTok videos without watermark
                  </p>
                </div>
              </div>
              <TikTokDownloader onDownload={noop} />
            </div>
          </TabsContent>

          <TabsContent value="tiktok-mp3" className="mt-0">
            <div className="glass rounded-2xl p-6 space-y-4 border-l-4 border-l-emerald-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/30">
              <div className="flex items-center gap-3 pb-2 border-b border-emerald-500/20">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-pink-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <FileAudio className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">TikTok to MP3 Converter</h2>
                  <p className="text-sm text-muted-foreground">
                    Convert TikTok videos to MP3 audio
                  </p>
                </div>
              </div>
              <TikTokToMp3 onDownload={noop} />
            </div>
          </TabsContent>

          <TabsContent value="reddit" className="mt-0">
            <div className="glass rounded-2xl p-6 space-y-4 border-l-4 border-l-orange-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-600/30">
              <div className="flex items-center gap-3 pb-2 border-b border-orange-600/20">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Reddit Video Downloader</h2>
                  <p className="text-sm text-muted-foreground">
                    Download Reddit videos with audio merged
                  </p>
                </div>
              </div>
              <RedditDownloader onDownload={noop} />
            </div>
          </TabsContent>

          <TabsContent value="facebook" className="mt-0">
            <div className="glass rounded-2xl p-6 space-y-4 border-l-4 border-l-blue-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-600/30">
              <div className="flex items-center gap-3 pb-2 border-b border-blue-600/20">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <Facebook className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Facebook Video &amp; Photo Downloader</h2>
                  <p className="text-sm text-muted-foreground">
                    Download Facebook videos, Reels, and photo posts in HD
                  </p>
                </div>
              </div>
              <FacebookDownloader onDownload={noop} />
            </div>
          </TabsContent>

          <TabsContent value="pinterest" className="mt-0">
            <div className="glass rounded-2xl p-6 space-y-4 border-l-4 border-l-red-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-600/30">
              <div className="flex items-center gap-3 pb-2 border-b border-red-600/20">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-red-600/30">
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Pinterest Downloader</h2>
                  <p className="text-sm text-muted-foreground">
                    Download Pinterest images and videos
                  </p>
                </div>
              </div>
              <PinterestDownloader onDownload={noop} />
            </div>
          </TabsContent>

          <TabsContent value="threads" className="mt-0">
            <div className="glass rounded-2xl p-6 space-y-4 border-l-4 border-l-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30">
              <div className="flex items-center gap-3 pb-2 border-b border-zinc-800/20">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center shadow-lg shadow-black/30 border border-white/20">
                  <AtSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Threads Downloader</h2>
                  <p className="text-sm text-muted-foreground">
                    Download Threads videos and images
                  </p>
                </div>
              </div>
              <ThreadsDownloader onDownload={noop} />
            </div>
          </TabsContent>

          <TabsContent value="mp3" className="mt-0">
            <div className="glass rounded-2xl p-6 space-y-4 border-l-4 border-l-emerald-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-600/30">
              <div className="flex items-center gap-3 pb-2 border-b border-emerald-600/20">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <FileAudio className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Video to MP3 Converter</h2>
                  <p className="text-sm text-muted-foreground">
                    Convert any video file to MP3 audio
                  </p>
                </div>
              </div>
              <Mp3Converter />
            </div>
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}
