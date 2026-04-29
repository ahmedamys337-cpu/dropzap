// Programmatic SEO: auto-generated pages targeting long-tail keyword combinations
// These generate at build time via generateStaticParams

export interface ProgrammaticPage {
  slug: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  platform: string;
  platformSlug: string;
  body: string;
}

const templates: {
  pattern: string;
  platform: string;
  platformSlug: string;
  variants: { slug: string; keyword: string; quality?: string; device?: string; extra?: string }[];
}[] = [
  {
    pattern: "youtube",
    platform: "YouTube",
    platformSlug: "/youtube-downloader",
    variants: [
      { slug: "youtube-to-mp4", keyword: "YouTube to MP4" },
      { slug: "youtube-to-mp3", keyword: "YouTube to MP3" },
      { slug: "youtube-to-mp4-hd", keyword: "YouTube to MP4 HD", quality: "HD" },
      { slug: "youtube-to-mp4-4k", keyword: "YouTube to MP4 4K", quality: "4K" },
      { slug: "youtube-to-mp4-1080p", keyword: "YouTube to MP4 1080p", quality: "1080p" },
      { slug: "youtube-to-mp3-320kbps", keyword: "YouTube to MP3 320kbps", quality: "320kbps" },
      { slug: "youtube-shorts-downloader", keyword: "YouTube Shorts downloader" },
      { slug: "youtube-video-downloader-free", keyword: "YouTube video downloader free" },
      { slug: "youtube-downloader-online", keyword: "YouTube downloader online" },
      { slug: "youtube-downloader-no-app", keyword: "YouTube downloader no app" },
      { slug: "download-youtube-video-iphone", keyword: "download YouTube video iPhone", device: "iPhone" },
      { slug: "download-youtube-video-android", keyword: "download YouTube video Android", device: "Android" },
      { slug: "download-youtube-video-pc", keyword: "download YouTube video PC", device: "PC" },
      { slug: "download-youtube-video-mac", keyword: "download YouTube video Mac", device: "Mac" },
      { slug: "youtube-playlist-downloader", keyword: "YouTube playlist downloader" },
      { slug: "youtube-music-downloader", keyword: "YouTube music downloader" },
      { slug: "youtube-audio-downloader", keyword: "YouTube audio downloader" },
      { slug: "youtube-thumbnail-grabber", keyword: "YouTube thumbnail grabber" },
    ],
  },
  {
    pattern: "tiktok",
    platform: "TikTok",
    platformSlug: "/tiktok-downloader",
    variants: [
      { slug: "tiktok-downloader-no-watermark", keyword: "TikTok downloader no watermark" },
      { slug: "tiktok-to-mp4", keyword: "TikTok to MP4" },
      { slug: "tiktok-to-mp3", keyword: "TikTok to MP3" },
      { slug: "tiktok-video-saver", keyword: "TikTok video saver" },
      { slug: "tiktok-downloader-hd", keyword: "TikTok downloader HD", quality: "HD" },
      { slug: "tiktok-downloader-iphone", keyword: "TikTok downloader iPhone", device: "iPhone" },
      { slug: "tiktok-downloader-android", keyword: "TikTok downloader Android", device: "Android" },
      { slug: "tiktok-slideshow-downloader", keyword: "TikTok slideshow downloader" },
      { slug: "tiktok-sound-downloader", keyword: "TikTok sound downloader" },
      { slug: "snaptik-alternative", keyword: "SnapTik alternative", extra: "DropZap is the best SnapTik alternative with a cleaner, ad-free experience." },
      { slug: "ssstik-alternative", keyword: "ssstik alternative", extra: "DropZap is a safer ssstik alternative — no pop-ups, no fake buttons." },
    ],
  },
  {
    pattern: "instagram",
    platform: "Instagram",
    platformSlug: "/instagram-downloader",
    variants: [
      { slug: "instagram-reels-downloader", keyword: "Instagram Reels downloader" },
      { slug: "instagram-video-downloader", keyword: "Instagram video downloader" },
      { slug: "instagram-to-mp4", keyword: "Instagram to MP4" },
      { slug: "instagram-reels-saver", keyword: "Instagram Reels saver" },
      { slug: "download-ig-reels", keyword: "download IG Reels" },
      { slug: "instagram-downloader-iphone", keyword: "Instagram downloader iPhone", device: "iPhone" },
      { slug: "instagram-downloader-online", keyword: "Instagram downloader online" },
      { slug: "snapinsta-alternative", keyword: "SnapInsta alternative", extra: "DropZap is a cleaner SnapInsta alternative with no aggressive ads." },
    ],
  },
  {
    pattern: "twitter",
    platform: "Twitter/X",
    platformSlug: "/twitter-video-downloader",
    variants: [
      { slug: "twitter-video-downloader-online", keyword: "Twitter video downloader online" },
      { slug: "x-video-downloader", keyword: "X video downloader" },
      { slug: "twitter-to-mp4", keyword: "Twitter to MP4" },
      { slug: "twitter-gif-downloader", keyword: "Twitter GIF downloader" },
      { slug: "download-x-video", keyword: "download X video" },
      { slug: "ssstwitter-alternative", keyword: "ssstwitter alternative", extra: "DropZap is a safer ssstwitter alternative — no redirects, no spam." },
      { slug: "twitter-video-saver", keyword: "Twitter video saver" },
    ],
  },
  {
    pattern: "facebook",
    platform: "Facebook",
    platformSlug: "/facebook-video-downloader",
    variants: [
      { slug: "facebook-video-downloader-hd", keyword: "Facebook video downloader HD", quality: "HD" },
      { slug: "facebook-to-mp4", keyword: "Facebook to MP4" },
      { slug: "facebook-reels-downloader", keyword: "Facebook Reels downloader" },
      { slug: "fb-video-downloader", keyword: "FB video downloader" },
      { slug: "download-facebook-video-online", keyword: "download Facebook video online" },
    ],
  },
  {
    pattern: "reddit",
    platform: "Reddit",
    platformSlug: "/reddit-video-downloader",
    variants: [
      { slug: "reddit-video-downloader-with-sound", keyword: "Reddit video downloader with sound" },
      { slug: "reddit-to-mp4", keyword: "Reddit to MP4" },
      { slug: "download-reddit-video-audio", keyword: "download Reddit video audio" },
      { slug: "redditsave-alternative", keyword: "RedditSave alternative", extra: "DropZap is a better RedditSave alternative — always includes audio." },
      { slug: "reddit-gif-downloader", keyword: "Reddit GIF downloader" },
    ],
  },
];

