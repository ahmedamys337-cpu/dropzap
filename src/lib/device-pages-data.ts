// Device-specific / use-case landing pages.
//
// These pages target very specific long-tail queries like:
//   "how to download instagram reels on iphone"
//   "download tiktok without watermark android"
//   "reddit video downloader with sound"
//
// Search intent here is razor-sharp: the user already knows they want
// to download X on platform Y. The page just needs to walk them
// through it cleanly with platform-specific gotchas (e.g. iPhone's
// Files-vs-Camera-Roll friction, Reddit's separate-audio problem).
//
// All 5 pages share the same React template and pull copy from this
// file, so a single edit propagates to every device variant.

export interface DevicePageFAQ {
  q: string;
  a: string;
}
export interface DevicePageStep {
  name: string;
  text: string;
}

export interface DevicePage {
  /** URL slug under the parent tool route, e.g. "iphone" or "with-sound". */
  slug: string;
  /** The base tool path the breadcrumb returns to. */
  toolPath: string;
  /** Tool name shown in breadcrumbs and copy, e.g. "Instagram Downloader". */
  toolName: string;
  /** Friendly label of the device/use-case, e.g. "iPhone" or "With Sound". */
  variantLabel: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  /** Visible H1. */
  h1: string;
  /** Lead paragraph under the H1 (~50-80 words). */
  intro: string;
  /** Long-form sections rendered as <h2> + paragraphs. */
  sections: { heading: string; html: string }[];
  /** HowTo steps — also emitted as HowTo JSON-LD. */
  howToSteps: DevicePageStep[];
  /** FAQs — also emitted as FAQPage JSON-LD. */
  faq: DevicePageFAQ[];
  /** Slugs of related blog posts. */
  relatedBlogPosts: string[];
  /** Last review date (ISO YYYY-MM-DD). */
  dateModified: string;
}

