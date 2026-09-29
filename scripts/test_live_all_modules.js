const https = require('https');

function request(url, options = {}, data = null) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json || body,
          raw: body
        });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 'ERROR', error: err.message });
    });

    if (data) {
      req.write(typeof data === 'object' ? JSON.stringify(data) : data);
    }
    req.end();
  });
}

(async () => {
  console.log('=== SELECTT LIVE PRODUCTION API VERIFICATION ===\n');

  // 1. Test Public Endpoints
  const publicTests = [
    { name: 'Cars List', url: 'https://api.selectt.in/api/cars' },
    { name: 'Public Settings', url: 'https://api.selectt.in/api/settings/public' },
    { name: 'Brands List', url: 'https://api.selectt.in/api/brands' },
    { name: 'Customer Reviews', url: 'https://api.selectt.in/api/customer-reviews' },
    { name: 'Video Testimonials', url: 'https://api.selectt.in/api/video-testimonials' },
    { name: 'Car Hub Locations', url: 'https://api.selectt.in/api/car-hub-locations' },
    { name: 'Locations', url: 'https://api.selectt.in/api/locations' },
    { name: 'Banners', url: 'https://api.selectt.in/api/banners' },
    { name: 'Meta Catalog CSV Feed', url: 'https://api.selectt.in/api/feeds/meta-catalog.csv' },
    { name: 'Meta Catalog XML Feed', url: 'https://api.selectt.in/api/feeds/meta-catalog.xml' },
    { name: 'Meta Catalog JSON Feed', url: 'https://api.selectt.in/api/feeds/meta-catalog.json' },
    { name: 'Sitemap XML', url: 'https://api.selectt.in/api/sitemap.xml' }
  ];

  for (const t of publicTests) {
    const res = await request(t.url);
    const pass = res.status >= 200 && res.status < 300;
    console.log(`${pass ? '✅' : '❌'} [HTTP ${res.status}] ${t.name}`);
    if (!pass) console.log(`   Response:`, res.raw.slice(0, 150));
  }

  // 2. Test Admin Login and Protected Endpoints
  console.log('\n--- Testing Admin Authentication ---');
  const loginRes = await request('https://api.selectt.in/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@selectt.in', password: 'password123' });

  if (loginRes.status === 200 && loginRes.data && loginRes.data.token) {
    console.log('✅ Admin Login Successful');
    const token = loginRes.data.token;
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const adminTests = [
      { name: 'Admin Notifications', url: 'https://api.selectt.in/api/admin/notifications' },
      { name: 'Admin Sell Requests', url: 'https://api.selectt.in/api/sell-requests' },
      { name: 'Admin Test Drives', url: 'https://api.selectt.in/api/test-drives' },
      { name: 'Admin Bookings', url: 'https://api.selectt.in/api/bookings' },
      { name: 'Admin Loan Applications', url: 'https://api.selectt.in/api/loan-applications' },
      { name: 'Admin Insurance Requests', url: 'https://api.selectt.in/api/admin/insurance-requests' },
      { name: 'Admin Analytics Overview', url: 'https://api.selectt.in/api/admin/analytics/overview' },
      { name: 'Admin Analytics Logs', url: 'https://api.selectt.in/api/admin/analytics/logs?page=1&limit=10' },
      { name: 'Admin Media Library', url: 'https://api.selectt.in/api/media' },
      { name: 'Admin Site Settings', url: 'https://api.selectt.in/api/settings' },
      { name: 'Admin Users / Staff', url: 'https://api.selectt.in/api/users' },
      { name: 'Admin Customers', url: 'https://api.selectt.in/api/customers' },
      { name: 'Admin Dashboard Stats', url: 'https://api.selectt.in/api/dashboard/stats' }
    ];

    for (const at of adminTests) {
      const res = await request(at.url, { headers: authHeaders });
      const pass = res.status >= 200 && res.status < 300;
      console.log(`${pass ? '✅' : '❌'} [HTTP ${res.status}] ${at.name}`);
      if (!pass) console.log(`   Response:`, res.raw ? res.raw.slice(0, 150) : res.error);
    }
  } else {
    console.log('❌ Admin Login Failed:', loginRes.data);
  }

  console.log('\n=== LIVE VERIFICATION FINISHED ===');
})();
