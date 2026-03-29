#!/usr/bin/env node
/**
 * Fetches book cover images from Open Library for all books in books.json.
 * Run from project root: node scripts/fetch-covers.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const COVERS_DIR = join(process.cwd(), 'public/images/covers');
const BOOKS_PATH = join(process.cwd(), 'src/data/books.json');

mkdirSync(COVERS_DIR, { recursive: true });

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchCover(title, author) {
  const slug = slugify(title);
  const filepath = join(COVERS_DIR, `${slug}.jpg`);

  // Skip if already downloaded
  if (existsSync(filepath)) {
    const stat = (await import('fs')).statSync(filepath);
    if (stat.size > 1000) {
      return { slug, found: true, status: 'cached' };
    }
  }

  // Search Open Library
  const query = encodeURIComponent(`${title} ${author}`);
  const url = `https://openlibrary.org/search.json?q=${query}&limit=3&fields=key,title,author_name,cover_i`;

  try {
    const resp = await fetch(url);
    const data = await resp.json();

    if (data.docs) {
      for (const doc of data.docs) {
        if (doc.cover_i) {
          // Download medium-size cover
          const coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
          const imgResp = await fetch(coverUrl);
          if (imgResp.ok) {
            const buffer = Buffer.from(await imgResp.arrayBuffer());
            if (buffer.length > 500) {
              writeFileSync(filepath, buffer);
              return { slug, found: true, status: 'downloaded' };
            }
          }
        }
      }
    }
    return { slug, found: false, status: 'no cover found' };
  } catch (err) {
    return { slug, found: false, status: err.message.slice(0, 50) };
  }
}

async function main() {
  const books = JSON.parse(readFileSync(BOOKS_PATH, 'utf8'));
  let found = 0;
  let missing = [];

  console.log(`Fetching covers for ${books.length} books...\n`);

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const slug = slugify(book.title);
    book.slug = slug;

    const result = await fetchCover(book.title, book.author);
    book.hasCover = result.found;

    if (result.found) {
      found++;
      process.stdout.write(`  ✓ [${i + 1}/${books.length}] ${book.title} (${result.status})\n`);
    } else {
      missing.push(book.title);
      process.stdout.write(`  ✗ [${i + 1}/${books.length}] ${book.title} — ${result.status}\n`);
    }

    // Rate limit: 300ms between requests
    if (result.status !== 'cached') {
      await sleep(300);
    }
  }

  // Save updated books.json with slugs and hasCover flags
  writeFileSync(BOOKS_PATH, JSON.stringify(books, null, 2));

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Done! ${found}/${books.length} covers found.`);
  if (missing.length) {
    console.log(`\nMissing covers (${missing.length}):`);
    missing.forEach((t) => console.log(`  - ${t}`));
  }
  console.log(`\nCovers saved to: public/images/covers/`);
  console.log(`Updated: src/data/books.json (added slug + hasCover fields)`);
}

main();
