const jwt = require('jsonwebtoken');
const secret = 's3l3ctt_jwt_$ecret_k3y_2025_xK9mR7pL2nQ8vW4jY6hT1bZ3cF5dG0eA';

(async () => {
  const adminToken = jwt.sign({ id: 1, email: 'admin@selectt.in', role: 'admin' }, secret, { expiresIn: '7d' });
  const res = await fetch('https://api.selectt.in/api/admin/notifications?limit=10', {
    headers: { Authorization: 'Bearer ' + adminToken }
  });
  const data = await res.json();
  console.log('Live notifications count:', data.notifications?.length, 'Unread count:', data.unreadCount);
  data.notifications?.forEach((n, i) => {
    console.log(`[${i+1}] ${n.type} | ${n.message} | ${n.created_at} | is_read: ${n.is_read}`);
  });
})();
