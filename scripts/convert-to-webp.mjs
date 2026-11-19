import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const IMAGES_DIR = path.resolve('public/images');

async function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return null;

  const relPath = path.relative(IMAGES_DIR, filePath).replace(/\\/g, '/');
  const webpPath = filePath.slice(0, -ext.length) + '.webp';

  const originalStats = fs.statSync(filePath);
  const originalSizeKB = originalStats.size / 1024;

  let transformer = sharp(filePath);
  const metadata = await transformer.metadata();

  // Custom sizing per directory
  if (relPath.startsWith('avatars/')) {
    transformer = transformer.resize({
      width: 256,
      height: 256,
      fit: 'cover',
      position: 'center',
      withoutEnlargement: true,
    });
  } else if (relPath.startsWith('reports/')) {
    transformer = transformer.resize({
      width: 800,
      height: 600,
      fit: 'inside',
      withoutEnlargement: true,
    });
  } else if (relPath.includes('hero')) {
    transformer = transformer.resize({
      width: 1440,
      fit: 'inside',
      withoutEnlargement: true,
    });
  } else {
    transformer = transformer.resize({
      width: 960,
      height: 720,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  await transformer
    .webp({ quality: 80, effort: 6 })
    .toFile(webpPath);

  const newStats = fs.statSync(webpPath);
  const newSizeKB = newStats.size / 1024;
  const savings = ((1 - newStats.size / originalStats.size) * 100).toFixed(1);

  // Remove old file
  fs.unlinkSync(filePath);

  return {
    file: relPath,
    oldKB: originalSizeKB.toFixed(1),
    newKB: newSizeKB.toFixed(1),
    savings: `${savings}%`,
  };
}

async function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkDir(fullPath)));
    } else {
      const res = await processFile(fullPath);
      if (res) results.push(res);
    }
  }
  return results;
}

async function main() {
  console.log('Starting conversion of public/images to WebP...');
  const results = await walkDir(IMAGES_DIR);

  console.log(`\nProcessed ${results.length} images:`);
  let totalOld = 0;
  let totalNew = 0;

  for (const r of results) {
    totalOld += parseFloat(r.oldKB);
    totalNew += parseFloat(r.newKB);
    console.log(`✓ ${r.file} -> webp: ${r.oldKB}KB -> ${r.newKB}KB (-${r.savings})`);
  }

  const totalSaved = ((1 - totalNew / totalOld) * 100).toFixed(1);
  console.log('\n=============================================');
  console.log(`Total Original Size : ${(totalOld / 1024).toFixed(2)} MB`);
  console.log(`Total WebP Size     : ${(totalNew / 1024).toFixed(2)} MB`);
  console.log(`Total Saved         : -${totalSaved}%`);
  console.log('=============================================');
}

main().catch(console.error);
