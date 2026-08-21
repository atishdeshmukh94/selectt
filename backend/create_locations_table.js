const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const createLocationsTable = `
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    image VARCHAR(255),
    is_popular TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const initialLocations = [
    ['Delhi NCR', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80', 1],
    ['Bangalore', 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&q=80', 1],
    ['Mumbai', 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&q=80', 1],
    ['Hyderabad', 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=400&q=80', 1],
    ['Ahmedabad', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80', 1],
    ['Chennai', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&q=80', 1],
    ['Pune', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80', 1],
    ['Lucknow', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&q=80', 1]
];

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to DB');

    db.query(createLocationsTable, (err) => {
        if (err) throw err;
        console.log('Locations table created');

        const insertQuery = 'INSERT IGNORE INTO locations (name, image, is_popular) VALUES ?';
        db.query(insertQuery, [initialLocations], (err) => {
            if (err) throw err;
            console.log('Initial locations inserted');
            db.end();
        });
    });
});
