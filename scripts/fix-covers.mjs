#!/usr/bin/env node
/**
 * Fix specific wrong covers by downloading from known-good ISBNs.
 * Run: node scripts/fix-covers.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const COVERS_DIR = join(process.cwd(), 'src/images/covers');
mkdirSync(COVERS_DIR, { recursive: true });

const fixes = [
  {
    slug: 'endurance',
    title: 'Endurance (Scott Kelly)',
    isbn: '9781524731595',
  },
  {
    slug: 'the-case-for-christ',
    title: 'The Case for Christ',
    isbn: '9780310350033',
  },
];

async function downloadCover(isbn, filepath, title) {
  // Try Open Library by ISBN
  const olUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  try {
    const resp = await fetch(olUrl, { redirect: 'follow' });
    if (resp.ok) {
      const buf = Buffer.from(await resp.arrayBuffer());
      if (buf.length > 2000) {
        writeFileSync(filepath, buf);
        console.log(`  ✓ ${title} — Open Library ISBN ${isbn} (${buf.length} bytes)`);
        return true;
      }
    }
  } catch (e) {}

  // Fallback: Google Books by ISBN
  try {
    const gUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`;
    const resp = await fetch(gUrl);
    const data = await resp.json();
    if (data.items?.[0]?.volumeInfo?.imageLinks) {
      const links = data.items[0].volumeInfo.imageLinks;
      const imgUrl = (links.thumbnail || links.smallThumbnail).replace('http://', 'https://');
      const imgResp = await fetch(imgUrl);
      if (imgResp.ok) {
        const buf = Buffer.from(await imgResp.arrayBuffer());
        if (buf.length > 1000) {
          writeFileSync(filepath, buf);
          console.log(`  ✓ ${title} — Google Books ISBN ${isbn} (${buf.length} bytes)`);
          return true;
        }
      }
    }
  } catch (e) {}

  console.log(`  ✗ ${title} — could not fix`);
  return false;
}

async function main() {
  console.log('Fixing incorrect covers...\n');
  for (const fix of fixes) {
    const filepath = join(COVERS_DIR, `${fix.slug}.jpg`);
    await downloadCover(fix.isbn, filepath, fix.title);
  }
  console.log('\nDone! Commit and push to update the site.');
}

main();