// Map: parent tool path -> array of device pages under it.
// The Next.js routes use a [device] dynamic segment that calls into
// this data structure to find the matching page.
export const devicePages: Record<string, DevicePage[]> = {
  // ===================================================================
  // /instagram-downloader/[device]
  // ===================================================================
  "/instagram-downloader": [
    {
      slug: "iphone",
      toolPath: "/instagram-downloader",
      toolName: "Instagram Downloader",
      variantLabel: "iPhone",
      metaTitle: "Download Instagram Reels on iPhone — No App Required (2026)",
      metaDescription:
        "How to download Instagram Reels and photos on iPhone using Safari. Save Reels to Camera Roll without an app, login, or watermark. Step-by-step guide for iOS 17+.",
      keywords: [
        "download instagram reels on iphone",
        "instagram reels iphone no app",
        "save instagram reel to camera roll",
        "instagram downloader iphone",
        "ig reel download safari",
      ],
      h1: "How to Download Instagram Reels on iPhone — No App Required",
      intro:
        "iPhone makes Instagram downloads feel harder than they should. The Instagram app has no built-in save button, the App Store is full of sketchy \"IG saver\" apps that disappear after a week, and Safari saves files to the Files app instead of your Camera Roll. This guide shows you the fastest, app-free way to save Instagram Reels and photos on iPhone using DropZap in Safari.",
      sections: [
        {
          heading: "Why iPhone makes Instagram downloads tricky",
          html: `
<p>On Android, downloaded videos automatically appear in your Gallery and can be edited or shared like any other media file. On iPhone, things are different — for security reasons, Safari saves all browser downloads into the Files app rather than the Camera Roll. That means after you download an Instagram Reel through any web tool, you have one extra tap to move it from Files into Photos.</p>
<p>The other catch: most iPhone-specific Instagram saver apps in the App Store either require an Instagram login (don't give them your password), expire after a few days, or charge a subscription. DropZap avoids both problems by being a website, not an app — and it never asks for your Instagram credentials.</p>
          `.trim(),
        },
        {
          heading: "The fast method: DropZap in Safari",
          html: `
<p>The complete download flow on iPhone takes about 15 seconds:</p>
<ol>
<li>Open the Instagram app, find the Reel or photo, tap the share arrow → <strong>Copy Link</strong>.</li>
<li>Open <strong>Safari</strong> on your iPhone and go to <a href="/instagram-downloader">dropzap.digital/instagram-downloader</a>.</li>
<li>Tap and hold on the URL field, then tap <strong>Paste</strong>.</li>
<li>Tap <strong>Download</strong>. Safari will show a download progress indicator at the top right.</li>
<li>The file is now in your <strong>Files app</strong> under <em>Downloads</em>. Move it to Camera Roll using the steps below.</li>
</ol>
<p>For Reels and IGTV videos, use the <strong>Reel & Video Downloader</strong> field. For single photos and multi-slide carousels, use the <strong>Photos & Carousel Downloader</strong> field — carousels download as a ZIP file containing every slide at original quality.</p>
          `.trim(),
        },
        {
          heading: "Moving downloaded videos from Files to Camera Roll",
          html: `
<p>After the download finishes:</p>
<ol>
<li>Open the <strong>Files</strong> app on your iPhone.</li>
<li>Tap <strong>Browse</strong> at the bottom, then tap <strong>Downloads</strong> under "On My iPhone" or "iCloud Drive".</li>
<li>Find the <code>.mp4</code> file you just saved (it'll be the most recent).</li>
<li>Tap and hold on the file → <strong>Share</strong> → <strong>Save Video</strong>.</li>
<li>The video now appears in your Camera Roll, ready to view, share, or edit.</li>
</ol>
<p>For photos, the flow is identical except the share-sheet option says "Save Image" instead of "Save Video". For ZIPs containing carousel slides, tap the ZIP file in Files first to expand it — iOS unzips automatically — then save each photo from the unzipped folder.</p>
          `.trim(),
        },
        {
          heading: "Common iPhone errors and how to fix them",
          html: `
<p><strong>"Can't connect to server"</strong> — Usually a sign that you copied the link from inside the Instagram app's preview rather than using the share sheet. Open the Reel directly in the Instagram app, tap the share arrow, then tap Copy Link. Don't paste a link from a web preview or screenshot.</p>
<p><strong>"This account is private"</strong> — DropZap can only download publicly accessible Instagram content. No external tool can download from private accounts; that requires you to follow the account inside the Instagram app and use Instagram's own save feature.</p>
<p><strong>"Download stuck at 0%"</strong> — On iOS, low storage can silently fail downloads. Check Settings → General → iPhone Storage. If you have less than 1 GB free, free up space and try again.</p>
<p><strong>The Reel saved as MP4 won't play in Camera Roll</strong> — Refresh the Photos app by closing it (swipe up) and reopening. iPhone sometimes takes a few seconds to index newly added videos.</p>
          `.trim(),
        },
      ],
      howToSteps: [
        {
          name: "Copy the Instagram Reel link",
          text: "Open the Instagram app, find the Reel or photo post, tap the share arrow (paper-airplane icon), then tap Copy Link.",
        },
        {
          name: "Open DropZap in Safari",
          text: "Launch Safari on your iPhone and go to dropzap.digital/instagram-downloader. Use Reel & Video field for videos, Photos & Carousel for photos.",
        },
        {
          name: "Paste and tap Download",
          text: "Tap and hold the URL field, tap Paste, then tap Download. Safari saves the MP4 or ZIP to the Files app.",
        },
        {
          name: "Move the file to Camera Roll",
          text: "Open Files app → Downloads, tap and hold the file, tap Share → Save Video (or Save Image). The file now lives in your Camera Roll.",
        },
      ],
      faq: [
        {
          q: "Do I need an app to download Instagram Reels on iPhone?",
          a: "No. DropZap works in Safari without any app installation. The Instagram app does not have a built-in save button for other people's Reels, but you can use any browser — Safari is recommended on iOS — to download via dropzap.digital.",
        },
        {
          q: "Why does Safari save the Reel to Files instead of Camera Roll?",
          a: "iOS sandboxes Safari downloads to the Files app for security. To move an MP4 to Camera Roll: open Files app → Downloads → tap-and-hold the file → Share → Save Video. The video then appears in Photos.",
        },
        {
          q: "Can I download an Instagram carousel (multiple photos) at once on iPhone?",
          a: "Yes. Paste any carousel URL into DropZap's Photos & Carousel field. The result is a single ZIP file with every slide at original resolution. Tap the ZIP in Files app to extract the photos automatically, then save each to Camera Roll.",
        },
        {
          q: "Is DropZap safe to use on iPhone? Does it ask for my Instagram password?",
          a: "DropZap never asks for your Instagram credentials. You only paste the public URL of the post you want to download. There is no login, no account access, and no data collection beyond standard web analytics.",
        },
        {
          q: "Can I save Instagram Stories on iPhone with DropZap?",
          a: "Yes for public Stories. Paste the Story URL into DropZap. Stories from private accounts are not accessible to any external tool — that's an Instagram-side restriction, not a DropZap one.",
        },
      ],
      relatedBlogPosts: [
        "how-to-download-instagram-reels-on-iphone",
        "how-to-download-instagram-carousel",
      ],
      dateModified: "2026-05-09",
    },
    {
      slug: "android",
      toolPath: "/instagram-downloader",
      toolName: "Instagram Downloader",
      variantLabel: "Android",
      metaTitle: "Download Instagram Reels on Android — Chrome Guide 2026",
      metaDescription:
        "Save Instagram Reels and photos on Android using Chrome. No app, no login, no watermark. Files auto-save to your Gallery. Step-by-step guide for any Android phone.",
      keywords: [
        "download instagram reels android",
        "instagram downloader android",
        "save ig reel to gallery android",
        "android instagram reel download",
        "ig downloader chrome",
      ],
      h1: "How to Download Instagram Reels on Android (Chrome, No App)",
      intro:
        "Downloading Instagram Reels on Android is dramatically easier than on iPhone. Chrome saves files directly to your Downloads folder, and Android automatically indexes new videos and photos into the Gallery app within seconds. This guide walks through using DropZap in Chrome on any Android phone — Samsung, Pixel, OnePlus, Xiaomi, anything — with no app installation and no Instagram login.",
      sections: [
        {
          heading: "Why Android is the easiest platform for Instagram downloads",
          html: `
<p>Unlike iOS, Android lets browsers save files directly to a shared Downloads folder, and the system MediaScanner automatically picks up new videos and photos and adds them to the Gallery. So once a Reel finishes downloading in Chrome, it's already showing up in Google Photos or Samsung Gallery — no extra steps required.</p>
<p>This also means you can completely skip the dodgy "IG saver" apps in the Play Store. Most of them request unnecessary permissions (contacts, SMS, microphone) or trigger ads aggressively. A web-based tool like DropZap has none of these risks — it's just a website that hands you a video file.</p>
          `.trim(),
        },
        {
          heading: "Step-by-step: Instagram Reel to Android Gallery",
          html: `
<p>Total time: about 10 seconds.</p>
<ol>
<li>Open the Instagram app, find the Reel or photo post, tap the paper-airplane icon → <strong>Copy Link</strong>.</li>
<li>Open <strong>Chrome</strong> (or any Android browser) and go to <a href="/instagram-downloader">dropzap.digital/instagram-downloader</a>.</li>
<li>Long-press the URL field → <strong>Paste</strong>.</li>
<li>Tap <strong>Download</strong>. Chrome shows a download notification.</li>
<li>The Reel is now in your Gallery (Google Photos or Samsung Gallery, depending on phone) and also in the Downloads folder accessible via Files / My Files.</li>
</ol>
<p>For carousels (multi-photo posts), use the <strong>Photos & Carousel</strong> field. The result is a ZIP file in your Downloads folder. Open it via your file manager — Android's built-in file managers handle ZIP extraction natively.</p>
          `.trim(),
        },
        {
          heading: "Where exactly does the file go?",
          html: `
<p>Chrome on Android saves all browser downloads to <code>/Internal storage/Download/</code>. You can find files there using:</p>
<ul>
<li><strong>Files by Google</strong> — built into Pixel and most Android phones.</li>
<li><strong>My Files</strong> — Samsung's built-in file manager.</li>
<li><strong>Mi File Manager</strong> — Xiaomi.</li>
</ul>
<p>For videos and photos specifically, Android's media indexer also shows them in:</p>
<ul>
<li><strong>Google Photos</strong> → "On device" or "Library" tab.</li>
<li><strong>Samsung Gallery</strong> → "Albums" → "Download" (or sometimes "DropZap" or "Pictures" depending on phone).</li>
</ul>
          `.trim(),
        },
        {
          heading: "Common Android-specific issues",
          html: `
<p><strong>The video doesn't appear in Gallery</strong> — Restart the phone, or open Files by Google and tap-and-hold the MP4 → Move → DCIM → Camera. That forces the video into the camera-roll album.</p>
<p><strong>Chrome blocks the download</strong> — Chrome occasionally flags video downloads from unknown sites. Tap Keep when the warning appears. DropZap is safe — it serves only the original Instagram CDN file with no modifications.</p>
<p><strong>Permission denied on Android 13+</strong> — Android 13 introduced finer-grained media permissions. If Chrome can't save downloads, go to Settings → Apps → Chrome → Permissions and enable "Photos and videos" / "Music and audio".</p>
<p><strong>Carousel ZIP won't open</strong> — Android's default file managers can extract ZIPs, but if yours can't, install the free <em>Files by Google</em> app, which handles ZIPs natively.</p>
          `.trim(),
        },
      ],
      howToSteps: [
        {
          name: "Copy the Instagram link",
          text: "In the Instagram app, tap the share arrow on the Reel or post, then Copy Link.",
        },
        {
          name: "Open DropZap in Chrome",
          text: "Go to dropzap.digital/instagram-downloader in Chrome (or any Android browser).",
        },
        {
          name: "Paste and Download",
          text: "Long-press the URL field, tap Paste, then tap Download. Chrome saves the file to the Downloads folder.",
        },
        {
          name: "Find it in Gallery",
          text: "The Reel automatically appears in Google Photos or Samsung Gallery. The Downloads folder is also accessible via Files by Google or My Files.",
        },
      ],
      faq: [
        {
          q: "Where does Chrome save Instagram downloads on Android?",
          a: "Chrome saves all downloads to /Internal storage/Download/. You can browse them via Files by Google, Samsung's My Files, or any other Android file manager. Videos and photos also appear automatically in Google Photos or your phone's Gallery app.",
        },
        {
          q: "Do I need a third-party Instagram saver app on Android?",
          a: "No. DropZap is a website, not an app — open it in Chrome and download. Most Play Store \"IG saver\" apps are unnecessary, request invasive permissions, or are ad-supported in aggressive ways.",
        },
        {
          q: "Why doesn't the downloaded Reel appear in my Gallery immediately?",
          a: "Android's media indexer (MediaScanner) usually takes 5-10 seconds to pick up new files. If it still doesn't show after a minute, try restarting the phone or moving the file to /DCIM/Camera/ via a file manager.",
        },
        {
          q: "Does DropZap work on Samsung Internet, Firefox, or Brave?",
          a: "Yes. DropZap is a standard website with no browser-specific requirements. Chrome, Samsung Internet, Firefox, Brave, Edge, and DuckDuckGo all work identically on Android.",
        },
        {
          q: "Can I download the audio from an Instagram Reel as MP3?",
          a: "Yes. Use DropZap's MP3 Converter tab on the homepage — paste the Reel URL and choose MP3 output. The converter extracts the audio track and saves it as a standalone MP3 file.",
        },
      ],
      relatedBlogPosts: [
        "how-to-download-instagram-reels-on-iphone",
        "how-to-download-instagram-carousel",
      ],
      dateModified: "2026-05-09",
    },
  ],

  // ===================================================================
  // /tiktok-downloader/[device]
  // ===================================================================
  "/tiktok-downloader": [
    {
      slug: "iphone",
      toolPath: "/tiktok-downloader",
      toolName: "TikTok Downloader",
      variantLabel: "iPhone",
      metaTitle: "Download TikTok Without Watermark on iPhone (Safari, No App)",
      metaDescription:
        "Save TikTok videos without the watermark on iPhone using Safari. No app, no login. Move from Files to Camera Roll in one tap. Step-by-step iOS guide.",
      keywords: [
        "tiktok download iphone no watermark",
        "save tiktok to iphone safari",
        "tiktok no watermark iphone",
        "iphone tiktok downloader",
        "tiktok video saver ios",
      ],
      h1: "Download TikTok Videos Without Watermark on iPhone",
      intro:
        "The TikTok iOS app has a built-in Save Video option, but it stamps a fat watermark across every video and adds a TikTok logo intro. If you want a clean, watermark-free MP4 to repost or edit, you need to skip TikTok's built-in saver and use a web tool instead. DropZap downloads watermark-free TikTok videos in 3 seconds straight from your iPhone's Safari browser — no app, no Apple ID required.",
      sections: [
        {
          heading: "Why TikTok puts watermarks on saved videos",
          html: `
<p>When you tap Save Video inside the TikTok iOS app, TikTok runs the video through a watermarking pipeline that overlays the @username and the TikTok logo before delivering the file. This is intentional — TikTok wants saved videos to drive traffic back to TikTok if they're reshared elsewhere.</p>
<p>The original, watermark-free version of every TikTok video also exists on TikTok's CDN — the watermarking is applied at the moment of save, not at the moment of upload. Tools like DropZap fetch the un-watermarked source file directly, before the watermarking pipeline touches it.</p>
          `.trim(),
        },
        {
          heading: "Step-by-step: clean TikTok download on iPhone",
          html: `
<p>About 10 seconds end-to-end:</p>
<ol>
<li>Open the TikTok app on your iPhone, find the video, tap the share arrow (paper-airplane icon) → <strong>Copy Link</strong>.</li>
<li>Open <strong>Safari</strong> and go to <a href="/tiktok-downloader">dropzap.digital/tiktok-downloader</a>.</li>
<li>Tap and hold the URL field → <strong>Paste</strong>.</li>
<li>Tap <strong>Download</strong>. The file appears in your Files app within 3-5 seconds.</li>
<li>Open Files → Downloads → tap-and-hold the MP4 → <strong>Share</strong> → <strong>Save Video</strong> to move it to Camera Roll.</li>
</ol>
<p>The result is a clean MP4 with no TikTok logo, no @username overlay, no intro splash. Standard 1080×1920 vertical resolution at the original quality TikTok ingested.</p>
          `.trim(),
        },
        {
          heading: "iPhone-specific quirks worth knowing",
          html: `
<p><strong>Files app vs Camera Roll</strong> — Safari downloads always land in Files first, never directly in Photos. This is a system-level iOS security restriction, not something DropZap can change. The two-tap move described above is required for every browser-downloaded video on iOS, regardless of which downloader you use.</p>
<p><strong>Save shortcut</strong> — If you save TikToks frequently, create an iOS Shortcut: Settings → Shortcuts → New Shortcut → Add "Save File to Photos" → Set input to URL. This lets you trigger a 1-tap save from the share sheet, but it still requires Safari to download the file first.</p>
<p><strong>iCloud Drive vs On My iPhone</strong> — Safari sometimes saves downloads to iCloud Drive instead of On My iPhone, depending on iOS settings. Both work the same in Files app — just check both folders if you can't find a recent download.</p>
          `.trim(),
        },
        {
          heading: "Is downloading TikTok videos on iPhone legal?",
          html: `
<p>Personal use of downloaded TikTok videos — saving for later viewing, sending to a friend, archiving — is generally allowed under fair-use principles in most jurisdictions. What's <em>not</em> allowed:</p>
<ul>
<li><strong>Reposting as your own.</strong> Reuploading someone else's TikTok to your account or another platform without credit can violate copyright.</li>
<li><strong>Commercial use.</strong> Using a downloaded TikTok in advertising or paid content without permission from the original creator.</li>
<li><strong>Scraping at scale.</strong> Downloading thousands of TikToks from a single creator using automation may violate TikTok's Terms of Service.</li>
</ul>
<p>For personal saves to your own Camera Roll, downloading is fine. Always credit the original creator if you reshare.</p>
          `.trim(),
        },
      ],
      howToSteps: [
        {
          name: "Copy the TikTok video link",
          text: "Tap the share arrow on the TikTok video, then Copy Link. Both vm.tiktok.com short links and full tiktok.com URLs work.",
        },
        {
          name: "Open DropZap in Safari",
          text: "In Safari on iPhone, go to dropzap.digital/tiktok-downloader.",
        },
        {
          name: "Paste and tap Download",
          text: "Paste the URL into the field and tap Download. The watermark-free MP4 saves to the Files app in 3-5 seconds.",
        },
        {
          name: "Move to Camera Roll",
          text: "Open Files app → Downloads → tap-and-hold the MP4 → Share → Save Video. The video now lives in your Camera Roll.",
        },
      ],
      faq: [
        {
          q: "Does DropZap really remove the TikTok watermark?",
          a: "Yes. DropZap fetches videos directly from TikTok's source CDN before the watermarking pipeline runs. The result is a clean MP4 with no @username overlay and no TikTok logo.",
        },
        {
          q: "Do I need to install an app on iPhone to download TikTok without watermark?",
          a: "No. DropZap is a website that works in Safari on iPhone. Skip the App Store entirely — most TikTok-saver apps are ad-heavy or violate the App Store guidelines and get pulled regularly.",
        },
        {
          q: "Why does my saved TikTok go to Files instead of Camera Roll on iPhone?",
          a: "Safari sandboxes downloads to Files for security — that's an iOS-wide rule, not specific to DropZap. To move to Camera Roll: Files app → Downloads → tap-and-hold the MP4 → Share → Save Video.",
        },
        {
          q: "Is this faster than TikTok's built-in Save Video on iPhone?",
          a: "DropZap takes 3-5 seconds, similar to TikTok's built-in saver. The difference is the file is watermark-free and goes through a normal browser download instead of TikTok's app pipeline.",
        },
        {
          q: "Can I download TikTok slideshows on iPhone with DropZap?",
          a: "Yes. TikTok image-slideshow posts download as a sequence of images, packaged as a ZIP file when there are multiple slides. Open the ZIP in Files → save individual images to Camera Roll.",
        },
      ],
      relatedBlogPosts: [
        "how-to-download-tiktok-without-watermark",
        "how-to-save-tiktok-to-camera-roll",
        "best-tiktok-downloader-no-watermark",
      ],
      dateModified: "2026-05-09",
    },
    {
      slug: "android",
      toolPath: "/tiktok-downloader",
      toolName: "TikTok Downloader",
      variantLabel: "Android",
      metaTitle: "Download TikTok Without Watermark on Android (Chrome, No App)",
      metaDescription:
        "Save TikTok videos without the watermark on Android using Chrome. No app required. Files auto-save to your Gallery. Works on Samsung, Pixel, Xiaomi, OnePlus, all Android phones.",
      keywords: [
        "tiktok download android no watermark",
        "tiktok no watermark android",
        "android tiktok saver",
        "tiktok downloader chrome android",
        "save tiktok to gallery android",
      ],
      h1: "Download TikTok Without Watermark on Android",
      intro:
        "Saving TikTok videos without watermark on Android is straightforward: paste the link into DropZap in Chrome, tap Download, and the clean MP4 lands in your Gallery automatically. No app, no Play Store install, no Google account required. This guide covers the exact steps plus a few Android-specific tips.",
      sections: [
        {
          heading: "Why Android is ideal for watermark-free TikTok downloads",
          html: `
<p>Android's open file system means browser downloads go to a shared Downloads folder that the entire system can read. The Android MediaScanner picks up new MP4s automatically and adds them to your Gallery within seconds. So once DropZap finishes saving a TikTok, the video is already viewable in Google Photos or Samsung Gallery — no manual move required.</p>
<p>Android also lets you bypass the Play Store entirely. There are dozens of TikTok-saver APKs floating around (TikSave, TikMate, SnapTik for Android, etc.) but most are unnecessary, request way too many permissions (contacts, SMS, location), or stop working when TikTok updates its API. A web tool sidesteps all of that.</p>
          `.trim(),
        },
        {
          heading: "Step-by-step: clean TikTok to Android Gallery",
          html: `
<ol>
<li>Open the TikTok app on Android, find the video, tap the share arrow → <strong>Copy Link</strong>.</li>
<li>Open <strong>Chrome</strong> and go to <a href="/tiktok-downloader">dropzap.digital/tiktok-downloader</a>.</li>
<li>Long-press the URL field → <strong>Paste</strong>.</li>
<li>Tap <strong>Download</strong>. Chrome shows a download notification.</li>
<li>The watermark-free MP4 appears in your Gallery (Google Photos / Samsung Gallery / Mi Gallery) and in the Downloads folder.</li>
</ol>
<p>The whole process takes 5-8 seconds. The output file is a standard 1080×1920 vertical MP4 with no TikTok logo, no @username, no intro overlay.</p>
          `.trim(),
        },
        {
          heading: "Where the file is stored on Android",
          html: `
<p>Chrome saves to <code>/Internal storage/Download/</code> by default. You can find your downloaded TikTok via:</p>
<ul>
<li><strong>Files by Google</strong> → Downloads tab.</li>
<li><strong>Samsung My Files</strong> → Downloads.</li>
<li><strong>Mi File Manager</strong> → Downloads.</li>
<li><strong>Google Photos</strong> → Library → Downloads or Library → On device.</li>
<li><strong>Samsung Gallery</strong> → Albums → Download (or "Pictures").</li>
</ul>
<p>If you want all your downloaded TikToks in one neat folder, you can move them to <code>/DCIM/Camera/</code> via a file manager — that's the same folder where TikTok's built-in saver puts videos.</p>
          `.trim(),
        },
        {
          heading: "Common Android issues and fixes",
          html: `
<p><strong>"This file may harm your device"</strong> — Chrome occasionally warns on video downloads from unfamiliar domains. Tap <em>Keep</em>. DropZap serves only the original TikTok CDN file with no modification, so the file is safe.</p>
<p><strong>Video doesn't show in Gallery</strong> — On Android 13+ with stricter media permissions, you may need to grant Chrome permission to write to Photos. Settings → Apps → Chrome → Permissions → Photos and videos → Allow.</p>
<p><strong>Download stalls</strong> — Most often a flaky network rather than a tool issue. Switch from mobile data to Wi-Fi (or vice versa) and retry. TikTok's CDN occasionally throttles a single IP that's downloading rapidly.</p>
<p><strong>Slideshows don't download as a video</strong> — TikTok slideshows are technically a sequence of images, not a video. DropZap returns them as a ZIP file containing each slide. Use a file manager to extract the ZIP, or install Files by Google which extracts ZIPs in one tap.</p>
          `.trim(),
        },
      ],
      howToSteps: [
        {
          name: "Copy the TikTok link",
          text: "Tap the share arrow on the TikTok video → Copy Link. Both full URLs and short vm.tiktok.com links work.",
        },
        {
          name: "Open DropZap in Chrome",
          text: "Go to dropzap.digital/tiktok-downloader in Chrome on Android.",
        },
        {
          name: "Paste and Download",
          text: "Long-press the URL field → Paste, then tap Download. The MP4 saves to your Downloads folder.",
        },
        {
          name: "Find it in Gallery",
          text: "Google Photos and Samsung Gallery automatically index the new MP4 within 5-10 seconds. Or browse via Files by Google → Downloads.",
        },
      ],
      faq: [
        {
          q: "Is DropZap better than TikSave or other Android APKs?",
          a: "DropZap is a website, so there's nothing to install — no APK, no permissions, no Play Store account. APK-based TikTok savers often request unnecessary permissions and stop working when TikTok updates its API. DropZap is updated server-side within days of any TikTok change.",
        },
        {
          q: "Where does Chrome save TikTok downloads on Android?",
          a: "Chrome saves to /Internal storage/Download/. The MP4 also appears automatically in Google Photos and your phone's default Gallery app, since Android's MediaScanner indexes new media files automatically.",
        },
        {
          q: "Can I download TikTok slideshows (image posts) on Android?",
          a: "Yes. TikTok slideshow posts download as a ZIP file containing each image as a separate JPG. Use Files by Google or your built-in file manager to extract the ZIP.",
        },
        {
          q: "Does this work on Samsung, Pixel, Xiaomi, OnePlus, etc.?",
          a: "Yes. DropZap is a standard website that works in any Android browser on any Android phone, regardless of manufacturer. The Files app and Gallery app names differ by phone (Samsung calls it My Files / Gallery, Xiaomi calls it Mi File Manager / Mi Gallery, etc.) but the workflow is identical.",
        },
        {
          q: "Can I bulk-download multiple TikTok videos on Android?",
          a: "Yes. DropZap has a Bulk Downloader on the homepage. Paste multiple TikTok URLs (one per line) and the queue downloads them sequentially. All files land in the Downloads folder.",
        },
      ],
      relatedBlogPosts: [
        "how-to-download-tiktok-without-watermark",
        "best-tiktok-downloader-no-watermark",
      ],
      dateModified: "2026-05-09",
    },
  ],

  // ===================================================================
  // /reddit-video-downloader/[useCase]
  // ===================================================================
  "/reddit-video-downloader": [
    {
      slug: "with-sound",
      toolPath: "/reddit-video-downloader",
      toolName: "Reddit Video Downloader",
      variantLabel: "With Sound",
      metaTitle: "Download Reddit Videos With Sound — Audio Merge Fixed (2026)",
      metaDescription:
        "Reddit videos download silent? DropZap automatically merges Reddit's separate audio and video streams into a single MP4 with full sound. No silent downloads, ever.",
      keywords: [
        "reddit video downloader with sound",
        "reddit video no audio fix",
        "reddit video silent download",
        "download reddit video sound",
        "reddit dash audio merge",
      ],
      h1: "Download Reddit Videos With Sound",
      intro:
        "If you've ever downloaded a Reddit video and ended up with a silent MP4, you've hit one of the internet's quietly annoying technical quirks: Reddit stores video and audio as two completely separate files, and most downloaders only grab the video stream. DropZap solves this by automatically downloading both streams and merging them into a single MP4 with full audio — no extra steps, no command line, no missing-sound surprises.",
      sections: [
        {
          heading: "Why Reddit videos download without sound",
          html: `
<p>Reddit uses a video format called <strong>DASH</strong> (Dynamic Adaptive Streaming over HTTP). DASH splits a video into separate audio and video tracks so the streaming player can pick the best quality combination on the fly based on your connection speed. This is great for streaming — but it means the video file and the audio file are two separate URLs on Reddit's servers.</p>
<p>When a basic downloader scrapes a Reddit post, it typically grabs only the video URL because that's what's most visible in the page's HTML. The audio URL is referenced separately in the DASH manifest. Result: a download that looks fine but plays in dead silence.</p>
<p>The fix requires three steps: download the video stream, download the audio stream, and use a tool like FFmpeg to mux them into a single MP4 container with both tracks. DropZap does all three automatically, so what you get is a single MP4 with picture and sound, ready to play in any media player.</p>
          `.trim(),
        },
        {
          heading: "How DropZap merges Reddit video and audio",
          html: `
<p>Behind the scenes, when you paste a Reddit video URL into DropZap:</p>
<ol>
<li>DropZap fetches the DASH manifest for the post.</li>
<li>It identifies the highest-quality video stream available (usually 720p or 1080p).</li>
<li>It identifies the matching audio stream (DASH audio is typically AAC at 128kbps).</li>
<li>FFmpeg muxes both streams into a single MP4 file using the H.264 video codec and AAC audio codec — no re-encoding, so quality is preserved exactly.</li>
<li>The merged MP4 streams to your browser as the final download.</li>
</ol>
<p>The whole process takes 5-10 seconds for typical Reddit videos. There's no upload, no server-side storage, and no quality loss because the streams are remuxed (container repackaged) rather than re-encoded.</p>
          `.trim(),
        },
        {
          heading: "Step-by-step: download a Reddit video with sound",
          html: `
<ol>
<li>Open the Reddit post (mobile app or browser).</li>
<li>Tap <strong>Share</strong> → <strong>Copy Link</strong>. The URL looks like reddit.com/r/SubName/comments/abc123/title or v.redd.it/xyz.</li>
<li>Go to <a href="/reddit-video-downloader">dropzap.digital/reddit-video-downloader</a>.</li>
<li>Paste the URL → tap <strong>Download</strong>.</li>
<li>The merged MP4 — with full audio — saves to your device in 5-10 seconds.</li>
</ol>
<p>Both reddit.com URLs and v.redd.it short URLs work. Cross-posts also work — DropZap follows the cross-post chain to the original video.</p>
          `.trim(),
        },
        {
          heading: "Why other Reddit downloaders fail",
          html: `
<p>Most browser-extension-style Reddit downloaders only handle the simple cases: GIF posts (which are actually MP4 videos with no audio track to begin with) and old i.redd.it images. The moment you try to download a v.redd.it video, they fail silently — they grab the video stream and skip the audio without warning the user.</p>
<p>The few extensions that do attempt audio merging usually run FFmpeg in the browser via WebAssembly, which is slow (30+ seconds for a 1-minute video) and consumes huge amounts of RAM. DropZap runs the merge server-side using a native FFmpeg binary, so it's 5-10x faster and works on any device including low-end phones.</p>
          `.trim(),
        },
        {
          heading: "Troubleshooting silent Reddit downloads",
          html: `
<p><strong>The downloaded MP4 still has no sound</strong> — Verify you used DropZap's Reddit field specifically (some tools have separate fields per platform). Other downloaders may not merge audio. If using DropZap and you got silent output, the original Reddit post may not have had audio (some Reddit videos are uploaded without an audio track from the start — common for GIF-style posts).</p>
<p><strong>Audio plays in VLC but not iPhone Photos</strong> — This is rare but happens when an audio codec is exotic. Re-download via DropZap; the AAC output should play in any iOS or Android media player.</p>
<p><strong>Cross-post returns the wrong video</strong> — Use the URL of the <em>original</em> post, not the cross-post wrapper. Click through cross-posts until you reach the post that hosts the video, then copy that URL.</p>
<p><strong>"Video not found"</strong> — The post may have been deleted, the subreddit may be private, or the video may be NSFW-gated and require account login. DropZap can only access publicly available content.</p>
          `.trim(),
        },
      ],
      howToSteps: [
        {
          name: "Copy the Reddit post URL",
          text: "Open the Reddit post → Share → Copy Link. Both reddit.com/r/... and v.redd.it/... URLs work. Cross-posts also work; DropZap follows them to the source.",
        },
        {
          name: "Paste into DropZap",
          text: "Go to dropzap.digital/reddit-video-downloader. Paste the URL into the field.",
        },
        {
          name: "Tap Download",
          text: "DropZap downloads both the video and audio DASH streams from Reddit and merges them with FFmpeg in one step.",
        },
        {
          name: "Save the MP4",
          text: "The merged MP4 — with full audio — downloads to your device in 5-10 seconds. No silent files.",
        },
      ],
      faq: [
        {
          q: "Why do Reddit videos always download without sound from other tools?",
          a: "Reddit uses DASH streaming, which stores video and audio as separate files. Most downloaders only fetch the video stream. To get sound you need to download both streams and merge them with FFmpeg. DropZap does this automatically, so the resulting MP4 always has full audio.",
        },
        {
          q: "Does DropZap re-encode the Reddit video?",
          a: "No. DropZap muxes (repackages) the existing H.264 video stream and AAC audio stream into a single MP4 container without re-encoding. Quality is identical to the original — there is no compression loss.",
        },
        {
          q: "Can DropZap download NSFW Reddit videos with sound?",
          a: "DropZap can download any publicly accessible Reddit video. NSFW posts that require an account login (some subreddits gate NSFW content behind sign-in) cannot be downloaded by any external tool, since they need authenticated access.",
        },
        {
          q: "What about Reddit GIF posts — do they have audio?",
          a: "Some do, some don't. Reddit converts uploaded GIFs to MP4, but the source GIF format has no audio. If a Reddit post was originally an MP4 with audio, DropZap returns it with sound. If it was originally a silent GIF, the resulting MP4 is also silent — that's not a tool issue.",
        },
        {
          q: "How long does the audio-merge process take?",
          a: "Typically 5-10 seconds for a 1-2 minute Reddit video. Longer videos take proportionally longer because the muxing step has to write the full file. There's no 30-second wait or progress bar trick — the time is just the actual merge.",
        },
      ],
      relatedBlogPosts: [
        "reddit-video-no-sound-fix",
      ],
      dateModified: "2026-05-09",
    },
  ],
};

/** Helper: find a device page by parent tool path + slug. */
export function findDevicePage(toolPath: string, slug: string): DevicePage | undefined {
  const pages = devicePages[toolPath];
  if (!pages) return undefined;
  return pages.find((p) => p.slug === slug);
}

/** Helper: list all device pages across all tools, for sitemap. */
export function listAllDevicePages(): { toolPath: string; page: DevicePage }[] {
  const out: { toolPath: string; page: DevicePage }[] = [];
  for (const toolPath of Object.keys(devicePages)) {
    for (const page of devicePages[toolPath]) {
      out.push({ toolPath, page });
    }
  }
  return out;
}
