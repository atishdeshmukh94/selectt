const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const VPS_SSH = {
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
};

const carBookingMsg = '*Your car is reserved.* 🚗✅\n\nHi {{name}} 👋\n\nYour booking for *{{Car_Model}}* is confirmed with Selectt.\n\nWe’ve received your booking amount of *{{Amount}}* 💳\n\nOur team will connect with you shortly for the next steps.😊';

const sellRequestMsg = '*Your car sell price is ready.* 💰🚗\n\nHi *{{name}}* 👏\n\nGood news — your car valuation is ready on Selectt.\n\nYour estimated sell price is *{{Sell_Amount}}* 💸\n\nIf you’d like, we can help you with the next step to sell it faster.😊';

const updates = [
    { key: 'gallabox_tpl_car_booking', value: 'car_booking_confirmation' },
    { key: 'gallabox_tpl_booking_confirmed', value: 'car_booking_confirmation' },
    { key: 'gallabox_msg_car_booking', value: carBookingMsg },
    { key: 'gallabox_msg_booking_confirmed', value: carBookingMsg },
    { key: 'gallabox_event_car_booking_enabled', value: 'true' },

    { key: 'gallabox_tpl_sell_request', value: 'customer_got_sell_price_for_their_car' },
    { key: 'gallabox_msg_sell_request', value: sellRequestMsg },
    { key: 'gallabox_event_sell_request_enabled', value: 'true' },

    { key: 'gallabox_auto_notifications_enabled', value: 'true' }
];

const conn = new Client();
conn.on('ready', () => {
    console.log('Connected to VPS SSH');

    // 1. Deploy index.js via SFTP
    conn.sftp((sftpErr, sftp) => {
        if (sftpErr) {
            console.error('SFTP Error:', sftpErr);
            conn.end();
            process.exit(1);
        }

        const localIndex = fs.readFileSync(path.join(__dirname, '..', 'index.js'), 'utf8');
        const remotePath = '/home/selectt-api/htdocs/api.selectt.in/index.js';
        const writeStream = sftp.createWriteStream(remotePath);

        writeStream.on('close', () => {
            console.log('Successfully uploaded updated index.js to live VPS!');

            // 2. Execute SQL updates on connect-db
            let sql = '';
            for (const item of updates) {
                const escapedVal = item.value.replace(/'/g, "\\'");
                sql += `INSERT INTO site_settings (setting_key, setting_value) VALUES ('${item.key}', '${escapedVal}') ON DUPLICATE KEY UPDATE setting_value = '${escapedVal}'; `;
            }

            // Write temporary SQL file on VPS and execute it via mysql client
            const remoteSqlFile = '/tmp/whatsapp_settings_update.sql';
            const sqlStream = sftp.createWriteStream(remoteSqlFile);
            sqlStream.on('close', () => {
                const cmd = `mysql -u selectt-wepnex -p6EVSUZ7RNYA9bV0WUoxy connect-db < ${remoteSqlFile} 2>&1 && rm -f ${remoteSqlFile} && export PATH=/home/selectt-api/.nvm/versions/node/v24.21.0/bin:$PATH && pm2 restart selectt-api && pm2 status`;
                conn.exec(cmd, (execErr, stream) => {
                    if (execErr) {
                        console.error('Exec error:', execErr);
                        conn.end();
                        process.exit(1);
                    }
                    let out = '';
                    stream.on('data', d => out += d);
                    stream.stderr.on('data', d => out += d);
                    stream.on('close', () => {
                        console.log('Live VPS Execution Output:\n' + out);
                        conn.end();
                        process.exit(0);
                    });
                });
            });
            sqlStream.end(sql);
        });

        writeStream.end(localIndex);
    });
}).connect(VPS_SSH);
