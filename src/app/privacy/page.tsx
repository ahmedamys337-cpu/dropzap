import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "DropZap privacy policy. We do not collect personal data, store videos, or track users.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block">
        ← Back to DropZap
      </Link>
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().getFullYear()}</p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. What We Collect</h2>
          <p>
            DropZap does not collect any personally identifiable information. We do not require account
            registration. Video URLs you submit are used solely to process your download request and are
            not stored or logged.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. Cookies & Local Storage</h2>
          <p>
            DropZap uses browser <strong>localStorage</strong> to store your recent download history
            locally on your device. This data never leaves your browser and is not transmitted to our servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. Third-Party Services</h2>
          <p>
            Downloaded media is fetched from third-party platforms (YouTube, Instagram, TikTok,
            Twitter/X). Your requests are subject to those platforms&apos; own privacy policies. DropZap
            acts only as a client-side tool.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Analytics</h2>
          <p>
            We may use anonymous, aggregated analytics (e.g. page view counts) to improve the service.
            No personal data is associated with analytics events.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Data Retention</h2>
          <p>
            No user data is retained on our servers. Temporary files created during processing are
            deleted immediately after your download is complete.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Contact</h2>
          <p>
            For privacy questions, contact us at{" "}
            <a href="mailto:hello@dropzap.digital" className="text-foreground underline">
              hello@dropzap.digital
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
