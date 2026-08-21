import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = 'D:\\MEGHA\\sell-banner.png';
const outputPath = path.join(__dirname, 'public', 'sell-banner.webp');

sharp(inputPath)
  .webp({ quality: 80, compressionLevel: 6 })
  .toFile(outputPath)
  .then(info => {
    console.log('Successfully converted image to WebP:', info);
  })
  .catch(err => {
    console.error('Error converting image:', err);
  });
