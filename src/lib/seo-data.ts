// SEO data for per-platform landing pages
// Each platform has its own metadata, keywords, FAQ, and long-form content

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dropzap.app";
export const SITE_NAME = "DropZap";

export interface PlatformSEO {
  slug: string;
  name: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  color: string;
  gradient: string;
  iconBg: string;
  faq: { q: string; a: string }[];
  features: { title: string; desc: string }[];
  howTo: { step: string; desc: string }[];
  content: {
    intro: string;
    whyUs: string;
    formats: string;
    devices: string;
    safety: string;
    tips: string;
  };
}

export const platforms: Record<string, PlatformSEO> = {
  youtube: {
    slug: "youtube-downloader",
    name: "YouTube",
    title: "YouTube Video Downloader - Download YouTube Videos HD/4K Free",
    h1: "YouTube Video Downloader - Save Videos in HD & 4K",
    description: "Download YouTube videos in HD, 4K, 1080p, 720p or convert to MP3. Free online YouTube downloader with no watermark, no signup. Works on all devices.",
    keywords: [
      "youtube downloader", "youtube video downloader", "download youtube videos",
      "youtube to mp4", "youtube to mp3", "youtube downloader online",
      "save youtube video", "youtube hd downloader", "youtube 4k downloader",
      "free youtube downloader", "youtube video saver", "youtube downloader no watermark",
      "youtube shorts downloader", "download youtube shorts", "youtube mp3 converter",
    ],
    color: "red-600",
    gradient: "from-red-600 to-red-700",
    iconBg: "bg-red-600",
    faq: [
      { q: "How do I download a YouTube video?", a: "Simply copy the YouTube video URL from your browser or the YouTube app, paste it into the DropZap YouTube downloader above, select your preferred quality (360p, 720p, 1080p, or 4K), and click Download. Your video will be saved to your device in seconds." },
      { q: "Can I download YouTube videos in 4K?", a: "Yes! DropZap supports downloading YouTube videos in all available qualities including 4K (2160p), 1080p Full HD, 720p HD, 480p, and 360p. Select the quality you need from the format options after pasting the URL." },
      { q: "Is it free to download YouTube videos with DropZap?", a: "Absolutely. DropZap is 100% free to use with no hidden fees, no subscription required, and no signup needed. You can download unlimited YouTube videos at no cost." },
      { q: "Can I convert YouTube videos to MP3?", a: "Yes. DropZap lets you extract the audio from any YouTube video and save it as a high-quality MP3 file. This is perfect for saving music, podcasts, lectures, and audiobooks." },
      { q: "Does DropZap work on iPhone and Android?", a: "Yes. DropZap is a web-based tool that works on any device with a browser — iPhone, Android, iPad, Mac, Windows, and Linux. No app installation required." },
      { q: "Can I download YouTube Shorts?", a: "Yes! DropZap fully supports YouTube Shorts. Just paste the Shorts URL and download it like any other video." },
      { q: "Is downloading YouTube videos legal?", a: "DropZap is intended for downloading videos for personal, offline viewing. Always respect copyright and the original creator's rights. Do not redistribute downloaded content without permission." },
      { q: "Why is my YouTube download slow?", a: "Download speed depends on your internet connection and the video file size. 4K videos are larger files and take longer. Try selecting a lower quality if speed is a priority." },
    ],
    features: [
      { title: "All Quality Options", desc: "Download in 4K, 1080p, 720p, 480p, or 360p. Choose the perfect balance between quality and file size." },
      { title: "YouTube to MP3", desc: "Extract audio from any YouTube video and save as high-quality MP3. Perfect for music and podcasts." },
      { title: "YouTube Shorts Support", desc: "Download YouTube Shorts videos just like regular videos. Full quality, no watermark." },
      { title: "No Signup Required", desc: "Start downloading immediately. No account creation, no email verification, no personal data collected." },
      { title: "Lightning Fast", desc: "Our servers process your request in seconds. Most downloads start within 3-5 seconds of pasting the URL." },
      { title: "Batch Download", desc: "Download multiple YouTube videos at once with our bulk download feature. Paste multiple URLs and let DropZap handle the rest." },
    ],
    howTo: [
      { step: "Copy the YouTube URL", desc: "Open YouTube in your browser or app, find the video you want to download, and copy the URL from the address bar or share button." },
      { step: "Paste into DropZap", desc: "Come back to DropZap and paste the URL into the input field above. Our system will automatically detect the video and fetch all available formats." },
      { step: "Choose quality and download", desc: "Select your preferred video quality or choose MP3 for audio-only. Click Download and the file will be saved to your device." },
    ],
    content: {
      intro: "DropZap YouTube Video Downloader is the fastest and easiest way to save YouTube videos to your device. Whether you need a lecture for offline study, want to save a music video, or keep a tutorial for reference, DropZap handles it all. Our tool supports every YouTube video format including regular videos, YouTube Shorts, playlists, and live streams. Simply paste the URL and download in the quality you need — from 360p for saving data to 4K for the best viewing experience.",
      whyUs: "Unlike other YouTube downloaders that are riddled with pop-up ads, fake download buttons, and malware, DropZap provides a clean, safe, and reliable experience. We don't require any account creation, we don't collect personal data, and we never inject watermarks into your downloads. Our servers are optimized for speed, delivering your downloads in seconds rather than minutes. DropZap works on every device and every browser — no software installation needed.",
      formats: "DropZap supports downloading YouTube videos in multiple formats and qualities. For video downloads, we offer MP4 format in 4K (2160p), Full HD (1080p), HD (720p), SD (480p), and Low (360p). For audio extraction, we support MP3 format at high bitrate (320kbps). You can also download YouTube Shorts in their original vertical format. Our system automatically detects the best available quality for each video and presents you with all available options.",
      devices: "DropZap is a web-based YouTube downloader that works on every device. Whether you are using an iPhone, iPad, Android phone, Android tablet, Windows PC, Mac, or Linux computer, DropZap works seamlessly in your browser. There is no app to download, no extension to install, and no software to configure. Simply open DropZap in Safari, Chrome, Firefox, Edge, or any modern browser and start downloading YouTube videos instantly.",
      safety: "Your safety is our priority. DropZap does not contain any malware, spyware, or adware. We do not require access to your YouTube account, and we never ask for personal information. All downloads are processed through our secure servers with encrypted connections. Unlike desktop YouTube downloaders that require installation and may contain bundled software, DropZap runs entirely in your browser with zero risk to your device.",
      tips: "For the best experience, make sure you are copying the full YouTube URL including the video ID. URLs from the YouTube app share button work perfectly. If a video has multiple formats available, we recommend 1080p for the best balance of quality and file size. For music, use our MP3 extraction feature to save just the audio without the video, which creates much smaller files. You can also use our Bulk Download feature to download multiple videos at once — just paste all URLs separated by new lines.",
    },
  },
  tiktok: {
    slug: "tiktok-downloader",
    name: "TikTok",
    title: "TikTok Video Downloader Without Watermark - HD No Logo Free",
    h1: "TikTok Video Downloader Without Watermark",
    description: "Download TikTok videos without watermark in HD quality. Free online TikTok saver — no logo, no signup. Save TikTok to MP4 on iPhone, Android & PC.",
    keywords: [
      "tiktok downloader", "tiktok video downloader", "tiktok no watermark",
      "download tiktok video", "tiktok downloader without watermark",
      "save tiktok video", "tiktok saver", "tiktok to mp4",
      "tiktok hd downloader", "tiktok download without logo",
      "tiktok video saver", "snaptik alternative", "ssstik alternative",
    ],
    color: "pink-500",
    gradient: "from-cyan-500 to-pink-500",
    iconBg: "bg-gradient-to-br from-cyan-500 to-pink-500",
    faq: [
      { q: "How do I download TikTok videos without watermark?", a: "Copy the TikTok video link from the app (tap Share > Copy Link), paste it into DropZap's TikTok downloader above, and click Download. The video will be saved without the TikTok watermark or logo." },
      { q: "Can I download TikTok videos on iPhone?", a: "Yes! DropZap works in Safari and Chrome on iPhone. After downloading, the video saves to your camera roll or Files app. No app installation needed." },
      { q: "Is DropZap better than SnappTik or ssstik?", a: "DropZap provides a cleaner experience with no pop-up ads, no fake download buttons, and no redirects. The video quality is identical (original HD), but your experience is safer and faster." },
      { q: "Can I download TikTok Slideshows?", a: "Yes, DropZap can download TikTok slideshows as video files. The slideshow images are combined into a single video at the original quality." },
      { q: "Why does the downloaded video have no sound?", a: "This is rare but can happen with certain TikTok videos that use copyrighted music. Most videos download with full audio. Try re-downloading if this occurs." },
      { q: "Can I download private TikTok videos?", a: "No. DropZap can only download publicly available TikTok videos. Private or friends-only videos cannot be accessed by external tools." },
    ],
    features: [
      { title: "No Watermark", desc: "Download TikTok videos completely clean — no TikTok logo, no username watermark. Perfect for repurposing content." },
      { title: "Original HD Quality", desc: "Videos are saved at the original quality uploaded by the creator. No compression, no quality loss." },
      { title: "Works on All Devices", desc: "Download TikTok videos on iPhone, Android, iPad, PC, or Mac. No app needed — works in your browser." },
      { title: "Fast Processing", desc: "Our servers fetch and process TikTok videos in under 5 seconds. The fastest TikTok downloader online." },
      { title: "No Signup Required", desc: "Start downloading immediately. No account, no email, no personal information needed." },
      { title: "Slideshow Support", desc: "Download TikTok slideshows and photo carousels as video files with music included." },
    ],
    howTo: [
      { step: "Copy the TikTok link", desc: "Open TikTok, find the video you want to save, tap the Share button, and select Copy Link." },
      { step: "Paste into DropZap", desc: "Open DropZap in your browser and paste the TikTok link into the input field above." },
      { step: "Download without watermark", desc: "Click Download and DropZap will save the video to your device — completely free of watermarks and logos." },
    ],
    content: {
      intro: "DropZap TikTok Downloader is the fastest free tool to download TikTok videos without the watermark. Every TikTok video you download through DropZap comes without the TikTok logo overlay, making it perfect for saving content to your camera roll, sharing on other platforms, or creating compilations. Our tool works with all types of TikTok content including regular videos, slideshows, duets, stitches, and trending sounds.",
      whyUs: "Most TikTok downloaders online are filled with aggressive pop-up ads, fake download buttons that redirect to spam sites, and low-quality conversions. DropZap is different. We provide a clean, ad-minimal interface where the real download button is the only button. No redirects, no malware, no misleading UI. Your TikTok videos download at their original uploaded quality with no compression artifacts.",
      formats: "DropZap downloads TikTok videos in MP4 format at the original resolution uploaded by the creator. Most TikTok videos are 1080x1920 (Full HD vertical), though some older videos may be 720x1280. The download includes the original audio track, including any music or voiceover used in the video. For slideshows, the images are compiled into a video with the original soundtrack.",
      devices: "DropZap TikTok Downloader works on every device. On iPhone, open DropZap in Safari, paste the link, and download — the video saves directly to your Files app or camera roll. On Android, use Chrome or any browser. On PC and Mac, it works in any browser. No TikTok account is needed, and no app installation is required.",
      safety: "DropZap is completely safe to use. We do not require your TikTok login credentials, we do not access your TikTok account, and we do not store any of your personal information. The download process happens entirely on our secure servers. Unlike TikTok downloader apps that may contain malware, DropZap runs in your browser with zero risk to your device.",
      tips: "For the best results, make sure you are copying the share link from within the TikTok app (Share > Copy Link). Links from the TikTok website also work. If a video fails to download, try opening the video in TikTok first to make sure it is still available. DropZap cannot download private videos or videos that have been removed by the creator.",
    },
  },
  instagram: {
    slug: "instagram-downloader",
    name: "Instagram",
    title: "Instagram Reels Downloader - Save Instagram Videos & Reels Free",
    h1: "Instagram Reels & Video Downloader",
    description: "Download Instagram Reels, videos, and posts in HD quality. Free Instagram downloader — save IG Reels to your device. No watermark, no login required.",
    keywords: [
      "instagram downloader", "instagram reels downloader", "download instagram reels",
      "instagram video downloader", "save instagram reels", "ig reels download",
      "instagram post downloader", "instagram saver", "insta downloader",
      "download instagram video", "instagram reels saver", "snapinsta alternative",
    ],
    color: "pink-600",
    gradient: "from-purple-600 via-pink-600 to-orange-500",
    iconBg: "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500",
    faq: [
      { q: "How do I download Instagram Reels?", a: "Open Instagram, find the Reel you want to download, tap the three dots (···) menu, select Copy Link, then paste the link into DropZap's Instagram downloader above and click Download." },
      { q: "Can I download Instagram posts and photos?", a: "Yes! DropZap supports downloading Instagram Reels, video posts, and IGTV videos. For photo posts, right-click and save the image directly from Instagram." },
      { q: "Do I need an Instagram account to download?", a: "No. DropZap downloads publicly available Instagram content without requiring any login. However, private account content cannot be downloaded." },
      { q: "Is it safe to download Instagram Reels?", a: "Yes. DropZap processes downloads through secure servers. We never ask for your Instagram password or access your account." },
      { q: "What quality are Instagram Reel downloads?", a: "DropZap downloads Instagram Reels at their original uploaded quality, typically 1080x1920 Full HD resolution." },
      { q: "Can I download Instagram Stories?", a: "Currently, DropZap supports Instagram Reels and regular video posts. Story downloads are planned for a future update." },
    ],
    features: [
      { title: "Instagram Reels Download", desc: "Save any public Instagram Reel to your device in full HD quality. No watermark added." },
      { title: "Video Posts", desc: "Download video posts from Instagram profiles and explore pages at original quality." },
      { title: "No Login Required", desc: "Download Instagram content without signing in. No credentials needed, no personal data collected." },
      { title: "Original Quality", desc: "Videos are saved at the same quality they were uploaded — no re-compression or quality degradation." },
      { title: "Fast & Reliable", desc: "Our servers handle Instagram downloads quickly. Most Reels download within 3-5 seconds." },
      { title: "All Devices Supported", desc: "Works on iPhone, Android, iPad, Mac, and PC. No app installation needed." },
    ],
    howTo: [
      { step: "Copy the Instagram link", desc: "Open Instagram, find the Reel or video post, tap the three-dot menu (···), and select Copy Link." },
      { step: "Paste into DropZap", desc: "Open DropZap and paste the Instagram link into the input field above." },
      { step: "Download to your device", desc: "Click Download and the video saves directly to your device at original quality." },
    ],
    content: {
      intro: "DropZap Instagram Downloader lets you save Instagram Reels, video posts, and IGTV content to your device in full HD quality. Instagram does not offer a built-in download feature for other people's content, but DropZap bridges that gap. Whether you want to save an inspiring Reel for offline viewing, keep a recipe video for later, or save a workout tutorial, DropZap makes it effortless.",
      whyUs: "Unlike other Instagram downloaders such as SnapInsta or IGram that bombard you with pop-up ads and redirects, DropZap offers a clean, safe downloading experience. We do not inject watermarks, we do not require your Instagram login, and we process downloads on secure servers. The entire process takes seconds, not minutes.",
      formats: "Instagram Reels and videos are downloaded in MP4 format at their original resolution. Most Reels are 1080x1920 (Full HD vertical), while feed videos may be 1080x1080 (square) or 1080x1350 (portrait). The audio track is always included. IGTV videos download at their full length and original quality.",
      devices: "DropZap Instagram Downloader works on all devices. On iPhone, videos save to your Files app or camera roll. On Android, videos download directly to your gallery. On desktop, files save to your Downloads folder. No app installation or browser extension is needed — DropZap runs entirely in your web browser.",
      safety: "DropZap never asks for your Instagram password or login credentials. We only access publicly available content through Instagram's content delivery network. Your privacy is protected — we do not store download history or personal information on our servers.",
      tips: "Make sure the Instagram account is public before trying to download. Private account content cannot be accessed by DropZap. For Reels, use the Copy Link option from the three-dot menu. For feed posts, tap Share and then Copy Link. If a download fails, the content may have been removed or the account may have been set to private.",
    },
  },
  twitter: {
    slug: "twitter-video-downloader",
    name: "Twitter/X",
    title: "Twitter Video Downloader - Save X Videos & GIFs in HD Free",
    h1: "Twitter/X Video Downloader - Save Videos & GIFs",
    description: "Download Twitter/X videos and GIFs in HD quality. Free online Twitter video saver — no watermark, no login. Save X videos on iPhone, Android & PC.",
    keywords: [
      "twitter video downloader", "twitter downloader", "download twitter video",
      "x video downloader", "save twitter video", "twitter video saver",
      "twitter gif downloader", "twitter to mp4", "ssstwitter alternative",
      "download x video", "twitter hd video", "save x post video",
    ],
    color: "gray-900",
    gradient: "from-gray-800 to-black",
    iconBg: "bg-black",
    faq: [
      { q: "How do I download Twitter/X videos?", a: "Find the tweet with the video on Twitter/X, click the share button, select Copy Link, then paste the link into DropZap's Twitter downloader above and click Download." },
      { q: "Can I download Twitter GIFs?", a: "Yes! Twitter GIFs are actually MP4 videos, and DropZap downloads them in their original MP4 format at full quality." },
      { q: "What quality are Twitter video downloads?", a: "DropZap downloads Twitter videos at the highest available quality. Most Twitter videos are available in 720p or 1080p HD." },
      { q: "Do I need a Twitter account to download?", a: "No. DropZap can download videos from public tweets without requiring any Twitter/X login." },
      { q: "Can I download videos from private Twitter accounts?", a: "No. DropZap can only download videos from public tweets. Protected/private accounts cannot be accessed." },
      { q: "Is DropZap better than ssstwitter?", a: "DropZap provides a cleaner, ad-free experience compared to ssstwitter. Same video quality, but without pop-ups, fake buttons, and redirects." },
    ],
    features: [
      { title: "HD Video Downloads", desc: "Download Twitter videos at the highest available quality — up to 1080p Full HD resolution." },
      { title: "GIF Downloads", desc: "Save Twitter GIFs as MP4 files at their original quality. Play them anywhere, on any device." },
      { title: "No Login Needed", desc: "Download from public tweets without any Twitter/X account required. No credentials collected." },
      { title: "Fast Processing", desc: "Twitter videos are processed and ready for download within seconds. No waiting, no queues." },
      { title: "All Devices", desc: "Works on iPhone, Android, iPad, Mac, and Windows. Browser-based — no app required." },
      { title: "No Watermark", desc: "Downloaded videos are clean — no DropZap branding or watermarks added to your files." },
    ],
    howTo: [
      { step: "Copy the tweet link", desc: "Open Twitter/X, find the tweet with the video, click the share icon, and select Copy Link." },
      { step: "Paste into DropZap", desc: "Open DropZap and paste the tweet link into the input field above." },
      { step: "Download the video", desc: "Click Download and the video file saves directly to your device in MP4 format." },
    ],
    content: {
      intro: "DropZap Twitter Video Downloader lets you save videos and GIFs from Twitter/X tweets to your device. Twitter does not provide a native download button for videos in tweets, but DropZap solves this problem. Whether you want to save a funny clip, a news segment, a sports highlight, or an educational thread video, DropZap downloads it in HD quality within seconds.",
      whyUs: "Existing Twitter video downloaders like ssstwitter and twitsave are notorious for aggressive advertising, pop-ups, and misleading download buttons. DropZap strips away all that noise and gives you a clean, fast downloading experience. One input field, one button, one click — your video is saved.",
      formats: "Twitter videos are downloaded in MP4 format at the highest available quality. Twitter typically offers videos in 360p, 480p, 720p, and sometimes 1080p. DropZap automatically selects the best quality available. Twitter GIFs are actually short MP4 loops — DropZap downloads them in their original MP4 format which you can convert to actual GIF format if needed.",
      devices: "DropZap works on every device with a web browser. On iPhone and iPad, videos save to your Files app or camera roll via Safari. On Android, downloads go to your gallery or Downloads folder. On desktop browsers (Chrome, Firefox, Edge, Safari), files save to your configured Downloads directory.",
      safety: "DropZap does not require your Twitter/X login credentials. We access only publicly available tweets through standard web protocols. No personal data is collected, no cookies are stored, and no tracking is performed. Our download process is secure and private.",
      tips: "To download a Twitter video, you need the direct tweet URL. Click the share button on the tweet and copy the link — do not copy the URL from your browser address bar if you are in a thread, as this may not point to the correct tweet. Videos in quote tweets and retweets can also be downloaded — just copy the link to the original tweet containing the video.",
    },
  },
  facebook: {
    slug: "facebook-video-downloader",
    name: "Facebook",
    title: "Facebook Video Downloader - Save FB Videos in HD Free Online",
    h1: "Facebook Video Downloader - Save FB Videos in HD",
    description: "Download Facebook videos in HD quality for free. Online Facebook video saver — save FB Reels, videos & clips to your device. No signup, no watermark.",
    keywords: [
      "facebook video downloader", "facebook downloader", "download facebook video",
      "fb video downloader", "save facebook video", "facebook video saver",
      "facebook reels downloader", "fb reels download", "facebook hd video download",
      "download fb video online", "facebook to mp4",
    ],
    color: "blue-600",
    gradient: "from-blue-600 to-blue-700",
    iconBg: "bg-blue-600",
    faq: [
      { q: "How do I download Facebook videos?", a: "Copy the Facebook video URL from your browser or the Facebook app (Share > Copy Link), paste it into DropZap above, and click Download. The video saves to your device in HD quality." },
      { q: "Can I download Facebook Reels?", a: "Yes! DropZap supports downloading Facebook Reels, regular video posts, and video clips at their original quality." },
      { q: "Do I need a Facebook account?", a: "No account is needed for public videos. However, videos posted on private profiles cannot be downloaded by external tools." },
      { q: "What quality can I download Facebook videos in?", a: "DropZap downloads Facebook videos at the highest available quality, typically HD (720p) or Full HD (1080p) depending on the original upload." },
      { q: "Can I download Facebook Live videos?", a: "Yes, after a Facebook Live has ended and been saved as a post, DropZap can download it like any other Facebook video." },
      { q: "Is it safe to use DropZap for Facebook videos?", a: "Absolutely. DropZap never asks for your Facebook login, does not access your account, and processes downloads through secure servers." },
    ],
    features: [
      { title: "HD Quality Downloads", desc: "Download Facebook videos at the highest available quality — up to 1080p Full HD." },
      { title: "Facebook Reels Support", desc: "Save Facebook Reels to your device at original quality. No watermark added." },
      { title: "No Login Required", desc: "Download public Facebook videos without any Facebook account or login credentials." },
      { title: "Fast & Free", desc: "All downloads are completely free. No subscriptions, no limits, no waiting." },
      { title: "All Devices", desc: "Works on iPhone, Android, Mac, Windows, and any device with a web browser." },
      { title: "No Installation", desc: "DropZap runs in your browser. No app, extension, or software to install." },
    ],
    howTo: [
      { step: "Copy the Facebook video URL", desc: "Open Facebook, find the video you want to download, and copy the URL from your browser or use Share > Copy Link." },
      { step: "Paste into DropZap", desc: "Open DropZap and paste the Facebook video link into the input field above." },
      { step: "Download in HD", desc: "Click Download and the Facebook video saves to your device in MP4 format at the best available quality." },
    ],
    content: {
      intro: "DropZap Facebook Video Downloader lets you save any public Facebook video to your device for free. Facebook does not offer a built-in download option for most videos, but DropZap provides an easy solution. Save video posts, Facebook Reels, Watch videos, and saved Live streams in HD quality with just one click.",
      whyUs: "Most Facebook video downloaders online are loaded with intrusive ads, pop-ups, and suspicious redirects. DropZap is different — we provide a clean, minimal interface focused on getting your download done quickly and safely. No fake buttons, no malware, no account required.",
      formats: "Facebook videos are downloaded in MP4 format at the highest quality available. Most Facebook videos are available in SD (480p) and HD (720p or 1080p). DropZap automatically selects the best quality. Audio is always included with the video download.",
      devices: "DropZap Facebook Video Downloader works on all devices — iPhone, Android, iPad, Mac, Windows, and Linux. Simply open DropZap in your browser (Safari, Chrome, Firefox, Edge) and paste the Facebook video link. No app to download, no extension to install.",
      safety: "DropZap is completely safe for downloading Facebook videos. We never request your Facebook login credentials, we do not access your Facebook account, and we do not collect personal information. Downloads are processed on encrypted servers.",
      tips: "For the best results, use the full video URL from your browser address bar. On mobile, use the Share button on the video post and select Copy Link. If a video is not downloading, check that the video is publicly available — DropZap cannot access videos from private profiles or closed groups.",
    },
  },
  reddit: {
    slug: "reddit-video-downloader",
    name: "Reddit",
    title: "Reddit Video Downloader With Sound - Save Reddit Videos Free",
    h1: "Reddit Video Downloader With Sound",
    description: "Download Reddit videos with sound merged automatically. Free Reddit video saver — save Reddit videos with audio to MP4. Works on all devices, no signup.",
    keywords: [
      "reddit video downloader", "reddit downloader", "download reddit video",
      "reddit video downloader with sound", "save reddit video",
      "reddit to mp4", "reddit video saver", "reddit downloader with audio",
      "reddit gif downloader", "download reddit with sound", "redditsave alternative",
    ],
    color: "orange-600",
    gradient: "from-orange-500 to-orange-600",
    iconBg: "bg-orange-600",
    faq: [
      { q: "How do I download Reddit videos with sound?", a: "Reddit stores video and audio as separate files. DropZap automatically merges them into a single MP4 file with sound. Just paste the Reddit post URL and click Download." },
      { q: "Why do other Reddit downloaders have no sound?", a: "Reddit separates video and audio tracks. Most basic downloaders only grab the video. DropZap uses advanced processing to merge both tracks, so you always get video with sound." },
      { q: "Can I download Reddit GIFs?", a: "Yes! Reddit GIFs are actually MP4 videos. DropZap downloads them at their original quality as MP4 files." },
      { q: "Do I need a Reddit account?", a: "No. DropZap downloads from any public Reddit post without requiring a Reddit login." },
      { q: "What about NSFW Reddit content?", a: "DropZap can download from any publicly accessible Reddit post. NSFW content that requires login cannot be accessed." },
      { q: "Can I download Reddit image galleries?", a: "Currently, DropZap supports Reddit video and GIF downloads. Image gallery downloads are planned for a future update." },
    ],
    features: [
      { title: "Audio Included", desc: "Unlike other Reddit downloaders, DropZap automatically merges the video and audio tracks so your download always has sound." },
      { title: "HD Quality", desc: "Download Reddit videos at the highest available quality — typically 720p or 1080p HD." },
      { title: "GIF Support", desc: "Save Reddit GIFs and short clips as MP4 files at original quality." },
      { title: "No Login Needed", desc: "Download from any public Reddit post. No Reddit account or login required." },
      { title: "Fast Processing", desc: "Video and audio merging happens on our servers in seconds. No waiting." },
      { title: "All Devices", desc: "Works on iPhone, Android, PC, Mac — any device with a browser." },
    ],
    howTo: [
      { step: "Copy the Reddit post URL", desc: "Open Reddit, find the video post, and copy the URL from your browser address bar or use the Share > Copy Link button." },
      { step: "Paste into DropZap", desc: "Open DropZap and paste the Reddit post link into the input field above." },
      { step: "Download with sound", desc: "Click Download. DropZap merges video and audio automatically and saves the complete file to your device." },
    ],
    content: {
      intro: "DropZap Reddit Video Downloader solves the most frustrating problem with saving Reddit videos — the missing audio. Reddit stores video and audio as separate files, which means most downloaders only give you a silent video. DropZap automatically detects both tracks, merges them on our servers, and delivers a complete MP4 file with full sound. Whether it is a funny clip from r/funny, a tutorial from r/DIY, or a clip from r/gaming, DropZap saves it properly.",
      whyUs: "The number one complaint about Reddit video downloaders is 'no sound.' Tools like redditsave and rapidsave often deliver silent videos because they only grab the video track. DropZap solves this by merging video and audio server-side before delivering the final file to you. Additionally, we provide a clean interface without the aggressive advertising found on competing sites.",
      formats: "Reddit videos are downloaded in MP4 format with audio merged. Quality options typically include 720p and 1080p HD, depending on the original upload. Reddit GIFs download as MP4 files at their original resolution. All downloads include the merged audio track when available.",
      devices: "DropZap Reddit Video Downloader works on every device. On iPhone, open DropZap in Safari, paste the Reddit link, and download. On Android, use Chrome or any browser. On desktop, any modern browser works. No app or extension installation required.",
      safety: "DropZap does not require your Reddit login credentials. We access only publicly available Reddit posts through standard web protocols. No personal data is collected, no tracking is performed, and all downloads are processed on secure servers.",
      tips: "For the best results, copy the direct link to the Reddit post (not a comment link). On mobile, use the Share button in the Reddit app and copy the link. DropZap works with links from reddit.com, old.reddit.com, and short redd.it URLs. If audio is missing from the source, DropZap will download the video-only track.",
    },
  },
};

export const platformOrder = ["youtube", "tiktok", "instagram", "twitter", "facebook", "reddit"];
