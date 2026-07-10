import type { Metadata } from "next";
import CompetitorStatusPage from "@/components/CompetitorStatusPage";
import { checkStatus } from "@/lib/competitor-status";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  title: "Is SnapTik Down Right Now? — Status Check & Free Alternative",
  description:
    "Check if SnapTik is down today. Live status monitor plus the best free SnapTik alternative for TikTok downloads without watermark.",
  keywords: ["is snaptik down", "snaptik not working", "snaptik down today", "snaptik alternative free", "snaptik status"],
  alternates: { canonical: `${SITE_URL}/is-snaptik-down` },
};

export const dynamic = "force-dynamic";

export default async function IsSnapTikDownPage() {
  const status = await checkStatus("https://snaptik.app");
  return (
    <CompetitorStatusPage
      config={{
        name: "SnapTik",
        url: "https://snaptik.app",
        slug: "snaptik",
        headline: "SnapTik went paid and its free tier now adds a watermark.",
        description:
          "SnapTik users often hit the paywall, daily limit, or a server error. Check the live status of SnapTik below and switch to DropZap if it is down or asking for money.",
        alternativeHref: "/tiktok-downloader",
        alternativeLabel: "Free TikTok Downloader",
      }}
      status={status}
    />
  );
}
