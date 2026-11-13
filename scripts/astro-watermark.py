#!/usr/bin/env python3
"""
Watermark an astrophoto for stefancoburn.com/astrophotography.

    python3 scripts/astro-watermark.py <source.jpg> <output.jpg> "<CAPTION>"

    e.g. python3 scripts/astro-watermark.py ~/Downloads/m42.jpg src/images/astro/orion-nebula.jpg "M42 · Orion Nebula"

Always run it on the clean, un-watermarked original (never on an already-marked file).

What it draws
  bottom left   the object caption: catalogue number, a middle dot, the common name
                ("M45 · Pleiades"). Lato Black, capitals, letter-spacing .26em, white at 88%.
  bottom right  "Stefan Coburn" in Newsreader italic, a thin rule in the site's accent
                orange (#d4764e), then "stefancoburn.com" in small spaced Lato Bold capitals.
                White at 85%. Both sides carry a soft dark glow so they read on bright nebulae.

Sizing
  The mark is sized from how wide the photo is SHOWN on the page, not from its pixel count,
  so it looks the same on screen for every photo whatever its resolution or crop:
      portrait photos  are shown 400 px wide
      landscape photos are shown about 622 px wide
  1 unit (u) = 4 CSS px on the page  ->  u = 4 * image_width / display_width.
  Margin 3.2u · caption 1.55u · signature 3.1u · rule 9u wide · site address 1.0u.
  If the page layout in src/pages/astrophotography.astro changes those display widths,
  change DISPLAY_W below to match and re-run on every photo.

Needs: Python 3 with Pillow and Playwright, a Chrome/Chromium install, and internet access
for the two Google Fonts (Newsreader, Lato). Claude runs this in its own workspace; it is
kept here so the exact style is on record.
"""
import asyncio, html, io, os, sys
from PIL import Image
from playwright.async_api import async_playwright

DISPLAY_W = {'portrait': 400.0, 'landscape': 622.0}
ACCENT = '#d4764e'
FONTS = ('<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@'
         '0,6..72,400;1,6..72,400&family=Lato:wght@700;900&display=swap" rel="stylesheet">')

def overlay_html(W, H, caption):
    u = 4.0 * W / DISPLAY_W['portrait' if H > W else 'landscape']
    m = 3.2 * u
    glow = f"text-shadow:0 0 {0.5*u}px rgba(0,0,0,.55),0 0 {1.4*u}px rgba(0,0,0,.35);"
    body = f"""
    <div style="position:absolute;right:{m}px;bottom:{m}px;text-align:right;opacity:.85">
      <div style="font:italic 400 {3.1*u}px Newsreader,serif;color:#fff;letter-spacing:-.005em;{glow}">Stefan Coburn</div>
      <div style="height:{max(1, 0.1*u)}px;background:{ACCENT};margin:{0.55*u}px 0 {0.7*u}px auto;width:{9*u}px"></div>
      <div style="font:700 {1.0*u}px Lato,sans-serif;color:#fff;letter-spacing:.28em;margin-right:-.28em;text-transform:uppercase;{glow}">stefancoburn.com</div>
    </div>
    <div style="position:absolute;left:{m}px;bottom:{m}px;font:900 {1.55*u}px Lato,sans-serif;color:#fff;letter-spacing:.26em;text-transform:uppercase;opacity:.88;white-space:nowrap;line-height:1;{glow}">{html.escape(caption)}</div>"""
    return (f'<!doctype html><html><head><meta charset="utf-8">{FONTS}<style>html,body{{margin:0;background:transparent}}'
            f'body{{width:{W}px;height:{H}px;position:relative;overflow:hidden}}</style></head><body>{body}</body></html>')

async def watermark(src, out, caption):
    im = Image.open(src).convert('RGB')
    W, H = im.size
    async with async_playwright() as p:
        kw = {}
        if os.environ.get('CHROME_PATH'): kw['executable_path'] = os.environ['CHROME_PATH']
        if os.environ.get('HTTPS_PROXY'): kw['proxy'] = {'server': os.environ['HTTPS_PROXY']}
        browser = await p.chromium.launch(**kw)
        page = await browser.new_page(viewport={'width': W, 'height': H})
        await page.set_content(overlay_html(W, H, caption), wait_until='networkidle')
        await page.evaluate('document.fonts.ready')
        await page.wait_for_timeout(250)
        if not await page.evaluate("document.fonts.check('italic 400 20px Newsreader') && document.fonts.check('900 20px Lato')"):
            sys.exit('Fonts did not load (Newsreader / Lato) - not writing a file with fallback fonts.')
        png = await page.screenshot(omit_background=True, type='png')
        await browser.close()
    overlay = Image.open(io.BytesIO(png)).convert('RGBA')
    Image.alpha_composite(im.convert('RGBA'), overlay).convert('RGB').save(out, quality=95, subsampling=0)
    print(f'{out}: {W}x{H}, caption "{caption}"')

if __name__ == '__main__':
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    asyncio.run(watermark(sys.argv[1], sys.argv[2], sys.argv[3]))
