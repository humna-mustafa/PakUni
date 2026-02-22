/**
 * Generate PakUni app icon PNGs from SVG source files.
 * 
 * Usage: npx sharp-cli is not flexible enough, so we use sharp directly.
 * Run: node scripts/generate-icons.js
 * 
 * Generates:
 *   - src/assets/images/pakuni-logo.png (400x520 - full logo with text)
 *   - src/assets/images/pakuni-icon.png (512x512 - icon only)
 *   - src/assets/images/pakuni-icon-round.png (512x512 - with circle bg)
 *   - Android mipmap icons (all densities)
 *   - store-listing/icon-512.png (Play Store icon)
 */

const fs = require('fs');
const path = require('path');

async function main() {
  // Dynamic import for sharp (ESM-only in newer versions)
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    const mod = await import('sharp');
    sharp = mod.default;
  }

  const BASE_DIR = path.resolve(__dirname, '..');
  const SVG_DIR = path.join(BASE_DIR, 'src', 'assets', 'svg');
  const IMG_DIR = path.join(BASE_DIR, 'src', 'assets', 'images');
  const ANDROID_RES = path.join(BASE_DIR, 'android', 'app', 'src', 'main', 'res');
  const STORE_DIR = path.join(BASE_DIR, 'store-listing');

  fs.mkdirSync(IMG_DIR, { recursive: true });
  fs.mkdirSync(STORE_DIR, { recursive: true });

  const iconSvg = fs.readFileSync(path.join(SVG_DIR, 'pakuni-icon.svg'));
  const logoSvg = fs.readFileSync(path.join(SVG_DIR, 'pakuni-logo.svg'));

  // --- 1. Full logo with text ---
  console.log('Generating full logo PNG (400x520)...');
  await sharp(logoSvg)
    .resize(400, 520)
    .png()
    .toFile(path.join(IMG_DIR, 'pakuni-logo.png'));
  console.log('  -> src/assets/images/pakuni-logo.png');

  // --- 2. Icon-only (512x512, transparent) ---
  console.log('Generating icon PNG (512x512)...');
  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(IMG_DIR, 'pakuni-icon.png'));
  console.log('  -> src/assets/images/pakuni-icon.png');

  // --- 3. Round icon with white circular background ---
  console.log('Generating round icon PNG (512x512)...');
  const iconBuffer = await sharp(iconSvg)
    .resize(400, 400)
    .png()
    .toBuffer();

  // Create circular mask
  const circleSvg = Buffer.from(
    `<svg width="512" height="512"><circle cx="256" cy="256" r="256" fill="white"/></svg>`
  );

  const whiteBase = await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
    .composite([
      { input: iconBuffer, top: 56, left: 56 },
    ])
    .png()
    .toBuffer();

  await sharp(whiteBase)
    .composite([
      {
        input: await sharp(circleSvg).resize(512, 512).png().toBuffer(),
        blend: 'dest-in',
      },
    ])
    .png()
    .toFile(path.join(IMG_DIR, 'pakuni-icon-round.png'));
  console.log('  -> src/assets/images/pakuni-icon-round.png');

  // --- 4. Play Store icon (512x512, white bg, no transparency) ---
  console.log('Generating Play Store icon (512x512)...');
  const storeIconFg = await sharp(iconSvg)
    .resize(420, 420)
    .png()
    .toBuffer();

  await sharp({
    create: { width: 512, height: 512, channels: 3, background: { r: 255, g: 255, b: 255 } }
  })
    .composite([
      { input: storeIconFg, top: 46, left: 46 },
    ])
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toFile(path.join(STORE_DIR, 'icon-512.png'));
  console.log('  -> store-listing/icon-512.png');

  // --- 5. Android mipmap launcher icons ---
  const MIPMAP_SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
  };

  console.log('Generating Android mipmap launcher icons...');
  for (const [folder, size] of Object.entries(MIPMAP_SIZES)) {
    const outDir = path.join(ANDROID_RES, folder);
    fs.mkdirSync(outDir, { recursive: true });

    const innerSize = Math.round(size * 0.78);
    const offset = Math.round((size - innerSize) / 2);

    const fgBuf = await sharp(iconSvg)
      .resize(innerSize, innerSize)
      .png()
      .toBuffer();

    // Square icon with white background
    await sharp({
      create: { width: size, height: size, channels: 3, background: { r: 255, g: 255, b: 255 } }
    })
      .composite([{ input: fgBuf, top: offset, left: offset }])
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .png()
      .toFile(path.join(outDir, 'ic_launcher.png'));
    console.log(`  -> ${folder}/ic_launcher.png (${size}x${size})`);

    // Round icon
    const roundBase = await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
    })
      .composite([{ input: fgBuf, top: offset, left: offset }])
      .png()
      .toBuffer();

    const roundMask = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`
    );

    await sharp(roundBase)
      .composite([
        {
          input: await sharp(roundMask).resize(size, size).png().toBuffer(),
          blend: 'dest-in',
        },
      ])
      .png()
      .toFile(path.join(outDir, 'ic_launcher_round.png'));
    console.log(`  -> ${folder}/ic_launcher_round.png (${size}x${size})`);
  }

  console.log('\n✅ All PakUni app icons generated successfully!');
  console.log('\nGenerated files:');
  console.log('  Logo:        src/assets/images/pakuni-logo.png (400x520)');
  console.log('  Icon:        src/assets/images/pakuni-icon.png (512x512)');
  console.log('  Round icon:  src/assets/images/pakuni-icon-round.png (512x512)');
  console.log('  Store icon:  store-listing/icon-512.png (512x512)');
  console.log('  Mipmap:      android/app/src/main/res/mipmap-*/ic_launcher.png');
  console.log('               android/app/src/main/res/mipmap-*/ic_launcher_round.png');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
