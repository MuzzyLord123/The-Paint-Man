import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { brands } from "@/data/brands";

/**
 * The paint brands strip — the band under the hero saying what goes on the wall.
 *
 * WHY IT SITS WHERE IT DOES. Straight under the hero and above the trades: a
 * customer comparing decorators wants to know two things early, who you are and
 * what you put on their walls, and naming the tins is one of the few claims on
 * a decorator's site that a reader can check for themselves. It is a band
 * rather than a section — no display heading, no CTA — so it hands over to the
 * services block quickly instead of competing with it.
 *
 * LIGHT PLATES, NOT LOOSE LOGOS. The page ground is near-black and these are
 * five other companies' marks, drawn for their own backgrounds: Farrow & Ball's
 * is white on dark slate, Little Greene's and Crown's are near-black on white,
 * Dulux's is a navy tile and Johnstone's a blue badge. There is no single
 * ground that suits all five, and recolouring a trademark to suit a page is
 * exactly what a brand guideline forbids. So each one gets its own light plate
 * — the site's card radius, a hairline, nothing else — and every mark is shown
 * as its owner drew it.
 *
 * NO LINKS, DELIBERATELY. Five outbound links under the hero is five ways off a
 * page whose whole job is to produce an enquiry, and the strip is a statement
 * about materials rather than a set of references. The brand's own address is
 * kept in src/data/brands.ts for whoever needs it.
 *
 * WHILE THE ARTWORK IS MISSING, the strip sets the names as one ruled row on
 * the page's own ground — NOT as empty plates. An empty light plate is a hole
 * that announces a missing image; the same names set as type read as a
 * deliberate list. So the plate only exists to host a logo, and appears with
 * one. A name is also the honest fallback: it is true, where a redrawn
 * approximation of somebody's mark gets worse the closer it looks.
 *
 * Dropping a file into public/brands and filling in `logo` in the data file
 * swaps that brand to its real mark on a plate, one at a time, with no change
 * here — so the two states can coexist while the artwork comes in.
 */
export function PaintBrands() {
  if (brands.length === 0) return null;

  return (
    <section
      className="border-b border-hairline bg-accent-wash/40 py-12 lg:py-14"
      aria-labelledby="brands-heading"
    >
      <div className="shell">
        <Reveal>
          <h2
            id="brands-heading"
            className="max-w-[46rem] font-display text-[1.375rem] leading-tight font-semibold tracking-[-0.025em] text-balance text-ink sm:text-[1.625rem]"
          >
            We use all the top leading paint brands in the UK
          </h2>
          <div className="tape-line mt-5" aria-hidden="true" />
        </Reveal>

        <Reveal>
          {/* SPACE IS THE SEPARATOR, not a character. An accent dot between
              names is the site's own byline device and it read well on one
              line — but this row wraps on a phone, and any between-items
              separator then dangles at the start of the new line, which looks
              like a typo. Generous gaps say the same thing and cannot wrap
              wrongly. */}
          <ul className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4 lg:gap-x-12">
            {brands.map((brand) => (
              <li key={brand.name} className="flex items-center">
                {brand.logo ? (
                  /* The plate exists ONLY to host a mark. These five logos are
                     drawn for their own grounds — white on slate, near-black on
                     white, a navy tile, a blue badge — and bg-ink is this dark
                     site's near-white token, so each one is shown as its owner
                     drew it rather than recoloured to suit the page. */
                  <span className="grid h-16 place-items-center rounded-[4px] border border-ink/15 bg-ink px-4 lg:h-20 lg:px-5">
                    <Image
                      src={brand.logo.src}
                      /* The brand name, not "logo" — a screen reader saying
                         "Dulux" is the information; "Dulux logo" is furniture. */
                      alt={brand.name}
                      width={brand.logo.width}
                      height={brand.logo.height}
                      /* Contained and capped, so a wide wordmark and a square
                         tile both sit on the same optical line whatever their
                         proportions. */
                      className="max-h-10 w-auto object-contain lg:max-h-12"
                    />
                  </span>
                ) : (
                  <span className="font-display text-[1.125rem] leading-tight font-semibold tracking-[-0.02em] whitespace-nowrap text-ink lg:text-[1.375rem]">
                    {brand.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Reveal>

        <p className="mt-5 text-[0.8125rem] leading-relaxed text-ink-mute">
          {/* Says what the strip means and, just as importantly, what it does
              not. Every mark belongs to its manufacturer; using their paint is
              not the same as being endorsed by them, and the difference is
              worth one honest sentence. */}
          Trade names and marks belong to their respective manufacturers. We buy and apply their
          products; nothing here implies any endorsement or approval by them.
        </p>
      </div>
    </section>
  );
}
