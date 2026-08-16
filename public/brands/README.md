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

Add the `logo` field to that brand in `src/data/brands.ts`, with the file's real
pixel dimensions:

```ts
{
  name: "Dulux",
  site: "https://www.dulux.co.uk",
  logo: { src: "/brands/dulux.svg", width: 600, height: 600 },
},
```

That is the whole job. The strip swaps that brand from its wordmark to the image
and leaves the other four alone, so they can go in one at a time.

## Two things the strip already handles

- **Backgrounds.** Each logo sits on its own light plate, because these five
  marks are drawn for different grounds and the page is near-black. Do not
  recolour anyone's logo to suit the page.
- **Sizing.** Anything is contained and capped at the plate height, so a wide
  wordmark and a square tile sit on the same optical line.

## One thing to check before shipping

`npm run audit:images` walks the built site and fails on an image that does not
load, so run it once after adding files.
