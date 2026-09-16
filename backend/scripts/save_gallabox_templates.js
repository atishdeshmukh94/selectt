const mysql = require('mysql2');
require('dotenv').config({ path: __dirname + '/../.env' });

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'selectt'
});

const GALLABOX_MAPPINGS = [
  // Authentication / OTP
  { key: 'gallabox_tpl_auth_otp', value: 'otp_template_name' },
  { key: 'gallabox_template_name', value: 'otp_template_name' },

  // Sell Car Workflow
  { key: 'gallabox_tpl_sell_request', value: 'customer_got_sell_price_for_their_car' },
  { key: 'gallabox_tpl_sell_price_offered', value: 'customer_got_sell_price_for_their_car' },
  { key: 'gallabox_tpl_sell_inspection_scheduled', value: 'schedule_visit_confim' },
  { key: 'gallabox_tpl_sell_deal_completed', value: 'happy_customers_clinch' },
  { key: 'gallabox_tpl_sell_car_rejected', value: 'try_to_help_you' },

  // Buy & Bookings
  { key: 'gallabox_tpl_car_booking', value: 'car_booking_confirmation' },
  { key: 'gallabox_tpl_booking_confirmed', value: 'car_booking_confirmation' },
  { key: 'gallabox_tpl_car_delivered', value: 'happy_customers_clinch' },
  { key: 'gallabox_tpl_booking_cancelled', value: 'try_to_help_you' },

  // Test Drives & Visits
  { key: 'gallabox_tpl_test_drive', value: 'schedule_visit_confim' },
  { key: 'gallabox_tpl_test_drive_confirmed', value: 'schedule_visit_confim' },
  { key: 'gallabox_tpl_test_drive_completed', value: 'visted_sequence_6' },
  { key: 'gallabox_tpl_test_drive_cancelled', value: 'try_to_help_you' },

  // Finance, EMI & Insurance
  { key: 'gallabox_tpl_loan_application', value: 'hot_lead_sequence_3_2026' },
  { key: 'gallabox_tpl_loan_approved', value: 'hot_lead_sequence_1_2026' },
  { key: 'gallabox_tpl_insurance_enquiry', value: 'try_to_help_you' },
  { key: 'gallabox_tpl_emi_query', value: 'hot_lead_sequence_3_2026' },

  // Leads, Wishlist & Retention
  { key: 'gallabox_tpl_lead_inquiry', value: 'try_to_help_you' },
  { key: 'gallabox_tpl_wishlist', value: 'price_drop_message' },
  { key: 'gallabox_tpl_price_drop', value: 'price_drop_message' },
  { key: 'gallabox_tpl_callback_requested', value: 'try_to_help_you' },
  { key: 'gallabox_tpl_welcome_new_user', value: 'hi_message' },
  { key: 'gallabox_tpl_feedback_nps', value: 'happy_customers_clinch' },
  { key: 'gallabox_tpl_warranty_activated', value: 'sequenceutlity_1' },

  // Promotional & Follow-up campaigns
  { key: 'gallabox_tpl_promo_festive', value: 'independence_day2026' },
  { key: 'gallabox_tpl_promo_weekend', value: 'free_this_saturday_or_sunday_' },
  { key: 'gallabox_tpl_promo_summer', value: 'summer_sale_may' },
  { key: 'gallabox_tpl_followup_march', value: 'final_followup_march_2026_clone' },
  { key: 'gallabox_tpl_visited_followup_1', value: 'visited_sequence_1' },
  { key: 'gallabox_tpl_visited_followup_6', value: 'visted_sequence_6' },
  { key: 'gallabox_tpl_cold_followup_1', value: 'cold_seqeunce_1' },
  { key: 'gallabox_tpl_hot_lead_1', value: 'hot_lead_sequence_1_2026' },
  { key: 'gallabox_tpl_hot_lead_3', value: 'hot_lead_sequence_3_2026' },

  // Global Settings
  { key: 'gallabox_channel_id', value: '687de856ba93969639c5815d' },
  { key: 'gallabox_api_key', value: '6a266646fb427251e4a36c71' },
  { key: 'gallabox_api_secret', value: 'dad859177c7c44a3af02466d48625519' },
  { key: 'whatsapp_provider', value: 'gallabox' },
  { key: 'gallabox_auto_notifications_enabled', value: 'true' }
];

db.connect(async (err) => {
  if (err) {
    console.error('DB Connection Error:', err);
    process.exit(1);
  }
  console.log('Connected to Selectt Database');

  for (const item of GALLABOX_MAPPINGS) {
    await new Promise((resolve) => {
      db.query(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [item.key, item.value, item.value],
        (queryErr, result) => {
          if (queryErr) {
            console.error(`Error saving ${item.key}:`, queryErr.message);
          } else {
            console.log(`Saved: ${item.key} = ${item.value}`);
          }
          resolve();
        }
      );
    });
  }

  console.log('✅ All Gallabox approved templates have been successfully saved into site_settings!');
  db.end();
  process.exit(0);
});
