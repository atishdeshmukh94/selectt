const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processOgImage() {
  const ogUrl = 'https://api.selectt.in/uploads/og_image-1790420641655-303744039.webp';
  console.log('Fetching OG image from:', ogUrl);
  
  const response = await fetch(ogUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  const targetDirs = [
    path.join(__dirname, '../../frontend/public'),
    path.join(__dirname, '../../frontend/public/img')
  ];

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 1. Save 1200x630 high-quality JPEG (<300KB for WhatsApp)
    const jpgBuffer = await sharp(inputBuffer)
      .resize(1200, 630, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();

    fs.writeFileSync(path.join(dir, 'og-image.jpg'), jpgBuffer);
    console.log(`Saved og-image.jpg (${jpgBuffer.length} bytes) to ${dir}`);

    // 2. Save PNG
    const pngBuffer = await sharp(inputBuffer)
      .resize(1200, 630, { fit: 'cover', position: 'center' })
      .png({ quality: 90, compressionLevel: 8 })
      .toBuffer();

    fs.writeFileSync(path.join(dir, 'og-image.png'), pngBuffer);
    console.log(`Saved og-image.png (${pngBuffer.length} bytes) to ${dir}`);

    // 3. Save WEBP
    const webpBuffer = await sharp(inputBuffer)
      .resize(1200, 630, { fit: 'cover', position: 'center' })
      .webp({ quality: 90 })
      .toBuffer();

    fs.writeFileSync(path.join(dir, 'og-image.webp'), webpBuffer);
    console.log(`Saved og-image.webp (${webpBuffer.length} bytes) to ${dir}`);
  }

  console.log('All OG images generated successfully!');
}

processOgImage().catch(console.error);
