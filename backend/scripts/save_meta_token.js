const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function saveMetaSettings() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'selectt'
  });

  const token = 'EAIo8QpxjUvIBShFcXMZC7YlPGwBIuMlhJFObguvxS6yvipTWYjBSuY03all2R6qxybMyeyRuThOrXjB5Hl6lKhUc0o50ZA96okACvvdPZBa8rla3ukxqYwSXhKVjDfa5xFBpVeeSVlBpjZB3F1hobJMp6ONoN9HF0UVUO9SRyyRpJx8vlddbqPuWHoxluwZDZD';
  const catalogId = '2206855529763290';
  const pixelId = '1289001699087868';
  const businessId = '535964300375557';

  const entries = [
    ['meta_catalog_id', catalogId],
    ['meta_access_token', token],
    ['meta_pixel_id', pixelId],
    ['meta_business_id', businessId],
    ['meta_catalog_auto_sync', 'true'],
    ['meta_catalog_fallback_brand', 'Selectt Cars'],
    ['meta_catalog_currency', 'INR']
  ];

  for (const [k, v] of entries) {
    await connection.query(
      'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      [k, v, v]
    );
  }

  console.log('✅ Successfully saved Meta Catalog settings to local Database!');

  const [rows] = await connection.query("SELECT setting_key, LEFT(setting_value, 20) as val FROM site_settings WHERE setting_key LIKE 'meta_%'");
  console.log('Current settings in DB:');
  console.table(rows);

  await connection.end();
}

saveMetaSettings().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
