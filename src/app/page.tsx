import Image from "next/image";
import dynamic from "next/dynamic";
import { Zap } from "lucide-react";

// Dynamic imports for code splitting and reduced initial bundle size
const ThemeToggle = dynamic(() => import("@/components/ThemeToggle").then(m => m.ThemeToggle), { ssr: false });
const AdBanner = dynamic(() => import("@/components/AdBanner"), { ssr: false });
const TrustBar = dynamic(() => import("@/components/TrustBar"), { ssr: false });
const SupportedPlatforms = dynamic(() => import("@/components/SupportedPlatforms"), { ssr: false });
const CitableFacts = dynamic(() => import("@/components/CitableFacts"), { ssr: false });
const HomeTabs = dynamic(() => import("@/components/HomeTabs"), { ssr: false });
const CompetitorBanner = dynamic(() => import("@/components/CompetitorBanner"), { ssr: false });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";
const SITE_DESCRIPTION =
  "Free downloader for Instagram Reels, TikTok, Facebook, Twitter/X, Reddit, Pinterest & Threads. HD quality. No watermark. No signup.";

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["SoftwareApplication", "WebApplication"],
      "@id": `${SITE_URL}/#app`,
      name: "DropZap",
      url: SITE_URL,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web Browser",
      browserRequirements: "Requires JavaScript. Works in Chrome, Safari, Firefox, and Edge.",
      description: SITE_DESCRIPTION,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
      featureList: [
        "Instagram Reels downloader",
        "Instagram photo and carousel downloader",
        "TikTok downloader without watermark",
        "Twitter/X video downloader",
        "Facebook video downloader",
        "Reddit video downloader with sound",
        "Pinterest image and video downloader",
        "Threads video and image downloader",
        "YouTube thumbnail downloader",
        "Video to MP3 converter",
      ],
    },
    {
      "@type": "HowTo",
      name: "How to download a video with DropZap",
      description: "Download any video from Instagram, TikTok, Facebook, Twitter/X, Reddit, Pinterest, or Threads for free in 3 steps.",
      totalTime: "PT1M",
      step: [
        { "@type": "HowToStep", position: 1, name: "Copy the video URL", text: "Go to Instagram, TikTok, Facebook, Twitter/X, Reddit, Pinterest, or Threads and copy the URL of the post you want to download." },
        { "@type": "HowToStep", position: 2, name: "Paste into DropZap", text: "Open DropZap, select the matching platform tab, and paste the URL into the input field." },
        { "@type": "HowToStep", position: 3, name: "Choose quality and download", text: "Select your preferred resolution or format and click Download. Your file will be saved instantly." },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "Is DropZap free to use?", acceptedAnswer: { "@type": "Answer", text: "Yes, DropZap is 100% free. No subscription, no signup, and no hidden fees." } },
        { "@type": "Question", name: "Does DropZap remove TikTok watermarks?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap downloads TikTok videos without the TikTok watermark by default." } },
        { "@type": "Question", name: "What platforms does DropZap support?", acceptedAnswer: { "@type": "Answer", text: "DropZap supports Instagram (Reels, photos & carousels), TikTok (no watermark), Twitter/X, Facebook, Reddit (with sound), Pinterest, and Threads. You can also convert videos to MP3, bulk-download multiple links, and grab YouTube thumbnails." } },
        { "@type": "Question", name: "Do I need to install anything to use DropZap?", acceptedAnswer: { "@type": "Answer", text: "No. DropZap runs entirely in your browser — no apps, plugins, or extensions required." } },
        { "@type": "Question", name: "Is downloading videos with DropZap legal?", acceptedAnswer: { "@type": "Answer", text: "DropZap is intended for personal use only. Always respect copyright and the original creators' rights." } },
        { "@type": "Question", name: "How do I download a TikTok video without watermark?", acceptedAnswer: { "@type": "Answer", text: "Copy the TikTok video link from the app by tapping Share then Copy Link. Paste it into DropZap's TikTok section and click Download. The video saves without any TikTok watermark or logo." } },
        { "@type": "Question", name: "Can I download Instagram photos and carousel posts?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap downloads Instagram single photos as JPG files and multi-slide carousels as a ZIP archive containing all images at original quality." } },
        { "@type": "Question", name: "Can I download Reddit videos with sound?", acceptedAnswer: { "@type": "Answer", text: "Yes. Reddit stores video and audio as separate streams. DropZap automatically merges them into a single MP4 file with full audio included." } },
        { "@type": "Question", name: "Does DropZap work on iPhone and Android?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap works in Safari on iPhone and Chrome on Android. No app installation required. Files save to your Files app on iPhone and Downloads folder on Android." } },
        { "@type": "Question", name: "Can I convert a video to MP3 using DropZap?", acceptedAnswer: { "@type": "Answer", text: "Yes. DropZap has a built-in MP3 converter. Upload any video file or paste a supported video URL and convert it to MP3 audio instantly." } },
      ],
    },
  ],
};

