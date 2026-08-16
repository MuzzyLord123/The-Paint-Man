"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/config/site";
import { testimonials } from "@/data/testimonials";

/**
 * How long each review holds before the next one comes in.
 *
 * Eight seconds, up from seven. The longest review here runs well over four
 * hundred characters, and seven seconds is not long enough to finish one and
 * still have a beat before it moves — a rail that changes while you are reading
 * is worse than one that changes slowly. There is no progress bar to keep in
 * step with this any more, so this constant is the only place the timing lives.
 */
const DWELL_MS = 8000;

/**
 * Type size, set by the length of the review.
 *
 * Every slide shares one grid cell, so the box is as tall as the LONGEST
 * review and every shorter one leaves the difference as empty space. At one
 * fixed size that difference was about 290px on a phone, because the reviews
 * run from 71 characters to 310 — the longest is more than four times the
 * shortest, and a box built for it swallowed the rest.
 *
 * Scaling the size to the length closes most of that gap and is better
 * typography besides: a twelve-word review deserves to be set large and a
 * fifty-word one does not want to be. It is the oldest trick in editorial
 * layout — fit the type to the space — and it costs nothing at runtime.
 *
 * The thresholds are character counts because that is what actually drives the
 * wrap; word counts vary too much with word length to be useful here.
 *
 * THERE ARE FOUR STEPS BECAUSE THREE STOPPED BEING ENOUGH. The bottom bucket was
 * open-ended, which was fine while the longest review was 310 characters. James
 * Churchill's is 418, and one open-ended bucket then spanned 211 to 418 — a
 * two-to-one range set at one size, so the longest review alone decided the
 * height of the box that all of them sit in. Splitting it at 300 costs one
 * branch and keeps the tallest slide roughly where it already was.
 *
 * The smallest step is 18px on a phone, which is a floor and not a starting
 * point: it is above the 16px the body text uses, and going below it to win back
 * height would be shrinking a customer's words to fit a layout. If a review ever
 * arrives long enough to need that, shorten the quote instead — see
 * src/data/testimonials.ts on excerpting.
 *
 * FIVE STEPS, AND THE SIZES ARE MEASURED RATHER THAN CHOSEN. Three steps, then
 * four, were picked by eye, and by twenty-four reviews that had stopped working
 * in both directions at once: the cell is as tall as the TALLEST slide, so one
 * bucket set slightly too large made the whole section taller, while the short
 * reviews sat in two lines of a box built for six and left the rest as a hole
 * above the quote.
 *
 * Both problems have the same shape and the same fix. Rendered height goes
 * roughly as (characters x size squared), so holding every review at about the
 * same height means size falling as 1/sqrt(characters) — which is what these
 * five steps are. They were fitted by rendering all twenty-four quotes at every
 * size from 16px to 60px in the real measure at each breakpoint, then measuring
 * the result in the built site rather than trusting the arithmetic. Against the
 * four hand-picked steps that preceded them, on this list:
 *
 *              emptiest slide        shared cell
 *   phone      173px -> 89px         356px -> 356px
 *   tablet      98px -> 36px         225px -> 216px
 *   desktop    100px -> 55px         243px -> 234px
 *
 * The gain is almost entirely in the first column, and that is the honest way to
 * read it: the band is barely shorter, because its height was already set by the
 * longest review and still is. What changed is that the emptiest slide is no
 * longer half a screen of nothing.
 *
 * WHY THE PHONE COLUMN DOES NOT MOVE. At 375px the tallest slide is the 420
 * character review at 18px, and 18px is the floor. Nothing in this function can
 * make that box shorter — only a shorter longest review can, which is a content
 * decision and belongs to James rather than to a layout tweak. The rest of the
 * slides now fill more of the box it sets.
 *
 * TO RE-FIT AFTER ADDING REVIEWS, which is worth doing if the shortest or the
 * longest moves much: the numbers above came from measuring, not arithmetic, so
 * measure again rather than adjusting by eye. Anything longer than about 420
 * characters will push the box taller on its own — that is the one input these
 * steps cannot absorb, and the note on excerpting in src/data/testimonials.ts is
 * the answer to it.
 *
 * The leading is stepped with the size because it has to be: the fit assumed
 * tighter leading on the big steps and looser on the small ones, which is also
 * simply how display type wants to be set.
 */
