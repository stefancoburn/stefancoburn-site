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
