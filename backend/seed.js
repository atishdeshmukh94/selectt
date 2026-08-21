const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const sampleCars = [
    {
        make: "Maruti Suzuki",
        model: "Swift",
        variant: "VXI",
        year: 2019,
        price: 525000,
        emi: 9500,
        km: 32000,
        fuel_type: "Petrol",
        transmission: "Manual",
        location: "Navi Mumbai",
        image: "/img/maruti-suzuki.png",
        is_assured: 1,
        tag: "Top Rated",
        hub: "Selectt Hub, Rohini"
    },
    {
        make: "Hyundai",
        model: "Creta",
        variant: "SX (O) Petrol",
        year: 2021,
        price: 1450000,
        emi: 24000,
        km: 15400,
        fuel_type: "Petrol",
        transmission: "Automatic",
        location: "Gurgaon",
        image: "/img/hyundai.webp",
        is_assured: 1,
        tag: "Trending",
        hub: "Selectt Hub, MG Road"
    },
    {
        make: "Honda",
        model: "City",
        variant: "V MT",
        year: 2018,
        price: 780000,
        emi: 12500,
        km: 45000,
        fuel_type: "Diesel",
        transmission: "Manual",
        location: "Noida",
        image: "/img/honda.webp",
        is_assured: 1,
        hub: "Selectt Hub, Sec 62"
    }
];

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to seed database...');

    const query = 'INSERT INTO cars (make, model, variant, year, price, emi, km, fuel_type, transmission, location, image, is_assured, tag, hub) VALUES ?';
    const values = sampleCars.map(car => [
        car.make, car.model, car.variant, car.year, car.price, car.emi, car.km, car.fuel_type, car.transmission, car.location, car.image, car.is_assured, car.tag, car.hub
    ]);

    db.query(query, [values], (err, result) => {
        if (err) throw err;
        console.log(`Successfully seeded ${result.affectedRows} cars!`);
        process.exit();
    });
});
