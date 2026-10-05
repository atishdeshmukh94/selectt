const mysql = require('mysql2');
const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'selectt-db' });

db.query("SELECT b.*, c.phone, c.email FROM bookings b JOIN customers c ON b.customer_id = c.id ORDER BY b.id DESC LIMIT 5", (err, rows) => {
  if (err) console.error(err);
  else console.log('Recent bookings in local DB:', rows);
  db.end();
});
