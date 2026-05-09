// Glossary entries — short, definition-style pages targeting
// informational long-tail queries.
//
// These are LLM-citation-optimized: each entry leads with a strict
// 1-2 sentence definition (the snippet ChatGPT, Perplexity, and
// Google AI Overviews extract), followed by 2-3 paragraphs of
// context, a "see also" rail, and a CTA back to the relevant tool.
//
// Why glossary pages matter for SEO/AI visibility:
//   1. Definition-format content is the single most-cited content
//      type in LLM responses — when someone asks "what is M3U8" the
//      models pull from short, structured definition pages.
//   2. Each page is eligible for the schema.org `DefinedTerm` type,
//      which is read directly by Google's Knowledge Graph and AI
//      Overviews.
//   3. Topical authority — a downloader site with deep glossary
//      coverage of streaming/video terms signals expertise to both
//      Google's HCU algorithm and entity-aware AI crawlers.

export interface GlossaryEntry {
  slug: string;
  /** The term itself, formatted for display (e.g. "DASH Streaming"). */
  term: string;
  /** Short alternative names (used for `alternateName` in schema). */
  aliases?: string[];
  /** Page <title> + H1. */
  title: string;
  /** Meta description and Article schema description. */
  description: string;
  /**
   * Strict 1-2 sentence canonical definition. This is the LLM
   * citation surface — the text models will lift verbatim. Write it
   * to be the cleanest possible answer to "what is X".
   */
  shortDefinition: string;
  /**
   * 2-3 paragraphs of expanded context. Should explain WHY the term
   * matters in the downloader / streaming context specifically.
   */
  longDefinition: string;
  /** Slug of the most relevant tool page (used for the inline CTA). */
  relatedTool?: { label: string; href: string };
  /** Slugs of other glossary entries to cross-link to. */
  related: string[];
  keywords: string[];
  dateModified: string;
}

