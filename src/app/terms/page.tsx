import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/terms` },
  title: "Terms of Service",
  description: "DropZap terms of service. For personal use only. Respect copyright and content creators' rights.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block">
        ← Back to DropZap
      </Link>
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().getFullYear()}</p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance</h2>
          <p>
            By using DropZap you agree to these terms. If you do not agree, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. Personal Use Only</h2>
          <p>
            DropZap is provided for <strong>personal, non-commercial use only</strong>. You may not use
            DropZap to download, reproduce, or distribute copyrighted content without the rights holder&apos;s
            permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Copyright Compliance</h2>
          <p>
            Users are solely responsible for ensuring their use of downloaded content complies with
            applicable copyright laws and the terms of service of the source platforms (YouTube, Instagram,
            TikTok, Twitter/X). DropZap does not endorse copyright infringement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. No Warranty</h2>
          <p>
            DropZap is provided &quot;as is&quot; without warranty of any kind. We do not guarantee
            uninterrupted availability, download success, or the quality of downloaded files.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Limitation of Liability</h2>
          <p>
            DropZap and its operators are not liable for any damages arising from the use or inability
            to use the service, or from the misuse of downloaded content.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Changes</h2>
          <p>
            We reserve the right to update these terms at any time. Continued use after changes
            constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
    </main>
  );
}
