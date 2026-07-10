import type { Metadata } from "next";
import CompetitorStatusPage from "@/components/CompetitorStatusPage";
import { checkStatus } from "@/lib/competitor-status";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Is MusicallyDown Down Right Now? — Status Check & Free Alternative",
  description:
    "Check if MusicallyDown is down today. Live status monitor plus the best free MusicallyDown alternative with no daily limit.",
  keywords: ["is musicallydown down", "musicallydown not working", "musicallydown down today", "musicallydown alternative", "musicallydown status"],
  alternates: { canonical: `${SITE_URL}/is-musicallydown-down` },
};

export const dynamic = "force-dynamic";

export default async function IsMusicallyDownDownPage() {
  const status = await checkStatus("https://musicallydown.com");
  return (
    <CompetitorStatusPage
      config={{
        name: "MusicallyDown",
        url: "https://musicallydown.com",
        slug: "musicallydown",
        headline: "MusicallyDown caps free conversions and shows popunder ads.",
        description:
          "MusicallyDown hits daily limits and can be slow or unreachable. Check the live status below and switch to DropZap for unlimited TikTok MP3 and video downloads.",
        alternativeHref: "/tiktok-to-mp3",
        alternativeLabel: "TikTok to MP3 Converter",
      }}
      status={status}
    />
  );
}
