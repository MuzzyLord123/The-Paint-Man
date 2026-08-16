import { readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Finds a brand's logo in public/brands, if somebody has put one there.
 *
 * WHY THIS READS THE DISK INSTEAD OF A LIST. The handover for these five logos
 * is "download the artwork from the manufacturer" — a job for whoever has the
 * files, not for whoever edits TypeScript. Asking that person to also add three
 * lines to a data file means the logo silently does not appear if they miss it,
 * and the failure looks like a bug rather than a missed step. So the strip
 * discovers what is in the folder: drop `dulux.png` in and Dulux gets its logo
 * on the next build, with nothing else touched.
 *
 * This runs on the server at BUILD time — the page is statically prerendered,
 * so the answer is baked into the HTML and no filesystem call happens for a
 * visitor. It is why PaintBrands must stay a server component.
 *
 * The dimensions are read from the file rather than guessed, because next/image
 * needs the real intrinsic size to reserve the right box; a wrong one shows as
 * a jump when the image lands.
 */

const DIR = join(process.cwd(), "public", "brands");

/** In preference order — the first match for a slug wins. */
const EXTENSIONS = [".svg", ".webp", ".png", ".jpg", ".jpeg"];

export type BrandLogo = {
  src: string;
  width: number;
  height: number;
  /** SVG cannot go through the image optimiser — see the note in resolve(). */
  unoptimized: boolean;
};

function listing(): string[] {
  try {
    return readdirSync(DIR);
  } catch {
    /* No folder yet, which is the state this ships in. The strip falls back to
       wordmarks, which is a designed state rather than a hole. */
    return [];
  }
}

/**
 * Intrinsic size of an SVG, from its own attributes.
 *
 * sharp can rasterise SVG only when the build has librsvg, which is not a
 * dependency worth adding for five logos — and an SVG carries its size in the
 * file anyway. width/height first, then viewBox, then a 4:1 wordmark guess,
 * which only ever affects the reserved box: the strip caps the rendered height
 * and contains the artwork inside it either way.
 */
function svgSize(svg: string): { width: number; height: number } {
  const attr = (name: string) => {
    const match = svg.match(new RegExp(`<svg[^>]*\\s${name}\\s*=\\s*["']([\\d.]+)`, "i"));
    return match ? Number(match[1]) : null;
  };
  const width = attr("width");
  const height = attr("height");
  if (width && height) return { width: Math.round(width), height: Math.round(height) };

  const box = svg.match(/viewBox\s*=\s*["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)/i);
  if (box) return { width: Math.round(Number(box[1])), height: Math.round(Number(box[2])) };

  return { width: 400, height: 100 };
}

export async function resolveBrandLogo(slug: string): Promise<BrandLogo | null> {
  const files = listing();
  const name = EXTENSIONS.map((ext) => `${slug}${ext}`).find((candidate) =>
    files.some((file) => file.toLowerCase() === candidate),
  );
  if (!name) return null;

  const path = join(DIR, name);
  const src = `/brands/${name}`;

  if (name.endsWith(".svg")) {
    /* unoptimized, because next.config.mjs deliberately does not set
       dangerouslyAllowSVG: the optimiser would otherwise be asked to process
       arbitrary SVG, which can carry script. Serving the file as-is from our
       own origin is both safer and, for a logo, smaller than any raster. */
    const { readFileSync } = await import("node:fs");
    const { width, height } = svgSize(readFileSync(path, "utf8"));
    return { src, width, height, unoptimized: true };
  }

  try {
    const sharp = (await import("sharp")).default;
    const { width, height } = await sharp(path).metadata();
    if (!width || !height) return null;
    return { src, width, height, unoptimized: false };
  } catch {
    /* An unreadable file is a missing logo, not a broken build — the brand
       falls back to its wordmark and the rest of the strip is unaffected. */
    return null;
  }
}
