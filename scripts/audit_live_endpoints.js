const https = require('https');

const endpoints = [
  { name: 'Live Website Home', url: 'https://selectt.in' },
  { name: 'Live Admin Panel', url: 'https://admin.selectt.in' },
  { name: 'Live API Health', url: 'https://api.selectt.in/api/cars' },
  { name: 'Live Brands API', url: 'https://api.selectt.in/api/brands' },
  { name: 'Live Models API', url: 'https://api.selectt.in/api/models' },
  { name: 'Live Car Hubs API', url: 'https://api.selectt.in/api/car-hubs' },
  { name: 'Live Banners API', url: 'https://api.selectt.in/api/banners' },
  { name: 'Live Customer Reviews API', url: 'https://api.selectt.in/api/customer-reviews' },
  { name: 'Live Video Testimonials API', url: 'https://api.selectt.in/api/video-testimonials' },
  { name: 'Live Meta Catalog Feed CSV', url: 'https://api.selectt.in/api/feeds/meta-catalog.csv' },
  { name: 'Live Notifications API (Options check)', url: 'https://api.selectt.in/api/notifications' },
];

function checkUrl(ep) {
  return new Promise((resolve) => {
    const req = https.get(ep.url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          name: ep.name,
          url: ep.url,
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 400,
          preview: data.slice(0, 100).replace(/\s+/g, ' ')
        });
      });
    });
    req.on('error', (err) => {
      resolve({
        name: ep.name,
        url: ep.url,
        status: 'ERROR',
        ok: false,
        error: err.message
      });
    });
  });
}

(async () => {
  console.log('--- Testing Live Endpoints & Modules ---');
  for (const ep of endpoints) {
    const res = await checkUrl(ep);
    const mark = res.ok ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} [HTTP ${res.status}] ${res.name} (${res.url})`);
    if (!res.ok) {
      console.log(`   Error/Detail: ${res.error || res.preview}`);
    }
  }
  console.log('--- Completed Live Audit ---');
})();
