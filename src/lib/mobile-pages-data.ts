// Mobile-specific landing pages: /iphone-video-downloader and
// /android-video-downloader.
//
// These target the highest-volume mobile-intent queries on the
// downloader topic — "video downloader iphone", "save instagram
// video to camera roll", "android video downloader no app", etc.
//
// Why dedicated pages instead of generic homepage:
//   1. Search intent is platform-specific. iPhone users want to
//      know about Files app vs Photos, Safari long-press vs share
//      sheet, and the "Save to Camera Roll" question. Android
//      users want Downloads folder, Chrome share menu, Gallery
//      sync, and external-storage permission concerns.
//   2. Google increasingly demands intent-matched pages (HCU). A
//      generic homepage that says "works on any device" ranks
//      worse than a dedicated page that walks through the iOS or
//      Android flow with screenshots and platform-specific FAQs.
//   3. Each page emits its own MobileApplication-adjacent schema
//      (we use SoftwareApplication with operatingSystem set), which
//      Google's Knowledge Graph reads as a "tool for [iOS/Android]"
//      signal.
//
// Both pages share the same template at app/[device]-video-
// downloader/page.tsx. Data lives here.

export interface MobileFAQ {
  q: string;
  a: string;
}

export interface MobileStep {
  name: string;
  text: string;
}

export interface MobilePlatformLink {
  label: string;
  href: string;
  /** Short blurb shown next to the link on the platform-grid card. */
  blurb: string;
}

export interface MobilePageData {
  /** URL slug. Final path is /<slug>. */
  slug: "iphone-video-downloader" | "android-video-downloader";
  /** Display name of the device family. */
  deviceLabel: "iPhone" | "Android";
  /** OS string used in SoftwareApplication.operatingSystem. */
  operatingSystem: "iOS" | "Android";
  /** Page <title>. */
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  /** Visible H1. */
  h1: string;
  /** Strict 1-2 sentence answer (TL;DR + LLM citation surface). */
  quickAnswer: string;
  /** 2-3 paragraph intro under H1. */
  intro: string;
  /**
   * Where the file ends up on this OS — explained explicitly because
   * "where did my download go?" is the #1 mobile downloader question.
   */
  whereFilesGo: {
    heading: string;
    body: string;
  };
  /** Generic step-by-step that works for any platform on this OS. */
  steps: MobileStep[];
  /**
   * OS-specific quirks / gotchas. Highly cite-friendly for LLMs
   * because they are concrete factual claims.
   */
  quirks: { title: string; body: string }[];
  /** FAQ block (also emitted as FAQPage JSON-LD). */
  faq: MobileFAQ[];
  /** Cross-links to platform tools, framed in OS-specific language. */
  platformLinks: MobilePlatformLink[];
  /** ISO YYYY-MM-DD date for dateModified. */
  dateModified: string;
}

