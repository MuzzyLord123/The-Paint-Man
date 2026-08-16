# Paint brand logos

Five files go in this folder, one per brand in `src/data/brands.ts`.

## What to get

Use the manufacturer's **own supplied artwork** — the file from their press kit,
brand-assets or media page. Not a screenshot of their website, and not a redrawn
copy: a logo that is nearly right looks worse than a name set in type, which is
what the strip shows until the real file arrives.

SVG is ideal. A transparent PNG about 600px wide is plenty — the strip never
renders one taller than 56px.

| Brand         | Where it comes from             | Suggested filename    |
| ------------- | ------------------------------- | --------------------- |
| Little Greene | littlegreene.com                | `little-greene.svg`   |
| Farrow & Ball | farrow-ball.com                 | `farrow-and-ball.svg` |
| Dulux         | dulux.co.uk                     | `dulux.svg`           |
| Crown         | crownpaints.com                 | `crown.svg`           |
| Johnstone's   | johnstonespaint.com             | `johnstones.svg`      |

## How to switch one on

Put the file in this folder, named after the brand's slug, and rebuild. That is
the whole job — **there is no code to change.** The strip reads this folder at
build time, finds `dulux.png`, reads its real dimensions and renders it; the
other four carry on as wordmarks until their files arrive, so they can go in one
at a time.

Accepted extensions, in preference order: `.svg`, `.webp`, `.png`, `.jpg`.

Everything after that is handled: SVGs are served straight from this origin
rather than through the image optimiser (deliberate — the optimiser is not
allowed to process arbitrary SVG), rasters are optimised normally, and the
aspect ratio is taken from the file so a wide wordmark and a square tile both
land on the same optical line.

## Two things the strip already handles

- **Backgrounds.** Each logo sits on its own light plate, because these five
  marks are drawn for different grounds and the page is near-black. Do not
  recolour anyone's logo to suit the page.
- **Sizing.** Anything is contained and capped at the plate height, so a wide
  wordmark and a square tile sit on the same optical line.

## One thing to check before shipping

`npm run audit:images` walks the built site and fails on an image that does not
load, so run it once after adding files.
