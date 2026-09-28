const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { pushBatchToMetaGraphApi, formatCarForMeta, testMetaCatalogConnection } = require('../meta-catalog-service');

async function syncMetaCatalog() {
  const token = 'EAIo8QpxjUvIBShFcXMZC7YlPGwBIuMlhJFObguvxS6yvipTWYjBSuY03all2R6qxybMyeyRuThOrXjB5Hl6lKhUc0o50ZA96okACvvdPZBa8rla3ukxqYwSXhKVjDfa5xFBpVeeSVlBpjZB3F1hobJMp6ONoN9HF0UVUO9SRyyRpJx8vlddbqPuWHoxluwZDZD';
  const catalogId = '2206855529763290';

  console.log('1. Testing Meta Catalog connection...');
  const testConn = await testMetaCatalogConnection({ catalogId, accessToken: token });
  console.log('Connection test:', testConn);

  if (!testConn.success) {
    console.error('Connection failed! Aborting sync.');
    return;
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'selectt'
  });

  const [cars] = await connection.query(
    "SELECT * FROM cars WHERE status = 'active' OR status IS NULL OR status = 'in_stock'"
  );
  console.log(`2. Found ${cars.length} active cars in database.`);

  if (cars.length === 0) {
    console.log('No cars to sync.');
    await connection.end();
    return;
  }

  const formattedItems = cars.map(c => formatCarForMeta(c, 'https://selectt.in', 'Selectt Cars'));
  console.log(`3. Formatted ${formattedItems.length} items for Meta Automotive/Commerce Catalog.`);

  console.log('4. Pushing batch to Meta Graph API...');
  const syncResult = await pushBatchToMetaGraphApi({
    catalogId,
    accessToken: token,
    items: formattedItems,
    method: 'UPDATE'
  });

  console.log('5. Sync result:', syncResult);

  const nowStr = new Date().toISOString();
  await connection.query(
    'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
    ['meta_catalog_last_synced_at', nowStr, nowStr]
  );
  await connection.query(
    'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
    ['meta_catalog_last_sync_status', syncResult.success ? 'success' : 'failed', syncResult.success ? 'success' : 'failed']
  );
  await connection.query(
    'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
    ['meta_catalog_last_sync_result', JSON.stringify(syncResult), JSON.stringify(syncResult)]
  );

  console.log('✅ Sync state saved to database successfully!');
  await connection.end();
}

syncMetaCatalog().catch(err => {
  console.error('Exception during sync:', err);
  process.exit(1);
});
