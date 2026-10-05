const mysql = require('mysql2');
const path = require('path');

// Run from backend context
const { sendGallaboxWhatsAppNotification, getSetting, queryAsync } = require('../index');

async function test() {
  console.log('--- Testing Gallabox WhatsApp for booking 19 ---');
  try {
    const res = await sendGallaboxWhatsAppNotification('car_booking', '9753003648', {
      customer_name: 'Rohit Yadav',
      name: 'Rohit Yadav',
      car_name: '2025 Skoda Kylaq Signature AT',
      Car_Model: '2025 Skoda Kylaq Signature AT',
      car_model: '2025 Skoda Kylaq Signature AT',
      amount: '₹11,000',
      Amount: '₹11,000',
      '1': 'Rohit Yadav',
      '2': '2025 Skoda Kylaq Signature AT',
      '3': '₹11,000'
    });
    console.log('Gallabox WhatsApp response:', res);
  } catch (err) {
    console.error('Gallabox WhatsApp error:', err);
  }
}

test();
