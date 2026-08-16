#!/usr/bin/env node
/**
 * Replace 4 covers with clean English editions (June 2026).
 * Run on Mac: node scripts/fetch-shelf-fixes.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const COVERS_DIR = join(process.cwd(), 'src/images/covers');
mkdirSync(COVERS_DIR, { recursive: true });

const fixes = [
  {
    slug: 'the-count-of-monte-cristo',
    title: 'The Count of Monte Cristo (Penguin Classics)',
    urls: [
      'https://images.penguinrandomhouse.com/cover/9780140449266',
      'https://covers.openlibrary.org/b/isbn/9780140449266-L.jpg',
    ],
  },
  {
    slug: 'the-score',
    title: 'The Score (C. Thi Nguyen)',
    urls: [
      'https://images.penguinrandomhouse.com/cover/9780593655658',
      'https://covers.openlibrary.org/b/isbn/9780593655658-L.jpg',
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
