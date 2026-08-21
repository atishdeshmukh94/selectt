const mysql = require('mysql2/promise');
require('dotenv').config();

const INITIAL_BRANDS = [
  { id: 'maruti', name: 'Maruti Suzuki', logo: '/img/maruti-suzuki.png' },
  { id: 'hyundai', name: 'Hyundai', logo: '/img/hyundai.webp' },
  { id: 'honda', name: 'Honda', logo: '/img/honda.webp' },
  { id: 'tata', name: 'Tata', logo: '/img/tata.webp' },
  { id: 'mahindra', name: 'Mahindra', logo: '/img/mahindra.webp' },
  { id: 'kia', name: 'Kia', logo: '/img/kia.webp' },
  { id: 'ford', name: 'Ford', logo: '/img/Fored.webp' },
  { id: 'renault', name: 'Renault', logo: '/img/renault.webp' },
  { id: 'vw', name: 'Volkswagen', logo: '/img/Volkswagen_logo.webp' },
  { id: 'bmw', name: 'BMW', logo: '/img/bmw.png' },
  { id: 'mercedes', name: 'Mercedes-Benz', logo: '/img/mercedes-benz.webp' },
];

const INITIAL_MODELS = {
  maruti: ['Swift', 'Baleno', 'Wagon R', 'Alto', 'Dzire', 'Brezza'],
  hyundai: ['Creta', 'i20', 'Grand i10', 'Venue', 'Verna'],
  honda: ['City', 'Amaze', 'Jazz', 'WR-V'],
  tata: ['Nexon', 'Tiago', 'Harrier', 'Safari'],
  mahindra: ['Thar', 'XUV700', 'Scorpio', 'XUV300'],
  kia: ['Seltos', 'Sonet', 'Carens'],
  ford: ['EcoSport', 'Endeavour', 'Figo'],
  renault: ['Kwid', 'Duster', 'Triber'],
  vw: ['Polo', 'Vento', 'Taigun'],
  bmw: ['3 Series', '5 Series', 'X1'],
  mercedes: ['C-Class', 'E-Class', 'GLA'],
};

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'selectt_db',
  });

  try {
    console.log('Creating brands table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating models table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS models (
        id INT AUTO_INCREMENT PRIMARY KEY,
        brand_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
      )
    `);

    // Check if brands are already seeded
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM brands');
    if (rows[0].count === 0) {
      console.log('Seeding initial brands and models...');
      for (const b of INITIAL_BRANDS) {
        // Insert brand
        const [brandResult] = await connection.query(
          'INSERT INTO brands (name, logo_url) VALUES (?, ?)',
          [b.name, b.logo]
        );
        const brandId = brandResult.insertId;

        // Insert its models
        const models = INITIAL_MODELS[b.id] || [];
        for (const m of models) {
          await connection.query(
            'INSERT INTO models (brand_id, name) VALUES (?, ?)',
            [brandId, m]
          );
        }
      }
      console.log('Seeded successfully.');
    } else {
      console.log('Tables already contain data, skipping seed.');
    }

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase();