function generateBody(v: { slug: string; keyword: string; quality?: string; device?: string; extra?: string }, platform: string, platformSlug: string): string {
  const deviceLine = v.device
    ? `<p>This tool works perfectly on <strong>${v.device}</strong>. Open DropZap in your browser, paste the ${platform} link, and download. No app installation required.</p>`
    : `<p>This tool works on all devices — iPhone, Android, PC, Mac, and tablets. Open DropZap in any browser and start downloading instantly.</p>`;

  const qualityLine = v.quality
    ? `<p>Download in <strong>${v.quality}</strong> quality. DropZap fetches the highest quality version available from ${platform} and delivers it in your preferred format.</p>`
    : `<p>DropZap downloads ${platform} videos at the highest available quality with no compression or quality loss.</p>`;

  const extraLine = v.extra ? `<p>${v.extra}</p>` : "";

  return `<p>Looking for a free <strong>${v.keyword}</strong> tool? DropZap is the fastest and safest option available. No signup, no watermark, no pop-up ads — just paste the URL and download.</p>

${qualityLine}

<h2>How to Use the ${v.keyword} Tool</h2>
<ol>
<li>Copy the ${platform} video URL from your browser or the app's share button</li>
<li>Paste it into the <a href="${platformSlug}">DropZap ${platform} Downloader</a> above</li>
<li>Click Download and save the file to your device</li>
</ol>

${deviceLine}

<h2>Why Choose DropZap for ${v.keyword}?</h2>
<ul>
<li><strong>100% Free</strong> — No subscriptions, no hidden fees, no limits</li>
<li><strong>No Watermark</strong> — Downloaded files are clean with no branding</li>
<li><strong>No Signup</strong> — Start downloading immediately, no account needed</li>
<li><strong>Fast Processing</strong> — Most downloads complete in under 10 seconds</li>
<li><strong>Safe & Private</strong> — No malware, no data collection, encrypted connections</li>
</ul>

${extraLine}

<h2>Frequently Asked Questions</h2>
<h3>Is the ${v.keyword} tool free?</h3>
<p>Yes. DropZap is completely free to use. There are no premium tiers required for basic downloading.</p>

<h3>Do I need to install any software?</h3>
<p>No. DropZap runs entirely in your web browser. It works on Chrome, Safari, Firefox, Edge, and any modern browser.</p>

<h3>Is it safe to use?</h3>
<p>Absolutely. DropZap does not contain malware, does not require login credentials for any platform, and processes all downloads on secure servers.</p>`;
}

export const programmaticPages: ProgrammaticPage[] = templates.flatMap((t) =>
  t.variants.map((v) => ({
    slug: v.slug,
    title: `${v.keyword} — Free Online ${t.platform} Downloader | DropZap`,
    h1: `${v.keyword} — Free & Fast`,
    description: `${v.keyword} online for free. Download ${t.platform} videos in HD quality. No watermark, no signup. Works on all devices.`,
    keywords: [v.keyword, `${v.keyword} free`, `${v.keyword} online`, `${t.platform.toLowerCase()} downloader`],
    platform: t.platform,
    platformSlug: t.platformSlug,
    body: generateBody(v, t.platform, t.platformSlug),
  }))
);
