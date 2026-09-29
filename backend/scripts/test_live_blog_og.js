async function check() {
  try {
    const res = await fetch('https://selectt.in/blog/buying-your-dream-car-check-now', {
      headers: {
        'User-Agent': 'WhatsApp/2.21.12.21 A'
      }
    });
    const html = await res.text();
    console.log('Status:', res.status);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const ogImageMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
    const ogTitleMatch = html.match(/property="og:title"\s+content="([^"]+)"/i);
    const ogDescMatch = html.match(/property="og:description"\s+content="([^"]+)"/i);
    console.log('1. Title:', titleMatch ? titleMatch[1] : 'NONE');
    console.log('2. og:title:', ogTitleMatch ? ogTitleMatch[1] : 'NONE');
    console.log('3. og:image:', ogImageMatch ? ogImageMatch[1] : 'NONE');
    console.log('4. og:desc:', ogDescMatch ? ogDescMatch[1] : 'NONE');
  } catch (e) {
    console.error(e);
  }
}
check();
