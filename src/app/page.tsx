"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import AdBanner from "@/components/AdBanner";
// Static imports so switching tabs is instant — no per-tab chunk fetch.
import ThumbnailDownloader from "@/components/ThumbnailDownloader";
import InstagramDownloader from "@/components/InstagramDownloader";
import TwitterDownloader from "@/components/TwitterDownloader";
import TikTokDownloader from "@/components/TikTokDownloader";
import Mp3Converter from "@/components/Mp3Converter";
import RedditDownloader from "@/components/RedditDownloader";
import FacebookDownloader from "@/components/FacebookDownloader";
import PinterestDownloader from "@/components/PinterestDownloader";
import ThreadsDownloader from "@/components/ThreadsDownloader";
import {
  Zap,
  Image as ImageIcon,
  Instagram,
  Twitter,
  Music2,
  FileAudio,
  MessageSquare,
  Facebook,
  AtSign,
} from "lucide-react";

export default function Home() {
  // Download history was removed at user request — the panel often confused
  // people into thinking previous failed attempts were still pending. We
  // keep the handler signature as a noop so child Downloader components
  // don't have to change their prop contracts.
  const handleDownload = (_title: string, _url: string, _type: string) => {
    void _title; void _url; void _type;
  };

  return (
    <main className="min-h-screen gradient-bg animate-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3" aria-label="DropZap home">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold leading-tight bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">
                DropZap
              </span>
              <p className="text-[11px] text-muted-foreground leading-tight font-medium">
                Media Downloader
              </p>
            </div>
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero / SEO H1 */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-4 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            DropZap
          </span>
          <span className="text-foreground"> — Free Online Media Downloader</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
          Download <strong>Instagram Reels</strong>, <strong>TikTok</strong>, <strong>Facebook</strong>,{" "}
          <strong>Twitter/X</strong>, <strong>Reddit</strong>, <strong>Pinterest</strong>, and <strong>Threads</strong> videos in HD — no watermark, no signup, 100% free.
        </p>
      </section>

      {/* === AD ZONE: Top Banner === */}
      <div className="max-w-6xl mx-auto px-4 pt-2">
        <AdBanner slot="top" />
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="instagram" className="space-y-6">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {/*
              Each tab uses a shared base that gives:
                - a low-opacity background + border that is visible in BOTH light
                  and dark themes (black-tinted in light, white-tinted in dark)
                - a lift-on-hover micro-interaction (translate + scale + shadow)
              Each tab then layers on its own platform color for the hover and
              active states so hovering Instagram turns pink/orange, hovering
              Facebook turns blue, etc. — matching the active appearance.
            */}
            <TabsList className="glass-strong h-auto p-1.5 gap-1 flex w-max lg:w-full justify-start">
              <TabsTrigger
                value="thumbnail"
                className="lg:flex-1 gap-1.5 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-md bg-foreground/[0.06] border border-foreground/15 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/40 data-[state=active]:bg-orange-500 data-[state=active]:border-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/30 transition-all duration-300 ease-out"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Thumbnails</span>
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
                <span>MP3</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="space-y-6">
            <div>
              <div className="glass rounded-2xl p-6">
                <TabsContent value="thumbnail" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-orange-500/20">
                      <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
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

                <TabsContent value="instagram" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-pink-600/20">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-lg shadow-pink-600/30">
                        <Instagram className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Instagram Downloader</h2>
                        <p className="text-sm text-muted-foreground">
                          Download Reels, photos, and carousel posts in original quality
                        </p>
                      </div>
                    </div>
                    <InstagramDownloader onDownload={handleDownload} />
                  </div>
                </TabsContent>

                <TabsContent value="twitter" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-white/20">
                      <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center shadow-lg shadow-black/40 border border-white/20">
                        <Twitter className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Twitter/X Video Downloader</h2>
                        <p className="text-sm text-muted-foreground">
                          Download videos from Twitter/X posts
                        </p>
                      </div>
                    </div>
                    <TwitterDownloader onDownload={handleDownload} />
                  </div>
                </TabsContent>

                <TabsContent value="tiktok" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-pink-500/20">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                        <Music2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">TikTok Downloader</h2>
                        <p className="text-sm text-muted-foreground">
                          Download TikTok videos without watermark
                        </p>
                      </div>
                    </div>
                    <TikTokDownloader onDownload={handleDownload} />
                  </div>
                </TabsContent>

                <TabsContent value="reddit" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-orange-600/20">
                      <div className="h-10 w-10 rounded-lg bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Reddit Video Downloader</h2>
                        <p className="text-sm text-muted-foreground">
                          Download Reddit videos with audio merged
                        </p>
                      </div>
                    </div>
                    <RedditDownloader onDownload={handleDownload} />
                  </div>
                </TabsContent>

                <TabsContent value="facebook" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-blue-600/20">
                      <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <Facebook className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Facebook Video &amp; Photo Downloader</h2>
                        <p className="text-sm text-muted-foreground">
                          Download Facebook videos, Reels, and photo posts in HD
                        </p>
                      </div>
                    </div>
                    <FacebookDownloader onDownload={handleDownload} />
                  </div>
                </TabsContent>

                <TabsContent value="pinterest" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-red-600/20">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-red-600/30">
                        <ImageIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Pinterest Downloader</h2>
                        <p className="text-sm text-muted-foreground">
                          Download Pinterest pin images and videos in original quality
                        </p>
                      </div>
                    </div>
                    <PinterestDownloader onDownload={handleDownload} />
                  </div>
                </TabsContent>

                <TabsContent value="threads" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-white/20">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center shadow-lg shadow-black/40 border border-white/10">
                        <AtSign className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Threads Downloader</h2>
                        <p className="text-sm text-muted-foreground">
                          Download Threads videos and images from public posts
                        </p>
                      </div>
                    </div>
                    <ThreadsDownloader onDownload={handleDownload} />
                  </div>
                </TabsContent>


                <TabsContent value="mp3" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-emerald-600/20">
                      <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                        <FileAudio className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Video to MP3 Converter</h2>
                        <p className="text-sm text-muted-foreground">
                          Upload a video file and convert it to MP3 audio
                        </p>
                      </div>
                    </div>
                    <Mp3Converter />
                  </div>
                </TabsContent>

              </div>
            </div>

            {/* Inline ad slot — used to live in the right sidebar; moves here
                now that the sidebar is gone so we keep the impression. */}
            <div>
              <AdBanner slot="sidebar" />
            </div>
          </div>
        </Tabs>
      </div>

      {/* SEO: Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-12" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
          Why DropZap is the Best Free Video Downloader
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold mb-2">Instagram Photos &amp; Carousels</h3>
            <p className="text-sm text-muted-foreground">
              Save Instagram photo posts and full carousels — single image as JPG, multi-slide carousels packaged into a clean ZIP.
            </p>
          </div>
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold mb-2">Instagram Reels Downloader</h3>
            <p className="text-sm text-muted-foreground">
              Download Instagram Reels, posts, and IGTV videos directly to your device with full quality preserved.
            </p>
          </div>
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold mb-2">TikTok No Watermark</h3>
            <p className="text-sm text-muted-foreground">
              Save TikTok videos without the TikTok logo or watermark — clean HD downloads every time.
            </p>
          </div>
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold mb-2">Twitter / X Video Downloader</h3>
            <p className="text-sm text-muted-foreground">
              Grab any video from Twitter or X posts in the best available resolution with one click.
            </p>
          </div>
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold mb-2">MP3 Converter</h3>
            <p className="text-sm text-muted-foreground">
              Convert any video file or online video into high-quality MP3 audio for music, podcasts, or learning.
            </p>
          </div>
          <div className="glass rounded-xl p-5">
            <h3 className="font-bold mb-2">Pinterest &amp; Threads</h3>
            <p className="text-sm text-muted-foreground">
              Save Pinterest pin images, Idea Pins, and Threads videos &amp; photos in their original quality — single posts or full carousels.
            </p>
          </div>
        </div>
      </section>

      {/* SEO: How To */}
      <section className="max-w-6xl mx-auto px-4 py-12" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
          How to Download a Video in 3 Steps
        </h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <li className="glass rounded-xl p-5">
            <div className="text-3xl font-extrabold bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent">1</div>
            <h3 className="font-bold mt-2 mb-1">Copy the link</h3>
            <p className="text-sm text-muted-foreground">
              Copy the URL of the post or video from Instagram, TikTok, Facebook, Twitter/X, Reddit, or any supported platform.
            </p>
          </li>
          <li className="glass rounded-xl p-5">
            <div className="text-3xl font-extrabold bg-gradient-to-br from-purple-600 to-pink-500 bg-clip-text text-transparent">2</div>
            <h3 className="font-bold mt-2 mb-1">Paste into DropZap</h3>
            <p className="text-sm text-muted-foreground">
              Pick the matching tab above and paste the link into the input box.
            </p>
          </li>
          <li className="glass rounded-xl p-5">
            <div className="text-3xl font-extrabold bg-gradient-to-br from-pink-500 to-orange-500 bg-clip-text text-transparent">3</div>
            <h3 className="font-bold mt-2 mb-1">Choose quality &amp; download</h3>
            <p className="text-sm text-muted-foreground">
              Select your preferred quality or format and DropZap delivers the file instantly.
            </p>
          </li>
        </ol>
      </section>

      {/* SEO: FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-12" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {[
            {
              q: "Is DropZap free to use?",
              a: "Yes — DropZap is 100% free with no subscription, no signup, and no hidden fees.",
            },
            {
              q: "Does DropZap remove TikTok watermarks?",
              a: "Yes. DropZap downloads TikTok videos without the TikTok watermark by default.",
            },
            {
              q: "What platforms does DropZap support?",
              a: "DropZap supports Instagram (Reels, photos, and carousels), TikTok, Twitter/X, Facebook, Reddit (with sound), Pinterest, and Threads. You can also convert videos to MP3 and grab YouTube thumbnails.",
            },
            {
              q: "Do I need to install anything?",
              a: "No. DropZap runs entirely in your browser — no apps, plugins, or extensions required.",
            },
            {
              q: "Is downloading videos with DropZap legal?",
              a: "DropZap is intended for personal use only. Always respect copyright and the original creators' rights.",
            },
          ].map((item, i) => (
            <details key={i} className="glass rounded-xl p-4 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                {item.q}
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* === AD ZONE: Bottom Banner === */}
      <div className="max-w-6xl mx-auto px-4 pb-6">
        <AdBanner slot="bottom" />
      </div>

      {/* Footer */}
      <footer className="mt-6 py-10 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500 fill-purple-500" />
              <span className="font-bold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                DropZap
              </span>
              <span className="text-xs text-muted-foreground">— Media Downloader</span>
            </div>
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-5 text-xs text-muted-foreground">
              <a href="/tiktok-downloader" className="hover:text-foreground transition-colors">TikTok Downloader</a>
              <a href="/instagram-downloader" className="hover:text-foreground transition-colors">Instagram Downloader</a>
              <a href="/twitter-video-downloader" className="hover:text-foreground transition-colors">Twitter Downloader</a>
              <a href="/facebook-video-downloader" className="hover:text-foreground transition-colors">Facebook Downloader</a>
              <a href="/reddit-video-downloader" className="hover:text-foreground transition-colors">Reddit Downloader</a>
              <a href="/blog" className="hover:text-foreground transition-colors">Blog</a>
              <a href="/about" className="hover:text-foreground transition-colors">About</a>
              <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
              <a href="/dmca" className="hover:text-foreground transition-colors">DMCA</a>
            </nav>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            For personal use only. Respect content creators&apos; rights. © {new Date().getFullYear()} DropZap. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