function sizeFor(quote: string): string {
  if (quote.length <= 110) {
    return "text-[2.5rem] leading-[1.2] sm:text-[3rem] lg:text-[3.25rem]";
  }
  if (quote.length <= 170) {
    return "text-[2rem] leading-[1.2] sm:text-[2.25rem] lg:text-[2.375rem]";
  }
  if (quote.length <= 240) {
    return "text-[1.5625rem] leading-[1.28] sm:text-[1.6875rem] lg:text-[2rem] lg:leading-[1.2]";
  }
  if (quote.length <= 320) {
    return "text-[1.3125rem] leading-[1.38] sm:text-[1.5rem] sm:leading-[1.28] lg:text-[1.875rem] lg:leading-[1.2]";
  }
  return "text-[1.125rem] leading-[1.45] sm:text-[1.3125rem] sm:leading-[1.38] lg:text-[1.5rem] lg:leading-[1.28]";
}

/**
 * The review switcher.
 *
 * WHAT IT IS NOT. It is not a carousel of cards. A row of review tiles with
 * arrows either side is the single most common way this goes wrong: it takes a
 * screen and a half, every card is a different length so the row never sits
 * straight, and the whole thing reads as a widget bolted on rather than part of
 * the page. The brief was explicitly that it must not bloat the home page or
 * push reviews in anyone's face, so this is ONE review at a time, in the site's
 * own editorial voice, in a band shorter than every other section on the page.
 *
 * ZERO LAYOUT SHIFT, WITHOUT A MAGIC NUMBER. Every review is in the DOM at
 * once, stacked into a single grid cell, with only the current one visible. The
 * container is therefore naturally as tall as the LONGEST review and never
 * changes height as they cycle — no min-height guessed per breakpoint, and
 * nothing to re-tune when James sends more. The quote block sits at the BOTTOM
 * of that cell rather than the top or the middle — see the note on justify-end
 * where the slide is rendered — so a twelve-word review keeps its slack as air
 * under the rule instead of as a gap above the attribution.
 *
 * It also means every review is in the served HTML, so they are readable by a
 * crawler and by anyone with JavaScript off — who gets the first review,
 * statically, rather than an empty box.
 *
 * A COUNTER AND A PAUSE, AND NOTHING ELSE. This has now lost, in order, a row of
 * per-review ticks, a progress bar and the previous/next arrows. The ticks went
 * because a fixed-width row divided by a growing list makes each one thinner
 * until it is 5px of hairline nobody can hit. The bar and the arrows went
 * because the section reads better without them: three round buttons and a rule
 * spanning the full width made an editorial band look like an embedded widget,
 * which is the exact thing the brief said to avoid.
 *
 * What is left is a position-over-total counter and the pause control. The
 * counter is the part that was doing real work — it says where you are and that
 * there are two dozen of these, which is the social proof — and it does not care
 * how long the list gets.
 *
 * THE PAUSE STAYS, and is not up for tidying away with the rest. WCAG 2.2 SC
 * 2.2.2 requires a way to stop anything that auto-updates for longer than five
 * seconds beside other content, and hover/focus pausing does not satisfy it
 * because neither is available to someone who cannot use a pointer. It is the
 * one control here that is load-bearing.
 *
 * WITHOUT ARROWS, WAITING IS THE ONLY WAY BACK to a review that has gone past.
 * That is a real cost and worth stating plainly rather than dressing up: it is
 * not a conformance failure — every review is in the served HTML, and the rail
 * reaches all of them on its own — but someone who wants to re-read the third
 * one has to sit through the other twenty-three. If that ever matters more than
 * the look, the arrows are a dozen lines and this comment is where to start.
 *
 * The count in that counter is NOT the same claim as a count in the header, and
 * the difference matters — see the note in src/data/testimonials.ts. It
 * describes this rail and nothing beyond it; a count in the header would assert
 * a total on someone else's page.
 *
 * IT STOPS WHEN IT SHOULD, which is most of the accessibility of the thing:
 *   - on hover and on focus-within, so it cannot move under a reader's eye or
 *     under someone tabbing through it
 *   - when scrolled out of view, so it is not animating to nobody
 *   - when the tab is hidden
 *   - under prefers-reduced-motion, where it does not auto-advance at all
 *   - and on demand, from the pause control. That control is not decoration:
 *     WCAG 2.2 SC 2.2.2 requires a way to pause anything that auto-updates for
 *     longer than five seconds beside other content, and hover/focus pausing
 *     alone does not satisfy it.
 *
 * The live region is `off` while it is rotating and `polite` once it is
 * paused — an auto-advancing region set to polite announces every eight seconds
 * forever, which is worse than announcing nothing.
 */
