/**
 * OneSignal Web Push Notification Service for Selectt
 * Supports:
 * 1. Custom Admin Push Notifications (Campaigns / Offers / Announcements)
 * 2. Automatic New Car Upload Push Alerts
 * 3. Automatic Price Drop Push Alerts
 * 4. Subscriber Stats & Credentials Validation via OneSignal REST API v1/v16
 */

const https = require('https');
const crypto = require('crypto');

// Helper to make HTTPS requests without external dependencies
function makeHttpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, raw: data });
        } catch (_) {
          resolve({ status: res.statusCode, data: { raw: data }, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

class OneSignalService {
  constructor(db) {
    this.db = db;
    this.ensureDatabaseTable();
  }

  // Ensure push_notifications table exists
  ensureDatabaseTable() {
    if (!this.db) return;
    const sql = `
      CREATE TABLE IF NOT EXISTS push_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        onesignal_id VARCHAR(100) NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        url VARCHAR(500) NULL,
        image_url VARCHAR(500) NULL,
        type ENUM('custom', 'new_car', 'price_drop') DEFAULT 'custom',
        car_id INT NULL,
        recipients_count INT DEFAULT 0,
        status ENUM('sent', 'failed', 'queued') DEFAULT 'sent',
        error_message TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    this.db.query(sql, (err) => {
      if (err) {
        console.warn('[OneSignal] Table creation warning:', err.message);
      } else {
        console.log('[OneSignal] Table push_notifications ready.');
      }
    });
  }

  // Retrieve current OneSignal configuration from site_settings
  async getConfig() {
    return new Promise((resolve) => {
      if (!this.db) {
        return resolve({
          enabled: false,
          appId: '',
          restApiKey: '',
        });
      }

      this.db.query(
        "SELECT setting_key, setting_value FROM site_settings WHERE setting_key LIKE 'onesignal_%'",
        (err, rows) => {
          if (err || !rows) {
            return resolve({
              enabled: false,
              appId: '',
              restApiKey: '',
            });
          }

          const map = {};
          rows.forEach((r) => {
            map[r.setting_key] = r.setting_value;
          });

          resolve({
            enabled: map.onesignal_enabled === 'true' || map.onesignal_enabled === '1',
            appId: (map.onesignal_app_id || '').trim(),
            restApiKey: (map.onesignal_rest_api_key || '').trim(),
            autoNewCar: map.onesignal_auto_new_car !== 'false' && map.onesignal_auto_new_car !== '0',
            newCarTitle: map.onesignal_new_car_title || '🚗 New Arrival: {year} {make} {model}',
            newCarMessage:
              map.onesignal_new_car_message ||
              'Just arrived at Selectt for ₹{price}! 200-point certified. Check details & book test drive.',
            autoPriceDrop: map.onesignal_auto_price_drop !== 'false' && map.onesignal_auto_price_drop !== '0',
            priceDropTitle: map.onesignal_price_drop_title || '🔥 Price Drop Alert: {make} {model}!',
            priceDropMessage:
              map.onesignal_price_drop_message ||
              'Price reduced by ₹{drop_amount}! Now only ₹{new_price}. Test drive this deal today.',
            priceDropMin: Number(map.onesignal_price_drop_min) || 1000,
            promptEnabled: map.onesignal_prompt_enabled !== 'false' && map.onesignal_prompt_enabled !== '0',
            iconUrl: map.onesignal_icon_url || 'https://selectt.in/favicon.png',
          });
        }
      );
    });
  }

  // Validate OneSignal App ID and REST API Key by querying OneSignal App Details API
  async testConnection({ appId, restApiKey }) {
    if (!appId || !restApiKey) {
      throw new Error('Both OneSignal App ID and REST API Key are required.');
    }

    const cleanAppId = appId.trim();
    const cleanKey = restApiKey.trim();

    const options = {
      hostname: 'api.onesignal.com',
      path: `/apps/${cleanAppId}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: cleanKey.startsWith('Key ') || cleanKey.startsWith('Basic ') ? cleanKey : `Key ${cleanKey}`,
      },
    };

    const res = await makeHttpsRequest(options);

    if (res.status === 200 && res.data && res.data.id) {
      return {
        success: true,
        appId: res.data.id,
        appName: res.data.name,
        players: res.data.players || 0,
        subscribers: res.data.messageable_players || res.data.players || 0,
        updatedAt: res.data.updated_at,
      };
    }

    const errMsg =
      (res.data && res.data.errors && res.data.errors[0]) ||
      (res.data && res.data.message) ||
      `OneSignal error HTTP ${res.status}`;
    throw new Error(errMsg);
  }

  // Send a Push Notification to all subscribed users or specified segment
  async sendPushNotification({
    title,
    message,
    url,
    imageUrl,
    iconUrl,
    segments = ['Total Subscriptions'],
    type = 'custom',
    carId = null,
  }) {
    const config = await this.getConfig();

    if (!config.enabled) {
      throw new Error('OneSignal is currently disabled in site settings.');
    }
    if (!config.appId || !config.restApiKey) {
      throw new Error('OneSignal App ID and REST API Key must be configured first.');
    }
    if (!title || !message) {
      throw new Error('Notification Title and Message are required.');
    }

    const finalUrl = url ? (url.startsWith('http') ? url : `https://selectt.in${url.startsWith('/') ? '' : '/'}${url}`) : 'https://selectt.in';
    const finalIcon = iconUrl || config.iconUrl || 'https://selectt.in/favicon.png';

    // Normalize Image URL if relative
    let finalImage = imageUrl || null;
    if (finalImage && !finalImage.startsWith('http')) {
      finalImage = `https://api.selectt.in${finalImage.startsWith('/') ? '' : '/'}${finalImage}`;
    }

    const payload = {
      app_id: config.appId,
      included_segments: Array.isArray(segments) && segments.length > 0 ? segments : ['Total Subscriptions', 'Subscribed Users'],
      headings: { en: title },
      contents: { en: message },
      url: finalUrl,
      web_url: finalUrl,
      target_channel: 'push',
      idempotency_key: crypto.randomUUID(),
      chrome_web_icon: finalIcon,
      firefox_icon: finalIcon,
    };

    if (finalImage) {
      payload.chrome_web_image = finalImage;
      payload.big_picture = finalImage;
    }

    const authHeader =
      config.restApiKey.startsWith('Key ') || config.restApiKey.startsWith('Basic ')
        ? config.restApiKey
        : `Key ${config.restApiKey}`;

    const options = {
      hostname: 'api.onesignal.com',
      path: '/notifications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: authHeader,
      },
    };

    const res = await makeHttpsRequest(options, payload);

    const isSuccess = res.status === 200 && res.data && res.data.id;
    const onesignalId = isSuccess ? res.data.id : null;
    const recipients = isSuccess ? (res.data.recipients || 0) : 0;
    const errorMsg = !isSuccess
      ? (res.data && res.data.errors ? JSON.stringify(res.data.errors) : `HTTP ${res.status}: ${res.raw}`)
      : null;

    // Log in database
    if (this.db) {
      const record = {
        onesignal_id: onesignalId,
        title: title.slice(0, 255),
        message: message,
        url: finalUrl,
        image_url: finalImage,
        type: type,
        car_id: carId,
        recipients_count: recipients,
        status: isSuccess ? 'sent' : 'failed',
        error_message: errorMsg,
      };

      this.db.query('INSERT INTO push_notifications SET ?', record, (err) => {
        if (err) console.warn('[OneSignal] Failed to log push notification to DB:', err.message);
      });
    }

    if (!isSuccess) {
      throw new Error(errorMsg || 'Failed to dispatch push notification');
    }

    return {
      success: true,
      onesignalId,
      recipients,
      data: res.data,
    };
  }

  // Trigger Automatic New Car Push Notification
  async triggerNewCar(carId, carData) {
    try {
      const config = await this.getConfig();
      if (!config.enabled || !config.autoNewCar) {
        return; // Auto new car notifications turned off
      }

      const year = carData.year || new Date().getFullYear();
      const make = carData.make || '';
      const model = carData.model || '';
      const variant = carData.variant || '';
      const priceFormatted = carData.price ? Number(carData.price).toLocaleString('en-IN') : 'Call for price';
      const location = carData.location || carData.hub || 'Mumbai';

      // Replace template tokens
      const replaceTokens = (tpl) =>
        tpl
          .replace(/{year}/gi, String(year))
          .replace(/{make}/gi, String(make))
          .replace(/{model}/gi, String(model))
          .replace(/{variant}/gi, String(variant))
          .replace(/{price}/gi, priceFormatted)
          .replace(/{location}/gi, String(location))
          .trim();

      const title = replaceTokens(config.newCarTitle);
      const message = replaceTokens(config.newCarMessage);
      const carUrl = `https://selectt.in/cars/${carId}`;
      const imageUrl = carData.image || null;

      console.log(`[OneSignal] Auto-sending new car push notification for Car #${carId}: "${title}"`);

      return await this.sendPushNotification({
        title,
        message,
        url: carUrl,
        imageUrl,
        type: 'new_car',
        carId,
      });
    } catch (err) {
      console.warn('[OneSignal] Auto new car push failed:', err.message);
    }
  }

  // Trigger Automatic Price Drop Push Notification
  async triggerPriceDrop(carId, oldCar, newCar, dropAmount) {
    try {
      const config = await this.getConfig();
      if (!config.enabled || !config.autoPriceDrop) {
        return; // Auto price drop notifications turned off
      }

      if (dropAmount < config.priceDropMin) {
        console.log(`[OneSignal] Price drop of ₹${dropAmount} below threshold of ₹${config.priceDropMin}. Skipping push.`);
        return;
      }

      const year = newCar.year || oldCar.year || '';
      const make = newCar.make || oldCar.make || '';
      const model = newCar.model || oldCar.model || '';
      const variant = newCar.variant || oldCar.variant || '';
      const oldPriceFormatted = oldCar.price ? Number(oldCar.price).toLocaleString('en-IN') : '';
      const newPriceFormatted = newCar.price ? Number(newCar.price).toLocaleString('en-IN') : '';
      const dropFormatted = Number(dropAmount).toLocaleString('en-IN');

      const replaceTokens = (tpl) =>
        tpl
          .replace(/{year}/gi, String(year))
          .replace(/{make}/gi, String(make))
          .replace(/{model}/gi, String(model))
          .replace(/{variant}/gi, String(variant))
          .replace(/{old_price}/gi, oldPriceFormatted)
          .replace(/{new_price}/gi, newPriceFormatted)
          .replace(/{drop_amount}/gi, dropFormatted)
          .trim();

      const title = replaceTokens(config.priceDropTitle);
      const message = replaceTokens(config.priceDropMessage);
      const carUrl = `https://selectt.in/cars/${carId}`;
      const imageUrl = newCar.image || oldCar.image || null;

      console.log(`[OneSignal] Auto-sending price drop push notification for Car #${carId}: "₹${dropFormatted} DROP" - "${title}"`);

      return await this.sendPushNotification({
        title,
        message,
        url: carUrl,
        imageUrl,
        type: 'price_drop',
        carId,
      });
    } catch (err) {
      console.warn('[OneSignal] Auto price drop push failed:', err.message);
    }
  }

  // Convenience aliases for flexible call styles
  notifyNewCar(car) {
    if (!car) return;
    return this.triggerNewCar(car.id, car);
  }

  notifyPriceDrop(car, oldPrice, newPrice) {
    if (!car) return;
    const drop = (Number(oldPrice) || 0) - (Number(newPrice) || 0);
    return this.triggerPriceDrop(car.id, { price: oldPrice, ...car }, { price: newPrice, ...car }, drop);
  }

  // Fetch past push notifications history
  getHistory({ limit = 50, offset = 0, type = null }) {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);

      let sql = 'SELECT * FROM push_notifications';
      const params = [];

      if (type) {
        sql += ' WHERE type = ?';
        params.push(type);
      }

      sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));

      this.db.query(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  // Delete a history entry
  deleteHistoryItem(id) {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve(false);
      this.db.query('DELETE FROM push_notifications WHERE id = ?', [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = OneSignalService;
