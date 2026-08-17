# stefancoburn.com — Claude instructions

## Publishing an essay

When Stefan delivers an essay to publish, **always ask him for any of these he didn't supply**, then create the file in `src/content/essays/{slug}.md` with this frontmatter:

```yaml
---
title: My Essay
date: 2026-06-09
description: One-line summary.
prominence: high
---
```

- `title` — essay title
- `date` — publish date, YYYY-MM-DD
- `description` — one-line summary shown on the essays index
- `prominence` — `normal`, `medium`, or `high`. Controls how the essay appears on the essays timeline (pi.website-inspired):
  - `high` → dark-bordered box with hard offset shadow (most prominent)
  - `medium` → quiet panel-toned box
  - `normal` → no box, plain on the timeline rail (default if omitted)

If Stefan forgets to specify `prominence`, ask him before publishing — don't silently default.

Three placeholder essays (`placeholder-*.md` in `src/content/essays/`) demo each tier. Delete them once real essays exist.

## Publishing workflow

Stefan publishes through this Claude interface. After creating/editing files, give him exact copy-paste git commands:

```
cd ~/Documents/stefancoburn-site
git add <specific files>
git commit -m "Description"
git push
```

Vercel auto-deploys on push to main. Stefan is a git novice — always give exact commands.

## Performance setup (Aug 2026 speed pass) — keep it fast

- **Book covers live in `src/images/covers/{slug}.jpg`** (not `public/`). They go through Astro's image pipeline via `src/components/Cover.astro`: resized, converted to AVIF (+WebP fallback), content-hashed, lazy-loaded. Just drop a JPEG in and rebuild — no manual optimizing. First Vercel build after adding covers takes a couple of minutes longer (image processing); subsequent builds are cached.
- The profile photo is `src/images/profile.jpg`, imported in `src/pages/index.astro`.
- Essay photos go in `public/images/essays/` as pre-sized AVIF/WebP (see the `<picture>` markup in `src/content/essays/fear.md`). Files under `/images/` are cached for a year by `vercel.json`, so **use a new filename** rather than overwriting an existing one.
- Fonts are self-hosted from `src/fonts/*.woff2` and declared in `src/styles/fonts.css` (Newsreader 400/500/600/400i, Lato 400/700 only). Don't reintroduce `@fontsource` imports or extra weights without a reason — every weight is ~23 KB per page.
- All CSS is inlined into each page (`build.inlineStylesheets: 'always'`), so keep `global.css` lean.
- Internal links are prefetched on hover/touch and prerendered in Chromium (`prefetch` + `experimental.clientPrerender` in `astro.config.mjs`).
- Vercel Speed Insights was removed on purpose; Vercel Analytics stays.

## Content conventions (Aug 2026 polish pass)

- Quotes live in `src/data/quotes.ts` (not inline in the page). The home-page "Quotes kept" stat counts that array automatically.
- Book notes: the note filename normally equals the book's bookshelf `slug`. If it doesn't, add `book: "<bookshelf-slug>"` to the note's frontmatter (see `elder-statesman.md`) so the note page shows the cover/rating and the bookshelf shows the Notes badge.
- Essays and book notes get automatic Older/Newer links (by date) — nothing to do per post.
- Bookshelf filters are shareable: `/bookshelf?genre=History&sort=title-asc&q=feyn`.
- Books without a note render as non-links on the bookshelf (no more `href="#"`).
- iOS icon is `public/apple-touch-icon.png` (generated from an SVG of the brand mark); `favicon.svg` is the browser-tab icon.

## Email newsletter (Buttondown)

- Subscribe box: `src/components/Subscribe.astro`, shown at the end of every essay and book note. Plain HTML POST to Buttondown (works without JS); with JS it submits in the background and confirms inline.
- The Buttondown username lives in `src/data/site.ts` (`BUTTONDOWN_USERNAME`). If Stefan's Buttondown URL isn't buttondown.com/stefancoburn, change that one constant.
- Sending is automatic: `.github/workflows/newsletter.yml` runs on every push to main; for each content file *added* in that push (essays or book notes) it waits for the page to be live, then `scripts/send-newsletter.mjs` creates the email in Buttondown via API (free plan includes API). Editing an existing post never re-sends. Needs the repo secret `BUTTONDOWN_API_KEY`; the optional repo variable `NEWSLETTER_MODE=draft` makes it create drafts for review instead of sending. Preview an email locally: `node scripts/send-newsletter.mjs --dry-run src/content/essays/<slug>.md`.
- Because of this, **publishing an essay = sending an email**. Before pushing a new essay, confirm with Stefan that it's ready to go out (or that NEWSLETTER_MODE is draft).
