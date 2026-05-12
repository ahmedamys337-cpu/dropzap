// Markdown digest builder + optional email delivery.
//
// Renders the three modules (Reddit, Quora, brand mentions) into a
// single Markdown report. The operator reads it, picks the best 3-5
// opportunities, and acts on them manually. The whole point of this
// system is to compress 3 hours of opportunity-hunting into a
// 5-minute scan of one document.

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { EMAIL, BRAND } from "./config.mjs";

const PAD = (n) => String(n).padStart(2, "0");
function dateStamp(d = new Date()) {
  return `${d.getUTCFullYear()}-${PAD(d.getUTCMonth() + 1)}-${PAD(d.getUTCDate())}`;
}

function formatAge(hours) {
  if (hours < 1) return `${Math.round(hours * 60)}m ago`;
  if (hours < 24) return `${Math.round(hours)}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function renderRedditSection(opps) {
  if (!opps.length) {
    return `## Reddit opportunities\n\n_No matching threads in the last 48 hours. Either everyone's quiet today or your filter is too tight — try lowering MIN_REDDIT_SCORE in config.mjs._\n`;
  }

  const lines = [`## Reddit opportunities (${opps.length})\n`];
  lines.push(
    `Threads from the last 48 hours matching your monitored keywords. **Read each thread before replying** — context matters and the suggested template is just a starting draft.\n`
  );

  for (const o of opps) {
    lines.push(`---\n`);
    lines.push(`### ${o.title}\n`);
    lines.push(
      `**Sub:** ${o.subreddit} · **Author:** ${o.author} · **Score:** ${o.score} · **Comments:** ${o.numComments} · **Age:** ${formatAge(o.ageHours)} · **Matched keyword:** \`${o.keyword}\`\n`
    );
    lines.push(`**Link:** ${o.url}\n`);
    if (o.selftext) {
      lines.push(`> ${o.selftext.replace(/\n+/g, " ").slice(0, 220)}${o.selftext.length > 220 ? "…" : ""}\n`);
    }
    lines.push(`<details><summary><strong>Suggested reply draft</strong> (template: \`${o.template.key}\`)</summary>\n`);
    lines.push(``);
    lines.push(o.template.body);
    lines.push(``);
    lines.push(`</details>\n`);
  }
  return lines.join("\n");
}

function renderQuoraSection(opps) {
  const lines = [`## Quora opportunities\n`];
  lines.push(
    `Quora has no API and aggressive anti-bot, so we generate pre-filtered Google search URLs instead. Click each link to see the freshest Quora threads matching that keyword. Pick 1-2 worth answering.\n`
  );
  lines.push(`| Keyword | Google search (last week, Quora-only) | Quora native search |`);
  lines.push(`|---|---|---|`);
  for (const o of opps) {
    lines.push(`| \`${o.keyword}\` | [Open](${o.googleSearchUrl}) | [Open](${o.quoraSearchUrl}) |`);
  }
  lines.push(``);
  return lines.join("\n");
}

