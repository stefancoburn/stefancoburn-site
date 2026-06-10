#!/usr/bin/env node
/**
 * Apply cover fixes exported from scripts/cover-review.html.
 * Expects cover-fixes.json in the project root (move it from ~/Downloads).
 *
 * Run from project root: node scripts/apply-cover-fixes.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const COVERS_DIR = join(process.cwd(), 'public/images/covers');
const FIXES_PATH = join(process.cwd(), 'cover-fixes.json');

if (!existsSync(FIXES_PATH)) {
  console.error('cover-fixes.json not found in project root.');
  console.error('Export it from the review page, then: mv ~/Downloads/cover-fixes.json .');
  process.exit(1);
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function download(url) {
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'StefanCoburnBookshelf/1.0' },
      redirect: 'follow',
    });
    if (!resp.ok) return null;
    const buf = Buffer.from(await resp.arrayBuffer());
    const isJpg = buf[0] === 0xff && buf[1] === 0xd8;
    const isPng = buf[0] === 0x89 && buf[1] === 0x50;
    if (buf.length > 4000 && (isJpg || isPng)) return buf;
    return null;
  } catch {
    return null;
  }
}

async function main() {
  const fixes = JSON.parse(readFileSync(FIXES_PATH, 'utf8'));
  console.log(`Applying ${fixes.length} cover fixes...\n`);

  let ok = 0, failed = [];
  for (const fix of fixes) {
    const filepath = join(COVERS_DIR, `${fix.slug}.jpg`);
    let buf = null;
    let used = '';

    if (fix.googleId) {
      // try largest zoom first
      for (const zoom of [3, 2, 1]) {
        buf = await download(`https://books.google.com/books/content?id=${fix.googleId}&printsec=frontcover&img=1&zoom=${zoom}`);
        if (buf) { used = `google zoom=${zoom}`; break; }
      }
    } else if (fix.url) {
      buf = await download(fix.url);
      used = fix.source || 'url';
    }

    if (buf) {
      writeFileSync(filepath, buf);
      ok++;
      console.log(`  ✓ ${fix.slug} (${used}, ${Math.round(buf.length / 1024)}KB)`);
    } else {
      failed.push(fix.slug);
      console.log(`  ✗ ${fix.slug} — download failed`);
    }
    await sleep(250);
  }

  console.log(`\nDone: ${ok}/${fixes.length} applied.`);
  if (failed.length) console.log(`Failed: ${failed.join(', ')}`);
  console.log('\nReview the site locally (npm run dev), then commit and push.');
}

main();
