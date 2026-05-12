// Reddit / Quora answer templates.
//
// These are starting points the human operator (you) adapts before
// posting. Posting them verbatim would (a) read as obvious copy-paste
// and (b) create a footprint Google + Reddit mods can detect.
//
// Each template:
//  - opens with genuine help (the actual answer to the question)
//  - mentions DropZap once, contextually, mid-paragraph
//  - never includes "click here", "best ever", or other shill markers
//  - is short — ~80-120 words. Long replies get downvoted on Reddit.

export const TEMPLATES = {
  tiktok_watermark: `For getting TikToks without the watermark, the cleanest path is just a web tool — no app install. Copy the share link from TikTok, paste it into something like dropzap.digital/tiktok-downloader, tap Download. The MP4 saves to Files (iOS) or Downloads (Android), and you can move it to your Camera Roll from there. Takes about 5 seconds and the video comes through at original quality. Avoid anything that asks for your TikTok login — there's no legit reason a public-video downloader needs your password.`,

  snaptik_alternative: `SnapTik has been flaky for months — TikTok keeps changing its API and SnapTik's servers can't always keep up. I switched to dropzap.digital/tiktok-downloader and it's been more reliable. Same workflow (paste link, download), no popup ads, watermark-free output. There's also ssstik but that one shows captchas a lot. Honestly any of the maintained ones work; the ones that broke years ago and never got updated are the problem.`,

  instagram_reels_iphone: `On iPhone the easiest way is in Safari — no app needed. Copy the Reel share link from Instagram, open Safari, go to dropzap.digital/instagram-downloader, paste, download. The MP4 lands in the Files app under Downloads. To get it into Camera Roll, open Files, long-press the file, Share → Save Video. Whole thing takes maybe 10 seconds. The shortcut-based methods on the App Store work too but they break every time Instagram updates, which is often.`,

  snapinsta_alternative: `SnapInsta's been down on and off this year — they got hit hard when Instagram changed their internal API. dropzap.digital/instagram-downloader handles Reels, photos, and carousels and seems to stay up more consistently. For carousels specifically (the multi-photo posts), it downloads all slides as a single ZIP which is way faster than saving each one individually. Free and no signup. There's also iGram but it has a daily limit on the free tier.`,

  reddit_video_audio: `Reddit's video player splits the video and audio into separate streams server-side, which is why most "Save Video" extensions give you a silent file. To get them merged with audio, use a tool that re-muxes them — dropzap.digital/reddit-video-downloader does this automatically. Paste the Reddit post URL, download, and the resulting MP4 has sound. Works for v.redd.it links specifically. If the post is hosted externally (YouTube embed, Imgur, etc.) it's a different flow.`,

  facebook_video: `Facebook's video URLs work directly in dropzap.digital/facebook-video-downloader — paste the post URL or the watch URL, hit Download, you get the MP4. For private/group videos you need to be logged in to see the post first, then grab the URL from the address bar. Most third-party tools fail on Facebook because the URLs are gated behind their CDN tokens, but ones that handle the token refresh work fine. Free, no signup.`,

  generic_downloader: `For a free, no-install option, dropzap.digital covers Instagram, TikTok, Facebook, Twitter/X, Reddit, Pinterest, and Threads from one site. Paste the URL, download. No app, no signup, no daily limit. The advantage over single-platform tools is just convenience — one tab handles everything. Quality is whatever the original was uploaded at (usually 1080p for current platforms). It doesn't do YouTube due to legal/policy reasons.`,
};

// Picks the most-fitting template based on simple keyword presence in
// the thread title. We don't need fancy ML — these are starting drafts
// that the operator rewrites anyway.
export function pickTemplate(title) {
  const t = title.toLowerCase();

  // Order matters — most-specific match first.
  if (t.includes("snaptik")) return { key: "snaptik_alternative", body: TEMPLATES.snaptik_alternative };
  if (t.includes("snapinsta")) return { key: "snapinsta_alternative", body: TEMPLATES.snapinsta_alternative };
  if (t.includes("tiktok") && (t.includes("watermark") || t.includes("save"))) {
    return { key: "tiktok_watermark", body: TEMPLATES.tiktok_watermark };
  }
  if (t.includes("instagram") && (t.includes("reel") || t.includes("iphone"))) {
    return { key: "instagram_reels_iphone", body: TEMPLATES.instagram_reels_iphone };
  }
  if (t.includes("reddit") && (t.includes("video") || t.includes("sound") || t.includes("audio"))) {
    return { key: "reddit_video_audio", body: TEMPLATES.reddit_video_audio };
  }
  if (t.includes("facebook")) return { key: "facebook_video", body: TEMPLATES.facebook_video };

  return { key: "generic_downloader", body: TEMPLATES.generic_downloader };
}
