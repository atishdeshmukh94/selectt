const mysql = require('mysql2');
const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'selectt-db' });

const updates = [
  { key: 'gallabox_tpl_car_booking', value: 'car_booking_confirmation' },
  { key: 'gallabox_tpl_booking_confirmed', value: 'car_booking_confirmation' },
  { key: 'gallabox_event_car_booking_enabled', value: 'true' },

  { key: 'gallabox_tpl_test_drive', value: 'schedule_test_drive_confim' },
  { key: 'gallabox_tpl_test_drive_confirmed', value: 'schedule_test_drive_confim' },
  { key: 'gallabox_event_test_drive_enabled', value: 'true' },
  { key: 'gallabox_event_test_drive_confirmed_enabled', value: 'true' },

  { key: 'gallabox_tpl_sell_request', value: 'customer_got_sell_price_for_their_car' },
  { key: 'gallabox_event_sell_request_enabled', value: 'true' },

  { key: 'gallabox_tpl_wishlist', value: 'price_drop_message' },
  { key: 'gallabox_event_wishlist_enabled', value: 'true' },

  { key: 'gallabox_auto_notifications_enabled', value: 'true' }
];

let pending = updates.length;
for (const item of updates) {
  db.query(
    'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
    [item.key, item.value, item.value],
    (err) => {
      if (err) console.error('Error updating', item.key, err);
      else console.log('Updated local setting:', item.key, '->', item.value);
      if (--pending === 0) {
        console.log('All local settings updated successfully!');
        db.end();
      }
    }
  );
}
