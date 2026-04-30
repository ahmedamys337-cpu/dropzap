// Generates raster favicons from src/app/icon.svg into public/.
//
// Run with:  node scripts/generate-favicons.mjs
//
// Requires (devDependencies):
//   - sharp        (SVG -> PNG rasterization)
//   - png-to-ico   (PNG -> multi-resolution .ico)
//
// Outputs (overwrites if present):
//   public/favicon.ico            (16/32/48 multi-res, used by Google + browsers)
//   public/favicon-16x16.png
//   public/favicon-32x32.png
//   public/apple-touch-icon.png   (180x180, iOS home screen)
//   public/icon-192.png           (PWA / Google search result)
//   public/icon-512.png           (PWA splash / large preview)
//   public/og-image.png           (1200x630, social previews — solid bg)

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const svgPath = path.join(root, "src", "app", "icon.svg");
const outDir = path.join(root, "public");

async function main() {
  const svg = await fs.readFile(svgPath);
  await fs.mkdir(outDir, { recursive: true });

  // Helper that renders the SVG at a given size, optionally on a solid bg.
  const render = (size, { background } = {}) => {
    let pipeline = sharp(svg, { density: 384 }).resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
    if (background) {
      pipeline = pipeline.flatten({ background });
    }
    return pipeline.png().toBuffer();
  };

  // Generate PNGs
  const sizes = [
    { name: "favicon-16x16.png", size: 16 },
    { name: "favicon-32x32.png", size: 32 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
  ];

  for (const { name, size } of sizes) {
    const buf = await render(size);
    await fs.writeFile(path.join(outDir, name), buf);
    console.log(`  wrote public/${name} (${size}x${size})`);
  }

  // Build favicon.ico from 16/32/48 PNGs
  const icoBuffers = await Promise.all([16, 32, 48].map((s) => render(s)));
  const ico = await pngToIco(icoBuffers);
  await fs.writeFile(path.join(outDir, "favicon.ico"), ico);
  console.log("  wrote public/favicon.ico (16+32+48 multi-res)");

  // OG image (1200x630) with brand gradient background — center the icon.
  const ogIcon = await sharp(svg, { density: 768 })
    .resize(360, 360, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const og = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 }, // slate-900
    },
  })
    .composite([{ input: ogIcon, gravity: "center" }])
    .png()
    .toBuffer();

  await fs.writeFile(path.join(outDir, "og-image.png"), og);
  console.log("  wrote public/og-image.png (1200x630)");

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
