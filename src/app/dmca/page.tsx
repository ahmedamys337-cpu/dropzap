import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.dropzap.digital";

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/dmca` },
  title: "DMCA / Copyright Policy",
  description:
    "DropZap DMCA copyright takedown policy. Submit DMCA notices and counter-notices for content you believe infringes copyright.",
  robots: { index: true, follow: true },
};

export default function DmcaPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-8 inline-block"
      >
        ← Back to DropZap
      </Link>
      <h1 className="text-3xl font-bold mb-2">DMCA / Copyright Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            1. Overview
          </h2>
          <p>
            DropZap is a tool that helps users access publicly available media content
            from third-party platforms. We do <strong>not</strong> host any video, audio,
            or image content on our servers. All media is fetched in real-time from the
            original source and streamed directly to the user&apos;s device. No copies are
            stored, indexed, or distributed by DropZap.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            2. Respect for Copyright
          </h2>
          <p>
            DropZap respects the intellectual property rights of others and expects its
            users to do the same. Users are solely responsible for ensuring that any
            content they download complies with applicable copyright laws and the terms
            of service of the source platform (Instagram, TikTok, Twitter/X,
            Facebook, Reddit).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            3. Where to Submit DMCA Notices
          </h2>
          <p>
            Because DropZap does not host content, DMCA takedown requests should be
            directed to the platform that hosts the content (Instagram, TikTok, etc.),
            not to DropZap. Each platform has its own DMCA reporting process:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>
              <strong>Instagram / Facebook:</strong>{" "}
              <a
                href="https://www.facebook.com/help/contact/1758255661104383"
                className="text-foreground underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                facebook.com/help/contact/1758255661104383
              </a>
            </li>
            <li>
              <strong>TikTok:</strong>{" "}
              <a
                href="https://www.tiktok.com/legal/copyright-policy"
                className="text-foreground underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                tiktok.com/legal/copyright-policy
              </a>
            </li>
            <li>
              <strong>Twitter / X:</strong>{" "}
              <a
                href="https://help.x.com/en/forms/ipi"
                className="text-foreground underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                help.x.com/en/forms/ipi
              </a>
            </li>
            <li>
              <strong>Reddit:</strong>{" "}
              <a
                href="https://www.reddithelp.com/hc/en-us/requests/new"
                className="text-foreground underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                reddithelp.com/hc/en-us/requests/new
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            4. Submitting a Notice to DropZap
          </h2>
          <p>
            If you believe DropZap is being used to infringe your copyright in a way
            that the source platform cannot address, you may send a written notice to:
          </p>
          <p className="mt-2">
            <strong>Email:</strong>{" "}
            <a
              href="mailto:dropzap.contact@gmail.com"
              className="text-foreground underline"
            >
              dropzap.contact@gmail.com
            </a>
          </p>
          <p className="mt-3">Your notice must include:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Identification of the copyrighted work claimed to be infringed.</li>
            <li>
              The exact URL on DropZap where the alleged infringement occurs (note:
              DropZap does not host content, so this typically refers to a feature
              that enables access).
            </li>
            <li>Your contact information (name, address, phone, email).</li>
            <li>
              A statement that you have a good-faith belief that the use is not
              authorized by the copyright owner, its agent, or the law.
            </li>
            <li>
              A statement, under penalty of perjury, that the information in the
              notice is accurate and that you are authorized to act on behalf of the
              owner.
            </li>
            <li>Your physical or electronic signature.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            5. Counter-Notification
          </h2>
          <p>
            If you believe a DMCA notice has been wrongly filed against you, you may
            submit a counter-notification to{" "}
            <a
              href="mailto:dropzap.contact@gmail.com"
              className="text-foreground underline"
            >
              dropzap.contact@gmail.com
            </a>{" "}
            containing the same elements as a notice plus a statement that you consent
            to the jurisdiction of the appropriate court.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            6. Repeat Infringers
          </h2>
          <p>
            DropZap reserves the right to terminate access for users who are determined
            to be repeat infringers, in accordance with the DMCA and applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            7. Safe Harbor
          </h2>
          <p>
            DropZap operates as a tool that retrieves publicly accessible content on
            behalf of users at their explicit request. We claim safe harbor under
            applicable copyright laws including the Digital Millennium Copyright Act
            (DMCA) section 512.
          </p>
        </section>
      </div>
    </main>
  );
}
