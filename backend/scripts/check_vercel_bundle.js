const https = require('https');

function check() {
  https.get('https://selectt.in/car/tata/safari/xza-plus/32?t=' + Date.now(), (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
      const match = data.match(/src="([^"]*assets[^"]*)"/);
      console.log('Live bundle src on Vercel:', match ? match[1] : 'Not found');
    });
  });
}
check();
