"use client";

import { useEffect } from "react";

/**
 * Closes a dialog when the breakpoint that renders it stops matching.
 *
 * WHY THIS EXISTS. The work and film galleries ship two complete treatments —
 * a desktop grid and a mobile feed — and CSS decides which one is on screen
 * (`lg:hidden` / `hidden lg:block`). Their dialogs live INSIDE those wrappers,
 * so rotating a tablet or dragging a desktop window across 1024px does not
 * close the open dialog: it sets `display: none` on an ancestor. The dialog
 * stays mounted, its effects never clean up, and the scroll lock those effects
 * put on <html> is never released — leaving the page silently unscrollable
 * under a dialog nobody can see. Escape still worked, because that listener
 * outlives the hiding, but nothing tells a visitor to press it.
 *
 * Closing on the media-query change runs the normal close path, so the lock is
 * released by the same cleanup that always releases it. `matchMedia` rather
 * than a resize listener: it fires once on the crossing rather than on every
 * intermediate pixel.
 *
 * @param query  the media query that governs the dialog's own wrapper
 * @param close  called when the query stops matching
 */
export function useBreakpointClose(query: string, close: () => void): void {
  useEffect(() => {
    const media = window.matchMedia(query);
    const sync = () => {
      if (!media.matches) close();
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [query, close]);
}
