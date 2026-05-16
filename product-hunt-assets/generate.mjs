// Converts every .svg in this folder to a PNG that exactly matches the
// dimensions Product Hunt requires (and that most other directories
// accept). Uses the project's existing `sharp` dependency — no extra
// install needed.
//
// Run from the repo root:   node product-hunt-assets/generate.mjs
//
// The thumbnail is rendered at 480x480 (2x the 240 PH requires) so it
// looks crisp on Retina screens but still falls under PH's 2MB cap.
// Gallery images are rendered at 1270x760, which is PH's recommended
// social-preview size and also wide enough for AlternativeTo, SaaSHub,
// Crunchbase, etc. to use the same asset.

import sharp from "sharp";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Per-file output sizing. Anything not listed here uses GALLERY_SIZE.
const SIZES = {
  "01-thumbnail.svg": { width: 480, height: 480, label: "thumbnail @ 480x480 (2x retina)" },
};
const GALLERY_SIZE = { width: 1270, height: 760, label: "gallery @ 1270x760" };

async function main() {
  const files = (await readdir(__dirname))
    .filter((f) => f.endsWith(".svg"))
    .sort();

  if (files.length === 0) {
    console.error("No .svg files found in", __dirname);
    process.exit(1);
  }

  console.log(`Converting ${files.length} SVG file(s)...\n`);

  for (const file of files) {
    const inputPath = join(__dirname, file);
    const outputPath = join(__dirname, basename(file, ".svg") + ".png");
    const size = SIZES[file] || GALLERY_SIZE;

    const svgBuffer = await readFile(inputPath);

    // density=300 gives crisp text rasterization; sharp computes the
    // correct internal resolution to hit the target output size.
    const pngBuffer = await sharp(svgBuffer, { density: 300 })
      .resize(size.width, size.height, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9, quality: 95 })
      .toBuffer();

    await writeFile(outputPath, pngBuffer);

    const sizeKb = (pngBuffer.length / 1024).toFixed(1);
    console.log(`  ${file}  →  ${basename(outputPath)}  (${size.label}, ${sizeKb} KB)`);
  }

  console.log("\nDone. Upload these PNGs to Product Hunt:");
  console.log("  Thumbnail field:   01-thumbnail.png");
  console.log("  Gallery (in order): 02-hero.png, 03-platforms.png, 04-mobile.png,");
  console.log("                     05-features.png, 06-cta.png");
}

main().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});
