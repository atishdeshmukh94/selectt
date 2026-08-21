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
    db.query('SELECT * FROM sell_requests WHERE make = "Ford" AND model = "EcoSport"', (err, results) => {
        if (err) console.error(err);
        else console.log("SELL REQUESTS:", JSON.stringify(results, null, 2));

        db.query('SELECT id, make, model FROM cars ORDER BY id DESC LIMIT 5', (err, cars) => {
            if (err) console.error(err);
            else console.log("LATEST CARS:", JSON.stringify(cars, null, 2));
            db.end();
        });
    });
});
