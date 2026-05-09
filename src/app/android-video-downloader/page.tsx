import type { Metadata } from "next";
import MobileLandingPage from "@/components/MobileLandingPage";
import { getMobilePage } from "@/lib/mobile-pages-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";
const data = getMobilePage("android-video-downloader")!;

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
  keywords: data.keywords,
  alternates: { canonical: `${SITE_URL}/android-video-downloader` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/android-video-downloader`,
    title: data.metaTitle,
    description: data.metaDescription,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: data.metaTitle,
    description: data.metaDescription,
  },
};

export default function AndroidVideoDownloaderPage() {
  return <MobileLandingPage data={data} />;
}
