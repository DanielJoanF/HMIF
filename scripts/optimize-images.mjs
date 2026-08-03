import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets');

async function optimizeImages() {
  console.log(`[Optimize Images] Scanning directory: ${ASSETS_DIR}`);
  const files = fs.readdirSync(ASSETS_DIR);

  let processedCount = 0;
  let totalSavedBytes = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      continue;
    }

    const filePath = path.join(ASSETS_DIR, file);
    const stat = fs.statSync(filePath);
    const originalSize = stat.size;

    const baseName = path.basename(file, path.extname(file));
    const webpFileName = `${baseName}.webp`;
    const webpPath = path.join(ASSETS_DIR, webpFileName);

    try {
      let image = sharp(filePath);
      const metadata = await image.metadata();

      if (metadata.width > 800 || metadata.height > 800) {
        image = image.resize({
          width: metadata.width > metadata.height ? 800 : null,
          height: metadata.height >= metadata.width ? 800 : null,
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      const tempWebpPath = path.join(ASSETS_DIR, `temp_${webpFileName}`);
      await image.webp({ quality: 80 }).toFile(tempWebpPath);

      const newStat = fs.statSync(tempWebpPath);
      const newSize = newStat.size;

      // Replace or move to webpPath
      if (fs.existsSync(webpPath) && webpPath !== tempWebpPath) {
        fs.unlinkSync(webpPath);
      }
      fs.renameSync(tempWebpPath, webpPath);

      // Remove original file if it was non-webp or larger than 500KB
      if (filePath !== webpPath) {
        fs.unlinkSync(filePath);
        console.log(`✔ Converted & Removed original: ${file} (${(originalSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024).toFixed(2)} KB)`);
      } else {
        console.log(`✔ Re-optimized WebP: ${file} (${(originalSize / 1024).toFixed(2)} KB -> ${(newSize / 1024).toFixed(2)} KB)`);
      }

      processedCount++;
      totalSavedBytes += (originalSize - newSize);
    } catch (err) {
      console.error(`✖ Failed to process ${file}:`, err.message);
    }
  }

  console.log(`\n🎉 Completed image optimization!`);
  console.log(`Processed ${processedCount} images.`);
  console.log(`Total storage saved: ${(totalSavedBytes / 1024 / 1024).toFixed(2)} MB`);
}

optimizeImages();
