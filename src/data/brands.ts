export type Brand = {
  name: string;
  /**
   * The filename to look for in public/brands, without an extension.
   *
   * This is the whole contract for adding artwork: name the file after the
   * slug — `dulux.png`, `farrow-and-ball.svg` — and the strip picks it up on
   * the next build. Nothing here needs editing. See src/lib/brand-logos.ts.
   */
  slug: string;
  /** The manufacturer's own site, for reference — not linked from the page. */
  site: string;
};

/**
 * The paint brands the business actually works with.
 *
 * THE ORDER IS THE DISPLAY ORDER, and Dulux is third because the client asked
 * for it in the middle — it being the name most customers recognise. That was
 * a request about a static row of five, where the centre is the position the
 * eye lands on first. This is a scrolling banner now and Valspar has made it
 * six, so there is no fixed middle any more: every logo passes the centre of
 * the screen on every loop. Dulux stays third because the sequence is still
 * worth choosing, not because that position now does the work it used to.
 *
 * THESE ARE OTHER COMPANIES' TRADEMARKS. They are shown to say which materials
 * this decorator buys and uses — ordinary, honest nominative use — and nothing
 * on the page claims a partnership, an endorsement, an approval or an official
 * stockist status, because none of that has been agreed. If any manufacturer
 * ever asks for their mark to be removed, delete the entry: the strip renders
 * whatever is in this array and needs no other change.
 *
 * THE ARTWORK CAME FROM THE CLIENT, not from the manufacturers' sites — those
 * are refused by the network policy where this is built. Each file was trimmed
 * of white or transparent margin only: a coloured corner means the background
 * IS part of the mark (Farrow & Ball's slate plate, Dulux's navy tile) and
 * cropping it would strip half the logo. Nothing was recoloured or redrawn.
 *
 * A brand with no file in public/brands falls back to its name in type, so the
 * banner never shows a hole. See public/brands/README.md.
 */
export const brands: Brand[] = [
  { name: "Little Greene", slug: "little-greene", site: "https://www.littlegreene.com" },
  { name: "Farrow & Ball", slug: "farrow-and-ball", site: "https://www.farrow-ball.com" },
  /* Third, by request — see the note on ordering above. */
  { name: "Dulux", slug: "dulux", site: "https://www.dulux.co.uk" },
  { name: "Crown", slug: "crown", site: "https://www.crownpaints.com" },
  { name: "Johnstone's", slug: "johnstones", site: "https://www.johnstonespaint.com" },
  { name: "Valspar", slug: "valspar", site: "https://www.valsparpaint.co.uk" },
];
