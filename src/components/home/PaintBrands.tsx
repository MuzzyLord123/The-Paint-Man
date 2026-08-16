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
 * WHILE THE ARTWORK IS MISSING, each brand is set as a WORDMARK in the site's
 * display face rather than shown as a gap or a redrawn approximation. That is a
 * deliberate state, not a broken one: it reads as a considered list of names
 * and it degrades in the right direction — a name is true, a hand-copied logo
 * is a worse lie the closer it gets. Dropping a file into public/brands and
 * filling in `logo` in the data file swaps it for the real mark, one brand at a
 * time, with no change here.
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
          {/* Five across on a desktop, so the middle brand is genuinely in the
              middle; two across on a phone, where five would be 60px each.
              The last plate spans both columns on the narrowest layout rather
              than sitting alone in a half-width box. */}
          <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
            {brands.map((brand, index) => (
              <li
                key={brand.name}
                className={
                  index === brands.length - 1 && brands.length % 2 === 1
                    ? "max-sm:col-span-2 sm:max-lg:col-span-3"
                    : undefined
                }
              >
                {/* bg-ink is the near-WHITE token on this dark site, and the
                    plate has to be light: Little Greene's and Crown's marks are
                    near-black artwork and would disappear on the page ground,
                    while recolouring them to suit it is the one thing a brand
                    guideline will not allow. */}
                <div className="grid h-20 place-items-center rounded-[4px] border border-ink/15 bg-ink px-4 lg:h-24">
                  {brand.logo ? (
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
                      className="max-h-12 w-auto object-contain lg:max-h-14"
                    />
                  ) : (
                    /* Near-black on the light plate — about 18:1, and the same
                       way round the real logos will sit. */
                    <span className="text-center font-display text-[1.0625rem] leading-tight font-semibold tracking-[-0.02em] text-balance text-paper lg:text-[1.125rem]">
                      {brand.name}
                    </span>
                  )}
                </div>
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