export const glossaryEntries: GlossaryEntry[] = [
  {
    slug: "watermark",
    term: "Watermark",
    aliases: ["video watermark", "TikTok watermark"],
    title: "What Is a Watermark? (Video Watermarks Explained)",
    description:
      "A watermark is a logo or text overlay added to a video to identify its source platform or creator. Learn how TikTok, Instagram, and Facebook apply watermarks and how to download videos without them.",
    shortDefinition:
      "A watermark is a translucent logo, username, or text overlay added to a video file that identifies the platform or creator that produced it. On TikTok, the watermark is the bouncing TikTok logo plus the creator's @username; on Instagram Reels, it's a small Instagram logo in the corner.",
    longDefinition:
      "Platforms add watermarks for two main reasons: brand recognition (so a TikTok shared on Twitter is visibly recognizable as a TikTok) and creator attribution (so the original creator's username travels with the video). The watermark is applied server-side at the moment a video is exported through the platform's official Save or Share button — it is not part of the original source MP4 stored on the platform's CDN.\n\nThis is why third-party downloaders can return watermark-free files: they fetch the underlying CDN MP4 directly, skipping the export pipeline that adds the overlay. The output is the same video at the same resolution, just without the visual logo. This is technically straightforward and entirely legal — the watermark itself is not copyrighted, and bypassing it does not bypass any DRM (none of these short-form platforms use DRM on user uploads).\n\nNote that some watermarks are baked into the original upload — for example, a creator might embed their own logo into the video before uploading. Those cannot be removed because they're part of the source file itself, not an overlay added later.",
    relatedTool: {
      label: "Download TikTok without watermark",
      href: "/tiktok-downloader",
    },
    related: ["mp4", "cdn", "h264"],
    keywords: ["watermark", "video watermark", "tiktok watermark", "what is a watermark"],
    dateModified: "2026-05-09",
  },
  {
    slug: "mp4",
    term: "MP4",
    aliases: ["MPEG-4 Part 14", ".mp4 file"],
    title: "What Is an MP4 File? (MP4 Format Explained)",
    description:
      "MP4 is the most common video file format on the internet. Learn what MP4 actually contains, why TikTok, Instagram, and YouTube all use it, and how it differs from MOV, WEBM, and MKV.",
    shortDefinition:
      "MP4 (MPEG-4 Part 14) is a digital container format that holds video, audio, subtitles, and metadata in a single file. It is the dominant video format on the modern internet — TikTok, Instagram, YouTube, X / Twitter, Facebook, and Reddit all serve videos as MP4 internally.",
    longDefinition:
      'MP4 is a "container" format, meaning the .mp4 file itself doesn\'t define how video and audio are encoded — it just holds those streams together. Inside a typical web MP4 you\'ll find H.264-encoded video and AAC-encoded audio, the same combination used by every major social platform. The MP4 container also supports H.265 (HEVC) video and Opus audio, but those are less common in social-media contexts because of patent-licensing complexity (H.264) and broader compatibility (AAC).\n\nMP4 became dominant because it strikes the right balance: small file size, high quality, fast streaming start times (the metadata header sits at the start of the file, so playback can begin before the full file is downloaded), and near-universal device support. Every iPhone, Android device, modern browser, and TV plays MP4 natively without plugins.\n\nWhen you download a video from a social platform using a tool like DropZap, you get the source MP4 file the platform stored on its CDN. The format and quality are identical to what the platform serves to its own app — there is no transcoding step.',
    relatedTool: {
      label: "Convert any video to MP4",
      href: "/",
    },
    related: ["h264", "aac-audio", "dash-streaming"],
    keywords: ["mp4", "mp4 file", "what is mp4", "mp4 format"],
    dateModified: "2026-05-09",
  },
  {
    slug: "dash-streaming",
    term: "DASH Streaming",
    aliases: ["MPEG-DASH", "Dynamic Adaptive Streaming over HTTP"],
    title: "What Is DASH Streaming? (MPEG-DASH Explained)",
    description:
      "DASH is the streaming protocol Reddit, Twitter, and most modern platforms use to serve video. Understanding DASH explains why some videos download silently — and how to fix it.",
    shortDefinition:
      "DASH (Dynamic Adaptive Streaming over HTTP), also called MPEG-DASH, is a streaming protocol that splits video and audio into separate files and lets the player request the best quality based on current bandwidth. Reddit, Twitter / X, and Facebook all use DASH for video delivery.",
    longDefinition:
      "In a DASH stream, the server publishes a small XML file called a manifest (usually with a .mpd extension) that lists all the available video qualities (e.g. 360p, 720p, 1080p) and audio tracks. The player downloads the manifest first, picks the highest video quality your bandwidth supports, and then fetches small chunks of that quality as you watch. If your connection slows down, the player automatically switches to a lower quality without interrupting playback.\n\nThe key consequence for downloading: in a DASH stream, video and audio are stored as separate files. A simple downloader that grabs only the video chunks ends up with a silent file. This is why Reddit videos so often download without audio — most general-purpose tools only fetch the video stream and skip the parallel audio stream entirely.\n\nFixing this requires merging the streams server-side using FFmpeg, which is what DropZap does for every Reddit, Twitter, and Facebook video. The result is a single MP4 file with both video and audio, ready to play in any video player.",
    relatedTool: {
      label: "Download Reddit videos with audio",
      href: "/reddit-video-downloader",
    },
    related: ["m3u8", "ffmpeg", "mp4", "bitrate"],
    keywords: ["dash streaming", "mpeg-dash", "what is dash", "dash protocol"],
    dateModified: "2026-05-09",
  },
  {
    slug: "m3u8",
    term: "M3U8",
    aliases: ["HLS playlist", ".m3u8 file"],
    title: "What Is an M3U8 File? (HLS Streaming Explained)",
    description:
      "M3U8 is the playlist format used by HLS (HTTP Live Streaming), Apple's streaming protocol used by TikTok, Twitch, and many video platforms. Learn what M3U8 contains and how it relates to MP4.",
    shortDefinition:
      "An M3U8 file is a UTF-8 encoded playlist that describes the segments of an HLS (HTTP Live Streaming) video stream. It does not contain video data itself — it lists the URLs of small .ts (Transport Stream) chunks that, when played in order, produce the full video.",
    longDefinition:
      "HLS is Apple's streaming protocol, designed in 2009 and now used by Twitch, TikTok, Apple TV+, and a large portion of live-streaming infrastructure. The .m3u8 playlist file references either a list of .ts video chunks (typically 6-10 seconds each) or another set of .m3u8 playlists representing different quality levels for adaptive bitrate switching.\n\nWhen you encounter an M3U8 URL while trying to download a video, you cannot just download the .m3u8 file — it's only a few KB of text and contains no video. To get the actual video as a single file, you need to download all the referenced .ts chunks, concatenate them, and (typically) remux into MP4. FFmpeg can do this in one command: ffmpeg -i playlist.m3u8 -c copy output.mp4.\n\nMost online HLS-to-MP4 tools (including DropZap for HLS-served platforms) automate this entire chunk-fetch-and-merge process server-side, returning a clean MP4 file ready to play.",
    related: ["dash-streaming", "ffmpeg", "mp4", "h264"],
    keywords: ["m3u8", "m3u8 file", "hls streaming", "what is m3u8"],
    dateModified: "2026-05-09",
  },
  {
    slug: "h264",
    term: "H.264",
    aliases: ["AVC", "Advanced Video Coding", "MPEG-4 AVC"],
    title: "What Is H.264? (Video Codec Explained)",
    description:
      "H.264 is the video codec used by virtually every social media platform — TikTok, Instagram, YouTube, Facebook, Twitter. Learn what H.264 is and why it dominates internet video.",
    shortDefinition:
      "H.264 (also called AVC, Advanced Video Coding) is the most widely used video compression codec on the internet. It compresses raw video into a much smaller file while preserving high visual quality, and it is the codec inside virtually every MP4 file served by TikTok, Instagram, YouTube, Facebook, X / Twitter, and Reddit.",
    longDefinition:
      "H.264 was finalized in 2003 and has dominated web video ever since. It uses a combination of motion prediction (only storing the differences between similar frames), spatial transforms, and entropy coding to achieve compression ratios around 50:1 — meaning a 1-hour 1080p video that would be 670GB uncompressed compresses down to roughly 13GB or less depending on quality settings.\n\nThe reason H.264 dominates over newer codecs (H.265 / HEVC, AV1, VP9) is hardware support. Every iPhone, Android device, smart TV, web browser, and gaming console has H.264 decoding built into the GPU, so playback is essentially free in terms of battery and CPU. Newer codecs offer better compression but require either software decoding (slower, drains battery) or newer hardware that not all users have.\n\nWhen you download a video from a social platform, the file is almost always H.264 video inside an MP4 container with AAC audio. This combination is the de-facto standard for shareable web video and plays on every device you'd ever want to play it on.",
    related: ["mp4", "aac-audio", "bitrate", "1080p"],
    keywords: ["h.264", "h264 codec", "avc codec", "what is h.264"],
    dateModified: "2026-05-09",
  },
  {
    slug: "aac-audio",
    term: "AAC Audio",
    aliases: ["Advanced Audio Coding", ".aac"],
    title: "What Is AAC? (Audio Codec Explained)",
    description:
      "AAC is the audio codec inside virtually every MP4 video file on the internet. Learn what AAC is and why it replaced MP3 as the dominant audio format.",
    shortDefinition:
      "AAC (Advanced Audio Coding) is a lossy audio compression codec designed as the successor to MP3. It is the audio format inside almost every MP4 video file served by TikTok, Instagram, YouTube, Facebook, and Twitter, and at the same bitrate it sounds noticeably better than MP3.",
    longDefinition:
      "AAC was standardized in 1997 and is the audio component of the MPEG-4 standard. At a typical web bitrate of 128 kbps, AAC produces audio that's transparent (indistinguishable from CD quality) for most listeners — a quality tier that requires roughly 192 kbps in MP3. This compression efficiency is why every modern video codec ecosystem standardized on AAC for audio.\n\nWhen you download a video from a social platform, the audio inside the MP4 is almost always AAC at 96-128 kbps mono or 128-192 kbps stereo. Tools that extract audio (like DropZap's video-to-MP3 mode) typically transcode the AAC track to MP3 because MP3 has slightly broader compatibility with older devices and software, even though MP3 at the same bitrate is lower quality.\n\nThe .aac file extension exists but is rare in practice — when AAC is extracted from a video, the file is almost always re-wrapped as either an .m4a (the standard Apple/iTunes container for AAC audio) or transcoded to .mp3.",
    related: ["mp4", "h264", "bitrate"],
    keywords: ["aac", "aac audio", "what is aac", "aac codec"],
    dateModified: "2026-05-09",
  },
  {
    slug: "ffmpeg",
    term: "FFmpeg",
    title: "What Is FFmpeg? (The Library Behind Every Video Tool)",
    description:
      "FFmpeg is the open-source library powering video encoding, decoding, and conversion in basically every video tool — including DropZap. Learn what it does and why it is everywhere.",
    shortDefinition:
      "FFmpeg is an open-source command-line library for handling video and audio: it can convert between formats, extract audio, merge video and audio streams, transcode codecs, trim clips, and much more. It is the underlying engine inside almost every video tool on the internet, including online converters and downloaders.",
    longDefinition:
      "FFmpeg has existed since 2000 and is one of the most foundational pieces of open-source software in the multimedia world. VLC, Handbrake, OBS Studio, Plex, Kodi, YouTube's encoding pipeline, and most online video tools either embed FFmpeg directly or wrap it in a higher-level interface. When you see a website that converts videos, extracts audio, or downloads from a streaming protocol, the heavy lifting almost always happens inside an FFmpeg process running on the server.\n\nDropZap uses FFmpeg server-side for two main jobs: merging Reddit's separate video and audio DASH streams into a single MP4, and transcoding videos to MP3 audio for the audio-extraction feature. Both happen on the server in a few seconds, so users don't have to install FFmpeg locally or learn its (admittedly intimidating) command-line syntax.\n\nIf you're ever curious about manually doing what an online tool does, FFmpeg can almost certainly do it: ffmpeg -i input.mp4 output.mp3 extracts audio, ffmpeg -i video.mp4 -i audio.mp4 -c copy merged.mp4 merges separate streams, and ffmpeg -i playlist.m3u8 -c copy out.mp4 downloads an HLS stream as MP4. The catch is that most platforms' video URLs aren't directly accessible — you need to first parse the manifest, which is the part downloaders automate.",
    related: ["dash-streaming", "m3u8", "mp4"],
    keywords: ["ffmpeg", "what is ffmpeg", "ffmpeg library"],
    dateModified: "2026-05-09",
  },
  {
    slug: "cdn",
    term: "CDN",
    aliases: ["Content Delivery Network"],
    title: "What Is a CDN? (Content Delivery Network Explained)",
    description:
      "A CDN is the network of servers that actually delivers TikTok videos, Instagram photos, and YouTube streams to your device. Learn how CDNs work and why they matter for downloading.",
    shortDefinition:
      "A CDN (Content Delivery Network) is a globally distributed network of servers that caches static content — videos, images, JavaScript files — close to where users are physically located, so the content loads faster than it would from the origin server. TikTok, Instagram, Twitter, and every other social platform uses CDNs to serve media.",
    longDefinition:
      "When you watch a TikTok video, the actual MP4 file is not served from TikTok's main servers — it's served from a CDN edge node that might be 50 km from your house. CDN companies (Cloudflare, Fastly, Akamai, Amazon CloudFront, plus the platforms' own internal CDNs) operate thousands of these edge nodes worldwide, dramatically reducing the latency between you and the content.\n\nFor downloaders, the CDN matters because that's where the source video file actually lives. Instagram's web pages might require login to view, but the underlying CDN URL where the MP4 is stored is typically accessible without authentication (because CDN-level auth would be expensive at the scale Instagram operates). Tools like DropZap parse the page (or API response) to find the CDN URL, then fetch the file directly — bypassing the login wall, the watermarking layer, and any other client-side restrictions Instagram's app applies.\n\nCDN-served files are also why downloads are typically very fast: the file is already cached near you, and CDN bandwidth is highly optimized. A 100MB MP4 from TikTok's CDN often arrives in 2-3 seconds, compared to 10-15+ seconds if it had to come from a regional origin server.",
    related: ["mp4", "dash-streaming", "watermark"],
    keywords: ["cdn", "content delivery network", "what is a cdn"],
    dateModified: "2026-05-09",
  },
  {
    slug: "bitrate",
    term: "Bitrate",
    aliases: ["video bitrate", "kbps", "Mbps"],
    title: "What Is Bitrate? (Video Quality Explained)",
    description:
      "Bitrate is the single biggest factor in video quality — more important than resolution. Learn what bitrate means in kbps and Mbps, and why TikTok looks worse than YouTube at the same resolution.",
    shortDefinition:
      "Bitrate is the amount of data used to encode each second of video, measured in kilobits per second (kbps) or megabits per second (Mbps). Higher bitrate means more data per second, which means better visual quality but larger file size. At the same resolution, a higher-bitrate video looks substantially better than a lower-bitrate one.",
    longDefinition:
      "Bitrate is often more important than resolution for perceived video quality. A 1080p video at 1 Mbps will look heavily compressed — visible blocking, smeared motion, faded colors — while a 720p video at 5 Mbps will look crisp and clean. This is why TikTok's 1080p videos (typically 2-4 Mbps) often look worse than YouTube's 1080p videos (typically 5-8 Mbps) even though both are nominally the same resolution.\n\nDifferent platforms cap bitrate at different levels based on their bandwidth budget and audience patience. TikTok and Instagram aggressively compress to keep mobile data usage low; YouTube and Vimeo allow much higher bitrates because users tolerate longer initial buffering. Twitter / X is somewhere in the middle, around 3-6 Mbps for 1080p.\n\nWhen you download a video, you get whatever bitrate the platform stored — there is no way to increase it after the fact, because the original detail is already lost in compression. Tools that claim to 'enhance' or 'upscale' video quality are using AI interpolation (which can add detail that wasn't in the original) and that's a separate process from downloading.",
    related: ["h264", "1080p", "mp4"],
    keywords: ["bitrate", "video bitrate", "kbps", "mbps"],
    dateModified: "2026-05-09",
  },
  {
    slug: "1080p",
    term: "1080p",
    aliases: ["Full HD", "1920x1080"],
    title: "What Is 1080p? (Full HD Resolution Explained)",
    description:
      "1080p, also called Full HD, is the resolution most social platforms cap their video quality at. Learn exactly what 1080p means and why it is still the dominant format in 2026.",
    shortDefinition:
      "1080p is a video resolution of 1920×1080 pixels (1920 wide by 1080 tall) — also called Full HD. The 'p' stands for progressive scan, meaning every frame is rendered as a complete image rather than interlaced. 1080p is the maximum resolution at which TikTok, Instagram, Twitter / X, and Facebook serve video.",
    longDefinition:
      "1080p became the dominant video resolution standard around 2010 and has stayed dominant for over a decade — a remarkably long run in tech timescales. The reasons are practical: 1080p hits the resolution where most viewers can no longer perceive individual pixels at typical viewing distances on phones and laptops, and the file sizes are still small enough for efficient streaming over modest connections. Pushing to 4K (3840×2160) quadruples the data and provides only marginal perceived quality gains on small screens.\n\nFor vertical video (TikTok, Reels, Shorts, Stories), 1080p typically refers to 1080×1920 — the same total pixel count, just rotated 90 degrees. The platform cap is the longer edge: 1080. Anything claiming to download TikTok or Instagram in 4K is misleading, because the source files only exist at 1080p maximum.\n\nThe practical implication for downloading: when you save a TikTok or Reel, you get a 1080×1920 MP4. That's the highest quality the platform itself stores; no third-party tool can produce a higher-resolution version because the source data simply doesn't exist at that resolution.",
    related: ["bitrate", "h264", "aspect-ratio"],
    keywords: ["1080p", "full hd", "1920x1080", "what is 1080p"],
    dateModified: "2026-05-09",
  },
  {
    slug: "aspect-ratio",
    term: "Aspect Ratio",
    aliases: ["16:9", "9:16", "1:1"],
    title: "What Is Aspect Ratio? (16:9 vs 9:16 vs 1:1 Explained)",
    description:
      "Aspect ratio is the shape of a video — wide (16:9), vertical (9:16), or square (1:1). Learn how each platform uses aspect ratio and why TikTok videos look strange on YouTube.",
    shortDefinition:
      "Aspect ratio is the proportional relationship between a video's width and height. 16:9 (widescreen) is the standard for YouTube, TVs, and most monitors. 9:16 (vertical) is the standard for TikTok, Instagram Reels, and YouTube Shorts. 1:1 (square) was popular for early Instagram feed posts.",
    longDefinition:
      "Aspect ratio shapes the entire visual language of a platform. TikTok and Reels use 9:16 because phones are held vertically — the video fills the entire screen with no black bars. YouTube traditionally used 16:9 because TVs and monitors are horizontal, but YouTube Shorts shifted to 9:16 to compete with TikTok. Square (1:1) was Instagram's signature for years because it was a compromise between vertical and horizontal that worked on any device orientation.\n\nThe practical issue with mixing aspect ratios: a 9:16 vertical TikTok played on a 16:9 horizontal YouTube layout shows huge black bars on the sides. Conversely, a 16:9 video cropped to 9:16 loses content from the sides. There is no perfect cross-platform aspect ratio — creators who want to be everywhere typically shoot 9:16 (because that has the strongest growth tailwind) and accept the bars on horizontal platforms.\n\nWhen you download a video, you get the original aspect ratio the platform stored. DropZap doesn't crop or letterbox; the file you download has the same shape as the source. If you need to change aspect ratio after downloading (e.g. to repost a TikTok on YouTube without bars), you'd need a video editor or FFmpeg's crop/pad filters.",
    related: ["1080p", "h264", "mp4"],
    keywords: ["aspect ratio", "16:9", "9:16", "video aspect ratio"],
    dateModified: "2026-05-09",
  },
  {
    slug: "transcoding",
    term: "Transcoding",
    aliases: ["video conversion", "re-encoding"],
    title: "What Is Transcoding? (Video Conversion Explained)",
    description:
      "Transcoding is the process of decoding a video and re-encoding it in a different format. Learn how it differs from remuxing, why it loses quality, and when it is necessary.",
    shortDefinition:
      "Transcoding is the process of decoding a video file and re-encoding it in a different format, codec, resolution, or bitrate. Unlike remuxing (which just changes the container without touching the audio or video data), transcoding always loses some quality because compression is applied a second time.",
    longDefinition:
      "When you 'convert' a video from MP4 to WEBM, or change resolution from 1080p to 720p, or switch codec from H.264 to H.265, you're transcoding. The original video is decoded back into raw frames and audio samples, then re-encoded according to the new format's rules. Each pass of compression introduces small artifacts — color banding, blocking in fast motion, smeared detail — that can't be undone.\n\nDownloaders generally avoid transcoding to preserve quality. When DropZap downloads a TikTok or Instagram video, it returns the source MP4 unchanged — same codec, same resolution, same bitrate. The only time DropZap transcodes is when explicit conversion is requested, like turning a video into MP3 audio (which requires decoding the video, extracting the audio track, and re-encoding it as MP3).\n\nThe alternative to transcoding is remuxing — putting the same encoded video and audio data into a different container without touching the encoded data itself. For example, an .mp4 file with H.264 + AAC can be remuxed to an .mkv container with no quality loss. FFmpeg does this with the -c copy flag: ffmpeg -i input.mp4 -c copy output.mkv. Whenever you can remux instead of transcode, you should.",
    related: ["ffmpeg", "mp4", "h264", "bitrate"],
    keywords: ["transcoding", "video conversion", "re-encoding", "what is transcoding"],
    dateModified: "2026-05-09",
  },
];
