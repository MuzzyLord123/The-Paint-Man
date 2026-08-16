"use client";

import { useEffect } from "react";

/**
 * Resolves /work#slug to whichever gallery is actually on screen.
 *
 * The page ships two galleries — a desktop grid and a mobile feed — both
 * server-rendered, with CSS deciding which one is shown. They used to give
 * their cards the same `id={slug}`, which meant two things:
 *
 *   1. duplicate ids, which is invalid HTML, and
 *   2. a deep link that landed on the FIRST match in document order — the
 *      desktop card. On a phone that card is display:none, so the browser had
 *      nothing to scroll to and the link silently did nothing. Every "Recent
 *      work" link in the mobile menu points at /work#slug.
 *
 * The ids are now scoped per gallery and each card carries data-slug. This
 * finds the one with layout and scrolls to it. Native anchor behaviour still
 * works for everything else on the site; this is only needed where the same
 * content is deliberately rendered twice.
 *
 * THREE TRIGGERS, AND THE CLICK ONE IS NOT OPTIONAL. Next's router navigates
 * with history.pushState, which never fires `hashchange` — so a tap on a
 * /work#slug link made while ALREADY on /work updated the URL and nothing
 * else: no event, no scroll, a tap that visibly did nothing. That is the exact
 * flow this component exists for (the menu's Recent-work strip, used on the
 * work page itself), so clicks on same-pathname hash links are handled
 * directly, reading the slug from the link rather than waiting for an event
 * the router will never send. `hashchange` still covers back/forward — the
 * browser does fire it when history entries differ only in fragment — and the
 * mount run covers arriving from another page.
 *
 * THE SCROLL WAITS FOR THE SCROLL LOCK. On mobile the tap that navigates is
 * also the tap that closes the menu, and the menu holds `overflow: hidden` on
 * the root until React commits the close — scrollIntoView during that window
 * is a silent no-op. So the scroll retries frame by frame until the lock is
 * released (capped at about a second), instead of firing once into a locked
 * page.
 */
export function HashTarget() {
  useEffect(() => {
    let frame = 0;

    /* decodeURIComponent throws URIError on a malformed escape — /work#% is
       enough. This runs outside React's render, so a throw would bypass
       error.tsx; the raw fragment is a fine fallback, and CSS.escape makes it
       safe to interpolate either way. */
    const decode = (fragment: string) => {
      try {
        return decodeURIComponent(fragment);
      } catch {
        return fragment;
      }
    };

    /* True when handled (scrolled, or nothing to scroll to); false when the
       page is scroll-locked and the attempt should be retried. */
    const attempt = (slug: string): boolean => {
      const candidates = document.querySelectorAll<HTMLElement>(
        `[data-slug="${CSS.escape(slug)}"]`,
      );
      // offsetParent is null for a display:none subtree — the cheap "is this
      // the one the visitor can see" test, with no layout read.
      const visible = [...candidates].find((el) => el.offsetParent !== null);
      if (!visible) return true;
      if (document.documentElement.style.overflow === "hidden") return false;

      visible.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
      return true;
    };

    const goTo = (slug: string) => {
      if (!slug) return;
      cancelAnimationFrame(frame);
      let tries = 0;
      const tick = () => {
        if (attempt(slug) || tries++ > 60) return;
        frame = requestAnimationFrame(tick);
      };
      // rAF so the galleries have laid out before we measure visibility.
      frame = requestAnimationFrame(tick);
    };

    const fromLocation = () => goTo(decode(window.location.hash.slice(1)));

    const onClick = (event: MouseEvent) => {
      /* Only a plain left-click is a navigation this tab will see. NO
         defaultPrevented check, deliberately: Next's <Link> preventDefaults
         every click it client-routes, so by the time the event bubbles to the
         document it is ALWAYS defaultPrevented for exactly the links this
         handler exists to serve. The modifier checks below match the ones
         Next itself uses to decide a click is not a same-tab navigation. */
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!anchor) return;
      const url = new URL(anchor.getAttribute("href") ?? "", window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname !== window.location.pathname || !url.hash) return;
      goTo(decode(url.hash.slice(1)));
    };

    fromLocation();
    window.addEventListener("hashchange", fromLocation);
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", fromLocation);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
