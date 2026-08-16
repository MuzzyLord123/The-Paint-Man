export type Brand = {
  name: string;
  /** The manufacturer's own site, for reference — not linked from the page. */
  site: string;
  /**
   * The logo file under public/brands, once the artwork is in.
   *
   * OPTIONAL ON PURPOSE. Until a real file is dropped in, the strip sets the
   * brand's NAME in the site's own display face rather than showing a gap or,
   * worse, a hand-drawn imitation of somebody's trademark. See the note at the
   * top of PaintBrands.tsx.
   */
  logo?: {
    src: string;
    /** The file's real pixel dimensions — next/image needs both. */
    width: number;
    height: number;
  };
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
 * ADDING THE ARTWORK. Drop the file in public/brands and fill in `logo` with
 * its real pixel size. Use the manufacturer's own supplied logo — a press-kit
 * or brand-assets download, not a screenshot and not a redrawn copy. SVG is
 * ideal; a transparent PNG at roughly 600px wide is plenty. Nothing else needs
 * touching: the strip swaps from the wordmark to the image on its own.
 */
export const brands: Brand[] = [
  { name: "Little Greene", site: "https://www.littlegreene.com" },
  { name: "Farrow & Ball", site: "https://www.farrow-ball.com" },
  /* The middle of the five — see the note above. */
  { name: "Dulux", site: "https://www.dulux.co.uk" },
  { name: "Crown", site: "https://www.crownpaints.com" },
  { name: "Johnstone's", site: "https://www.johnstonespaint.com" },
];
