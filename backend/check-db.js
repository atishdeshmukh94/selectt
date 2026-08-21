const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) throw err;
    db.query('SELECT id, email, password FROM users', (err, results) => {
        if (err) throw err;
        console.log(JSON.stringify(results, null, 2));
        db.end();
    });
});
