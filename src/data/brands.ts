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
 * THE ORDER IS THE DISPLAY ORDER, and Dulux sits in the middle of five because
 * it is the one most customers recognise — the client asked for it there
 * specifically, and the centre of an odd-numbered row is the position the eye
 * lands on first. Adding a sixth brand breaks that centring: keep the list odd,
 * or move Dulux to whatever the new middle is.
 *
 * THESE ARE OTHER COMPANIES' TRADEMARKS. They are shown to say which materials
 * this decorator buys and uses — ordinary, honest nominative use — and nothing
 * on the page claims a partnership, an endorsement, an approval or an official
 * stockist status, because none of that has been agreed. If any manufacturer
 * ever asks for their mark to be removed, delete the entry: the strip renders
 * whatever is in this array and needs no other change.
 *
 * THE ARTWORK IS NOT IN THE REPOSITORY. It could not be fetched where this was
 * built — the network policy refuses all five manufacturers' sites outright —
 * so until somebody drops the files in, each brand is shown as its NAME set in
 * the site's own face. That is deliberate: a name is true, whereas a redrawn
 * copy of somebody's mark is wrong in a way that gets worse the closer it
 * looks. public/brands/README.md is the instruction for finishing it.
 */
export const brands: Brand[] = [
  { name: "Little Greene", slug: "little-greene", site: "https://www.littlegreene.com" },
  { name: "Farrow & Ball", slug: "farrow-and-ball", site: "https://www.farrow-ball.com" },
  /* The middle of the five — see the note above. */
  { name: "Dulux", slug: "dulux", site: "https://www.dulux.co.uk" },
  { name: "Crown", slug: "crown", site: "https://www.crownpaints.com" },
  { name: "Johnstone's", slug: "johnstones", site: "https://www.johnstonespaint.com" },
];
