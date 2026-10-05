const nodemailer = require('nodemailer');
const { generateBookingReceiptPdf } = require('../receipt-pdf');
const mysql = require('mysql2/promise');

async function testEmail() {
  const db = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'selectt-db' });
  const [rows] = await db.query(`
    SELECT b.*, c.email, c.first_name, c.last_name, c.phone, c.city, car.id AS car_id, car.make, car.model, car.variant, car.year, car.price, car.price AS car_price, car.fuel_type, car.transmission, car.km AS km_driven, car.km, car.color, car.registration_no, car.ownership, car.image 
    FROM bookings b 
    JOIN customers c ON b.customer_id = c.id 
    JOIN cars car ON b.car_id = car.id 
    WHERE b.id = 19
  `);
  
  if (!rows.length) {
    console.log('Booking 19 not found');
    await db.end();
    return;
  }
  const b = rows[0];
  console.log('Found booking:', b.booking_no, b.email);

  const [settingsRows] = await db.query('SELECT setting_key, setting_value FROM site_settings');
  const settings = {};
  settingsRows.forEach(r => settings[r.setting_key] = r.setting_value);

  const smtpHost = settings.smtp_host || 'smtp.gmail.com';
  const smtpPort = parseInt(settings.smtp_port || 587);
  const smtpUser = settings.smtp_user;
  const smtpPass = settings.smtp_pass;

  console.log('SMTP config:', { smtpHost, smtpPort, smtpUser });

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
    tls: { rejectUnauthorized: false }
  });

  try {
    const info = await transporter.sendMail({
      from: `"Selectt." <${settings.smtp_from_email || smtpUser}>`,
      to: b.email,
      subject: `Payment Successful - Car Booking Confirmed #${b.booking_no}`,
      html: `<h2>Booking Confirmed for ${b.year} ${b.make} ${b.model}!</h2><p>Amount: ₹${b.booking_amount}</p>`
    });
    console.log('Email sent successfully! MessageId:', info.messageId);
  } catch (err) {
    console.error('Email send error:', err);
  }
  await db.end();
}

testEmail();