function renderBrandMentionsSection(report) {
  if (report.skipped) {
    return `## Brand mention tracker\n\n_Skipped: ${report.reason}_\n`;
  }

  const unlinked = report.results.filter((r) => r.alreadyLinks === false);
  const alreadyLinked = report.results.filter((r) => r.alreadyLinks === true);
  const unknown = report.results.filter((r) => r.alreadyLinks === null);

  const lines = [`## Brand mention tracker\n`];
  lines.push(
    `Pages that mention "${BRAND.name}" on the open web in the last 7 days, classified by whether they already link back to ${BRAND.domain}.\n`
  );
  lines.push(
    `**Action:** for each unlinked mention with a contact email, send a short polite request asking them to add a link to the brand reference. Conversion rate ~25%. Don't email the same site twice — keep notes.\n`
  );

  if (unlinked.length) {
    lines.push(`### Unlinked mentions (${unlinked.length}) — outreach targets\n`);
    for (const r of unlinked) {
      lines.push(`- **[${r.title}](${r.link})** — ${r.displayLink}`);
      lines.push(`  - Snippet: _${(r.snippet || "").slice(0, 220)}_`);
      lines.push(
        `  - Contact: ${r.contactEmail ? `\`${r.contactEmail}\`` : "_not found on page — try /contact, /about, or hunter.io_"}`
      );
      lines.push(`  - Variant matched: \`${r.variant}\``);
      lines.push(``);
    }
  } else {
    lines.push(`### Unlinked mentions\n\n_None this run._\n`);
  }

  if (alreadyLinked.length) {
    lines.push(`### Already linking back (${alreadyLinked.length}) — for reference\n`);
    for (const r of alreadyLinked) {
      lines.push(`- [${r.title}](${r.link}) — ${r.displayLink}`);
    }
    lines.push(``);
  }

  if (unknown.length) {
    lines.push(`<details><summary>${unknown.length} pages couldn't be fetched (timeouts / blocks)</summary>\n`);
    for (const r of unknown) {
      lines.push(`- ${r.link}${r.fetchError ? ` _(${r.fetchError})_` : ""}`);
    }
    lines.push(`</details>\n`);
  }

  return lines.join("\n");
}

export function buildMarkdownDigest({ reddit, quora, brand }) {
  const today = dateStamp();
  const header = [
    `# DropZap SEO Outreach Digest — ${today}`,
    ``,
    `_Generated: ${new Date().toISOString()}_`,
    ``,
    `**How to use this report:**`,
    `1. Skim the Reddit section, pick 2-3 threads with real questions you can genuinely answer.`,
    `2. Open each thread, **read the full post + existing comments**, then write a reply that adapts the suggested template (don't paste verbatim — Reddit mods detect copy-paste).`,
    `3. Click the Quora search URLs, pick 1-2 questions, write genuine answers.`,
    `4. For unlinked brand mentions, send a short outreach email asking for the backlink.`,
    ``,
    `**Daily target:** 2 Reddit replies + 1 Quora answer + 2 outreach emails. Roughly 20-30 minutes of focused work.`,
    ``,
    `---`,
    ``,
  ].join("\n");

  return [
    header,
    renderRedditSection(reddit),
    `\n---\n`,
    renderQuoraSection(quora),
    `\n---\n`,
    renderBrandMentionsSection(brand),
  ].join("\n");
}

export async function writeDigestFile(markdown) {
  const today = dateStamp();
  const dir = path.resolve(process.cwd(), "seo-reports");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${today}.md`);
  await writeFile(file, markdown, "utf8");
  // Also write/overwrite a `latest.md` so a static link always shows the newest report.
  await writeFile(path.join(dir, "latest.md"), markdown, "utf8");
  return file;
}

// Minimal Resend integration. We use Resend instead of SMTP because
// it works cleanly inside GitHub Actions (no port-25 weirdness, no
// app-password setup) and the free tier is generous.
export async function sendDigestEmail(markdown) {
  if (!EMAIL.resendApiKey || !EMAIL.toAddress) {
    return { sent: false, reason: "Email env vars not set" };
  }
  // Convert the markdown to very-basic HTML by wrapping in a <pre>.
  // Email clients render this readably; we don't bother with a full
  // markdown-to-html pipeline because the operator usually reads the
  // .md file in the repo anyway. Email is just a notification trigger.
  const html =
    `<pre style="font: 13px/1.5 -apple-system,system-ui,sans-serif; white-space: pre-wrap;">` +
    markdown.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])) +
    `</pre>`;

  const today = dateStamp();
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${EMAIL.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL.fromAddress,
      to: EMAIL.toAddress,
      subject: `[DropZap SEO] Daily outreach digest — ${today}`,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { sent: false, reason: `Resend ${res.status}: ${body.slice(0, 200)}` };
  }
  return { sent: true };
}
