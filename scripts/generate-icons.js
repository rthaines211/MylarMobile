import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const iconsDir = join(rootDir, 'public', 'icons');

// Ensure icons directory exists
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

const svgPath = join(iconsDir, 'icon.svg');
const svgBuffer = readFileSync(svgPath);

const sizes = [
  { name: 'icon-16.png', size: 16 },
  { name: 'icon-32.png', size: 32 },
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

async function generateIcons() {
  console.log('Generating icons from SVG...');

  for (const { name, size } of sizes) {
    const outputPath = join(iconsDir, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  Created ${name} (${size}x${size})`);
  }

  // Generate maskable icon with padding (safe zone is 80% of icon)
  const maskableSize = 512;
  const safeZone = Math.floor(maskableSize * 0.8);
  const padding = Math.floor((maskableSize - safeZone) / 2);

  await sharp(svgBuffer)
    .resize(safeZone, safeZone)
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: '#1a1a1a'
    })
    .png()
    .toFile(join(iconsDir, 'icon-512-maskable.png'));
  console.log('  Created icon-512-maskable.png (512x512 with safe zone)');

  console.log('Done!');
}

generateIcons().catch(console.error);
