/**
 * Diigo Bookmarker  (DA 92)
 *
 * Saves DropZap URLs as public bookmarks on Diigo.
 * Diigo bookmarks are crawled by Google and provide high-DA backlinks.
 *
 * Required env vars:
 *   DIIGO_USERNAME   — Your Diigo username
 *   DIIGO_API_KEY    — From https://www.diigo.com/api_keys/new/
 *
 * Diigo API v2 uses HTTP Basic auth with username:api_key.
 *
 * Frontmatter: not needed — this script bookmarks a fixed set of DropZap
 * URLs automatically. Run it once; Diigo rate-limits to ~3/minute.
 */

const SITE_URL = "https://www.dropzap.digital";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The set of DropZap URLs we want bookmarked on Diigo.
// Each entry is a public Diigo bookmark pointing to the target page.
const DROPZAP_BOOKMARKS = [
  {
    url: SITE_URL,
    title: "DropZap — Free Instagram, TikTok & Social Media Video Downloader",
    desc: "Download Instagram Reels, TikTok videos without watermark, Facebook, Twitter/X, Reddit, Pinterest and Threads media. Free, no signup, no install required.",
    tags: "instagram-downloader,tiktok-downloader,video-downloader,free,no-watermark",
  },
  {
    url: `${SITE_URL}/instagram-downloader`,
    title: "Free Instagram Reels & Photos Downloader — DropZap",
    desc: "Download Instagram Reels, posts, photos, and carousel albums for free. No watermark, no login. Works on iPhone, Android, and desktop.",
    tags: "instagram,reels,downloader,free,no-watermark",
  },
  {
    url: `${SITE_URL}/tiktok-downloader`,
    title: "TikTok Video Downloader Without Watermark — DropZap",
    desc: "Save TikTok videos in HD without the TikTok watermark or logo. Free, instant, no signup. Works on mobile and desktop.",
    tags: "tiktok,downloader,no-watermark,free,hd",
  },
  {
    url: `${SITE_URL}/tiktok-to-mp3`,
    title: "TikTok to MP3 Converter — DropZap",
    desc: "Convert TikTok videos to MP3 audio instantly. Save TikTok sounds, music, and voiceovers as high-quality audio files. Free, no signup.",
    tags: "tiktok,mp3,converter,audio,free",
  },
  {
    url: `${SITE_URL}/facebook-video-downloader`,
    title: "Facebook Video Downloader — DropZap",
    desc: "Download Facebook videos, Reels, and photo albums for free. Supports public posts, pages, and groups. HD quality, no signup.",
    tags: "facebook,video-downloader,reels,free,hd",
  },
  {
    url: `${SITE_URL}/twitter-video-downloader`,
    title: "Twitter / X Video Downloader — DropZap",
    desc: "Download any Twitter or X video in HD. Grab videos from tweets in the best available resolution with one click. Free.",
    tags: "twitter,x,video-downloader,tweets,free",
  },
  {
    url: `${SITE_URL}/reddit-video-downloader`,
    title: "Reddit Video Downloader with Audio — DropZap",
    desc: "Download Reddit videos with audio merged into a single MP4. Reddit stores video and audio separately; DropZap combines them automatically.",
    tags: "reddit,video-downloader,audio,mp4,free",
  },
  {
    url: `${SITE_URL}/mp3-converter`,
    title: "Free Video to MP3 Converter Online — DropZap",
    desc: "Convert any video file to MP3 audio online. Upload a video or paste a link and get a high-quality MP3 in seconds. No signup, no app install.",
    tags: "mp3,converter,video-to-audio,free,online",
  },
];

async function bookmarkOnDiigo(bookmark, username, apiKey, dryRun) {
  if (dryRun) {
    console.log(`[Diigo DRY RUN] Would bookmark: ${bookmark.url}`);
    return true;
  }

  const auth = Buffer.from(`${username}:${apiKey}`).toString("base64");
  const params = new URLSearchParams({
    url: bookmark.url,
    title: bookmark.title,
    desc: bookmark.desc,
    tags: bookmark.tags,
    shared: "yes",
    readLater: "no",
  });

  const res = await fetch(`https://secure.diigo.com/api/v2/bookmarks?${params.toString()}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const text = await res.text();

  if (res.ok) {
    console.log(`✅ Diigo bookmarked: ${bookmark.url}`);
    return true;
  } else if (res.status === 400 && text.includes("exist")) {
    console.log(`ℹ️  Diigo already has: ${bookmark.url} (skipping duplicate)`);
    return true;
  } else {
    console.error(`❌ Diigo failed (${res.status}): ${text.slice(0, 200)}`);
    return false;
  }
}

export async function runDiigoBookmarks(dryRun = false) {
  const username = process.env.DIIGO_USERNAME;
  const apiKey = process.env.DIIGO_API_KEY;

  if (!username || !apiKey) {
    console.error(
      "❌ Diigo: DIIGO_USERNAME or DIIGO_API_KEY not set.\n" +
        "   Get your API key at: https://www.diigo.com/api_keys/new/"
    );
    return;
  }

  console.log(`\n📎 Diigo — submitting ${DROPZAP_BOOKMARKS.length} bookmark(s)…`);

  for (const bookmark of DROPZAP_BOOKMARKS) {
    await bookmarkOnDiigo(bookmark, username, apiKey, dryRun);
    await sleep(20000); // Diigo rate limit: ~3 requests/minute
  }

  console.log("✅ Diigo bookmarks done.");
}
