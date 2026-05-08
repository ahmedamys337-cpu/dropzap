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
  // YouTube programmatic SEO is intentionally disabled while
  // /youtube-downloader is 308-redirected to /. Their primary CTA links
  // to that redirect, which Google reads as a dead-end and tanks the
  // quality score of every generated YT page (44 pages). Re-enable this
  // block when YouTube downloads are working again.
  /*
  {
    pattern: "youtube",
    platform: "YouTube",
    platformSlug: "/youtube-downloader",
    variants: [],
  },
  */
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
      { slug: "tiktok-no-watermark-2026", keyword: "TikTok no watermark 2026" },
      { slug: "tiktok-downloader-2026", keyword: "TikTok downloader 2026" },
      { slug: "tiktok-mp4-no-watermark", keyword: "TikTok MP4 no watermark" },
      { slug: "tiktok-1080p-downloader", keyword: "TikTok 1080p downloader", quality: "1080p" },
      { slug: "tiktok-downloader-pc", keyword: "TikTok downloader PC", device: "PC" },
      { slug: "tiktok-downloader-mac", keyword: "TikTok downloader Mac", device: "Mac" },
      { slug: "tiktok-downloader-ipad", keyword: "TikTok downloader iPad", device: "iPad" },
      { slug: "tiktok-music-downloader", keyword: "TikTok music downloader" },
      { slug: "tiktok-audio-extractor", keyword: "TikTok audio extractor" },
      { slug: "tiktok-live-recorder", keyword: "TikTok live recorder" },
      { slug: "tiktok-photo-carousel-downloader", keyword: "TikTok photo carousel downloader" },
      { slug: "save-tiktok-without-app", keyword: "save TikTok without app" },
      { slug: "musicallydown-alternative", keyword: "MusicallyDown alternative", extra: "DropZap is a faster MusicallyDown alternative with original quality preserved." },
      { slug: "tikmate-alternative", keyword: "TikMate alternative", extra: "DropZap is a web-based TikMate alternative — no Android app needed." },
      { slug: "tiktok-downloader-no-app", keyword: "TikTok downloader no app" },
      { slug: "tiktok-video-saver-online", keyword: "TikTok video saver online" },
      { slug: "best-tiktok-downloader-2026", keyword: "best TikTok downloader 2026" },
      { slug: "free-tiktok-downloader", keyword: "free TikTok downloader" },
      { slug: "tiktok-downloader-without-logo", keyword: "TikTok downloader without logo" },
      { slug: "tiktok-hd-no-watermark", keyword: "TikTok HD no watermark", quality: "HD" },
      { slug: "tiktok-downloader-fast", keyword: "TikTok downloader fast" },
      { slug: "tiktok-bulk-downloader", keyword: "TikTok bulk downloader" },
      { slug: "save-tiktok-camera-roll", keyword: "save TikTok to camera roll", device: "iPhone" },
      { slug: "tiktok-to-gallery", keyword: "TikTok to gallery", device: "Android" },
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
      { slug: "instagram-downloader-2026", keyword: "Instagram downloader 2026" },
      { slug: "instagram-reels-2026", keyword: "Instagram Reels downloader 2026" },
      { slug: "instagram-photo-downloader", keyword: "Instagram photo downloader" },
      { slug: "instagram-carousel-downloader", keyword: "Instagram carousel downloader" },
      { slug: "instagram-story-downloader", keyword: "Instagram Story downloader" },
      { slug: "instagram-igtv-downloader", keyword: "Instagram IGTV downloader" },
      { slug: "instagram-highlight-downloader", keyword: "Instagram highlight downloader" },
      { slug: "instagram-downloader-android", keyword: "Instagram downloader Android", device: "Android" },
      { slug: "instagram-downloader-pc", keyword: "Instagram downloader PC", device: "PC" },
      { slug: "instagram-downloader-mac", keyword: "Instagram downloader Mac", device: "Mac" },
      { slug: "instagram-downloader-ipad", keyword: "Instagram downloader iPad", device: "iPad" },
      { slug: "save-instagram-reels-camera-roll", keyword: "save Instagram Reels to camera roll", device: "iPhone" },
      { slug: "instagram-mp4-downloader", keyword: "Instagram MP4 downloader" },
      { slug: "ig-video-saver", keyword: "IG video saver" },
      { slug: "igram-alternative", keyword: "IGram alternative", extra: "DropZap is a faster IGram alternative without API errors." },
      { slug: "fastdl-alternative", keyword: "FastDl alternative", extra: "DropZap is a more reliable FastDl alternative — works even when Instagram changes APIs." },
      { slug: "instasave-alternative", keyword: "InstaSave alternative", extra: "DropZap is a safer InstaSave alternative — no malware risk." },
      { slug: "best-instagram-downloader-2026", keyword: "best Instagram downloader 2026" },
      { slug: "free-instagram-reels-downloader", keyword: "free Instagram Reels downloader" },
      { slug: "instagram-hd-downloader", keyword: "Instagram HD downloader", quality: "HD" },
      { slug: "instagram-1080p-downloader", keyword: "Instagram 1080p downloader", quality: "1080p" },
      { slug: "download-ig-without-app", keyword: "download IG without app" },
      { slug: "instagram-downloader-private-account", keyword: "Instagram downloader for public accounts" },
      { slug: "instagram-reels-to-mp3", keyword: "Instagram Reels to MP3" },
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
      { slug: "twitter-video-downloader-2026", keyword: "Twitter video downloader 2026" },
      { slug: "x-video-downloader-2026", keyword: "X video downloader 2026" },
      { slug: "twitter-mp4-downloader", keyword: "Twitter MP4 downloader" },
      { slug: "twitter-mp3-downloader", keyword: "Twitter MP3 downloader" },
      { slug: "twitter-720p-downloader", keyword: "Twitter 720p downloader", quality: "720p" },
      { slug: "twitter-1080p-downloader", keyword: "Twitter 1080p downloader", quality: "1080p" },
      { slug: "twitter-downloader-iphone", keyword: "Twitter downloader iPhone", device: "iPhone" },
      { slug: "twitter-downloader-android", keyword: "Twitter downloader Android", device: "Android" },
      { slug: "twitter-downloader-pc", keyword: "Twitter downloader PC", device: "PC" },
      { slug: "twitter-downloader-mac", keyword: "Twitter downloader Mac", device: "Mac" },
      { slug: "x-com-video-downloader", keyword: "X.com video downloader" },
      { slug: "twitter-spaces-downloader", keyword: "Twitter Spaces downloader" },
      { slug: "twitsave-alternative", keyword: "Twitsave alternative", extra: "DropZap is a faster Twitsave alternative without ad-laden pages." },
      { slug: "savetwitter-alternative", keyword: "SaveTwitter alternative", extra: "DropZap is a higher-quality SaveTwitter alternative." },
      { slug: "best-twitter-downloader-2026", keyword: "best Twitter downloader 2026" },
      { slug: "free-twitter-video-downloader", keyword: "free Twitter video downloader" },
      { slug: "twitter-gif-to-mp4", keyword: "Twitter GIF to MP4" },
      { slug: "twitter-video-to-mp4", keyword: "Twitter video to MP4" },
      { slug: "save-x-video", keyword: "save X video" },
      { slug: "save-twitter-gif", keyword: "save Twitter GIF" },
      { slug: "twitter-downloader-no-watermark", keyword: "Twitter downloader no watermark" },
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
      { slug: "facebook-downloader-2026", keyword: "Facebook downloader 2026" },
      { slug: "facebook-video-2026", keyword: "Facebook video downloader 2026" },
      { slug: "facebook-1080p-downloader", keyword: "Facebook 1080p downloader", quality: "1080p" },
      { slug: "facebook-watch-downloader", keyword: "Facebook Watch downloader" },
      { slug: "facebook-live-downloader", keyword: "Facebook Live recording downloader" },
      { slug: "facebook-private-video-downloader", keyword: "Facebook public video downloader" },
      { slug: "facebook-downloader-iphone", keyword: "Facebook downloader iPhone", device: "iPhone" },
      { slug: "facebook-downloader-android", keyword: "Facebook downloader Android", device: "Android" },
      { slug: "facebook-downloader-pc", keyword: "Facebook downloader PC", device: "PC" },
      { slug: "facebook-downloader-mac", keyword: "Facebook downloader Mac", device: "Mac" },
      { slug: "fb-watch-downloader", keyword: "fb.watch downloader" },
      { slug: "fb-reels-downloader", keyword: "FB Reels downloader" },
      { slug: "fbdown-alternative", keyword: "FBDown alternative", extra: "DropZap is a cleaner FBDown alternative without aggressive ads." },
      { slug: "getfvid-alternative", keyword: "GetfvId alternative", extra: "DropZap is a faster GetfvId alternative — no multi-page navigation." },
      { slug: "savefrom-facebook-alternative", keyword: "SaveFrom Facebook alternative", extra: "DropZap is a Chrome-extension-free SaveFrom alternative for Facebook." },
      { slug: "best-facebook-downloader-2026", keyword: "best Facebook downloader 2026" },
      { slug: "free-facebook-video-downloader", keyword: "free Facebook video downloader" },
      { slug: "facebook-mp4-downloader", keyword: "Facebook MP4 downloader" },
      { slug: "facebook-mp3-downloader", keyword: "Facebook MP3 downloader" },
      { slug: "save-facebook-video-camera-roll", keyword: "save Facebook video to camera roll", device: "iPhone" },
      { slug: "facebook-downloader-no-app", keyword: "Facebook downloader no app" },
      { slug: "facebook-page-video-downloader", keyword: "Facebook page video downloader" },
      { slug: "facebook-group-video-downloader", keyword: "Facebook group video downloader" },
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
      { slug: "reddit-downloader-2026", keyword: "Reddit downloader 2026" },
      { slug: "reddit-video-with-sound-2026", keyword: "Reddit video with sound 2026" },
      { slug: "reddit-1080p-downloader", keyword: "Reddit 1080p downloader", quality: "1080p" },
      { slug: "reddit-720p-downloader", keyword: "Reddit 720p downloader", quality: "720p" },
      { slug: "reddit-downloader-iphone", keyword: "Reddit downloader iPhone", device: "iPhone" },
      { slug: "reddit-downloader-android", keyword: "Reddit downloader Android", device: "Android" },
      { slug: "reddit-downloader-pc", keyword: "Reddit downloader PC", device: "PC" },
      { slug: "reddit-downloader-mac", keyword: "Reddit downloader Mac", device: "Mac" },
      { slug: "v-redd-it-downloader", keyword: "v.redd.it downloader" },
      { slug: "reddit-mp4-downloader", keyword: "Reddit MP4 downloader" },
      { slug: "reddit-audio-extractor", keyword: "Reddit audio extractor" },
      { slug: "rapidsave-alternative", keyword: "RapidSave alternative", extra: "DropZap is a faster RapidSave alternative — always merges audio properly." },
      { slug: "viewvideo-alternative", keyword: "ViewVideo alternative", extra: "DropZap is a cleaner ViewVideo alternative without ad-laden pages." },
      { slug: "best-reddit-downloader-2026", keyword: "best Reddit downloader 2026" },
      { slug: "free-reddit-video-downloader", keyword: "free Reddit video downloader" },
      { slug: "reddit-video-saver", keyword: "Reddit video saver" },
      { slug: "save-reddit-video-camera-roll", keyword: "save Reddit video to camera roll", device: "iPhone" },
      { slug: "reddit-downloader-no-app", keyword: "Reddit downloader no app" },
      { slug: "reddit-cross-post-downloader", keyword: "Reddit cross-post downloader" },
      { slug: "old-reddit-video-downloader", keyword: "old Reddit video downloader" },
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
