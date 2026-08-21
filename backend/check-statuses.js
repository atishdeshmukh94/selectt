const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.query('SELECT fuel_type, transmission FROM cars', (err, results) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(results);
    db.end();
});
