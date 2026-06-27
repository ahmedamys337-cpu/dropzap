import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/privacy` },
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
            We use Google Analytics to understand aggregated, anonymous traffic patterns
            (page views, referrers, country-level location) so we can improve the service.
            Google Analytics may set cookies on your browser. You can opt out using the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              className="text-foreground underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            5. Advertising
          </h2>
          <p>
            DropZap is supported by advertising. We use{" "}
            <strong>Adsterra</strong> to serve ads. Adsterra and its advertising
            partners may use cookies, web beacons, or similar technologies to show you
            ads based on your prior visits to our site or other sites.
          </p>
          <p className="mt-3">
            You may opt out of personalized advertising by visiting{" "}
            <a
              href="https://www.aboutads.info/choices/"
              className="text-foreground underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              aboutads.info/choices
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            6. GDPR &amp; CCPA Rights
          </h2>
          <p>
            If you are a resident of the European Economic Area (EEA), United Kingdom,
            or California, you have specific rights regarding your personal data,
            including the right to access, correct, delete, or restrict the processing
            of your data. Since DropZap does not collect personally identifiable
            information, most of these rights are automatically protected. To exercise
            any rights, contact us at{" "}
            <a
              href="mailto:dropzap.contact@gmail.com"
              className="text-foreground underline"
            >
              dropzap.contact@gmail.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            7. Children&apos;s Privacy
          </h2>
          <p>
            DropZap is not directed at children under the age of 13. We do not
            knowingly collect personal information from children. If you believe a
            child has provided personal information to us, please contact us so we can
            delete it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            8. Data Retention
          </h2>
          <p>
            No user data is retained on our servers. Temporary files created during
            processing are deleted immediately after your download is complete.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            9. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. The &quot;Last
            updated&quot; date at the top reflects the most recent revision. Continued
            use of DropZap after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">10. Contact</h2>
          <p>
            For privacy questions or to exercise your rights, contact us at{" "}
            <a
              href="mailto:dropzap.contact@gmail.com"
              className="text-foreground underline"
            >
              dropzap.contact@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
