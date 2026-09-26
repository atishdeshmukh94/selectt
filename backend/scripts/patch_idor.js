const fs = require('fs');
const path = require('path');

const indexJsPath = path.join(__dirname, '..', 'index.js');
let content = fs.readFileSync(indexJsPath, 'utf8');

const targetStr = `'UPDATE bookings SET payment_status = ?, razorpay_order_id = ?, razorpay_payment_id = ? WHERE id = ?'`;
const replacementStr = `'UPDATE bookings SET payment_status = ?, razorpay_order_id = ?, razorpay_payment_id = ? WHERE id = ? AND customer_id = ?'`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    content = content.replace(
        "['paid', razorpay_order_id, razorpay_payment_id, booking_id],",
        "['paid', razorpay_order_id, razorpay_payment_id, booking_id, req.user.id],"
    );
    fs.writeFileSync(indexJsPath, content, 'utf8');
    console.log('Successfully patched IDOR in payment verification!');
} else {
    console.log('Target string not found or already patched.');
}
