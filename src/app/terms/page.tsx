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
            TikTok, Facebook, Twitter/X, Reddit, Pinterest, Threads, and others). DropZap does not endorse
            or facilitate copyright infringement.
          </p>
          <p className="mt-3">
            DropZap acts only as a technical intermediary that retrieves files from publicly accessible
            URLs. We do not host, store, or redistribute any video, audio, or image content. All media
            remains the property of its original copyright holders. Where copyrighted content is downloaded,
            users are responsible for ensuring their use falls within the personal-use exceptions, fair use
            doctrine, fair dealing doctrine, or licensing terms applicable in their jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. DMCA Takedown Policy</h2>
          <p>
            DropZap respects the intellectual property rights of others and complies with the Digital
            Millennium Copyright Act (DMCA) and similar copyright laws in other jurisdictions. If you
            are a copyright owner (or an authorized agent of one) and believe that material accessible
            through our service infringes your copyright, please submit a DMCA notice by emailing{" "}
            <a
              href="mailto:dropzap.contact@gmail.com"
              className="text-foreground underline"
            >
              dropzap.contact@gmail.com
            </a>{" "}
            with the following information:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>A physical or electronic signature of the copyright owner or authorized agent.</li>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>The URL or specific description of the material on our service to be disabled.</li>
            <li>Your contact information (name, address, telephone, email).</li>
            <li>
              A statement that you have a good-faith belief that the disputed use is not authorized
              by the copyright owner, its agent, or the law.
            </li>
            <li>
              A statement, made under penalty of perjury, that the information in your notice is
              accurate and that you are the copyright owner or authorized to act on the owner&apos;s behalf.
            </li>
          </ul>
          <p className="mt-3">
            We will investigate valid notices and take appropriate action, which may include disabling
            access to the reported URL pattern, blocking specific platform endpoints, or terminating
            access for repeat infringers. Submitting false DMCA notices may result in liability under
            17 U.S.C. § 512(f).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Prohibited Uses</h2>
          <p>You agree not to use DropZap for any of the following:</p>
          <ul className="list-disc pl-6 mt-3 space-y-1">
            <li>
              Downloading content you do not have the legal right to access, including content from
              private profiles, closed groups, or accounts you are not authorized to view.
            </li>
            <li>
              Bulk scraping, automated harvesting, or systematic mass-downloading of content using
              bots, crawlers, or scripts that bypass our rate limits.
            </li>
            <li>
              Reverse-engineering, decompiling, or attempting to extract the source code of the service.
            </li>
            <li>
              Re-uploading downloaded content to commercial platforms, monetized channels, or
              redistribution services without the rights holder&apos;s permission.
            </li>
            <li>
              Using DropZap to download content that violates applicable laws (including but not
              limited to defamation, harassment, hate speech, or content depicting minors).
            </li>
            <li>
              Interfering with the proper operation of the service, including denial-of-service
              attacks, network flooding, or attempting to bypass security mechanisms.
            </li>
            <li>
              Reselling, sublicensing, or commercially exploiting the service or its outputs without
              prior written consent from DropZap.
            </li>
          </ul>
          <p className="mt-3">
            Violation of these prohibited uses may result in immediate access restriction or
            termination, and where applicable, referral to law enforcement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. No Warranty</h2>
          <p>
            DropZap is provided &quot;as is&quot; and &quot;as available&quot; without warranty of any
            kind, express or implied, including but not limited to warranties of merchantability,
            fitness for a particular purpose, non-infringement, accuracy, or uninterrupted availability.
            We do not guarantee that downloads will succeed, that files will be free of defects, or that
            the service will be available at all times.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, DropZap and its operators, employees,
            and affiliates shall not be liable for any indirect, incidental, special, consequential,
            or punitive damages — including but not limited to loss of profits, data, goodwill, or
            other intangible losses — arising out of or in connection with your use of, or inability
            to use, the service. This limitation applies regardless of whether the alleged liability
            is based on contract, tort, negligence, strict liability, or any other legal theory.
          </p>
          <p className="mt-3">
            You agree that the total liability of DropZap to you for any claims arising from or
            related to the service is limited to the amount you have paid to DropZap in the past
            twelve months (which, for free users, is zero).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">8. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless DropZap and its operators from and against
            any claims, liabilities, damages, losses, and expenses (including reasonable legal fees)
            arising out of or in any way connected with your use of the service, your violation of these
            terms, or your violation of any third-party rights including copyright, trademark, privacy,
            or other proprietary or legal rights.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">9. Governing Law &amp; Disputes</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws applicable to
            the jurisdiction where DropZap&apos;s operator resides, without regard to its conflict of
            law principles. Any dispute arising from or relating to these Terms or the service shall
            be resolved through good-faith negotiation as a first step. If unresolved, disputes shall
            be submitted to the competent courts in the operator&apos;s jurisdiction, except where
            mandatory local consumer-protection law grants you the right to bring proceedings in your
            own country of residence.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">10. Severability</h2>
          <p>
            If any provision of these Terms is held to be invalid, illegal, or unenforceable by a
            court of competent jurisdiction, the remaining provisions shall continue in full force
            and effect, and the invalid provision shall be modified to the minimum extent necessary
            to make it valid and enforceable.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">11. Changes</h2>
          <p>
            We reserve the right to update these terms at any time. The &quot;Last updated&quot; date
            at the top of this page reflects the most recent revision. We will make reasonable efforts
            to notify users of material changes. Continued use of the service after changes constitutes
            acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">12. Contact</h2>
          <p>
            For questions about these Terms, DMCA notices, or any other legal matter, contact us at{" "}
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
