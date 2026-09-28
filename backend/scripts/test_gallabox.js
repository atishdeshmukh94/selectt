const { Client } = require('ssh2');

const VPS_SSH = {
    host: '200.97.166.12',
    port: 22,
    username: 'selectt-api',
    password: 'qdBG7QXFQayXUuwvHPzo'
};

const conn = new Client();
conn.on('ready', () => {
    // Run node script on VPS to test Gallabox dispatch
    const testCode = `
      const mysql = require('mysql2/promise');
      (async () => {
        const db = await mysql.createConnection({
          host: 'localhost',
          user: 'selectt-wepnex',
          password: '6EVSUZ7RNYA9bV0WUoxy',
          database: 'connect-db'
        });
        const [rows] = await db.query('SELECT setting_key, setting_value FROM site_settings WHERE setting_key LIKE "gallabox_%" OR setting_key LIKE "whatsapp_%"');
        const settings = {};
        rows.forEach(r => settings[r.setting_key] = r.setting_value);
        console.log('Gallabox Settings:', {
          apiKey: settings.gallabox_api_key ? settings.gallabox_api_key.substring(0, 6) + '...' : null,
          apiSecret: settings.gallabox_api_secret ? '***' : null,
          channelId: settings.gallabox_channel_id,
          testMode: settings.whatsapp_test_mode,
          autoEnabled: settings.gallabox_auto_notifications_enabled
        });
        
        // Test Gallabox direct API call
        const fetch = (await import('node-fetch')).default || globalThis.fetch;
        const testPayload = {
          channelId: settings.gallabox_channel_id,
          channelType: "whatsapp",
          recipient: {
            name: "Rohit Yadav",
            phone: "919753003648"
          },
          whatsapp: {
            type: "template",
            template: {
              templateName: settings.gallabox_tpl_car_booking || "car_booking_confirmation",
              bodyValues: {
                "1": "Rohit Yadav",
                "2": "2025 Skoda Kylaq",
                "3": "5,000",
                "4": "BK-755984",
                "customer_name": "Rohit Yadav",
                "car_name": "2025 Skoda Kylaq",
                "amount": "5,000",
                "booking_id": "BK-755984"
              }
            }
          }
        };
        
        console.log('Sending test message to Gallabox API...');
        const res = await fetch('https://server.gallabox.com/devapi/messages/whatsapp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apiKey': settings.gallabox_api_key,
            'apiSecret': settings.gallabox_api_secret
          },
          body: JSON.stringify(testPayload)
        });
        const data = await res.json().catch(e => ({ error: e.message }));
        console.log('Gallabox API HTTP Status:', res.status);
        console.log('Gallabox API Response:', data);
        process.exit(0);
      })();
    `;
    conn.exec(`export PATH=/home/selectt-api/.nvm/versions/node/v24.21.0/bin:$PATH && node -e '${testCode}'`, (err, stream) => {
        if (err) throw err;
        let out = '';
        stream.on('data', d => out += d);
        stream.stderr.on('data', d => out += d);
        stream.on('close', () => {
            console.log(out);
            conn.end();
            process.exit(0);
        });
    });
}).connect(VPS_SSH);
