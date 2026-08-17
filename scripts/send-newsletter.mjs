/**
 * Send newly published essays / book notes to Buttondown subscribers.
 *
 * Runs in GitHub Actions on every push to main (see .github/workflows/newsletter.yml).
 * It looks at which content files were ADDED in the push, builds one email per new
 * post (title, description, link, then the full text), and creates it in Buttondown.
 *
 * Usage (locally, to preview without sending):
 *   node scripts/send-newsletter.mjs --dry-run src/content/essays/fear.md
 *
 * Env:
 *   BUTTONDOWN_API_KEY   required unless --dry-run
 *   NEWSLETTER_MODE      "send" (default) or "draft" — draft creates the email in
 *                        Buttondown for you to review and click Send yourself.
 */
import { readFileSync, existsSync } from 'node:fs';
import { basename } from 'node:path';

const SITE = 'https://stefancoburn.com';
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const files = args.filter(a => !a.startsWith('--'));
const mode = (process.env.NEWSLETTER_MODE || 'send').toLowerCase();
const apiKey = process.env.BUTTONDOWN_API_KEY;

if (files.length === 0) { console.log('No new posts in this push — nothing to send.'); process.exit(0); }
if (!dryRun && !apiKey) { console.error('BUTTONDOWN_API_KEY is not set.'); process.exit(1); }

function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return { data, body: src.slice(m[0].length) };
}

/** Drop raw-HTML blocks (photo carousels, <style>, <script>) that won't render in email. */
function stripHtmlBlocks(md) {
  const out = [];
  let divDepth = 0;
  let closing = null; // e.g. '</style>' while inside a style/script block
  for (const line of md.split('\n')) {
    const t = line.trim();
    if (closing) { if (t.toLowerCase().includes(closing)) closing = null; continue; }
    const m = t.match(/^<(style|script|iframe|video|table)\b/i);
    if (m && divDepth === 0) {
      const tag = m[1].toLowerCase();
      if (!t.toLowerCase().includes(`</${tag}>`)) closing = `</${tag}>`;
      continue;
    }
    const opens = (t.match(/<div\b/gi) || []).length;
    const closes = (t.match(/<\/div>/gi) || []).length;
    if (divDepth > 0 || /^<div\b/i.test(t)) {
      divDepth = Math.max(0, divDepth + opens - closes);
      continue;
    }
    if (/^<\/?(section|figure|figcaption|button)\b/i.test(t) || /^<!--/.test(t)) continue;
    out.push(line);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Make site-relative links/images absolute so they work from an inbox. */
function absolutize(md) {
  return md.replace(/\]\((\/[^)\s]*)\)/g, `](${SITE}$1)`).replace(/(src|href)="\/(?!\/)/g, `$1="${SITE}/`);
}

async function main() {
  for (const file of files) {
    if (!existsSync(file)) { console.log(`skip (missing): ${file}`); continue; }
    const isEssay = file.includes('/essays/');
    const isNote = file.includes('/book-notes/');
    if (!isEssay && !isNote) { console.log(`skip (not content): ${file}`); continue; }
    if (basename(file).startsWith('placeholder-')) { console.log(`skip (placeholder): ${file}`); continue; }

    const { data, body } = parseFrontmatter(readFileSync(file, 'utf8'));
    const slug = basename(file).replace(/\.mdx?$/, '');
    const url = `${SITE}/${isEssay ? 'essays' : 'book-notes'}/${slug}`;
    const kind = isEssay ? 'essay' : 'book note';
    const title = data.title || slug;
    const description = data.description ? `*${data.description}*\n\n` : '';

    const emailBody =
`*New ${kind} on stefancoburn.com*

# ${title}

${description}[Read it on the site →](${url})

---

${absolutize(stripHtmlBlocks(body))}

---

You're getting this because you subscribed at stefancoburn.com. Reply to say hi, or unsubscribe with the link below.`;

    const payload = {
      subject: title,
      body: emailBody,
      status: mode === 'draft' ? 'draft' : 'about_to_send',
      slug,
      canonical_url: url,
      description: data.description || undefined,
    };

    if (dryRun) {
      console.log(`\n=== DRY RUN: ${file} → ${payload.status} ===\nSubject: ${payload.subject}\n\n${payload.body}\n`);
      continue;
    }

    const res = await fetch('https://api.buttondown.com/v1/emails', {
      method: 'POST',
      headers: { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`Buttondown API error ${res.status} for ${file}: ${await res.text()}`);
      process.exitCode = 1;
      continue;
    }
    const json = await res.json();
    console.log(`${payload.status === 'draft' ? 'Drafted' : 'Sent'} "${title}" (${json.id})`);
  }
}
main();
