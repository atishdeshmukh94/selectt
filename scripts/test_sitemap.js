const https = require('https');

https.get('https://api.selectt.in/api/sitemap.xml', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    console.log(`Sitemap XML length: ${data.length} characters`);
    console.log('--- XML PREVIEW ---');
    console.log(data.slice(0, 800));
  });
}).on('error', (err) => {
  console.error('Error fetching sitemap:', err.message);
});