export function Testimonials() {
  /* Renders nothing until there are real reviews. See src/data/testimonials.ts:
     a missing section reads as a business that has not asked for reviews yet,
     an invented one is a banned practice. */
  const count = testimonials.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false); // the explicit control
  /* TWO states, not one. These used to be a single `held` boolean written by
     four sources — hover, focus, the IntersectionObserver and visibilitychange —
     and the last writer won: returning to the tab while focus sat on the Pause
     button ran the visibility handler, which knew nothing about focus, set the
     boolean false, and the rail advanced under the reader — the exact thing the
     spec above promises cannot happen. The conditions are independent, so they
     get independent state and are OR-ed where `running` is derived. */
  const [engaged, setEngaged] = useState(false); // pointer over it, or focus within it
  const [away, setAway] = useState(false); // scrolled off-screen, or the tab is hidden
  const [reduced, setReduced] = useState(false);
  const region = useRef<HTMLDivElement>(null);

  /* Forward only, now that the arrows are gone — the interval is the sole
     caller. A signed delta with one call site passing +1 is generality nobody
     is using. */
  const advance = useCallback(() => setIndex((current) => (current + 1) % count), [count]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /* Off-screen and hidden-tab both count as "nobody is looking", and both are
     cheaper to honour than to explain. */
  useEffect(() => {
    const node = region.current;
    if (!node) return;
    let onScreen = true;
    const update = () => setAway(!onScreen || document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        update();
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const running = !paused && !engaged && !away && !reduced && count > 1;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(advance, DWELL_MS);
    return () => window.clearInterval(timer);
  }, [running, advance]);

  if (count === 0) return null;

  const current = testimonials[index];

  return (
    <section
      className="border-y border-hairline bg-accent-wash py-14 lg:py-16"
      aria-labelledby="reviews-heading"
    >
      <div className="shell">
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 id="reviews-heading" className="eyebrow text-ink-mute">
              What people say
            </h2>
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 eyebrow text-ink-mute transition-colors duration-200 hover:text-accent"
            >
              {/* NO COUNT HERE, deliberately. "11 recommendations on Facebook"
                  asserts a total nobody has counted, from a page that also
                  carries reviews this rail does not show — a claim that is
                  unverifiable and stops being flattering the moment a visitor
                  checks. The link does the work instead: it goes to the page,
                  where all of them are, which is the honest way to publish a
                  selection. See src/data/testimonials.ts. */}
              Read them on Facebook
              <ArrowUpRight weight="bold" aria-hidden="true" className="size-3" />
            </a>
          </div>
          <div className="tape-line mt-3" aria-hidden="true" />
        </Reveal>

        <div
          ref={region}
          role="group"
          aria-roledescription="carousel"
          aria-label="Customer reviews"
          /* POINTER EVENTS, FILTERED TO A REAL MOUSE. With onMouseEnter, a
             single tap on a phone fired the browser's synthesized mouseenter,
             set engaged, and nothing ever cleared it: touch scrolling fires no
             mouse compat events, so the rail froze for the rest of the visit
             while the control still showed the Pause icon, claiming it was
             running. Hover is a pointer concept and phones do not have it, so
             only a mouse may set this. Focus is handled separately below and
             is genuine on every device. */
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setEngaged(true);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") setEngaged(false);
          }}
          onFocusCapture={() => setEngaged(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setEngaged(false);
          }}
          className="mt-7 lg:mt-9"
        >
          {/* Every review occupies the same grid cell, so the box is the height
              of the longest and never moves. */}
          <div className="grid" aria-live={running ? "off" : "polite"}>
            {testimonials.map((item, position) => {
              const active = position === index;
              return (
                <figure
                  key={`${item.name}-${item.date}`}
                  aria-hidden={!active}
                  inert={!active}
                  data-active={active}
                  /* justify-end, not center. Every slide shares one cell sized
                     to the LONGEST review, so a short one has slack to spend.
                     Centred, that slack splits and leaves an obvious hole
                     between the attribution and the controls below. Pushed to
                     the bottom, it all lands above the quote, where it reads as
                     air under the rule and the caption stays tight to the
                     controls it belongs with. */
                  className="review-slide col-start-1 row-start-1 flex flex-col justify-end"
                >
                  {/* Capped at 54rem. Unconstrained, a review ran the full
                      shell width — around 100 characters a line on a wide
                      screen, which is roughly double what anyone reads
                      comfortably and made a short review look like a banner. */}
                  <blockquote
                    className={`review-quote max-w-[54rem] font-display font-medium tracking-[-0.02em] text-balance text-ink ${sizeFor(item.quote)}`}
                  >
                    <span className="text-accent" aria-hidden="true">
                      “
                    </span>
                    {item.quote}
                    <span className="text-accent" aria-hidden="true">
                      ”
                    </span>
                  </blockquote>
                  <figcaption className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.9375rem]">
                    <span className="font-semibold text-ink">{item.name}</span>
                    <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
                    <span className="text-ink-mute">{item.date}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>

          {count > 1 && (
            /* Held to the same 54rem the quote is, rather than the full shell.
               A row stretched to the shell width put the pause control a long
               way out to the right of a column of type that stops well short of
               it, which read as a widget's chrome rather than as part of the
               quote. Sharing the measure makes the section one left-hand column
               with air beside it, and the counter and the pause then bracket
               that column the way the eyebrow and the Facebook link bracket the
               section above. */
            <div className="mt-8 flex max-w-[54rem] items-center justify-between gap-4">
              {/* Hidden from assistive tech: the sr-only live region below
                  already announces the position and the total. */}
              <p className="eyebrow shrink-0 text-ink-mute" aria-hidden="true">
                {index + 1} / {count}
              </p>
              <Control
                label={paused ? "Play reviews" : "Pause reviews"}
                onClick={() => setPaused((value) => !value)}
              >
                {paused ? (
                  <Play weight="fill" aria-hidden="true" className="size-3.5" />
                ) : (
                  <Pause weight="fill" aria-hidden="true" className="size-3.5" />
                )}
              </Control>
            </div>
          )}
        </div>

        {/* Read by nobody who can see the section, and the only way someone on a
            screen reader knows where they are in it — the counter beside the
            bar is the visual equivalent, and is aria-hidden so this is not
            announced twice. Off while rotating, like the slides region above:
            hard-coded polite here meant an announcement every eight seconds
            forever, which is the exact failure the note at the top forbids. */}
        <p className="sr-only" aria-live={running ? "off" : "polite"}>
          Review {index + 1} of {count}: {current.name}, {current.date}.
        </p>
      </div>
    </section>
  );
}

function Control({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-9 place-items-center rounded-full border border-ink/15 text-ink-soft transition-colors duration-200 hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  );
}
