const mysql = require('mysql2');
const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'selectt-db' });

db.query("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('whatsapp_test_mode', 'gallabox_channel_id', 'gallabox_api_key', 'gallabox_api_secret', 'gallabox_auto_notifications_enabled')", (err, rows) => {
  if (err) console.error(err);
  else console.log(rows);
  db.end();
});
