const mysql = require('mysql2');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const defaultUser = {
    first_name: 'Rohit',
    last_name: 'Yadav',
    email: 'admin@gmail.com',
    password: 'password', 
    role: 'admin',
    job_title: 'Administrator',
    country: 'India',
    city_state: 'Delhi, India',
    postal_code: '110001',
    tax_id: 'TAX12345',
    phone: '+919753003648',
    bio: '',
    facebook: '',
    x_com: '',
    linkedin: '',
    instagram: '',
    image: './images/user/owner.jpg'
};

db.connect(async (err) => {
    if (err) throw err;
    console.log('Connected to MySQL');

    const hashedPassword = await bcrypt.hash(defaultUser.password, 10);
    const userToSeed = { ...defaultUser, password: hashedPassword };

    db.query('INSERT INTO users SET ? ON DUPLICATE KEY UPDATE id=id, password=VALUES(password)', userToSeed, (err, result) => {
        if (err) throw err;
        console.log('User seeded with hashed password');
        db.end();
    });
});
