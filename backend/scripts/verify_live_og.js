async function verifyLive() {
  console.log('--- Verifying Live selectt.in metadata & og-image ---');
  
  // 1. Check og-image.jpg
  const imgRes = await fetch('https://selectt.in/img/og-image.jpg', { cache: 'no-store' });
  console.log('1. /img/og-image.jpg:', imgRes.status, imgRes.headers.get('content-type'), imgRes.headers.get('content-length'), 'bytes');

  // 2. Check og-image.png
  const pngRes = await fetch('https://selectt.in/og-image.png', { cache: 'no-store' });
  console.log('2. /og-image.png:', pngRes.status, pngRes.headers.get('content-type'));

  // 3. Fetch index.html
  const htmlRes = await fetch('https://selectt.in/', { cache: 'no-store' });
  const html = await htmlRes.text();

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  console.log('3. Live <title>:', titleMatch ? titleMatch[1] : 'NONE');

  const ogTitleMatch = html.match(/property="og:title"\s+content="([^"]+)"/i);
  console.log('4. Live og:title:', ogTitleMatch ? ogTitleMatch[1] : 'NONE');

  const ogImageMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
  console.log('5. Live og:image:', ogImageMatch ? ogImageMatch[1] : 'NONE');

  const geoPlaceMatch = html.match(/name="geo.placename"\s+content="([^"]+)"/i);
  console.log('6. Live geo.placename:', geoPlaceMatch ? geoPlaceMatch[1] : 'NONE');

  const hasRaipur = html.toLowerCase().includes('raipur');
  console.log('7. Any "raipur" in live index.html?', hasRaipur ? 'YES (needs fix)' : 'NO (Clean!)');
}

verifyLive().catch(console.error);
