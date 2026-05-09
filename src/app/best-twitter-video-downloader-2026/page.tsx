import type { Metadata } from "next";
import YearPageTemplate from "@/components/YearPageTemplate";
import { getYearPage } from "@/lib/year-pages-data";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";
const data = getYearPage("best-twitter-video-downloader-2026")!;

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
  keywords: data.keywords,
  alternates: { canonical: `${SITE_URL}/${data.slug}` },
  openGraph: {
    type: "article",
    url: `${SITE_URL}/${data.slug}`,
    title: data.metaTitle,
    description: data.metaDescription,
    modifiedTime: data.dateModified,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: data.metaTitle,
    description: data.metaDescription,
  },
};

export default function Page() {
  return <YearPageTemplate data={data} />;
}
