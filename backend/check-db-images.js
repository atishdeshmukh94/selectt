const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkBanners() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'selectt_db',
  });

  try {
    const [banners] = await connection.query('SELECT * FROM banners');
    console.log('BANNERS:', JSON.stringify(banners, null, 2));

    const [brands] = await connection.query('SELECT * FROM brands');
    console.log('BRANDS:', JSON.stringify(brands, null, 2));
    
    const [blogs] = await connection.query('SELECT title, featured_image FROM blog_posts LIMIT 5');
    console.log('BLOGS:', JSON.stringify(blogs, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkBanners();
