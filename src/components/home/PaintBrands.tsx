import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { brands } from "@/data/brands";
import { resolveBrandLogo } from "@/lib/brand-logos";

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
 * Dropping a file into public/brands is the ONLY step — the logo is discovered
 * on the filesystem at build time, so no code changes hands to switch a brand
 * over, and the two states coexist while the artwork comes in one file at a
 * time. See src/lib/brand-logos.ts.
 */
export async function PaintBrands() {
  if (brands.length === 0) return null;

  /* Server component, so this is a build-time read that gets baked into the
     static HTML — a visitor never touches the filesystem. */
  const withLogos = await Promise.all(
    brands.map(async (brand) => ({ ...brand, logo: await resolveBrandLogo(brand.slug) })),
  );

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
      </div>

      {/* FULL-BLEED, outside the shell, because a banner that stops at the text
          column is not a banner. The band clips and masks its own edges — see
          .marquee-band in globals.css. */}
      <div
        className="marquee-band relative mt-7 overflow-hidden"
        /* The whole list, once, for anything that reads rather than looks. The
           copies below are all aria-hidden, so this is said once however many
           times it is drawn. */
        aria-label={`Paint brands we use: ${brands.map((b) => b.name).join(", ")}`}
      >
        <div className="brand-marquee-track flex w-max items-center">
          {/* TWO HALVES, and each half is the list repeated — both numbers are
              load-bearing. The keyframes run -50% to 0, which is seamless only
              if the track is exactly two identical halves, so the outer pair is
              fixed at 2. The inner repeat exists because five short names are
              narrower than a wide screen: one bare copy would leave the band
              visibly empty for part of every loop. Three copies per half clears
              a 2560px viewport with the names alone, and clears it further once
              the logos land, since a plate is wider than a word. */}
          {[0, 1].map((half) => (
            <div key={half} aria-hidden="true" className="flex shrink-0 items-center">
              {[0, 1, 2].map((copy) => (
                <ul key={copy} className="flex shrink-0 items-center">
                  {withLogos.map((brand) => (
                    <li key={brand.name} className="flex shrink-0 items-center px-6 lg:px-9">
                      {brand.logo ? (
                        /* The plate exists ONLY to host a mark. These five
                           logos are drawn for their own grounds — white on
                           slate, near-black on white, a navy tile, a blue badge
                           — and bg-ink is this dark site's near-white token, so
                           each one is shown as its owner drew it rather than
                           recoloured to suit the page. */
                        <span className="grid h-16 place-items-center rounded-[4px] border border-ink/15 bg-ink px-4 lg:h-20 lg:px-5">
                          <Image
                            src={brand.logo.src}
                            /* The brand name, not "logo" — a screen reader
                               saying "Dulux" is the information; "Dulux logo"
                               is furniture. */
                            alt={brand.name}
                            width={brand.logo.width}
                            height={brand.logo.height}
                            unoptimized={brand.logo.unoptimized}
                            /* THE ASPECT RATIO IS SET EXPLICITLY, from the real
                               file dimensions read at build time. A plain
                               `w-auto` works for a raster, whose intrinsic size
                               the browser knows from the bytes — but an SVG
                               that carries only a viewBox has no intrinsic
                               width, and the image collapsed to 0x0: a logo
                               that silently vanished, in the format most brand
                               kits ship. Fixing the height and declaring the
                               ratio makes the width deterministic for both.
                               max-w keeps a very wide wordmark from crowding
                               the band; object-contain letterboxes rather than
                               crops if it hits that. */
                            style={{
                              aspectRatio: `${brand.logo.width} / ${brand.logo.height}`,
                            }}
                            className="h-10 w-auto max-w-[9rem] object-contain lg:h-12 lg:max-w-[11rem]"
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
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="shell">
        <p className="mt-6 text-[0.8125rem] leading-relaxed text-ink-mute">
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
