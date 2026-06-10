#!/usr/bin/env node
/**
 * One-off: fetch verified covers for the religious books (June 2026).
 * Sources researched per-book (Church Store, Deseret Book, Goodreads, publishers).
 * Each entry has a primary URL and fallbacks; images are normalized to JPEG
 * (max 600px wide) via sharp.
 *
 * Run from project root: node scripts/fix-religious-covers.mjs
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

const COVERS_DIR = join(process.cwd(), 'public/images/covers');

const fixes = [
  {
    slug: 'holy-bible-king-james-version',
    title: 'Holy Bible (KJV, LDS edition)',
    urls: [
      'https://images-us-prod.cms.commerce.dynamics.com/cms/api/fswvqbgntk/imageFileData/search?fileName=/Products%2FPI340300_000_001.png',
      'https://files.plytix.com/api/v1.1/rn/public_files/pim/assets/3e/1e/de/64/64de1e3e6974570001d45a2c/images/9e/62/21/66/6621629e4d8f8419f6be63c8/5111208_5111208_none_base_7d5112cf.png/5111208_5111208_none_base_7d5112cf.jpg?s=1000x1000&t=JPEG',
    ],
  },
  {
    slug: 'the-doctrine-and-covenants',
    title: 'The Doctrine and Covenants',
    urls: [
      'https://images-us-prod.cms.commerce.dynamics.com/cms/api/fswvqbgntk/imageFileData/search?fileName=/Products%2FPI41700_000_001.png',
      'https://files.plytix.com/api/v1.1/rn/public_files/pim/assets/3e/1e/de/64/64de1e3e6974570001d45a2c/images/31/79/21/66/66217931b1dea3bbbe497080/5130962_5130962_none_base_4021c023.png/5130962_5130962_none_base_4021c023.jpg?s=1000x1000&t=JPEG',
    ],
  },
  {
    slug: 'the-pearl-of-great-price',
    title: 'The Pearl of Great Price',
    urls: [
      'https://images-us-prod.cms.commerce.dynamics.com/cms/api/fswvqbgntk/imageFileData/search?fileName=/Products%2FPI348100_000_001.png',
    ],
  },
  {
    slug: 'the-new-testament-a-translation-for-latter-day-saints',
    title: 'The New Testament: A Translation for Latter-day Saints (Wayment)',
    urls: [
      'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1550294824i/44021266.jpg',
      'https://files.plytix.com/api/v1.1/rn/public_files/pim/assets/3e/1e/de/64/64de1e3e6974570001d45a2c/images/a8/70/21/66/662170a84d8f8419f6bef5ad/6024827_The_New_Testament_Translation.png/6024827_The_New_Testament_Translation.jpg?s=1000x1000&t=JPEG',
    ],
  },
  {
    slug: 'the-book-of-mormon-godwin-s-illustrated-edition',
    title: "The Book of Mormon (Godwin's Illustrated Edition)",
    urls: [
      'https://nauvoo.supply/cdn/shop/files/81qDtAfJTaL._SL1499.jpg?v=1732547392',
      'https://m.media-amazon.com/images/I/81qDtAfJTaL.jpg',
    ],
  },
  {
    slug: 'the-doctrines-and-the-mysteries',
    title: 'The Doctrines and the Mysteries (Godwin)',
    urls: [
      'https://plainandpreciouspublishing.com/cdn/shop/files/Screenshot_2025-11-23_at_2.29.12_PM.png?v=1763933401',
      'https://plainandpreciouspublishing.com/cdn/shop/files/IMG_D7D3F6BC0CD0-1.jpg?v=1763933401',
    ],
  },
  {
    slug: 'the-joseph-smith-papers-journals-vol-1',
    title: 'The Joseph Smith Papers, Journals Vol. 1',
    urls: [
      'https://files.plytix.com/api/v1.1/rn/public_files/pim/assets/3e/1e/de/64/64de1e3e6974570001d45a2c/images/83/a5/cf/67/67cfa5839ab7822b03cb8c98/P4389351_P4389351_none_base_91a96470.png/P4389351_P4389351_none_base_91a96470.jpg?s=1000x1000&t=JPEG',
      'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1418286685i/4469975.jpg',
    ],
  },
  {
    slug: 'the-joseph-smith-papers-journals-vol-2',
    title: 'The Joseph Smith Papers, Journals Vol. 2',
    urls: [
      'https://media.rainpos.com/5709/jsp_v2.jpg',
      'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1418286520i/11128986.jpg',
    ],
  },
  {
    slug: 'god-will-prevail',
    title: 'God Will Prevail (Muhlestein)',
    urls: [
      'https://files.plytix.com/api/v1.1/rn/public_files/pim/assets/3e/1e/de/64/64de1e3e6974570001d45a2c/images/df/82/b0/68/68b082df6e8bf4b2ad427e59/P5251547_HERO_GOD-WILL-PREVAIL.png/P5251547_HERO_GOD-WILL-PREVAIL.jpg?s=1000x1000&t=JPEG',
      'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1612744318i/56985570.jpg',
    ],
  },
];

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function download(url) {
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      redirect: 'follow',
    });
    if (!resp.ok) return null;
    const buf = Buffer.from(await resp.arrayBuffer());
    if (buf.length < 3000) return null;
    return buf;
  } catch {
    return null;
  }
}

async function main() {
  let ok = 0;
  const failed = [];

  for (const fix of fixes) {
    let done = false;
    for (const url of fix.urls) {
      const buf = await download(url);
      if (!buf) continue;
      try {
        const img = sharp(buf);
        const meta = await img.metadata();
        if (!meta.width || meta.width < 200) continue;
        const out = await img
          .flatten({ background: '#ffffff' }) // in case of transparent PNGs
          .resize({ width: 600, withoutEnlargement: true })
          .jpeg({ quality: 88 })
          .toBuffer();
        writeFileSync(join(COVERS_DIR, `${fix.slug}.jpg`), out);
        console.log(`  ✓ ${fix.title} (${meta.width}x${meta.height} → jpg, ${Math.round(out.length / 1024)}KB)`);
        ok++;
        done = true;
        break;
      } catch {
        continue; // not a decodable image, try next URL
      }
    }
    if (!done) {
      failed.push(fix.title);
      console.log(`  ✗ ${fix.title} — all sources failed`);
    }
    await sleep(300);
  }

  console.log(`\nDone: ${ok}/${fixes.length}.`);
  if (failed.length) {
    console.log(`Failed: ${failed.join('; ')}`);
    console.log('Tell Claude which ones failed and it will find alternate sources.');
  }
}

main();
