const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Patch inspection endpoint with Gallabox & admin notification
const inspectionTarget = `app.put('/api/sell-requests/:id/inspection', (req, res) => {
    const { name, phone, appointmentDate, time, appointmentTime, notes } = req.body;
    const reqId = req.params.id;

    const updateFields = {
        inspection_date: appointmentDate || null,
        inspection_time: time || appointmentTime || null,
        inspection_notes: notes || null
    };
    if (name) updateFields.customer_name = name;
    if (phone) updateFields.customer_phone = phone;

    db.query('UPDATE sell_requests SET ? WHERE id = ?', [updateFields, reqId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Inspection appointment booked successfully', id: reqId });
    });
});`;

const inspectionReplacement = `app.put('/api/sell-requests/:id/inspection', (req, res) => {
    const { name, phone, appointmentDate, time, appointmentTime, notes } = req.body;
    const reqId = req.params.id;

    const updateFields = {
        inspection_date: appointmentDate || null,
        inspection_time: time || appointmentTime || null,
        inspection_notes: notes || null
    };
    if (name) updateFields.customer_name = name;
    if (phone) updateFields.customer_phone = phone;

    db.query('UPDATE sell_requests SET ? WHERE id = ?', [updateFields, reqId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // Trigger WhatsApp Notification for Inspection Scheduled
        db.query('SELECT * FROM sell_requests WHERE id = ?', [reqId], (sErr, sRows) => {
            if (!sErr && sRows.length > 0) {
                const sr = sRows[0];
                const targetPhone = phone || sr.customer_phone;
                if (targetPhone) {
                    sendGallaboxWhatsAppNotification('sell_inspection_scheduled', targetPhone, {
                        customer_name: name || sr.customer_name || 'Valued Seller',
                        car_name: \`\${sr.year || ''} \${sr.make || ''} \${sr.model || ''} \${sr.variant || ''}\`.trim(),
                        date_slot: \`\${appointmentDate || sr.inspection_date || ''} \${time || appointmentTime || sr.inspection_time || ''}\`.trim(),
                        request_id: \`#SELL-\${reqId}\`
                    });
                }
                createNotification('CAR_SELL_REQUEST', \`Inspection scheduled for Sell Request #\${reqId} on \${appointmentDate || sr.inspection_date} (\${time || appointmentTime || sr.inspection_time})\`, sr.customer_id, reqId);
            }
        });

        res.status(200).json({ message: 'Inspection appointment booked successfully', id: reqId });
    });
});`;

// 2. Patch payments/verify with Gallabox & admin notification
const verifyTarget = `            // Payment verified
            db.query(
                'UPDATE bookings SET payment_status = ?, razorpay_order_id = ?, razorpay_payment_id = ? WHERE id = ? AND customer_id = ?',
                ['paid', razorpay_order_id, razorpay_payment_id, booking_id, req.user.id],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Payment verified and booking updated' });
                    // Send email notification asynchronously
                    sendPaymentSuccessEmail(booking_id).catch(console.error);
                }
            );`;

const verifyReplacement = `            // Payment verified
            db.query(
                'UPDATE bookings SET payment_status = ?, razorpay_order_id = ?, razorpay_payment_id = ? WHERE id = ? AND customer_id = ?',
                ['paid', razorpay_order_id, razorpay_payment_id, booking_id, req.user.id],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Payment verified and booking updated' });

                    // Gallabox WhatsApp & Admin Notification
                    db.query(
                        'SELECT b.*, c.first_name, c.last_name, c.phone, car.make, car.model, car.variant, car.year FROM bookings b JOIN customers c ON b.customer_id = c.id JOIN cars car ON b.car_id = car.id WHERE b.id = ?',
                        [booking_id],
                        (bErr, bRows) => {
                            if (!bErr && bRows.length > 0) {
                                const info = bRows[0];
                                sendGallaboxWhatsAppNotification('car_booking', info.phone || req.user.phone, {
                                    customer_name: \`\${info.first_name || ''} \${info.last_name || ''}\`.trim() || 'Valued Buyer',
                                    car_name: \`\${info.year || ''} \${info.make || ''} \${info.model || ''} \${info.variant || ''}\`.trim(),
                                    amount: \`₹\${Number(info.booking_amount || 5000).toLocaleString('en-IN')}\`,
                                    booking_id: info.booking_no || \`BK-\${booking_id}\`
                                });
                                createNotification('PAYMENT', \`Token payment of ₹\${Number(info.booking_amount || 5000).toLocaleString('en-IN')} received for booking #\${info.booking_no} (\${info.make} \${info.model})\`, req.user.id, booking_id);
                            }
                        }
                    );

                    // Send email notification asynchronously
                    sendPaymentSuccessEmail(booking_id).catch(console.error);
                }
            );`;

const norm = s => s.replace(/\r\n/g, '\n');
if (norm(code).includes(norm(inspectionTarget))) {
    code = norm(code).replace(norm(inspectionTarget), norm(inspectionReplacement));
    console.log('Successfully patched inspection endpoint in backend/index.js');
} else {
    console.log('Inspection target not found or already patched');
}

if (norm(code).includes(norm(verifyTarget))) {
    code = norm(code).replace(norm(verifyTarget), norm(verifyReplacement));
    console.log('Successfully patched verifyTarget in backend/index.js');
} else {
    console.log('Verify target not found or already patched');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Saved index.js');
