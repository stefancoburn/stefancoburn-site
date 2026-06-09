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
