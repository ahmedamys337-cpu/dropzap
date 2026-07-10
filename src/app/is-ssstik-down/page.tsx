import type { Metadata } from "next";
import CompetitorStatusPage from "@/components/CompetitorStatusPage";
import { checkStatus } from "@/lib/competitor-status";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Is ssstik Down Right Now? — Status Check & Free Alternative",
  description:
    "Check if ssstik is down today. Live status monitor plus the best free ssstik alternative for TikTok downloads without watermark or captcha.",
  keywords: ["is ssstik down", "ssstik not working", "ssstik down today", "ssstik alternative", "ssstik status"],
  alternates: { canonical: `${SITE_URL}/is-ssstik-down` },
};

export const dynamic = "force-dynamic";

export default async function IsSsstikDownPage() {
  const status = await checkStatus("https://ssstik.io");
  return (
    <CompetitorStatusPage
      config={{
        name: "ssstik",
        url: "https://ssstik.io",
        slug: "ssstik",
        headline: "ssstik keeps showing captchas and fake download buttons.",
        description:
          "ssstik is a popular TikTok downloader, but it often fails with captchas, pop-ups, and server errors. Check the live status below and use DropZap if it is not loading.",
        alternativeHref: "/tiktok-downloader",
        alternativeLabel: "Free TikTok Downloader",
      }}
      status={status}
    />
  );
}
