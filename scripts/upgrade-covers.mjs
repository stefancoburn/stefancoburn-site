#!/usr/bin/env node
/**
 * Upgrade all covers to high resolution.
 * Only replaces a cover when the new image is BIGGER than the current one,
 * and only when the source's title matches the book (avoids wrong-book swaps).
 * Backs up current covers to covers-backup/ first.
 *
 * Run from project root: node scripts/upgrade-covers.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, copyFileSync, readdirSync } from 'fs';
import { join } from 'path';

const COVERS_DIR = join(process.cwd(), 'public/images/covers');
const BOOKS_PATH = join(process.cwd(), 'src/data/books.json');
const BACKUP_DIR = join(process.cwd(), 'covers-backup');

const GOOD_WIDTH = 380; // covers at or above this width are left alone
const MIN_ACCEPT_WIDTH = 300; // never accept a replacement narrower than this

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ---- image dimension parsing (no dependencies) ----
function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}
function pngSize(buf) {
  if (buf[0] !== 0x89 || buf[1] !== 0x50) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}
function imageSize(buf) { return jpegSize(buf) || pngSize(buf); }

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function titleMatches(bookTitle, candidateTitle) {
  const a = normalize(bookTitle.replace(/\(.*?\)/g, ''));
  const b = normalize(candidateTitle);
  if (!a || !b) return false;
  // main title before colon must appear in the candidate (or vice versa)
  const mainA = a.split(' vol ')[0].split(' vols ')[0];
  const shortA = mainA.length > 40 ? mainA.slice(0, 40) : mainA;
  return b.includes(shortA) || a.includes(b) || b.startsWith(mainA.split(' ').slice(0, 4).join(' '));
}

async function fetchImage(url) {
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'StefanCoburnBookshelf/1.0' },
      redirect: 'follow',
    });
    if (!resp.ok) return null;
    const buf = Buffer.from(await resp.arrayBuffer());
    if (buf.length < 4000) return null; // placeholder / blank image
    const size = imageSize(buf);
    if (!size) return null;
    return { buf, ...size };
  } catch {
    return null;
  }
}

async function findBetterCover(book, currentWidth) {
  const cleanTitle = book.title.replace(/\(.*?\)/g, '').trim();
  const candidates = [];

  // Source 1: Open Library search → large cover
  try {
    const q = encodeURIComponent(`${cleanTitle} ${book.author}`);
    const resp = await fetch(
      `https://openlibrary.org/search.json?q=${q}&limit=6&fields=title,cover_i`,
      { headers: { 'User-Agent': 'StefanCoburnBookshelf/1.0' } }
    );
    const data = await resp.json();
    for (const doc of data.docs || []) {
      if (doc.cover_i && titleMatches(book.title, doc.title)) {
        candidates.push({ url: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`, src: 'openlibrary-L' });
      }
    }
  } catch {}

  await sleep(150);

  // Source 2: Google Books → frontcover at zoom 3 (large), then 2
  try {
    const q = encodeURIComponent(`${cleanTitle} ${book.author}`);
    const resp = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=6`);
    const data = await resp.json();
    for (const item of data.items || []) {
      const vi = item.volumeInfo || {};
      if (vi.imageLinks && titleMatches(book.title, vi.title || '')) {
        for (const zoom of [3, 2]) {
          candidates.push({
            url: `https://books.google.com/books/content?id=${item.id}&printsec=frontcover&img=1&zoom=${zoom}`,
            src: `google-zoom${zoom}`,
          });
        }
      }
    }
  } catch {}

  // Try candidates in order; accept the first that is clearly better
  for (const c of candidates.slice(0, 8)) {
    const img = await fetchImage(c.url);
    await sleep(100);
    if (!img) continue;
    if (img.width >= MIN_ACCEPT_WIDTH && img.width > currentWidth * 1.3) {
      return { ...img, src: c.src };
    }
  }
  return null;
}

async function main() {
  const books = JSON.parse(readFileSync(BOOKS_PATH, 'utf8'));

  // Backup
  mkdirSync(BACKUP_DIR, { recursive: true });
  for (const f of readdirSync(COVERS_DIR)) {
    copyFileSync(join(COVERS_DIR, f), join(BACKUP_DIR, f));
  }
  console.log(`Backed up ${readdirSync(COVERS_DIR).length} covers to covers-backup/\n`);

  let upgraded = 0, skipped = 0, kept = 0;
  const keptList = [];

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const filepath = join(COVERS_DIR, `${book.slug}.jpg`);
    const label = `[${i + 1}/${books.length}] ${book.title}`;

    if (!existsSync(filepath) || statSync(filepath).size < 2000) {
      skipped++;
      continue; // placeholder book, nothing to upgrade
    }

    const cur = imageSize(readFileSync(filepath));
    const curWidth = cur ? cur.width : 0;
    if (curWidth >= GOOD_WIDTH) {
      skipped++;
      console.log(`  – ${label} (already ${curWidth}px, skipped)`);
      continue;
    }

    const better = await findBetterCover(book, curWidth);
    if (better) {
      writeFileSync(filepath, better.buf);
      upgraded++;
      console.log(`  ✓ ${label} (${curWidth}px → ${better.width}px, ${better.src})`);
    } else {
      kept++;
      keptList.push(`${book.title} (${curWidth}px)`);
      console.log(`  ✗ ${label} (no better image found, kept ${curWidth}px)`);
    }
    await sleep(250);
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Upgraded: ${upgraded}   Already good/placeholder: ${skipped}   No better found: ${kept}`);
  if (keptList.length) {
    console.log(`\nStill low-res (good candidates for the review page):`);
    keptList.forEach((t) => console.log(`  - ${t}`));
  }
  console.log(`\nOriginals saved in covers-backup/ — delete that folder once you're happy.`);
}

main();
