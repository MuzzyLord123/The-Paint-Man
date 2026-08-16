import { DesktopNav } from "./DesktopNav";
import { MobileMenu } from "./MobileMenu";
import { NavSentinel } from "./NavSentinel";
import { ScrollPaintLevel } from "./ScrollPaintLevel";

/**
 * Two separately designed navigation systems, not one responsive compromise.
 * The header floats over the hero; each system handles its own chrome.
 *
 * The scroll paint level lives here, last, so it paints over the condensed
 * chrome — see the note in ScrollPaintLevel.tsx for why it cannot be a
 * sibling.
 */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-[90] isolate">
      <NavSentinel />
      <DesktopNav />
      <MobileMenu />
      <ScrollPaintLevel />
    </header>
  );
}
