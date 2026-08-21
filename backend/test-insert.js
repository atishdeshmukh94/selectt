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
    const carData = {
        make: "Ford", 
        model: "EcoSport", 
        variant: "Petrol Automatic", 
        year: 2020, 
        km: 40, 
        fuel_type: "", 
        transmission: "", 
        ownership: "3rd Owner", 
        location: "Mumbai", 
        price: "0.00",
        description: "",
        status: 'active'
    };
    db.query('INSERT INTO cars SET ?', carData, (insertErr, result) => {
        if (insertErr) {
            console.error("Insert Error:", insertErr.message);
        } else {
            console.log("Inserted with ID:", result.insertId);
        }
        db.end();
    });
});
