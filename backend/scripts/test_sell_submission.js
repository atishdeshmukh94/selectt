const jwt = require('jsonwebtoken');
const secret = 's3l3ctt_jwt_$ecret_k3y_2025_xK9mR7pL2nQ8vW4jY6hT1bZ3cF5dG0eA';

(async () => {
  const custToken = jwt.sign({ id: 4, phone: '9753003648' }, secret, { expiresIn: '7d' });
  const payload = {
    make: 'Kia',
    model: 'Sonet',
    variant: 'HTK Plus',
    year: 2021,
    km: 45000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    ownership: '1st Owner',
    location: 'Mumbai',
    asking_price: 712000,
    customer_name: 'Rohit Yadav',
    customer_phone: '9753003648',
    customer_id: 4,
    inspection_date: '2026-09-28',
    inspection_time: '11:00 AM - 12:00 PM',
    inspection_notes: 'Home inspection in Mumbai'
  };

  const res = await fetch('https://api.selectt.in/api/sell-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + custToken
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  console.log('Sell request POST status:', res.status, data);

  // Now verify customer GET /api/sell-requests/mine
  const mineRes = await fetch('https://api.selectt.in/api/sell-requests/mine', {
    headers: { 'Authorization': 'Bearer ' + custToken }
  });
  const mineData = await mineRes.json();
  console.log('Customer sell requests count:', mineData.length, mineData[0]);

  // Now verify admin GET /api/sell-requests
  const adminToken = jwt.sign({ id: 1, email: 'admin@selectt.in', role: 'admin' }, secret, { expiresIn: '7d' });
  const adminRes = await fetch('https://api.selectt.in/api/sell-requests', {
    headers: { 'Authorization': 'Bearer ' + adminToken }
  });
  const adminData = await adminRes.json();
  console.log('Admin sell requests count:', adminData.length, adminData[0]);
})();
