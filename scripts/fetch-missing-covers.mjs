#!/usr/bin/env node
/**
 * Fallback cover fetcher — tries multiple sources for missing covers.
 * Run from project root: node scripts/fetch-missing-covers.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const COVERS_DIR = join(process.cwd(), 'public/images/covers');
const BOOKS_PATH = join(process.cwd(), 'src/data/books.json');

mkdirSync(COVERS_DIR, { recursive: true });

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function tryDownload(url, filepath) {
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      redirect: 'follow',
    });
    if (resp.ok) {
      const buffer = Buffer.from(await resp.arrayBuffer());
      // Check it's actually an image and not a placeholder/error page
      if (buffer.length > 2000 && buffer[0] === 0xFF && buffer[1] === 0xD8) {
        // JPEG signature
        writeFileSync(filepath, buffer);
        return true;
      }
      if (buffer.length > 2000 && buffer[0] === 0x89 && buffer[1] === 0x50) {
        // PNG signature
        writeFileSync(filepath, buffer);
        return true;
      }
      // Try saving anyway if large enough
      if (buffer.length > 5000) {
        writeFileSync(filepath, buffer);
        return true;
      }
    }
  } catch (e) {
    // silent fail, try next source
  }
  return false;
}

async function fetchCoverMultiSource(title, author) {
  const slug = slugify(title);
  const filepath = join(COVERS_DIR, `${slug}.jpg`);

  if (existsSync(filepath) && statSync(filepath).size > 2000) {
    return { slug, found: true, status: 'already exists' };
  }

  const cleanTitle = title.replace(/\(.*?\)/g, '').replace(/Vol\.\s*\d+:?\s*/g, '').trim();

  // Source 1: Open Library search (with cleaned title)
  try {
    const q = encodeURIComponent(`${cleanTitle} ${author}`);
    const resp = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=5&fields=key,title,cover_i,isbn`, {
      headers: { 'User-Agent': 'StefanCoburnBookshelf/1.0' },
    });
    const data = await resp.json();
    if (data.docs) {
      for (const doc of data.docs) {
        if (doc.cover_i) {
          // Try large size first, then medium
          for (const size of ['L', 'M']) {
            const ok = await tryDownload(
              `https://covers.openlibrary.org/b/id/${doc.cover_i}-${size}.jpg`,
              filepath
            );
            if (ok) return { slug, found: true, status: `openlibrary-${size}` };
          }
        }
        // Try by ISBN if available
        if (doc.isbn && doc.isbn.length > 0) {
          for (const isbn of doc.isbn.slice(0, 3)) {
            const ok = await tryDownload(
              `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
              filepath
            );
            if (ok) return { slug, found: true, status: 'openlibrary-isbn' };
          }
        }
      }
    }
  } catch (e) { /* try next */ }

  await sleep(200);

  // Source 2: Google Books API
  try {
    const q = encodeURIComponent(`${cleanTitle} ${author}`);
    const resp = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=5`);
    const data = await resp.json();
    if (data.items) {
      for (const item of data.items) {
        const links = item.volumeInfo?.imageLinks;
        if (links) {
          // Try all available image sizes
          for (const key of ['large', 'medium', 'small', 'thumbnail', 'smallThumbnail']) {
            if (links[key]) {
              let url = links[key].replace('http://', 'https://');
              const ok = await tryDownload(url, filepath);
              if (ok) return { slug, found: true, status: `google-${key}` };
            }
          }
        }
      }
    }
  } catch (e) { /* try next */ }

  await sleep(200);

  // Source 3: Open Library by title only (broader search)
  try {
    const q = encodeURIComponent(cleanTitle);
    const resp = await fetch(`https://openlibrary.org/search.json?title=${q}&limit=5&fields=key,title,cover_i`, {
      headers: { 'User-Agent': 'StefanCoburnBookshelf/1.0' },
    });
    const data = await resp.json();
    if (data.docs) {
      for (const doc of data.docs) {
        if (doc.cover_i) {
          const ok = await tryDownload(
            `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`,
            filepath
          );
          if (ok) return { slug, found: true, status: 'openlibrary-title-only' };
        }
      }
    }
  } catch (e) { /* try next */ }

  return { slug, found: false, status: 'exhausted all sources' };
}

async function main() {
  const books = JSON.parse(readFileSync(BOOKS_PATH, 'utf8'));

  const missing = books.filter((b) => {
    const slug = b.slug || slugify(b.title);
    const filepath = join(COVERS_DIR, `${slug}.jpg`);
    return !existsSync(filepath) || statSync(filepath).size < 2000;
  });

  if (missing.length === 0) {
    console.log('All books have covers! Nothing to do.');
    return;
  }

  console.log(`Found ${missing.length} books missing covers. Trying multiple sources...\n`);

  let found = 0;
  let stillMissing = [];

  for (let i = 0; i < missing.length; i++) {
    const book = missing[i];
    const result = await fetchCoverMultiSource(book.title, book.author);

    const bookIdx = books.findIndex((b) => b.title === book.title);
    if (bookIdx >= 0) {
      books[bookIdx].hasCover = result.found;
      books[bookIdx].slug = result.slug;
    }

    if (result.found) {
      found++;
      process.stdout.write(`  ✓ [${i + 1}/${missing.length}] ${book.title} (${result.status})\n`);
    } else {
      stillMissing.push(book.title);
      process.stdout.write(`  ✗ [${i + 1}/${missing.length}] ${book.title}\n`);
    }

    await sleep(300);
  }

  writeFileSync(BOOKS_PATH, JSON.stringify(books, null, 2));

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Recovered ${found}/${missing.length} covers.`);
  if (stillMissing.length) {
    console.log(`\nStill missing (${stillMissing.length}) — will use styled placeholders:`);
    stillMissing.forEach((t) => console.log(`  - ${t}`));
  }
}

main();