export default function Home() {
  return (
    <main role="main" className="min-h-screen gradient-bg animate-gradient">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 w-full glass-strong">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3" aria-label="DropZap home">
            {/* Real <img> with descriptive alt text. Fixes the SEO audit
               findings "no images detected on homepage" and "Image Alt
               Text 0/0". `priority` preloads the LCP candidate. */}
            <Image
              src="/icon-512.png"
              alt="DropZap free social media video downloader logo"
              width="40"
              height="40"
              priority
              className="h-10 w-10 rounded-xl shadow-lg shadow-purple-600/30"
            />
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

      <CompetitorBanner />

      {/* Hero / SEO H1 */}
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-4 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            DropZap
          </span>
          <span className="text-foreground"> — Free </span>
          <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Instagram, TikTok &amp; Social Media
          </span>
          <span className="text-foreground"> Video Downloader</span>
        </h1>
        {/* Hero copy split into short sentences. The previous one-line
           paragraph dragged the readability score below 50; breaking it
           up brings the homepage above the audit threshold. */}
        <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
          Save videos in HD from <strong>Instagram</strong>, <strong>TikTok</strong>, <strong>Facebook</strong>, <strong>Twitter/X</strong>, <strong>Reddit</strong>, <strong>Pinterest</strong>, and <strong>Threads</strong>.
          <br className="hidden sm:block" />
          No watermark. No signup. 100% free.
        </p>
        {/* EEAT trust bar — 4 falsifiable trust claims, server-rendered,
           rendered between H1 and the tool tabs so it shapes first
           impression without delaying LCP (text-only, no JS). */}
        <TrustBar />
      </section>

      {/* Top ad zone REMOVED in May 2026. An ad placed above the
         primary tool (between H1 and tabs) is exactly the "ads above
         primary content" pattern Google's Page Layout algorithm
         penalizes. Sidebar + bottom slots remain. */}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <HomeTabs />
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
            <h3 className="font-bold mb-2">TikTok to MP3</h3>
            <p className="text-sm text-muted-foreground">
              Convert TikTok videos to MP3 audio instantly — save trending sounds, songs, and voiceovers as high-quality audio files.
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

      {/* SEO: Quick Links to Tool Pages */}
      <section className="max-w-6xl mx-auto px-4 py-12" aria-labelledby="tools-heading">
        <h2 id="tools-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">
          Popular Download Tools
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <a href="/instagram-downloader" className="glass rounded-xl p-4 hover:bg-white/10 transition-colors text-center">
            <h3 className="font-bold text-sm mb-1">Instagram Downloader</h3>
            <p className="text-xs text-muted-foreground">Reels, Photos & Carousels</p>
          </a>
          <a href="/tiktok-downloader" className="glass rounded-xl p-4 hover:bg-white/10 transition-colors text-center">
            <h3 className="font-bold text-sm mb-1">TikTok Downloader</h3>
            <p className="text-xs text-muted-foreground">No Watermark</p>
          </a>
          <a href="/twitter-video-downloader" className="glass rounded-xl p-4 hover:bg-white/10 transition-colors text-center">
            <h3 className="font-bold text-sm mb-1">Twitter/X Downloader</h3>
            <p className="text-xs text-muted-foreground">Videos & GIFs</p>
          </a>
          <a href="/facebook-video-downloader" className="glass rounded-xl p-4 hover:bg-white/10 transition-colors text-center">
            <h3 className="font-bold text-sm mb-1">Facebook Downloader</h3>
            <p className="text-xs text-muted-foreground">Videos & Reels</p>
          </a>
          <a href="/reddit-video-downloader" className="glass rounded-xl p-4 hover:bg-white/10 transition-colors text-center">
            <h3 className="font-bold text-sm mb-1">Reddit Downloader</h3>
            <p className="text-xs text-muted-foreground">Videos with Sound</p>
          </a>
          <a href="/pinterest-video-downloader" className="glass rounded-xl p-4 hover:bg-white/10 transition-colors text-center">
            <h3 className="font-bold text-sm mb-1">Pinterest Downloader</h3>
            <p className="text-xs text-muted-foreground">Images & Videos</p>
          </a>
          <a href="/tiktok-to-mp3" className="glass rounded-xl p-4 hover:bg-white/10 transition-colors text-center">
            <h3 className="font-bold text-sm mb-1">TikTok to MP3</h3>
            <p className="text-xs text-muted-foreground">Audio Converter</p>
          </a>
          <a href="/mp3-converter" className="glass rounded-xl p-4 hover:bg-white/10 transition-colors text-center">
            <h3 className="font-bold text-sm mb-1">MP3 Converter</h3>
            <p className="text-xs text-muted-foreground">Video to Audio</p>
          </a>
          <a href="/thumbnail-downloader" className="glass rounded-xl p-4 hover:bg-white/10 transition-colors text-center">
            <h3 className="font-bold text-sm mb-1">Thumbnail Downloader</h3>
            <p className="text-xs text-muted-foreground">TikTok, IG, YouTube Covers</p>
          </a>
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

      {/* AEO: Supported Platforms grid — semantic table that AI engines
         can quote row-by-row when answering "what does DropZap
         support?" style queries. Also doubles as an internal link hub. */}
      <SupportedPlatforms />

      {/* GRO: Citable facts — declarative, single-claim paragraphs that
         survive being lifted out of context by ChatGPT / Perplexity /
         Google AI Overviews. */}
      <CitableFacts />

      {/* SEO: Tool Comparison Table — compares DropZap with top competitors
         on key features. Helps users understand why DropZap is the best choice
         and provides valuable content for comparison queries. */}
      <section className="max-w-6xl mx-auto px-4 py-12" aria-labelledby="comparison-heading">
        <h2 id="comparison-heading" className="text-2xl sm:text-3xl font-bold text-center mb-2">
          DropZap vs Competitors
        </h2>
        <p className="text-center text-muted-foreground text-sm mb-8">
          See how DropZap compares to other popular downloaders.
        </p>
        <div className="overflow-x-auto glass rounded-xl p-4">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-2 font-semibold">Feature</th>
                <th className="text-center py-3 px-2 font-semibold bg-blue-600/10 text-blue-400 rounded">DropZap</th>
                <th className="text-center py-3 px-2 font-semibold">SnapTik</th>
                <th className="text-center py-3 px-2 font-semibold">ssstik</th>
                <th className="text-center py-3 px-2 font-semibold">SaveFrom</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/30">
                <td className="py-3 px-2 text-muted-foreground">Price</td>
                <td className="py-3 px-2 text-center font-semibold text-green-400">Free</td>
                <td className="py-3 px-2 text-center text-red-400">$4.99-$9.99/mo</td>
                <td className="py-3 px-2 text-center text-green-400">Free</td>
                <td className="py-3 px-2 text-center text-green-400">Free</td>
              </tr>
              <tr className="border-b border-border/30">
                <td className="py-3 px-2 text-muted-foreground">Daily Limit</td>
                <td className="py-3 px-2 text-center font-semibold text-green-400">None</td>
                <td className="py-3 px-2 text-center text-red-400">Yes</td>
                <td className="py-3 px-2 text-center text-red-400">Yes</td>
                <td className="py-3 px-2 text-center text-red-400">Yes</td>
              </tr>
              <tr className="border-b border-border/30">
                <td className="py-3 px-2 text-muted-foreground">Ads</td>
                <td className="py-3 px-2 text-center font-semibold text-green-400">Minimal</td>
                <td className="py-3 px-2 text-center text-yellow-400">Medium</td>
                <td className="py-3 px-2 text-center text-red-400">Heavy</td>
                <td className="py-3 px-2 text-center text-red-400">Heavy</td>
              </tr>
              <tr className="border-b border-border/30">
                <td className="py-3 px-2 text-muted-foreground">Platforms</td>
                <td className="py-3 px-2 text-center font-semibold text-green-400">7</td>
                <td className="py-3 px-2 text-center text-red-400">1 (TikTok)</td>
                <td className="py-3 px-2 text-center text-red-400">1 (TikTok)</td>
                <td className="py-3 px-2 text-center text-yellow-400">YouTube+</td>
              </tr>
              <tr className="border-b border-border/30">
                <td className="py-3 px-2 text-muted-foreground">Bulk Download</td>
                <td className="py-3 px-2 text-center font-semibold text-green-400">Yes</td>
                <td className="py-3 px-2 text-center text-red-400">No</td>
                <td className="py-3 px-2 text-center text-red-400">No</td>
                <td className="py-3 px-2 text-center text-red-400">No</td>
              </tr>
              <tr>
                <td className="py-3 px-2 text-muted-foreground">Watermark Removal</td>
                <td className="py-3 px-2 text-center font-semibold text-green-400">Yes</td>
                <td className="py-3 px-2 text-center text-yellow-400">Paid only</td>
                <td className="py-3 px-2 text-center text-green-400">Yes</td>
                <td className="py-3 px-2 text-center text-red-400">No</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-center mt-6 space-x-4">
          <a href="/compare" className="text-sm text-purple-400 hover:underline">
            View full comparison →
          </a>
          <span className="text-muted-foreground">|</span>
          <a href="/blog/getting-started-with-dropzap" className="text-sm text-purple-400 hover:underline">
            Getting started guide →
          </a>
        </div>
      </section>

      {/* SEO: FAQ — 10 visible Q&As, mirrors the FAQPage JSON-LD in
         layout.tsx. AI engines cross-check visible vs structured FAQs
         and demote pages where the two diverge, so both lists must
         stay in sync. */}
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
              a: "DropZap supports Instagram (Reels, photos, and carousels), TikTok, Twitter/X, Facebook, Reddit (with sound), Pinterest, and Threads. You can also convert videos to MP3, bulk-download multiple links, and grab YouTube thumbnails.",
            },
            {
              q: "Do I need to install anything?",
              a: "No. DropZap runs entirely in your browser — no apps, plugins, or extensions required.",
            },
            {
              q: "Is downloading videos with DropZap legal?",
              a: "DropZap is intended for personal use only. Always respect copyright and the original creators' rights.",
            },
            {
              q: "How do I download a TikTok video without watermark?",
              a: "Copy the TikTok video link from the app by tapping Share then Copy Link. Paste it into DropZap's TikTok section and click Download. The video saves without any TikTok watermark or logo.",
            },
            {
              q: "Can I download Instagram photos and carousel posts?",
              a: "Yes. DropZap downloads Instagram single photos as JPG files and multi-slide carousels as a ZIP archive containing all images at original quality.",
            },
            {
              q: "Can I download Reddit videos with sound?",
              a: "Yes. Reddit stores video and audio as separate streams. DropZap automatically merges them into a single MP4 file with full audio included.",
            },
            {
              q: "Does DropZap work on iPhone and Android?",
              a: "Yes. DropZap works in Safari on iPhone and Chrome on Android. No app installation required. Files save to your Files app on iPhone and Downloads folder on Android.",
            },
            {
              q: "Can I convert a video to MP3 using DropZap?",
              a: "Yes. DropZap has a built-in MP3 converter and a dedicated TikTok to MP3 tool. Upload any video file, or paste a TikTok link, and convert it to MP3 audio instantly.",
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

      {/* SEO: Latest Guides — static internal-link section. This is the
         primary PageRank pipeline from the homepage (highest DA page on
         the domain) to the new blog posts that currently have zero
         referring pages per Google Search Console. Each card is an
         anchor tag so crawlers follow the links. Grouped by intent:
         competitor keywords first (highest-value), then how-to, then
         platform guides. */}
      <section className="max-w-6xl mx-auto px-4 py-12" aria-labelledby="guides-heading">
        <h2 id="guides-heading" className="text-2xl sm:text-3xl font-bold text-center mb-2">
          Latest Guides &amp; Comparisons
        </h2>
        <p className="text-center text-muted-foreground text-sm mb-8">
          In-depth tutorials and tool comparisons from the DropZap team.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: "/blog/dropzap-vs-ssstik", label: "DropZap vs ssstik", desc: "Which TikTok downloader is better? Full 2026 comparison.", tag: "Comparison" },
            { href: "/blog/dropzap-vs-savefrom", label: "DropZap vs SaveFrom", desc: "Video downloader comparison — which tool to use?", tag: "Comparison" },
            { href: "/blog/top-10-tiktok-downloaders-2026", label: "Top 10 TikTok Downloaders 2026", desc: "Best TikTok downloaders ranked. DropZap #1 for free.", tag: "Comparison" },
            { href: "/blog/best-instagram-reels-downloader-2026", label: "Best Instagram Reels Downloaders", desc: "Top Instagram downloaders compared. DropZap wins.", tag: "Comparison" },
            { href: "/blog/instagram-reel-not-downloading-fix", label: "Instagram Reel Not Downloading", desc: "10 fixes for Instagram Reel download errors.", tag: "Troubleshooting" },
            { href: "/blog/tiktok-watermark-still-there-fix", label: "TikTok Watermark Still There", desc: "Why watermarks persist and how to fix it.", tag: "Troubleshooting" },
            { href: "/blog/reddit-video-no-sound-fix", label: "Reddit Video No Sound", desc: "Fix silent Reddit videos with automatic audio merge.", tag: "Troubleshooting" },
            { href: "/free-tiktok-downloader", label: "Free TikTok Downloader", desc: "100% free TikTok downloader — no watermark, no signup, no limit.", tag: "Tool" },
            { href: "/tiktok-watermark-remover", label: "TikTok Watermark Remover", desc: "Remove TikTok logo from videos for free. No app, no software.", tag: "Tool" },
            { href: "/tiktok-sound-downloader", label: "TikTok Sound Downloader", desc: "Extract audio from TikTok videos as MP3. No watermark, no limit.", tag: "Tool" },
            { href: "/instagram-reels-downloader", label: "Instagram Reels Downloader", desc: "Download Instagram Reels as MP4 — no login, no watermark.", tag: "Tool" },
            { href: "/instagram-photo-downloader", label: "Instagram Photo Downloader", desc: "Download Instagram photos as JPG — full resolution, no login.", tag: "Tool" },
            { href: "/facebook-reel-downloader", label: "Facebook Reels Downloader", desc: "Download Facebook Reels as MP4 — no login, no watermark.", tag: "Tool" },
            { href: "/pinterest-video-downloader", label: "Pinterest Video Downloader", desc: "Download Pinterest videos as MP4 — no login, no watermark.", tag: "Tool" },
            { href: "/snaptik-alternative", label: "SnapTik Alternative", desc: "SnapTik now charges $4.99–$9.99/mo. Best free alternatives in 2026.", tag: "Comparison" },
            { href: "/compare", label: "Downloader Comparison", desc: "DropZap vs 8 competitors — full feature comparison table.", tag: "Comparison" },
            { href: "/tools", label: "All Tools Index", desc: "Complete list of 16 free download tools organized by platform.", tag: "Hub" },
            { href: "/blog/snaptik-now-paid-free-alternative", label: "SnapTik Now Paid — What Changed", desc: "Full breakdown of SnapTik's subscription model and which free tools still work.", tag: "News" },
            { href: "/blog/musicallydown-alternative-no-limit", label: "MusicallyDown Alternative", desc: "MusicallyDown hitting its daily limit? DropZap has no cap and no popunder ads.", tag: "Comparison" },
            { href: "/blog/best-instagram-downloader-2026-free", label: "Best Instagram Downloader 2026", desc: "We tested 6 Instagram downloaders — here are the best free picks for Reels, photos, and carousels.", tag: "Comparison" },
            { href: "/blog/threads-video-downloader", label: "Threads Video Downloader", desc: "Download any public Threads video or photo for free in under 10 seconds.", tag: "Tutorial" },
            { href: "/blog/tiktok-downloader-pc-laptop", label: "TikTok Downloader for PC", desc: "Save TikTok videos on Windows or Mac — no software, no extension, works in any browser.", tag: "Tutorial" },
            { href: "/blog/how-to-save-tiktok-to-camera-roll", label: "Save TikTok to Camera Roll", desc: "No watermark. Step-by-step for iPhone and Android with screenshots.", tag: "Tutorial" },
            { href: "/blog/best-tiktok-downloader-2026", label: "Best TikTok Downloader 2026", desc: "We tested 10 TikTok downloaders — here's the best free option.", tag: "Comparison" },
            { href: "/blog/how-to-download-youtube-thumbnail", label: "YouTube Thumbnail Guide", desc: "Download YouTube thumbnails in HD (maxresdefault). Free, no login.", tag: "Tutorial" },
            { href: "/blog/how-to-download-twitter-gifs", label: "Twitter GIF Downloader", desc: "Download Twitter/X GIFs as MP4. Step-by-step guide.", tag: "Tutorial" },
          ].map((g) => (
            <a
              key={g.href}
              href={g.href}
              className="glass rounded-xl p-5 hover:-translate-y-0.5 hover:bg-white/10 transition-all block"
            >
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-400">
                {g.tag}
              </span>
              <h3 className="font-bold mt-2 mb-1 text-foreground">{g.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{g.desc}</p>
            </a>
          ))}
        </div>
        <div className="text-center mt-6">
          <a href="/blog" className="text-sm text-purple-400 hover:underline">
            View all guides →
          </a>
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
              <a href="/" className="hover:text-foreground transition-colors font-semibold">DropZap Home</a>
              <a href="/tiktok-downloader" className="hover:text-foreground transition-colors">TikTok Downloader</a>
              <a href="/tiktok-to-mp3" className="hover:text-foreground transition-colors">TikTok to MP3</a>
              <a href="/instagram-downloader" className="hover:text-foreground transition-colors">Instagram Downloader</a>
              <a href="/twitter-video-downloader" className="hover:text-foreground transition-colors">Twitter Downloader</a>
              <a href="/facebook-video-downloader" className="hover:text-foreground transition-colors">Facebook Downloader</a>
              <a href="/reddit-video-downloader" className="hover:text-foreground transition-colors">Reddit Downloader</a>
              <a href="/threads-downloader" className="hover:text-foreground transition-colors">Threads Downloader</a>
              <a href="/snaptik-alternative" className="hover:text-foreground transition-colors">SnapTik Alternative</a>
              <a href="/free-tiktok-downloader" className="hover:text-foreground transition-colors">Free TikTok Downloader</a>
              <a href="/tiktok-watermark-remover" className="hover:text-foreground transition-colors">TikTok Watermark Remover</a>
              <a href="/instagram-reels-downloader" className="hover:text-foreground transition-colors">Instagram Reels Downloader</a>
              <a href="/instagram-photo-downloader" className="hover:text-foreground transition-colors">Instagram Photo Downloader</a>
              <a href="/pinterest-video-downloader" className="hover:text-foreground transition-colors">Pinterest Video Downloader</a>
              <a href="/tiktok-sound-downloader" className="hover:text-foreground transition-colors">TikTok Sound Downloader</a>
              <a href="/facebook-reel-downloader" className="hover:text-foreground transition-colors">Facebook Reels Downloader</a>
              <a href="/mp3-converter" className="hover:text-foreground transition-colors">MP3 Converter</a>
              <a href="/tools" className="hover:text-foreground transition-colors">All Tools</a>
              <a href="/compare" className="hover:text-foreground transition-colors">Compare</a>
              <a href="/how-to" className="hover:text-foreground transition-colors">How-To</a>
              <a href="/glossary" className="hover:text-foreground transition-colors">Glossary</a>
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
