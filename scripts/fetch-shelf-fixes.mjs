#!/usr/bin/env node
/**
 * Replace 4 covers with clean English editions (June 2026).
 * Run on Mac: node scripts/fetch-shelf-fixes.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const COVERS_DIR = join(process.cwd(), 'public/images/covers');
mkdirSync(COVERS_DIR, { recursive: true });

const fixes = [
  {
    slug: 'the-doctrine-and-covenants',
    title: 'The Doctrine and Covenants (English, 297x475)',
    urls: [
      'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1431584156l/25535702.jpg',
    ],
  },
];

async function download(url, filepath, title) {
  try {
    const resp = await fetch(url, { redirect: 'follow' });
    if (resp.ok) {
      const buf = Buffer.from(await resp.arrayBuffer());
      if (buf.length > 5000) {
        writeFileSync(filepath, buf);
        console.log(`  ✓ ${title} (${buf.length} bytes)`);
        return true;
      }
    }
  } catch (e) {}
  return false;
}

async function main() {
  console.log('Fetching replacement covers...\n');
  for (const fix of fixes) {
    const filepath = join(COVERS_DIR, `${fix.slug}.jpg`);
    let ok = false;
    for (const url of fix.urls) {
      ok = await download(url, filepath, fix.title);
      if (ok) break;
    }
    if (!ok) console.log(`  ✗ ${fix.title} — all sources failed`);
  }
  console.log('\nDone! Review the images, then commit and push.');
}

main();