export const mobilePages: MobilePageData[] = [
  // ====================================================================
  // iPhone
  // ====================================================================
  {
    slug: "iphone-video-downloader",
    deviceLabel: "iPhone",
    operatingSystem: "iOS",
    metaTitle:
      "iPhone Video Downloader (2026) — Save TikTok, Reels & Twitter Videos to Camera Roll",
    metaDescription:
      "Download videos from TikTok, Instagram Reels, Twitter / X, Facebook, and Reddit directly to your iPhone Camera Roll. No app install, no jailbreak, works on iOS 16, 17, and 18.",
    keywords: [
      "iphone video downloader",
      "video downloader for iphone",
      "save tiktok to camera roll iphone",
      "download instagram reels iphone",
      "ios video downloader no app",
      "save twitter video iphone",
    ],
    h1: "Video Downloader for iPhone — Save Any Social Video to Camera Roll",
    quickAnswer:
      "To download a video to iPhone, copy the video link from the source app, open dropzap.digital in Safari, paste the link, tap Download, then long-press the video and choose Save to Photos. The video is saved at full original quality directly to your Camera Roll — no app install required, works on iOS 16, 17, and 18.",
    intro:
      "DropZap is a 100% browser-based video downloader that works on every iPhone — from the iPhone SE running iOS 16 up through iPhone 16 Pro on iOS 18. There is nothing to install, no Apple ID prompt, no jailbreak, and no Shortcut to import. You paste a link in Safari and the file lands in your Camera Roll in about 10 seconds.\n\nApple does not let third-party browsers install Camera Roll save extensions, so the standard iOS save flow is intentionally a two-step process: download the file to the iOS file system, then save it to Photos using the share sheet. DropZap walks you through both steps and the entire path takes under a minute the first time and about 15 seconds once you have done it once.",
    whereFilesGo: {
      heading: "Where iPhone saves the file",
      body: 'When you tap "Save to Photos" from Safari\'s share sheet, the video lands in the Photos app under the Recents album, exactly like a video you recorded yourself. From there it auto-syncs to iCloud Photos (if enabled), shows up in the Photos tab of iMessage, and can be sent in any app that accepts video attachments. If you instead choose "Save to Files," the video lands in the Files app under On My iPhone › Downloads. Most users want Photos because Camera Roll videos are easier to share and post.',
    },
    steps: [
      {
        name: "Copy the video link",
        text: 'In the source app (TikTok, Instagram, Twitter / X, Facebook, Reddit), tap the Share button on the video and choose "Copy Link." On the web you can long-press the video and pick "Copy Link" instead.',
      },
      {
        name: "Open dropzap.digital in Safari",
        text: "Use Safari rather than the in-app browser of the source app — Safari has full file system access and can save to Photos. The in-app browsers inside TikTok or Instagram block the save sheet.",
      },
      {
        name: "Paste the link and tap Download",
        text: "Tap the input box, choose Paste from the popup, then tap the Download button. DropZap fetches the source MP4 from the platform's CDN. This takes 2-10 seconds depending on the video length.",
      },
      {
        name: "Save the video to Photos",
        text: "When the video preview appears, long-press it, then choose Save to Photos from the share sheet (the icon with the down arrow into a tray). Confirm permission for Safari to access Photos if prompted — this is a one-time approval.",
      },
      {
        name: "Find it in your Camera Roll",
        text: "Open the Photos app — the video is at the bottom of Recents, with the original aspect ratio and full source quality preserved. From here you can edit, share, or repost it like any other video.",
      },
    ],
    quirks: [
      {
        title: "Safari is required (not Chrome on iOS)",
        body: 'Chrome on iOS uses the same WebKit engine as Safari but routes downloads differently. Save-to-Photos works most reliably from Safari directly. If you must use Chrome, save to Files first, then open the file in Files and use the share sheet to send it to Photos.',
      },
      {
        title: "Long-press, not tap, to get the save sheet",
        body: 'Tapping a video preview just plays it inline. To get the share sheet you need a long-press (touch and hold for ~0.5 seconds). The share sheet then offers "Save to Photos," "Save to Files," "Add to Notes," and other targets.',
      },
      {
        title: "iOS strips no metadata",
        body: 'Unlike some platforms\' built-in download buttons, the file you save to Photos is the exact same MP4 the platform serves to its app. Resolution, bitrate, color profile, and audio quality are all identical to the source. iOS adds a "Date Saved" timestamp but does not re-encode.',
      },
      {
        title: "Low Power Mode pauses background downloads",
        body: 'If your iPhone is in Low Power Mode and you switch away from Safari mid-download, the download pauses. Either disable Low Power Mode for downloads longer than 30 seconds, or keep Safari in the foreground until the file is ready.',
      },
    ],
    faq: [
      {
        q: "Does this work on iPhone without an app?",
        a: "Yes. DropZap is a website, not an app. There is nothing to install, no Apple ID required, and no Shortcut to import. You use it directly in Safari.",
      },
      {
        q: "Does it work on older iPhones?",
        a: "Yes. The site is tested on iOS 15, 16, 17, and 18, covering iPhone 6s through iPhone 16 Pro. The only requirement is a working browser and an internet connection.",
      },
      {
        q: "Will the video save to Camera Roll or only to Files?",
        a: "It saves wherever you choose from the share sheet. Most users pick Save to Photos (which lands in Camera Roll). Save to Files is also available if you prefer to keep it organized in the Files app.",
      },
      {
        q: "Does it remove the TikTok / Instagram watermark?",
        a: "Yes. DropZap fetches the source MP4 from the platform's CDN, which is the version before the watermark is applied. The file you save to your iPhone is fully watermark-free at full original resolution.",
      },
      {
        q: "Why do I need to long-press instead of tap?",
        a: "Tapping a video in Safari just plays it inline. iOS reserves long-press for the share sheet, which is where the Save to Photos option lives. This is an iOS design choice, not something DropZap controls.",
      },
      {
        q: "Does iCloud auto-sync the downloaded video?",
        a: "Yes, if you have iCloud Photos enabled. Once the video is in the Recents album, it syncs to all your other Apple devices automatically just like a video you recorded.",
      },
      {
        q: "Is there a file size limit on iPhone downloads?",
        a: "Practically, no. iOS does not impose a per-download size limit in Safari. The largest single videos you'll encounter on social platforms are 200-400MB (long Twitter or Reddit videos), which iPhone handles without issue.",
      },
    ],
    platformLinks: [
      {
        label: "TikTok Downloader for iPhone",
        href: "/tiktok-downloader",
        blurb:
          "Save TikTok videos to Camera Roll without the watermark. Works on iOS 16+.",
      },
      {
        label: "Instagram Reels Downloader for iPhone",
        href: "/instagram-downloader",
        blurb:
          "Download Reels, posts, and Stories from Safari directly to Photos.",
      },
      {
        label: "Twitter / X Video Downloader for iPhone",
        href: "/twitter-video-downloader",
        blurb:
          "Save tweets with video at full quality — no Twitter Premium needed.",
      },
      {
        label: "Reddit Video Downloader for iPhone",
        href: "/reddit-video-downloader",
        blurb:
          "Reddit videos with audio merged in. Saves correctly to Camera Roll.",
      },
      {
        label: "Facebook Video Downloader for iPhone",
        href: "/facebook-video-downloader",
        blurb:
          "Save public Facebook videos and Reels to Photos in one tap.",
      },
    ],
    dateModified: "2026-05-09",
  },

  // ====================================================================
  // Android
  // ====================================================================
  {
    slug: "android-video-downloader",
    deviceLabel: "Android",
    operatingSystem: "Android",
    metaTitle:
      "Android Video Downloader (2026) — Save TikTok, Reels & Twitter Videos to Gallery",
    metaDescription:
      "Download videos from TikTok, Instagram, Twitter / X, Facebook, and Reddit to your Android phone. No app install, no permissions, works on Samsung, Pixel, OnePlus, and every Android 11+ device.",
    keywords: [
      "android video downloader",
      "video downloader for android",
      "save tiktok to gallery android",
      "download instagram reels android",
      "android video downloader no app",
      "save twitter video android",
    ],
    h1: "Video Downloader for Android — Save Any Social Video to Your Gallery",
    quickAnswer:
      "To download a video on Android, copy the video link from the source app, open dropzap.digital in Chrome, paste the link, tap Download, and the file is saved to your phone's Downloads folder. From there it appears in the Gallery app automatically. No APK install, no permissions, works on every Android 11+ device.",
    intro:
      "DropZap works on every Android phone — Samsung Galaxy, Google Pixel, OnePlus, Xiaomi, Motorola, and any other brand running Android 11 or newer. There is nothing to install, no APK to sideload, and no risky third-party app store. You paste a link in Chrome (or Samsung Internet, or Firefox) and the MP4 file lands in your Downloads folder in seconds.\n\nAndroid's file system is more open than iOS, which actually makes downloads simpler: the browser writes the file directly to /Downloads, the Gallery app picks it up via MediaStore scanning, and it appears in your photo grid within a few seconds. There is no extra share-sheet step required.",
    whereFilesGo: {
      heading: "Where Android saves the file",
      body: "Browser downloads on Android land in the Downloads folder (technically /storage/emulated/0/Download/). You can find them three ways: open the Files app (Files by Google on Pixel, My Files on Samsung), open the browser's download manager, or open the notification shade and tap the completion notification. Within 5-10 seconds the video also appears in the Gallery app (Google Photos on Pixel, Samsung Gallery on Galaxy) under the Downloads or All Photos album, because Android's MediaStore service auto-scans the Downloads folder.",
    },
    steps: [
      {
        name: "Copy the video link",
        text: 'In the source app (TikTok, Instagram, Twitter / X, Facebook, Reddit), tap the Share icon on the video and choose "Copy Link." Most apps put it directly on the share sheet; on Android Reddit you may need to scroll the share sheet to find it.',
      },
      {
        name: "Open dropzap.digital in Chrome",
        text: "Chrome, Samsung Internet, Firefox, and Brave all work. The site is identical across browsers — the only difference is which folder the browser uses by default for downloads (almost always /Downloads on every browser).",
      },
      {
        name: "Paste the link and tap Download",
        text: "Tap and hold the input box, choose Paste from the popup, then tap the Download button. DropZap fetches the source MP4 from the platform's CDN. The video preview appears in 2-10 seconds.",
      },
      {
        name: "Tap the Download button on the video preview",
        text: 'Below the preview is a Download button. Tap it. Chrome shows a "Downloading…" notification at the top of the screen and a completion notification when the file is saved. No permission dialog because Chrome already has Downloads-folder access.',
      },
      {
        name: "Find it in your Gallery",
        text: "Open the Gallery app (Google Photos / Samsung Gallery / your default gallery). The video appears in the All Photos timeline at the current date, and also in a Downloads folder if your gallery shows folder views. From here you can edit, share, or repost like any video you recorded.",
      },
    ],
    quirks: [
      {
        title: "No storage permission needed",
        body: 'Android 11+ uses scoped storage, which means browsers write to the public Downloads folder without needing the legacy WRITE_EXTERNAL_STORAGE permission. You will not see a permission dialog when downloading from DropZap because none is required.',
      },
      {
        title: "MediaStore scanning is automatic but not instant",
        body: "After the file lands in /Downloads, Android's MediaStore service has to scan it before it shows up in Gallery apps. This usually takes 5-10 seconds. If a video does not appear in Gallery immediately, wait 10 seconds or pull down to refresh the gallery.",
      },
      {
        title: "Samsung Internet vs Chrome",
        body: 'Samsung Internet and Chrome both work fine, but Samsung Internet has a built-in "Smart Anti-Tracking" mode that some users have on by default. This does not block DropZap — the site uses no third-party trackers — but if any browser shows an unusual warning, switching to Chrome is the simplest fix.',
      },
      {
        title: "Battery saver does not block downloads",
        body: 'Unlike iOS Low Power Mode, Android battery saver does not pause active downloads when you switch apps. You can start a download in Chrome, switch to another app, and the download continues in the background until complete.',
      },
      {
        title: "SD card storage (if enabled)",
        body: 'On Samsung devices with SD cards, you can set Chrome\'s default download folder to the SD card via Chrome Settings › Downloads › Location. After that, DropZap-saved videos land directly on the SD card. Most modern Samsung phones do not have SD card slots, so this only applies to older devices and Galaxy A-series.',
      },
    ],
    faq: [
      {
        q: "Does this work on Android without installing an APK?",
        a: "Yes. DropZap is a website. You open it in Chrome (or any browser) and use it directly. There is no APK, no Play Store install, and no third-party app store needed.",
      },
      {
        q: "Does it work on Samsung, Pixel, OnePlus, and other brands?",
        a: "Yes. The site works identically on every Android brand and skin — Samsung One UI, Google Pixel stock Android, OnePlus OxygenOS, Xiaomi MIUI / HyperOS, OPPO ColorOS, Motorola, and any other Android 11+ device.",
      },
      {
        q: "Will the video appear in my Gallery app?",
        a: "Yes, within 5-10 seconds. Android's MediaStore service auto-scans the Downloads folder and adds new videos to the Gallery timeline. You'll find it in Google Photos / Samsung Gallery under today's date.",
      },
      {
        q: "Does it remove the TikTok / Instagram watermark?",
        a: "Yes. DropZap fetches the source MP4 from the platform's CDN before the watermark is applied. The file saved to your Android phone is the watermark-free original at full source resolution.",
      },
      {
        q: "Where exactly are the files saved?",
        a: "/storage/emulated/0/Download/ — also called the Downloads folder. Open the Files app (Files by Google on Pixel, My Files on Samsung) and tap Downloads to see all saved videos.",
      },
      {
        q: "Can I save to my SD card?",
        a: "Yes, if your phone has an SD card slot. Open Chrome Settings → Downloads → Location and pick your SD card. After that, all DropZap downloads go straight to external storage.",
      },
      {
        q: "Why does the file disappear after a phone restart on some devices?",
        a: 'It does not — but on Samsung devices with "Storage Cleaner" enabled in Device Care, the system can clear large files from /Downloads after 30+ days of inactivity. Move important videos to a different folder if you want to keep them long-term.',
      },
    ],
    platformLinks: [
      {
        label: "TikTok Downloader for Android",
        href: "/tiktok-downloader",
        blurb:
          "Save TikTok videos to your Gallery without the watermark. Samsung, Pixel, all brands.",
      },
      {
        label: "Instagram Downloader for Android",
        href: "/instagram-downloader",
        blurb:
          "Download Reels, posts, and Stories straight to /Downloads.",
      },
      {
        label: "Twitter / X Video Downloader for Android",
        href: "/twitter-video-downloader",
        blurb:
          "Save tweets with video at full quality. Works in Chrome and Samsung Internet.",
      },
      {
        label: "Reddit Video Downloader for Android",
        href: "/reddit-video-downloader",
        blurb:
          "Reddit videos with audio merged. Saves to Gallery automatically.",
      },
      {
        label: "Facebook Video Downloader for Android",
        href: "/facebook-video-downloader",
        blurb:
          "Public Facebook videos and Reels saved to Downloads in one tap.",
      },
    ],
    dateModified: "2026-05-09",
  },
];

export function getMobilePage(slug: string): MobilePageData | undefined {
  return mobilePages.find((p) => p.slug === slug);
}
