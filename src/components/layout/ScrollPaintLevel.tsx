/**
 * Signature interaction 7 — scroll paint level.
 *
 * A 3px band of accent laid across the top of the viewport as the page is read.
 * Driven by a CSS scroll-driven animation (`animation-timeline: scroll()`), so
 * it costs no JavaScript at all: no component state, no scroll listener, and
 * nothing on the main thread while scrolling. See `.scroll-level` in
 * globals.css. A server component — it ships zero bytes of JS.
 *
 * RENDERED INSIDE THE HEADER, LAST, AT z-[97] — the mounting is the fix for the
 * bar being invisible for its whole life. As a sibling below the header
 * (z-[90] isolate), it was painted over by the header's chrome, and the chrome
 * becomes ~opaque within the first 80px of scroll — exactly when the bar first
 * gains any width. Nobody ever saw it. Inside the header's own stacking
 * context, 97 puts it above the condensed chrome and the mobile bar (z-[96]);
 * at the root the header still sits at 90, so the splash (200) and the
 * lightbox and sheets (120) keep painting over it as before.
 */
export function ScrollPaintLevel() {
  return <div aria-hidden="true" className="scroll-level fixed inset-x-0 top-0 z-[97] h-[3px] bg-accent-bright" />;
}
