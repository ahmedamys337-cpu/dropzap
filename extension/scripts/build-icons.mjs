import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = join(__dirname, '..', '..');
const SOURCE = join(ROOT, 'public', 'icon-512.png');
const OUT_DIR = join(__dirname, '..', 'icons');

const SIZES = [16, 32, 48, 128];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const size of SIZES) {
    await sharp(SOURCE)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(join(OUT_DIR, `icon${size}.png`));
    console.log(`Generated icon${size}.png`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
