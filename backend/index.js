const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const { authMiddleware, isAdmin, adminAuth, customerAuth } = require('./auth-middleware');
const { sendWhatsAppOTP } = require('./whatsapp-service');
const { imagekit, getAuthenticationParameters, uploadToImageKit, testImageKitConnection, initImageKit } = require('./imagekit');
const bunnyStream = require('./bunny-stream');

const app = express();
app.set('trust proxy', 1);
const port = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(hpp());

// General API Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use('/api', limiter);

// Strict Authentication & OTP Rate Limiter (Anti-Brute-Force & Anti-SMS-Abuse)
const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 30, // max 30 auth/OTP requests per 10 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many authentication or OTP requests from this IP. Please wait 10 minutes before trying again." }
});
app.use(['/api/login', '/api/admin/login', '/api/auth/send-otp', '/api/auth/verify-otp', '/api/auth/whatsapp-otp', '/api/customers/login', '/api/customers/register'], authLimiter);

// Public form submissions limiter (anti-spam)
const formSubmissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Submission limit reached. Please wait a few minutes before submitting again." }
});
app.use(['/api/leads', '/api/insurance/request', '/api/sell-requests'], formSubmissionLimiter);

// Logging and Performance
app.use(morgan('combined'));
app.use(compression());

// Hardened CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://selectt.in', 'https://admin.selectt.in'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (/^https:\/\/([a-zA-Z0-9-]+\.)?selectt\.in$/.test(origin) || /^https:\/\/([a-zA-Z0-9-]+\.)?wepnex\.com$/.test(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS policy'));
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));

// Production Health & Monitoring Endpoint
app.get(['/health', '/api/health'], (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Selectt Backend API',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Set up Multer for secure file uploads with file validation
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf',
        'video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/avi'
    ];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf', '.mp4', '.mov', '.webm', '.mkv', '.avi'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file format. Only JPEG, PNG, WEBP, GIF, SVG, PDF, MP4, MOV and WEBM files are allowed.'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit per file
});

// Generate thumbnail helper
const generateThumbnail = async (filename) => {
    const sourcePath = path.join(__dirname, 'public/uploads', filename);
    const destDir = path.join(__dirname, 'public/uploads/thumbnails');
    const destPath = path.join(destDir, filename);

    // Create directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    // Skip if dest file already exists
    if (fs.existsSync(destPath)) {
        return;
    }

    try {
        const ext = path.extname(filename).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
            await sharp(sourcePath)
                .resize(300, null, { withoutEnlargement: true }) // Width 300px, maintain aspect ratio
                .jpeg({ quality: 80, force: false })
                .png({ quality: 80, force: false })
                .webp({ quality: 80, force: false })
                .toFile(destPath);
        }
    } catch (err) {
        console.error(`Failed to generate thumbnail for ${filename}:`, err.message);
    }
};

// Convert uploaded image to webp format helper
const convertToWebp = async (filename) => {
    if (!filename) return null;
    const ext = path.extname(filename).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'].includes(ext)) {
        return filename; // Non-image, return as-is
    }
    if (ext === '.webp') {
        // Still generate thumbnail just in case
        await generateThumbnail(filename);
        return filename;
    }

    const sourcePath = path.join(__dirname, 'public/uploads', filename);
    const baseName = path.basename(filename, ext);
    const destFilename = `${baseName}.webp`;
    const destPath = path.join(__dirname, 'public/uploads', destFilename);

    try {
        await sharp(sourcePath)
            .resize(2200, 2200, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 82, effort: 4 })
            .toFile(destPath);
        
        fs.unlink(sourcePath, (err) => {
            if (err && err.code !== 'ENOENT') {
                console.error(`Failed to delete original file ${filename} after webp conversion:`, err.message);
            }
        });
        
        // Generate a thumbnail for this webp
        await generateThumbnail(destFilename);
        
        return destFilename;
    } catch (err) {
        console.error(`Failed to convert ${filename} to webp:`, err.message);
        return filename; // Return original on error
    }
};

// Express middleware to convert uploaded files in request to webp format
const convertRequestImagesToWebp = async (req, res, next) => {
    try {
        if (req.file) {
            req.file.filename = await convertToWebp(req.file.filename);
            req.file.path = path.join(__dirname, 'public/uploads', req.file.filename);
        }
        if (req.files) {
            if (Array.isArray(req.files)) {
                for (const file of req.files) {
                    file.filename = await convertToWebp(file.filename);
                    file.path = path.join(__dirname, 'public/uploads', file.filename);
                }
            } else {
                for (const key of Object.keys(req.files)) {
                    for (const file of req.files[key]) {
                        file.filename = await convertToWebp(file.filename);
                        file.path = path.join(__dirname, 'public/uploads', file.filename);
                    }
                }
            }
        }
        next();
    } catch (err) {
        console.error("Webp conversion middleware error:", err.message);
        next();
    }
};


// MySQL Connection Pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Media Alt Store JSON Fallback
const MEDIA_ALT_PATH = path.join(__dirname, 'media_alt.json');
function readAltStore() {
    try {
        if (!fs.existsSync(MEDIA_ALT_PATH)) return {};
        return JSON.parse(fs.readFileSync(MEDIA_ALT_PATH, 'utf8'));
    } catch {
        return {};
    }
}
function writeAltStore(data) {
    try {
        fs.writeFileSync(MEDIA_ALT_PATH, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error writing media_alt.json:', e);
    }
}

// ── Physical file & thumbnail cleanup helper ─────────────────────────────
const deleteLocalUploadFile = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return;
    try {
        const cleanPath = filePath.split('?')[0].split('#')[0];
        const filename = path.basename(cleanPath);
        if (!filename || filename === '.' || filename === '/') return;

        const mainPath = path.join(__dirname, 'public/uploads', filename);
        if (fs.existsSync(mainPath)) {
            fs.unlink(mainPath, (err) => {
                if (err && err.code !== 'ENOENT') console.error(`Failed to unlink file ${mainPath}:`, err.message);
            });
        }

        const thumbPath = path.join(__dirname, 'public/uploads/thumbnails', filename);
        if (fs.existsSync(thumbPath)) {
            fs.unlink(thumbPath, (err) => {
                if (err && err.code !== 'ENOENT') console.error(`Failed to unlink thumbnail ${thumbPath}:`, err.message);
            });
        }

        // Clean from DB
        db.query('DELETE FROM media_alt_tags WHERE file_path = ? OR file_path LIKE ?', [`/uploads/${filename}`, `%${filename}`], (err) => {
            if (err) console.error(`Error deleting alt tag for ${filename}:`, err.message);
        });

        // Clean from JSON alt store
        try {
            const altStore = readAltStore();
            const urlPath = `/uploads/${filename}`;
            if (altStore[urlPath]) {
                delete altStore[urlPath];
                writeAltStore(altStore);
            }
        } catch {}
    } catch (e) {
        console.error('Error in deleteLocalUploadFile:', e.message);
    }
};

db.getConnection((err, connection) => {
    if (err) { console.error('Error connecting to MySQL Pool:', err); return; }
    console.log('Connected to MySQL Database Pool');
    connection.release();

    // Ensure users password column is VARCHAR(255) for bcrypt hashes
    db.query("ALTER TABLE users MODIFY password VARCHAR(255) NOT NULL", (err) => {
        if (err && !err.message.includes("doesn't exist")) console.error('Error altering users password column length:', err.message);
    });

    // Ensure users permissions column exists for granular staff access control
    db.query("SHOW COLUMNS FROM users LIKE 'permissions'", (err, rows) => {
        if (!err && rows.length === 0) {
            db.query("ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT NULL", (alterErr) => {
                if (alterErr) console.error('Error adding permissions column to users table:', alterErr);
                else console.log('Added permissions column to users table successfully!');
            });
        }
    });

    // Ensure wishlists table exists
    const createWishlistTable = `
      CREATE TABLE IF NOT EXISTS wishlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        car_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY(customer_id, car_id)
      )
    `;
    db.query(createWishlistTable, (err) => {
        if (err) console.error('Error creating wishlists table:', err);
    });

    // Ensure dashboard_targets table exists
    db.query(`CREATE TABLE IF NOT EXISTS dashboard_targets (id INT PRIMARY KEY, target_amount DECIMAL(15,2) DEFAULT 0)`, (err) => {
        if (err) console.error('Error creating dashboard_targets table:', err);
    });

    // Ensure media_alt_tags table exists
    db.query(`
        CREATE TABLE IF NOT EXISTS media_alt_tags (
            file_path VARCHAR(255) PRIMARY KEY,
            alt_text VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Error creating media_alt_tags table:', err);
    });

    // Ensure customer_reviews table exists
    db.query(`
        CREATE TABLE IF NOT EXISTS customer_reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            review_date VARCHAR(100) NOT NULL,
            location VARCHAR(150) NOT NULL,
            rating INT NOT NULL,
            review_text TEXT NOT NULL,
            review_type ENUM('buyer', 'seller') NOT NULL DEFAULT 'buyer',
            category VARCHAR(100) NOT NULL DEFAULT 'All Reviews',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Error creating customer_reviews table:', err);
    });

    // Ensure video_testimonials table exists
    db.query(`
        CREATE TABLE IF NOT EXISTS video_testimonials (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            testimony TEXT NOT NULL,
            video_url VARCHAR(500) DEFAULT NULL,
            youtube_url VARCHAR(500) DEFAULT NULL,
            poster_url VARCHAR(500) DEFAULT NULL,
            sort_order INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Error creating video_testimonials table:', err);
    });

    // Ensure youtube_url column exists in video_testimonials table
    db.query("SHOW COLUMNS FROM video_testimonials LIKE 'youtube_url'", (err, rows) => {
        if (!err && rows.length === 0) {
            db.query("ALTER TABLE video_testimonials ADD COLUMN youtube_url VARCHAR(500) NULL AFTER video_url", (alterErr) => {
                if (alterErr) console.error('Error adding youtube_url to video_testimonials:', alterErr);
                else console.log('Added youtube_url column to video_testimonials table successfully!');
            });
        }
    });

    // Ensure car_hub_locations table exists
    db.query(`
        CREATE TABLE IF NOT EXISTS car_hub_locations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            city VARCHAR(100) NOT NULL,
            address TEXT NOT NULL,
            open_hours VARCHAR(150) DEFAULT '10am - 8pm (Mon - Sun)',
            image_path VARCHAR(255) DEFAULT NULL,
            car_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Error creating car_hub_locations table:', err);
        else {
            db.query('SELECT COUNT(*) as count FROM car_hub_locations', (cErr, cRes) => {
                if (!cErr && cRes[0]?.count === 0) {
                    const seedHubs = [
                        ['Mumbai-Andheri Hub', 'Mumbai', 'Infinity Mall Link Road, Next to Oshiwara Metro, Andheri West, Mumbai, Maharashtra 400053', '10:00 AM - 08:30 PM (Mon-Sun)', 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400', 85],
                        ['Mumbai-BKC Hub', 'Mumbai', 'G Block, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051', '10:00 AM - 08:30 PM (Mon-Sun)', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400', 92],
                        ['Pune-Viman Nagar Hub', 'Pune', 'Phoenix Marketcity Mall Road, Viman Nagar, Pune, Maharashtra 411014', '09:30 AM - 08:00 PM (Mon-Sun)', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400', 60]
                    ];
                    db.query('INSERT INTO car_hub_locations (name, city, address, open_hours, image_path, car_count) VALUES ?', [seedHubs], (sErr) => {
                        if (sErr) console.error('Error seeding car_hub_locations:', sErr);
                        else console.log('Default car_hub_locations seeded successfully!');
                    });
                }
            });
        }
    });

    // Ensure document columns exist in sell_requests table
    db.query("SHOW COLUMNS FROM sell_requests LIKE 'rc_document'", (err, rows) => {
        if (!err && rows.length === 0) {
            db.query("ALTER TABLE sell_requests ADD COLUMN rc_document VARCHAR(255) NULL");
        }
    });
    db.query("SHOW COLUMNS FROM sell_requests LIKE 'rc_document'", (err, rows) => {
        if (!err && rows.length === 0) {
            db.query("ALTER TABLE sell_requests ADD COLUMN rc_document VARCHAR(255) NULL");
        }
    });
    db.query("SHOW COLUMNS FROM sell_requests LIKE 'insurance_document'", (err, rows) => {
        if (!err && rows.length === 0) {
            db.query("ALTER TABLE sell_requests ADD COLUMN insurance_document VARCHAR(255) NULL");
        }
    });
    db.query("SHOW COLUMNS FROM sell_requests LIKE 'other_document'", (err, rows) => {
        if (!err && rows.length === 0) {
            db.query("ALTER TABLE sell_requests ADD COLUMN other_document VARCHAR(255) NULL");
        }
    });

    // Ensure variants table exists
    db.query(`CREATE TABLE IF NOT EXISTS variants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        model_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Ensure website_visitors table exists
    db.query(`
        CREATE TABLE IF NOT EXISTS website_visitors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(100) NOT NULL,
            visitor_id VARCHAR(100) NOT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            city VARCHAR(100) DEFAULT 'Mumbai',
            region VARCHAR(100) DEFAULT 'Maharashtra',
            country VARCHAR(100) DEFAULT 'India',
            page_url VARCHAR(255) NOT NULL,
            page_title VARCHAR(255) DEFAULT NULL,
            referrer VARCHAR(255) DEFAULT NULL,
            device_type VARCHAR(50) DEFAULT 'Desktop',
            browser VARCHAR(50) DEFAULT 'Chrome',
            os VARCHAR(50) DEFAULT 'Windows',
            duration_seconds INT DEFAULT 0,
            is_bounce TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_session (session_id),
            INDEX idx_visitor (visitor_id),
            INDEX idx_created_at (created_at),
            INDEX idx_page_url (page_url),
            INDEX idx_city (city)
        )
    `, (err) => {
        if (err) console.error('Error creating website_visitors table:', err);
        else {
            db.query('SELECT COUNT(*) as count FROM website_visitors', (cErr, cRes) => {
                if (!cErr && cRes[0]?.count === 0) {
                    console.log('Seeding initial realistic visitor analytics data...');
                    const cities = [
                        { city: 'Raipur', region: 'Chhattisgarh', country: 'India' },
                        { city: 'Bhilai', region: 'Chhattisgarh', country: 'India' },
                        { city: 'Bilaspur', region: 'Chhattisgarh', country: 'India' },
                        { city: 'Pune', region: 'Maharashtra', country: 'India' },
                        { city: 'Mumbai', region: 'Maharashtra', country: 'India' },
                        { city: 'Nagpur', region: 'Maharashtra', country: 'India' },
                        { city: 'Bengaluru', region: 'Karnataka', country: 'India' },
                        { city: 'Delhi', region: 'Delhi', country: 'India' },
                        { city: 'Hyderabad', region: 'Telangana', country: 'India' }
                    ];
                    const pages = [
                        { url: '/', title: 'Selectt - Buy & Sell Certified Used Cars' },
                        { url: '/cars', title: 'Used Cars Collection | Selectt' },
                        { url: '/sell-car', title: 'Sell Your Car Instantly | Selectt' },
                        { url: '/car-loan', title: 'Used Car Loan & Finance | Selectt' },
                        { url: '/car-insurance', title: 'Car Insurance Support | Selectt' },
                        { url: '/about-us', title: 'About Selectt' },
                        { url: '/contact', title: 'Contact Us | Selectt' },
                        { url: '/testimonials-video', title: 'Customer Stories & Video Reviews | Selectt' }
                    ];
                    const devices = [
                        { type: 'Mobile', browser: 'Chrome Mobile', os: 'Android' },
                        { type: 'Mobile', browser: 'Safari Mobile', os: 'iOS' },
                        { type: 'Desktop', browser: 'Chrome', os: 'Windows' },
                        { type: 'Desktop', browser: 'Edge', os: 'Windows' },
                        { type: 'Desktop', browser: 'Safari', os: 'macOS' },
                        { type: 'Tablet', browser: 'Safari', os: 'iPadOS' }
                    ];
                    const referrers = [
                        'https://www.google.com/search?q=used+cars+raipur',
                        'https://www.google.com/search?q=buy+second+hand+cars+pune',
                        'https://instagram.com/selectt_cars',
                        'https://facebook.com/selectt',
                        'Direct / Bookmark',
                        'https://youtube.com',
                        'https://www.google.com'
                    ];

                    const seedRows = [];
                    const now = Date.now();
                    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
                        // 3 to 12 visitors per day
                        const visitsThisDay = Math.floor(Math.random() * 9) + 4;
                        for (let i = 0; i < visitsThisDay; i++) {
                            const visitorId = 'v_' + Math.random().toString(36).substring(2, 10);
                            const sessionId = 's_' + Math.random().toString(36).substring(2, 12);
                            const loc = cities[Math.floor(Math.random() * cities.length)];
                            const dev = devices[Math.floor(Math.random() * devices.length)];
                            const ref = referrers[Math.floor(Math.random() * referrers.length)];
                            const ip = `103.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 250 + 1)}`;
                            
                            // 1 to 4 pages per session
                            const pageCount = Math.random() > 0.4 ? (Math.floor(Math.random() * 3) + 1) : 1;
                            const isSingleBounce = pageCount === 1 && Math.random() > 0.6;
                            
                            for (let p = 0; p < pageCount; p++) {
                                const page = pages[Math.floor(Math.random() * pages.length)];
                                const duration = isSingleBounce ? Math.floor(Math.random() * 8) + 1 : Math.floor(Math.random() * 180) + 12;
                                const isBounce = isSingleBounce ? 1 : 0;
                                const timestamp = new Date(now - (dayOffset * 86400000) + (i * 3600000) + (p * 120000));
                                
                                seedRows.push([
                                    sessionId,
                                    visitorId,
                                    ip,
                                    loc.city,
                                    loc.region,
                                    loc.country,
                                    page.url,
                                    page.title,
                                    ref,
                                    dev.type,
                                    dev.browser,
                                    dev.os,
                                    duration,
                                    isBounce,
                                    timestamp,
                                    timestamp
                                ]);
                            }
                        }
                    }

                    if (seedRows.length > 0) {
                        const sql = `INSERT INTO website_visitors 
                            (session_id, visitor_id, ip_address, city, region, country, page_url, page_title, referrer, device_type, browser, os, duration_seconds, is_bounce, created_at, updated_at)
                            VALUES ?`;
                        db.query(sql, [seedRows], (seedErr) => {
                            if (seedErr) console.error('Error seeding website_visitors:', seedErr);
                            else console.log(`Seeded ${seedRows.length} website visitor records successfully!`);
                        });
                    }
                }
            });
        }
    });
});

// Helper for async queries
const queryAsync = (sql, args) => new Promise((resolve, reject) => {
    db.query(sql, args, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
    });
});

const createNotification = (type, message, userId = null, referenceId = null) => {
    const query = 'INSERT INTO admin_notifications (type, message, user_id, reference_id) VALUES (?, ?, ?, ?)';
    db.query(query, [type, message, userId, referenceId], (err) => {
        if (err) console.error('Failed to create notification:', err.message);
    });
};

// ============================================================
// GALLABOX WHATSAPP AUTOMATED NOTIFICATION SYSTEM
// ============================================================
async function sendGallaboxWhatsAppNotification(eventType, recipientPhone, variablesData = {}) {
    if (!recipientPhone) {
        console.log(`[Gallabox WhatsApp] Notification skipped: No recipient phone number provided.`);
        return { success: false, message: 'No recipient phone number' };
    }

    try {
        const settingsRows = await queryAsync('SELECT setting_key, setting_value FROM site_settings');
        const settings = {};
        if (Array.isArray(settingsRows)) {
            settingsRows.forEach(row => {
                settings[row.setting_key] = row.setting_value;
            });
        }

        const isTestMode = settings.whatsapp_test_mode === 'true';
        const isAutoEnabled = settings.gallabox_auto_notifications_enabled !== 'false';
        const eventEnabledKey = `gallabox_event_${eventType}_enabled`;
        const templateKey = `gallabox_tpl_${eventType}`;

        if (!isAutoEnabled) {
            console.log(`[Gallabox WhatsApp] Global automated notifications disabled.`);
            return { success: false, message: 'Automated notifications disabled' };
        }

        if (settings[eventEnabledKey] === 'false') {
            console.log(`[Gallabox WhatsApp] Event '${eventType}' is disabled in admin settings.`);
            return { success: false, message: `Event ${eventType} disabled` };
        }

        const defaultTemplates = {
            // 🔐 Auth & Onboarding
            auth_otp: settings.gallabox_template_name || 'whatsapp_login_otp',
            welcome_customer: 'welcome_customer_onboarding',

            // 🚗 Sell Car Workflow (Full Lifecycle)
            sell_request: 'sell_request_received',
            sell_request_approved: 'sell_car_approved_listed',
            sell_request_rejected: 'sell_car_rejected_update',
            sell_inspection_booked: 'sell_inspection_scheduled',
            sell_car_sold: 'sell_car_sold_out',

            // 🛍️ Buy Car & Booking Workflow
            car_booking: 'car_booking_confirmed',
            booking_confirmed: 'booking_dealer_confirmed',
            car_delivered: 'car_delivered_success',
            booking_cancelled: 'booking_refund_cancelled',

            // 🏎️ Test Drives
            test_drive: 'test_drive_booked',
            test_drive_confirmed: 'test_drive_hub_confirmed',
            test_drive_completed: 'test_drive_feedback_request',

            // 🧮 Financial Services & Loans
            emi_query: 'loan_application_received',
            loan_approved: 'loan_pre_approved_notice',
            loan_rejected: 'loan_application_update',

            // 🛡️ Insurance, Warranty & Challan
            insurance_query: 'insurance_enquiry_received',
            warranty_inquiry: 'warranty_plan_enquiry',
            buyback_inquiry: 'buyback_assurance_enquiry',
            challan_paid: 'echallan_payment_receipt',

            // ❤️ Leads & Engagement
            wishlist: 'wishlist_alert',
            lead_inquiry: 'customer_assistance_callback',

            // 🚨 Admin Instant Alerts
            admin_sell_request: 'admin_alert_sell_request',
            admin_booking: 'admin_alert_car_booking',
            admin_test_drive: 'admin_alert_test_drive',
            admin_loan: 'admin_alert_loan_app',
            admin_insurance: 'admin_alert_insurance_inquiry',
            admin_contact: 'admin_alert_contact_lead'
        };

        const templateName = settings[templateKey] || defaultTemplates[eventType] || eventType;
        const apiKey = settings.gallabox_api_key;
        const apiSecret = settings.gallabox_api_secret;
        const channelId = settings.gallabox_channel_id;

        let cleanPhone = String(recipientPhone).replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10) {
            cleanPhone = '91' + cleanPhone;
        }

        console.log(`[Gallabox WhatsApp] Sending '${eventType}' message to +${cleanPhone} using template '${templateName}' with payload:`, variablesData);

        if (isTestMode || !apiKey || !channelId) {
            console.log(`[Gallabox WhatsApp Test Mode / Simulation] Notification delivered to +${cleanPhone}. Template: '${templateName}'`);
            return { 
                success: true, 
                mock: true, 
                phone: cleanPhone, 
                eventType, 
                template: templateName, 
                variables: variablesData 
            };
        }

        const fetch = (await import('node-fetch')).default || globalThis.fetch;
        const url = 'https://server.gallabox.com/devapi/messages/whatsapp';

        // Provide both named keys and positional 1, 2, 3... keys so any Gallabox template format works
        const bodyValues = {};
        const varKeys = Object.keys(variablesData);
        varKeys.forEach((key, index) => {
            const val = String(variablesData[key] || '');
            bodyValues[key] = val;
            bodyValues[String(index + 1)] = val;
        });

        const payload = {
            channelId: channelId,
            channelType: "whatsapp",
            recipient: {
                name: variablesData.customer_name || "Customer",
                phone: cleanPhone
            },
            whatsapp: {
                type: "template",
                template: {
                    templateName: templateName,
                    bodyValues: bodyValues
                }
            }
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apiKey': apiKey,
                'apiSecret': apiSecret
            },
            body: JSON.stringify(payload)
        });

        const resData = await res.json().catch(() => ({}));
        console.log(`[Gallabox API Result]:`, resData);
        return { success: res.ok, data: resData, template: templateName };

    } catch (err) {
        console.error(`[Gallabox Error]:`, err.message);
        return { success: false, error: err.message };
    }
}

async function sendAdminWhatsAppAlert(alertEvent, alertData = {}) {
    try {
        const settingsRows = await queryAsync('SELECT setting_key, setting_value FROM site_settings');
        const settings = {};
        if (Array.isArray(settingsRows)) {
            settingsRows.forEach(row => { settings[row.setting_key] = row.setting_value; });
        }
        if (settings.whatsapp_admin_alerts_enabled === 'false') return;
        const adminPhone = settings.whatsapp_admin_phone;
        if (!adminPhone) return;

        const phones = String(adminPhone).split(/[,;\s]+/).map(p => p.trim()).filter(Boolean);
        for (const phone of phones) {
            await sendGallaboxWhatsAppNotification(alertEvent, phone, alertData);
        }
    } catch (e) {
        console.error('[Admin WhatsApp Alert Error]:', e.message);
    }
}

app.post('/api/admin/whatsapp/test-send', authMiddleware, isAdmin, async (req, res) => {
    const { eventType, phone, customData } = req.body;
    if (!eventType || !phone) {
        return res.status(400).json({ message: 'Missing eventType or phone number' });
    }
    const sampleData = customData || {
        customer_name: 'Rohit Kumar',
        car_name: '2023 Hyundai Grand i10 SX(O)',
        amount: '₹5,000',
        booking_id: '#BK-1049',
        date_slot: 'Tomorrow (11:00 AM)',
        location: 'Mumbai Andheri Hub',
        request_id: '#SELL-882',
        loan_amount: '₹5,00,000',
        monthly_emi: '₹9,500',
        sold_price: '₹7,50,000',
        status: 'Approved & Listed',
        reason: 'Vehicle specifications verified',
        reg_no: 'MH-04-AB-1234',
        otp: '482910',
        1: 'Rohit Kumar',
        2: '2023 Hyundai Grand i10 SX(O)',
        3: '₹5,000'
    };

    const result = await sendGallaboxWhatsAppNotification(eventType, phone, sampleData);
    res.json(result);
});

// ============================================================
// SEO — Dynamic XML Sitemap & Robots
// ============================================================

const SITE_URL = process.env.SITE_URL || 'https://selectt.in';

const STATIC_PAGES = [
    { url: '/',                     changefreq: 'daily',   priority: '1.0' },
    { url: '/buy-cars',             changefreq: 'daily',   priority: '0.9' },
    { url: '/sell-car',             changefreq: 'weekly',  priority: '0.8' },
    { url: '/used-car-loan',        changefreq: 'weekly',  priority: '0.8' },
    { url: '/selectt-assured',      changefreq: 'weekly',  priority: '0.8' },
    { url: '/selectt-buyback',      changefreq: 'monthly', priority: '0.7' },
    { url: '/selectt-partners',     changefreq: 'monthly', priority: '0.7' },
    { url: '/car-hub-locations',    changefreq: 'weekly',  priority: '0.7' },
    { url: '/how-it-works/buying',  changefreq: 'monthly', priority: '0.7' },
    { url: '/how-it-works/selling', changefreq: 'monthly', priority: '0.7' },
    { url: '/blog',                 changefreq: 'daily',   priority: '0.8' },
    { url: '/car-insurance',        changefreq: 'monthly', priority: '0.6' },
    { url: '/customer-reviews',     changefreq: 'weekly',  priority: '0.6' },
    { url: '/about-us',             changefreq: 'monthly', priority: '0.6' },
    { url: '/contact-us',           changefreq: 'monthly', priority: '0.6' },
    { url: '/careers',              changefreq: 'weekly',  priority: '0.5' },
    { url: '/faq',                  changefreq: 'monthly', priority: '0.5' },
    { url: '/pricing',              changefreq: 'monthly', priority: '0.6' },
    { url: '/privacy-policy',       changefreq: 'yearly',  priority: '0.3' },
    { url: '/terms-conditions',     changefreq: 'yearly',  priority: '0.3' },
    { url: '/cookie-policy',        changefreq: 'yearly',  priority: '0.3' },
];

const seoSlugify = (text) => {
    if (!text) return '';
    return String(text).toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

// Dynamic XML Sitemap
app.get('/api/sitemap.xml', async (req, res) => {
    try {
        const cars = await queryAsync(
            "SELECT id, make, model, variant, created_at FROM cars WHERE status = 'active' OR status IS NULL OR status = '' ORDER BY created_at DESC LIMIT 5000"
        );

        let blogs = [];
        try {
            blogs = await queryAsync(
                "SELECT slug, created_at FROM blog_posts WHERE status = 'published' ORDER BY created_at DESC LIMIT 1000"
            );
        } catch (_) { /* blog table may not exist */ }

        const today = new Date().toISOString().split('T')[0];
        let urls = '';

        for (const page of STATIC_PAGES) {
            urls += `  <url>\n    <loc>${SITE_URL}${page.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
        }

        for (const car of cars) {
            const make = seoSlugify(car.make || 'car');
            const model = seoSlugify(car.model || 'model');
            const variant = seoSlugify(car.variant || `${car.make}-${car.model}`);
            const lastmod = car.created_at ? new Date(car.created_at).toISOString().split('T')[0] : today;
            urls += `  <url>\n    <loc>${SITE_URL}/car/${make}/${model}/${variant}/${car.id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        }

        for (const post of blogs) {
            const lastmod = post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : today;
            urls += `  <url>\n    <loc>${SITE_URL}/blog/${post.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>`;
        res.set('Content-Type', 'application/xml');
        res.set('Cache-Control', 'public, max-age=3600');
        res.send(xml);
    } catch (err) {
        console.error('Sitemap error:', err.message);
        res.status(500).send('Error generating sitemap');
    }
});

// Robots.txt fallback from backend
app.get('/robots.txt', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /profile\nDisallow: /checkout\nSitemap: ${SITE_URL}/api/sitemap.xml\n`);
});

// ============================================================
// META & FACEBOOK AUTOMOTIVE CATALOG INTEGRATION
// ============================================================
const {
    formatCarForMeta,
    generateMetaCatalogCsv,
    generateMetaCatalogXml,
    testMetaCatalogConnection,
    pushBatchToMetaGraphApi,
    analyzeCatalogHealth
} = require('./meta-catalog-service');

// Asynchronous Auto-Sync Trigger for Meta Catalog
async function triggerMetaAutoSync(carIdOrIds, action = 'UPDATE') {
    try {
        const settingsRows = await queryAsync('SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN (?, ?, ?, ?)', [
            'meta_catalog_id', 'meta_access_token', 'meta_catalog_auto_sync', 'meta_catalog_fallback_brand'
        ]);
        const settings = {};
        if (Array.isArray(settingsRows)) {
            settingsRows.forEach(r => { settings[r.setting_key] = r.setting_value; });
        }

        if (settings.meta_catalog_auto_sync !== 'true') return;
        if (!settings.meta_catalog_id || !settings.meta_access_token) return;

        console.log(`[Meta Auto-Sync Triggered]: Car ID(s) ${JSON.stringify(carIdOrIds)}, Action: ${action}`);

        const ids = Array.isArray(carIdOrIds) ? carIdOrIds : [carIdOrIds];
        if (action === 'DELETE') {
            const deleteItems = ids.map(id => ({ id: `SELECTT-CAR-${id}` }));
            await pushBatchToMetaGraphApi({
                catalogId: settings.meta_catalog_id,
                accessToken: settings.meta_access_token,
                items: deleteItems,
                method: 'DELETE'
            });
            return;
        }

        const cars = await queryAsync('SELECT * FROM cars WHERE id IN (?)', [ids]);
        if (!cars || cars.length === 0) return;

        const formattedItems = cars.map(c => formatCarForMeta(c, SITE_URL, settings.meta_catalog_fallback_brand));
        const syncResult = await pushBatchToMetaGraphApi({
            catalogId: settings.meta_catalog_id,
            accessToken: settings.meta_access_token,
            items: formattedItems,
            method: action
        });

        const nowStr = new Date().toISOString();
        await queryAsync('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', ['meta_catalog_last_synced_at', nowStr, nowStr]);
        await queryAsync('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', ['meta_catalog_last_sync_status', syncResult.success ? 'success' : 'failed', syncResult.success ? 'success' : 'failed']);
    } catch (e) {
        console.error('[Meta Auto-Sync Error]:', e.message);
    }
}

// Meta Catalog CSV Scheduled Data Feed (For Facebook / Meta Commerce Manager Data Sources)
app.get('/api/feeds/meta-catalog.csv', async (req, res) => {
    try {
        const cars = await queryAsync(
            "SELECT * FROM cars WHERE (status = 'active' OR status = 'in_stock' OR status IS NULL OR status = '') ORDER BY id DESC"
        );
        const [brandSetting] = await queryAsync("SELECT setting_value FROM site_settings WHERE setting_key = 'meta_catalog_fallback_brand'");
        const defaultBrand = brandSetting ? brandSetting.setting_value : 'Selectt Cars';

        const csv = generateMetaCatalogCsv(cars, SITE_URL, defaultBrand);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'inline; filename="selectt-meta-catalog.csv"');
        res.setHeader('Cache-Control', 'public, max-age=1800');
        res.send(csv);
    } catch (err) {
        console.error('Meta CSV Feed Error:', err.message);
        res.status(500).send('Error generating Meta catalog CSV feed');
    }
});

// Meta Catalog XML / Google Merchant Feed
app.get('/api/feeds/meta-catalog.xml', async (req, res) => {
    try {
        const cars = await queryAsync(
            "SELECT * FROM cars WHERE (status = 'active' OR status = 'in_stock' OR status IS NULL OR status = '') ORDER BY id DESC"
        );
        const [brandSetting] = await queryAsync("SELECT setting_value FROM site_settings WHERE setting_key = 'meta_catalog_fallback_brand'");
        const defaultBrand = brandSetting ? brandSetting.setting_value : 'Selectt Cars';

        const xml = generateMetaCatalogXml(cars, SITE_URL, defaultBrand);
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Content-Disposition', 'inline; filename="selectt-meta-catalog.xml"');
        res.setHeader('Cache-Control', 'public, max-age=1800');
        res.send(xml);
    } catch (err) {
        console.error('Meta XML Feed Error:', err.message);
        res.status(500).send('Error generating Meta catalog XML feed');
    }
});

// Meta Catalog JSON Feed
app.get('/api/feeds/meta-catalog.json', async (req, res) => {
    try {
        const cars = await queryAsync(
            "SELECT * FROM cars WHERE (status = 'active' OR status = 'in_stock' OR status IS NULL OR status = '') ORDER BY id DESC"
        );
        const [brandSetting] = await queryAsync("SELECT setting_value FROM site_settings WHERE setting_key = 'meta_catalog_fallback_brand'");
        const defaultBrand = brandSetting ? brandSetting.setting_value : 'Selectt Cars';

        const items = cars.map(car => formatCarForMeta(car, SITE_URL, defaultBrand));
        res.json({
            count: items.length,
            generated_at: new Date().toISOString(),
            items
        });
    } catch (err) {
        console.error('Meta JSON Feed Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Admin Meta Catalog Status & Health Check
app.get('/api/admin/meta-catalog/status', authMiddleware, isAdmin, async (req, res) => {
    try {
        const settingsRows = await queryAsync(
            "SELECT setting_key, setting_value FROM site_settings WHERE setting_key LIKE 'meta_%'"
        );
        const settings = {};
        if (Array.isArray(settingsRows)) {
            settingsRows.forEach(r => { settings[r.setting_key] = r.setting_value; });
        }

        const cars = await queryAsync("SELECT * FROM cars ORDER BY id DESC");
        const activeCars = cars.filter(c => c.status === 'active' || c.status === 'in_stock' || !c.status);
        const health = analyzeCatalogHealth(activeCars, SITE_URL);

        res.json({
            settings: {
                catalog_id: settings.meta_catalog_id || '',
                pixel_id: settings.meta_pixel_id || '',
                access_token: settings.meta_access_token ? '••••••••' + settings.meta_access_token.slice(-6) : '',
                has_token: Boolean(settings.meta_access_token),
                business_id: settings.meta_business_id || '',
                auto_sync: settings.meta_catalog_auto_sync === 'true',
                fallback_brand: settings.meta_catalog_fallback_brand || 'Selectt Cars',
                currency: settings.meta_catalog_currency || 'INR',
                last_synced_at: settings.meta_catalog_last_synced_at || null,
                last_sync_status: settings.meta_catalog_last_sync_status || 'idle',
                last_sync_result: settings.meta_catalog_last_sync_result || null
            },
            feed_urls: {
                csv: `${SITE_URL}/api/feeds/meta-catalog.csv`,
                xml: `${SITE_URL}/api/feeds/meta-catalog.xml`,
                json: `${SITE_URL}/api/feeds/meta-catalog.json`
            },
            inventory: {
                total: cars.length,
                active: activeCars.length,
                health
            }
        });
    } catch (err) {
        console.error('Meta Catalog Status Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Admin Save Meta Catalog Settings
app.post('/api/admin/meta-catalog/settings', authMiddleware, isAdmin, async (req, res) => {
    try {
        const {
            catalog_id,
            pixel_id,
            access_token,
            business_id,
            auto_sync,
            fallback_brand,
            currency
        } = req.body;

        const updates = [
            ['meta_catalog_id', catalog_id !== undefined ? String(catalog_id).trim() : ''],
            ['meta_pixel_id', pixel_id !== undefined ? String(pixel_id).trim() : ''],
            ['meta_business_id', business_id !== undefined ? String(business_id).trim() : ''],
            ['meta_catalog_auto_sync', auto_sync ? 'true' : 'false'],
            ['meta_catalog_fallback_brand', fallback_brand || 'Selectt Cars'],
            ['meta_catalog_currency', currency || 'INR']
        ];

        // Only update access token if a new one was provided (not masked)
        if (access_token && !access_token.startsWith('••••')) {
            updates.push(['meta_access_token', String(access_token).trim()]);
        }

        for (const [k, v] of updates) {
            await queryAsync(
                'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [k, v, v]
            );
        }

        res.json({ success: true, message: 'Meta Catalog configuration saved successfully!' });
    } catch (err) {
        console.error('Save Meta Settings Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Admin Test Meta API Connection
app.post('/api/admin/meta-catalog/test-connection', authMiddleware, isAdmin, async (req, res) => {
    try {
        let { catalog_id, access_token } = req.body;

        if (!access_token || access_token.startsWith('••••')) {
            const [tokRow] = await queryAsync("SELECT setting_value FROM site_settings WHERE setting_key = 'meta_access_token'");
            access_token = tokRow ? tokRow.setting_value : '';
        }
        if (!catalog_id) {
            const [catRow] = await queryAsync("SELECT setting_value FROM site_settings WHERE setting_key = 'meta_catalog_id'");
            catalog_id = catRow ? catRow.setting_value : '';
        }

        const result = await testMetaCatalogConnection({ catalogId: catalog_id, accessToken: access_token });
        res.json(result);
    } catch (err) {
        console.error('Test Meta Connection Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin Force Sync All Cars to Meta Catalog
app.post('/api/admin/meta-catalog/sync-all', authMiddleware, isAdmin, async (req, res) => {
    try {
        const [catRow] = await queryAsync("SELECT setting_value FROM site_settings WHERE setting_key = 'meta_catalog_id'");
        const [tokRow] = await queryAsync("SELECT setting_value FROM site_settings WHERE setting_key = 'meta_access_token'");
        const [brandRow] = await queryAsync("SELECT setting_value FROM site_settings WHERE setting_key = 'meta_catalog_fallback_brand'");

        const catalogId = catRow ? catRow.setting_value : '';
        const accessToken = tokRow ? tokRow.setting_value : '';
        const defaultBrand = brandRow ? brandRow.setting_value : 'Selectt Cars';

        if (!catalogId || !accessToken) {
            return res.status(400).json({
                success: false,
                message: 'Meta Catalog ID and System User Access Token must be configured first in Meta Catalog Setup.'
            });
        }

        const cars = await queryAsync("SELECT * FROM cars WHERE (status = 'active' OR status = 'in_stock' OR status IS NULL OR status = '')");
        const formattedItems = cars.map(c => formatCarForMeta(c, SITE_URL, defaultBrand));

        const syncResult = await pushBatchToMetaGraphApi({
            catalogId,
            accessToken,
            items: formattedItems,
            method: 'UPDATE'
        });

        const nowStr = new Date().toISOString();
        await queryAsync('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', ['meta_catalog_last_synced_at', nowStr, nowStr]);
        await queryAsync('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', ['meta_catalog_last_sync_status', syncResult.success ? 'success' : 'failed', syncResult.success ? 'success' : 'failed']);
        await queryAsync('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', ['meta_catalog_last_sync_result', JSON.stringify(syncResult), JSON.stringify(syncResult)]);

        res.json(syncResult);
    } catch (err) {
        console.error('Meta Sync All Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// SEC-001 FIX: Admin notifications now require authentication
app.get(['/api/admin/notifications', '/api/notifications'], authMiddleware, isAdmin, (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    db.query('SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT ?', [limit], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.query('SELECT COUNT(*) as unreadCount FROM admin_notifications WHERE is_read = FALSE', (err, countResult) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                notifications: results,
                unreadCount: countResult[0].unreadCount
            });
        });
    });
});

app.put(['/api/admin/notifications/:id/read', '/api/notifications/:id/read'], authMiddleware, isAdmin, (req, res) => {
    db.query('UPDATE admin_notifications SET is_read = TRUE WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.put(['/api/admin/notifications/read-all', '/api/notifications/read-all'], authMiddleware, isAdmin, (req, res) => {
    db.query('UPDATE admin_notifications SET is_read = TRUE WHERE is_read = FALSE', (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, updated: result.affectedRows });
    });
});

// ============================================================
// Helper: map car row to camelCase
// ============================================================
function mapCar(car) {
    const rawPrice = Number(car.price || 0);
    const origPrice = car.original_price ? Number(car.original_price) : null;
    const offPrice = car.offer_price ? Number(car.offer_price) : null;

    let effectivePrice = rawPrice;
    let effectiveOriginalPrice = origPrice;

    if (offPrice && offPrice > 0 && offPrice < (origPrice || rawPrice)) {
        effectivePrice = offPrice;
        if (!effectiveOriginalPrice) effectiveOriginalPrice = rawPrice;
    } else if (origPrice && origPrice > rawPrice) {
        effectivePrice = rawPrice;
        effectiveOriginalPrice = origPrice;
    }

    return {
        id: car.id,
        title: car.title || `${car.year || ''} ${car.make || ''} ${car.model || ''} ${car.variant || ''}`.trim(),
        make: car.make,
        model: car.model,
        variant: car.variant,
        year: car.year,
        price: effectivePrice,
        originalPrice: effectiveOriginalPrice,
        original_price: effectiveOriginalPrice,
        offerPrice: offPrice || (effectiveOriginalPrice ? effectivePrice : null),
        offer_price: offPrice || (effectiveOriginalPrice ? effectivePrice : null),
        discountType: car.discount_type || 'none',
        discount_type: car.discount_type || 'none',
        discountValue: car.discount_value ? Number(car.discount_value) : 0,
        discount_value: car.discount_value ? Number(car.discount_value) : 0,
        emi: Number(car.emi),
        km: car.km,
        fuelType: car.fuel_type,
        transmission: car.transmission,
        location: car.location,
        image: car.image,
        isAssured: Boolean(car.is_assured),
        listingType: car.listing_type || 'standard',
        listing_type: car.listing_type || 'standard',
        tag: car.tag,
        badgeText: car.badge_text || '',
        hub: car.hub,
        ownership: car.ownership,
        engineCapacity: car.engine_capacity,
        regYear: car.reg_year,
        regState: car.reg_state,
        spareKey: car.spare_key,
        insuranceStatus: car.insurance_status,
        color: car.color,
        bodyType: car.body_type,
        description: car.description,
        reasonsToBuy: car.reasons_to_buy ? JSON.parse(car.reasons_to_buy) : [],
        specifications: car.specifications ? JSON.parse(car.specifications) : [],
        features: car.features ? JSON.parse(car.features) : {},
        qualityReport: car.quality_report ? JSON.parse(car.quality_report) : null,
        moreImages: car.more_images ? JSON.parse(car.more_images) : [],
        videoUrl: car.video_url || '',
        createdAt: car.created_at,
        registrationNo: car.registration_no || car.registrationNo || null,
        registration_no: car.registration_no || car.registrationNo || null,
        status: car.status || 'active',
        listedBy: car.listed_by || null
    };
}

// ============================================================
// CARS API
// ============================================================
app.get('/api/cars', (req, res) => {
    const { location, search } = req.query;
    
    // Check if request is from an admin
    let isAdminRequest = false;
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.role === 'admin') {
                    isAdminRequest = true;
                }
            } catch (e) {
                // Ignore token errors
            }
        }
    }

    let query = 'SELECT cars.*, sr.customer_name as listed_by FROM cars LEFT JOIN sell_requests sr ON cars.id = sr.car_id';
    let params = [];
    let whereClauses = [];
    
    if (!isAdminRequest) {
        whereClauses.push("(cars.status IS NULL OR cars.status = '' OR cars.status != 'draft')");
    }
    
    if (location) {
        whereClauses.push("cars.location = ?");
        params.push(location);
    }
    
    if (search && search.trim()) {
        const searchPattern = `%${search.trim()}%`;
        whereClauses.push("(cars.make LIKE ? OR cars.model LIKE ? OR cars.variant LIKE ? OR cars.fuel_type LIKE ? OR cars.transmission LIKE ? OR cars.body_type LIKE ? OR cars.color LIKE ?)");
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    query += ' ORDER BY cars.created_at DESC';
    
    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results.map(mapCar));
    });
});

app.get('/api/car-counts-by-brand', (req, res) => {
    db.query("SELECT make as name, count(*) as count FROM cars WHERE (status IS NULL OR status = '' OR status != 'draft') GROUP BY make", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/cars/:id', (req, res) => {
    // Check if request is from an admin
    let isAdminRequest = false;
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.role === 'admin') {
                    isAdminRequest = true;
                }
            } catch (e) {
                // Ignore token errors
            }
        }
    }

    db.query('SELECT * FROM cars WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Car not found' });
        
        const car = results[0];
        if (!isAdminRequest && car.status === 'draft') {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.json(mapCar(car));
    });
});

app.post('/api/cars', authMiddleware, isAdmin, (req, res) => {
    const { title, make, model, variant, year, price, originalPrice, original_price, discountType, discount_type, discountValue, discount_value, offerPrice, offer_price, emi, km, fuelType, fuel_type, transmission,
        location, image, tag, badgeText, badge_text, hub, isAssured, listingType, listing_type, ownership, engineCapacity, engine_capacity,
        regYear, reg_year, regState, reg_state, spareKey, spare_key, insuranceStatus,
        insurance_status, color, bodyType, body_type, description, videoUrl, video_url, status, registrationNo, registration_no } = req.body;

    if (!make || !model) {
        return res.status(400).json({ error: 'Make and Model are required' });
    }

    // Determine primary cover image
    let primaryImage = (image && typeof image === 'string' && image.trim()) ? image.trim() : '';
    if (!primaryImage && req.body.moreImages) {
        const gallery = Array.isArray(req.body.moreImages) ? req.body.moreImages : [];
        const firstImg = gallery.find(url => typeof url === 'string' && !url.includes('youtube.com') && !url.includes('youtu.be') && !url.endsWith('.mp4') && !url.endsWith('.mov') && !url.endsWith('.webm'));
        if (firstImg) primaryImage = firstImg;
    }
    if (!primaryImage) primaryImage = '/img/suv.png';

    // Auto extract video URL if not explicitly set
    let finalVideoUrl = videoUrl || video_url || null;
    if (!finalVideoUrl && req.body.moreImages && Array.isArray(req.body.moreImages)) {
        const firstVid = req.body.moreImages.find(url => typeof url === 'string' && (url.includes('youtube.com') || url.includes('youtu.be') || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm')));
        if (firstVid) finalVideoUrl = firstVid;
    }

    const safeNumber = (val, fallback = null) => {
        if (val === undefined || val === null || val === '') return fallback;
        const n = Number(val);
        return isNaN(n) ? fallback : n;
    };

    const finalYear = safeNumber(year, new Date().getFullYear());
    const finalTitle = (title && typeof title === 'string' && title.trim())
        ? title.trim()
        : `${finalYear} ${String(make).trim()} ${String(model).trim()} ${variant ? String(variant).trim() : ''}`.trim();

    const data = {
        title: finalTitle,
        make: String(make).trim(),
        model: String(model).trim(),
        variant: variant || null,
        year: finalYear,
        price: safeNumber(price, 0),
        emi: safeNumber(emi, null),
        km: safeNumber(km, 0),
        original_price: safeNumber(originalPrice !== undefined ? originalPrice : original_price, null),
        discount_type: discountType || discount_type || 'none',
        discount_value: safeNumber(discountValue !== undefined ? discountValue : discount_value, 0),
        offer_price: safeNumber(offerPrice !== undefined ? offerPrice : offer_price, null),
        fuel_type: fuelType || fuel_type || 'Petrol',
        transmission: transmission || 'Manual',
        location: location || 'Mumbai',
        image: primaryImage,
        tag: tag || null,
        hub: hub || null,
        badge_text: badgeText || badge_text || null,
        is_assured: isAssured ? 1 : 0,
        listing_type: listingType || listing_type || 'standard',
        ownership: ownership || '1st Owner',
        engine_capacity: engineCapacity || engine_capacity || null,
        reg_year: safeNumber(regYear !== undefined ? regYear : reg_year, safeNumber(year, new Date().getFullYear())),
        reg_state: regState || reg_state || null,
        spare_key: spareKey || spare_key || 'Yes',
        insurance_status: insuranceStatus || insurance_status || 'Active',
        color: color || null,
        body_type: bodyType || body_type || null,
        description: description || null,
        registration_no: registrationNo || registration_no || null,
        reasons_to_buy: req.body.reasonsToBuy ? (typeof req.body.reasonsToBuy === 'string' ? req.body.reasonsToBuy : JSON.stringify(req.body.reasonsToBuy)) : null,
        specifications: req.body.specifications ? (typeof req.body.specifications === 'string' ? req.body.specifications : JSON.stringify(req.body.specifications)) : null,
        features: req.body.features ? (typeof req.body.features === 'string' ? req.body.features : JSON.stringify(req.body.features)) : null,
        quality_report: req.body.qualityReport ? (typeof req.body.qualityReport === 'string' ? req.body.qualityReport : JSON.stringify(req.body.qualityReport)) : null,
        more_images: req.body.moreImages ? (typeof req.body.moreImages === 'string' ? req.body.moreImages : JSON.stringify(req.body.moreImages)) : null,
        video_url: finalVideoUrl,
        status: status || 'active'
    };

    db.query('INSERT INTO cars SET ?', data, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        try { triggerMetaAutoSync(result.insertId, 'CREATE'); } catch (_) {}
        res.status(201).json({ id: result.insertId, ...mapCar({ ...data, id: result.insertId }) });
    });
});

app.post('/api/cars/bulk-import', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { cars: bulkCars } = req.body;
        if (!Array.isArray(bulkCars) || bulkCars.length === 0) {
            return res.status(400).json({ message: "No cars provided for bulk import" });
        }

        let insertedCount = 0;
        const insertedIds = [];
        for (const carItem of bulkCars) {
            const data = {
                make: carItem.make || "Maruti Suzuki",
                model: carItem.model || "Swift",
                variant: carItem.variant || "VXI",
                year: Number(carItem.year || 2023),
                price: Number(carItem.price || 500000),
                km: Number(carItem.km || 10000),
                fuel_type: carItem.fuelType || carItem.fuel_type || "Petrol",
                transmission: carItem.transmission || "Manual",
                location: carItem.location || "Mumbai",
                registration_no: carItem.registrationNo || carItem.registration_no || carItem.regNo || null,
                image: carItem.image || "/img/suv.png",
                status: carItem.status || "in_stock",
                listing_type: carItem.listingType || carItem.listing_type || "standard"
            };
            await new Promise((resolve) => {
                db.query('INSERT INTO cars SET ?', data, (err, resObj) => {
                    if (!err) {
                        insertedCount++;
                        if (resObj && resObj.insertId) insertedIds.push(resObj.insertId);
                    }
                    resolve(true);
                });
            });
        }
        if (insertedIds.length > 0) {
            try { triggerMetaAutoSync(insertedIds, 'CREATE'); } catch (_) {}
        }
        res.json({ message: `Successfully imported ${insertedCount} cars`, count: insertedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/cars/:id', authMiddleware, isAdmin, (req, res) => {
    // Check old car images before updating to clean up any removed ones
    db.query('SELECT image, more_images FROM cars WHERE id = ?', [req.params.id], (findErr, findResults) => {
        const oldCar = findResults && findResults[0] ? findResults[0] : null;

        const { title, make, model, variant, year, price, originalPrice, original_price, discountType, discount_type, discountValue, discount_value, offerPrice, offer_price, emi, km, fuelType, fuel_type, transmission,
            location, image, tag, badgeText, badge_text, hub, isAssured, listingType, listing_type, ownership, engineCapacity, engine_capacity,
            regYear, reg_year, regState, reg_state, spareKey, spare_key, insuranceStatus,
            insurance_status, color, bodyType, body_type, description, videoUrl, video_url, status, registrationNo, registration_no } = req.body;

        if (!make || !model) {
            return res.status(400).json({ error: 'Make and Model are required' });
        }

        // Determine primary cover image
        let primaryImage = (image && typeof image === 'string' && image.trim()) ? image.trim() : '';
        if (!primaryImage && req.body.moreImages) {
            const gallery = Array.isArray(req.body.moreImages) ? req.body.moreImages : [];
            const firstImg = gallery.find(url => typeof url === 'string' && !url.includes('youtube.com') && !url.includes('youtu.be') && !url.endsWith('.mp4') && !url.endsWith('.mov') && !url.endsWith('.webm'));
            if (firstImg) primaryImage = firstImg;
        }
        if (!primaryImage && oldCar && oldCar.image) primaryImage = oldCar.image;
        if (!primaryImage) primaryImage = '/img/suv.png';

        // Auto extract video URL if not explicitly set
        let finalVideoUrl = videoUrl || video_url || null;
        if (!finalVideoUrl && req.body.moreImages && Array.isArray(req.body.moreImages)) {
            const firstVid = req.body.moreImages.find(url => typeof url === 'string' && (url.includes('youtube.com') || url.includes('youtu.be') || url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm')));
            if (firstVid) finalVideoUrl = firstVid;
        }

        const safeNumber = (val, fallback = null) => {
            if (val === undefined || val === null || val === '') return fallback;
            const n = Number(val);
            return isNaN(n) ? fallback : n;
        };

        const finalYear = safeNumber(year, new Date().getFullYear());
        const finalTitle = (title && typeof title === 'string' && title.trim())
            ? title.trim()
            : `${finalYear} ${String(make).trim()} ${String(model).trim()} ${variant ? String(variant).trim() : ''}`.trim();

        const data = {
            title: finalTitle,
            make: String(make).trim(),
            model: String(model).trim(),
            variant: variant || null,
            year: finalYear,
            price: safeNumber(price, 0),
            emi: safeNumber(emi, null),
            km: safeNumber(km, 0),
            original_price: safeNumber(originalPrice !== undefined ? originalPrice : original_price, null),
            discount_type: discountType || discount_type || 'none',
            discount_value: safeNumber(discountValue !== undefined ? discountValue : discount_value, 0),
            offer_price: safeNumber(offerPrice !== undefined ? offerPrice : offer_price, null),
            fuel_type: fuelType || fuel_type || 'Petrol',
            transmission: transmission || 'Manual',
            location: location || 'Mumbai',
            image: primaryImage,
            tag: tag || null,
            hub: hub || null,
            badge_text: badgeText || badge_text || null,
            is_assured: isAssured !== undefined ? (isAssured ? 1 : 0) : 0,
            listing_type: listingType || listing_type || 'standard',
            ownership: ownership || '1st Owner',
            engine_capacity: engineCapacity || engine_capacity || null,
            reg_year: safeNumber(regYear !== undefined ? regYear : reg_year, safeNumber(year, new Date().getFullYear())),
            reg_state: regState || reg_state || null,
            spare_key: spareKey || spare_key || 'Yes',
            insurance_status: insuranceStatus || insurance_status || 'Active',
            color: color || null,
            body_type: bodyType || body_type || null,
            description: description || null,
            registration_no: registrationNo || registration_no || null,
            reasons_to_buy: req.body.reasonsToBuy ? (typeof req.body.reasonsToBuy === 'string' ? req.body.reasonsToBuy : JSON.stringify(req.body.reasonsToBuy)) : null,
            specifications: req.body.specifications ? (typeof req.body.specifications === 'string' ? req.body.specifications : JSON.stringify(req.body.specifications)) : null,
            features: req.body.features ? (typeof req.body.features === 'string' ? req.body.features : JSON.stringify(req.body.features)) : null,
            quality_report: req.body.qualityReport ? (typeof req.body.qualityReport === 'string' ? req.body.qualityReport : JSON.stringify(req.body.qualityReport)) : null,
            more_images: req.body.moreImages ? (typeof req.body.moreImages === 'string' ? req.body.moreImages : JSON.stringify(req.body.moreImages)) : null,
            video_url: finalVideoUrl,
            status: status || 'active'
        };

        db.query('UPDATE cars SET ? WHERE id = ?', [data, req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // Storage cleanup: If main image replaced, delete old main image
            if (oldCar && oldCar.image && data.image && oldCar.image !== data.image && oldCar.image.startsWith('/uploads/')) {
                deleteLocalUploadFile(oldCar.image);
            }
            // Storage cleanup: If more_images items were removed, delete them from disk
            if (oldCar && oldCar.more_images && data.more_images) {
                try {
                    const oldGallery = typeof oldCar.more_images === 'string' ? JSON.parse(oldCar.more_images) : oldCar.more_images;
                    const newGallery = typeof data.more_images === 'string' ? JSON.parse(data.more_images) : data.more_images;
                    if (Array.isArray(oldGallery) && Array.isArray(newGallery)) {
                        oldGallery.forEach(oldImg => {
                            if (oldImg && !newGallery.includes(oldImg) && typeof oldImg === 'string' && oldImg.startsWith('/uploads/')) {
                                deleteLocalUploadFile(oldImg);
                            }
                        });
                    }
                } catch (e) {}
            }

            // Trigger sold out notification to seller if this car came from a sell request
            if (data.status === 'sold_out') {
                db.query('SELECT * FROM sell_requests WHERE car_id = ?', [req.params.id], (srErr, srRows) => {
                    if (!srErr && srRows && srRows.length > 0) {
                        const seller = srRows[0];
                        sendGallaboxWhatsAppNotification('sell_car_sold', seller.customer_phone, {
                            customer_name: seller.customer_name || 'Valued Seller',
                            car_name: `${data.year || seller.year || ''} ${data.make || seller.make || ''} ${data.model || seller.model || ''} ${data.variant || seller.variant || ''}`.trim(),
                            sold_price: data.price ? `₹${Number(data.price).toLocaleString('en-IN')}` : '',
                            request_id: `#SELL-${seller.id}`
                        });
                    }
                });
            }

            // Auto-sync updated car with Meta Catalog
            try { triggerMetaAutoSync(req.params.id, 'UPDATE'); } catch (_) {}

            res.json({ message: 'Car updated successfully' });
        });
    });
});

app.patch('/api/cars/bulk-update', authMiddleware, isAdmin, (req, res) => {
    const { ids, status, isAssured, listingType, listing_type } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'ids array is required' });
    }
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (isAssured !== undefined) updateData.is_assured = isAssured;
    if (listingType !== undefined || listing_type !== undefined) updateData.listing_type = listingType || listing_type;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    db.query('UPDATE cars SET ? WHERE id IN (?)', [updateData, ids], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        triggerMetaAutoSync(ids, 'UPDATE');
        res.json({ message: `Updated ${ids.length} cars successfully` });
    });
});

app.patch('/api/cars/:id', authMiddleware, isAdmin, (req, res) => {
    const fieldMap = {
        status: 'status',
        isAssured: 'is_assured',
        is_assured: 'is_assured',
        listingType: 'listing_type',
        listing_type: 'listing_type',
        price: 'price',
        tag: 'tag',
        hub: 'hub',
        location: 'location'
    };
    const updateData = {};
    Object.keys(req.body).forEach(key => {
        if (fieldMap[key] !== undefined) {
            updateData[fieldMap[key]] = req.body[key];
        }
    });

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    db.query('UPDATE cars SET ? WHERE id = ?', [updateData, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        triggerMetaAutoSync(req.params.id, 'UPDATE');
        res.json({ message: 'Car updated successfully', updated: updateData });
    });
});

app.delete('/api/cars/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('SELECT image, more_images FROM cars WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Car not found' });
        
        const car = results[0];
        const imagesToDelete = [];
        if (car.image) imagesToDelete.push(car.image);
        if (car.more_images) {
            try {
                const gallery = typeof car.more_images === 'string' ? JSON.parse(car.more_images) : car.more_images;
                if (Array.isArray(gallery)) {
                    gallery.forEach(img => {
                        if (img) imagesToDelete.push(img);
                    });
                }
            } catch (e) {
                console.error('Failed to parse more_images for deletion', e);
            }
        }
        
        // Delete the car from DB
        db.query('DELETE FROM cars WHERE id = ?', [req.params.id], (delErr) => {
            if (delErr) return res.status(500).json({ error: delErr.message });
            
            // Delete all associated files and thumbnails from disk and DB
            imagesToDelete.forEach(filePath => deleteLocalUploadFile(filePath));
            
            // Trigger Meta Catalog item removal
            triggerMetaAutoSync(req.params.id, 'DELETE');

            res.json({ message: 'Car deleted successfully and associated images removed' });
        });
    });
});

// ============================================================
// CUSTOMER AUTH API
// ============================================================
app.post('/api/customers/register', async (req, res) => {
    const { phone, first_name, last_name, email, password, city } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone is required' });

    db.query('SELECT id FROM customers WHERE phone = ?', [phone], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) return res.status(409).json({ message: 'Phone already registered' });

        let hashedPassword = null;
        if (password) hashedPassword = await bcrypt.hash(password, 10);
        
        const customer = { phone, first_name, last_name, email, city, password: hashedPassword };

        db.query('INSERT INTO customers SET ?', customer, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            createNotification('NEW_USER', `New customer registered: ${first_name || ''} ${last_name || ''} (${phone})`, result.insertId);
            const token = jwt.sign({ id: result.insertId, phone, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.status(201).json({ token, customer: { id: result.insertId, ...customer, password: undefined } });
        });
    });
});

app.post('/api/customers/login', async (req, res) => {
    const { phone, password } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone is required' });

    db.query('SELECT * FROM customers WHERE phone = ?', [phone], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'No account found with this phone number' });

        const customer = results[0];

        // If no password, allow login with phone only (OTP-style - just phone match)
        if (!customer.password && !password) {
            const token = jwt.sign({ id: customer.id, phone: customer.phone, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token, customer: { id: customer.id, first_name: customer.first_name, last_name: customer.last_name, phone: customer.phone, email: customer.email } });
        }

        if (password && customer.password) {
            const isMatch = await bcrypt.compare(password, customer.password);
            if (!isMatch) return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: customer.id, phone: customer.phone, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, customer: { id: customer.id, first_name: customer.first_name, last_name: customer.last_name, phone: customer.phone, email: customer.email } });
    });
});

// ============================================================
// WHATSAPP OTP API
// ============================================================

// Send OTP via WhatsApp
app.post('/api/auth/send-otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    try {
        // Support both 10-digit (India) and international formats
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        // Get WhatsApp settings from site_settings table
        const settings = {};
        const keys = [
            'whatsapp_provider',
            'whatsapp_api_token', 
            'whatsapp_phone_number_id', 
            'whatsapp_otp_template_name',
            'whatsapp_test_mode',
            'whatsapp_test_otp',
            'gallabox_api_key',
            'gallabox_api_secret',
            'gallabox_channel_id',
            'gallabox_template_name'
        ];
        
        for (const key of keys) {
            settings[key] = await getSetting(key);
        }

        // Generate OTP
        let otp;
        if (settings.whatsapp_test_mode === 'true') {
            otp = settings.whatsapp_test_otp || '123456';
            console.log(`[TEST MODE] OTP for ${cleanPhone}: ${otp}`);
        } else {
            otp = Math.floor(100000 + Math.random() * 900000).toString();
        }

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in database
        await queryAsync(
            'INSERT INTO otps (phone, otp, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp = ?, expires_at = ?', 
            [cleanPhone, otp, expiresAt, otp, expiresAt]
        );

        // Logic check: If in test mode, return success immediately without calling API
        if (settings.whatsapp_test_mode === 'true') {
            return res.json({ 
                message: 'OTP generated in Test Mode (Bypassing WhatsApp API)', 
                testMode: true,
                otp: otp // Returning it in response for easy testing
            });
        }

        // Real Mode: Check credentials based on provider choice
        const provider = settings.whatsapp_provider || 'meta';
        if (provider === 'gallabox') {
            if (!settings.gallabox_api_key || !settings.gallabox_api_secret || !settings.gallabox_channel_id || !settings.gallabox_template_name) {
                console.error('Gallabox Settings missing:', settings);
                return res.status(400).json({ message: 'Gallabox OTP service is not fully configured by administrator.' });
            }
        } else {
            if (!settings.whatsapp_api_token || !settings.whatsapp_phone_number_id || !settings.whatsapp_otp_template_name) {
                console.error('WhatsApp Settings missing:', settings);
                return res.status(400).json({ message: 'WhatsApp OTP service is not fully configured by administrator.' });
            }
        }

        // Send real OTP via service (supports meta & gallabox)
        try {
            await sendWhatsAppOTP(cleanPhone, otp, settings);
            res.json({ message: 'OTP sent successfully to WhatsApp' });
        } catch (apiError) {
            console.error('Real WhatsApp OTP sending failed, falling back to test mode OTP:', apiError.message);
            res.json({ 
                message: 'Real OTP service failed. Using fallback test OTP.', 
                testMode: true,
                otp: otp 
            });
        }
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ message: error.message || 'Failed to send OTP' });
    }
});

// Verify OTP & Login/Register
app.post('/api/auth/verify-otp', async (req, res) => {
    const { phone, otp, firstName, lastName, email, city } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });

    try {
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

        const results = await queryAsync('SELECT * FROM otps WHERE phone = ? AND otp = ? AND expires_at > NOW()', [cleanPhone, otp]);
        
        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // SEC-003 FIX: Delete OTP immediately after validation to prevent reuse
        await queryAsync('DELETE FROM otps WHERE phone = ?', [cleanPhone]);

        // Check if customer exists
        // Match either 91X or X (10 digit) just in case
        let customerResults = await queryAsync('SELECT * FROM customers WHERE phone = ? OR phone = ?', [cleanPhone, cleanPhone.substring(2)]);
        let customer = customerResults[0];

        if (!customer) {
            // New user -> If they provided a name, create account now.
            // Otherwise, tell frontend to show registration fields.
            if (firstName) {
                const phoneForDb = cleanPhone.length > 10 ? cleanPhone.substring(cleanPhone.length - 10) : cleanPhone;
                const insertResult = await queryAsync(
                    'INSERT INTO customers (phone, first_name, last_name, email, city) VALUES (?, ?, ?, ?, ?)', 
                    [phoneForDb, firstName, lastName || '', email || '', city || '']
                );
                
                customer = { 
                    id: insertResult.insertId, 
                    phone: phoneForDb, 
                    first_name: firstName, 
                    last_name: lastName || '', 
                    email: email || '',
                    city: city || ''
                };
                
                createNotification('NEW_USER', `New customer registered via WhatsApp: ${firstName} ${lastName || ''} (${phoneForDb})`, customer.id);
            } else {
                return res.json({ 
                    success: true, 
                    verified: true, 
                    existingUser: false,
                    message: 'OTP verified. Account details required for new user.'
                });
            }
        }

        // Login user
        const token = jwt.sign({ id: customer.id, phone: customer.phone, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ 
            success: true, 
            verified: true, 
            existingUser: true, 
            token, 
            customer: { 
                id: customer.id, 
                first_name: customer.first_name, 
                last_name: customer.last_name, 
                phone: customer.phone, 
                email: customer.email 
            } 
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ message: error.message || 'Verification failed' });
    }
});

// customerAuth imported from ./auth-middleware

app.get('/api/customers/profile', customerAuth, (req, res) => {
    db.query('SELECT * FROM customers WHERE id = ?', [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Not found' });
        const c = results[0];
        delete c.password;
        res.json(c);
    });
});

app.put('/api/customers/profile', customerAuth, (req, res) => {
    const { first_name, last_name, alt_phone, email, address, area, city, state, pincode } = req.body;
    const data = { first_name, last_name, alt_phone, email, address, area, city, state, pincode };
    db.query('UPDATE customers SET ? WHERE id = ?', [data, req.user.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profile updated successfully' });
    });
});

// Customer: Upload profile picture
app.post('/api/customers/avatar', customerAuth, upload.single('avatar'), convertRequestImagesToWebp, (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const imageUrl = `/uploads/${req.file.filename}`;
    db.query('UPDATE customers SET avatar_url = ? WHERE id = ?', [imageUrl, req.user.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profile picture updated successfully', imageUrl });
    });
});

// Admin: Upload customer profile picture
app.post('/api/customers/:id/avatar', authMiddleware, isAdmin, upload.single('avatar'), convertRequestImagesToWebp, (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const imageUrl = `/uploads/${req.file.filename}`;
    db.query('UPDATE customers SET avatar_url = ? WHERE id = ?', [imageUrl, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profile picture updated successfully', imageUrl });
    });
});

// Admin: Get all customers
app.get('/api/customers', authMiddleware, isAdmin, (req, res) => {
    db.query('SELECT id, first_name, last_name, phone, alt_phone, email, city, state, avatar_url, created_at FROM customers ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Admin: Get single customer
app.get('/api/customers/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('SELECT * FROM customers WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Not found' });
        const c = results[0];
        delete c.password;
        res.json(c);
    });
});

// Admin: Update customer
app.put('/api/customers/:id', authMiddleware, isAdmin, (req, res) => {
    const { first_name, last_name, phone, alt_phone, email, address, area, city, state, pincode } = req.body;
    db.query('UPDATE customers SET ? WHERE id = ?', [{ first_name, last_name, phone, alt_phone, email, address, area, city, state, pincode }, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Customer updated successfully' });
    });
});

// Admin: Delete customer
app.delete('/api/customers/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('DELETE FROM customers WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Customer deleted successfully' });
    });
});

// ============================================================
// WISHLISTS API
// ============================================================
app.get('/api/wishlist', customerAuth, (req, res) => {
    const query = `
        SELECT c.*, w.created_at as wishlisted_at 
        FROM cars c 
        JOIN wishlists w ON c.id = w.car_id 
        WHERE w.customer_id = ? AND (c.status = 'active' OR c.status IS NULL OR c.status = '')
        ORDER BY w.created_at DESC
    `;
    db.query(query, [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results.map(mapCar));
    });
});

app.post('/api/wishlist/:carId', customerAuth, (req, res) => {
    const { carId } = req.params;
    const customerId = req.user.id;
    
    // Check if already wishlisted
    db.query('SELECT id FROM wishlists WHERE customer_id = ? AND car_id = ?', [customerId, carId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            // Remove from wishlist
            db.query('DELETE FROM wishlists WHERE id = ?', [results[0].id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Removed from wishlist', isWishlisted: false });
            });
        } else {
            // Add to wishlist
            db.query('INSERT INTO wishlists (customer_id, car_id) VALUES (?, ?)', [customerId, carId], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                createNotification('WISHLIST', `Customer wishlisted a car`, customerId, carId);
                res.json({ message: 'Added to wishlist', isWishlisted: true });
            });
        }
    });
});

// Check specific car status
app.get('/api/wishlist/check/:carId', customerAuth, (req, res) => {
    const { carId } = req.params;
    db.query('SELECT id FROM wishlists WHERE customer_id = ? AND car_id = ?', [req.user.id, carId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ isWishlisted: results.length > 0 });
    });
});

// ============================================================
// SELL REQUESTS API
// ============================================================
app.post('/api/sell-requests', (req, res) => {
    const { 
        make, model, variant, year, km, fuelType, fuel_type, 
        transmission, ownership, location, asking_price, description, 
        customer_name, customer_phone, customer_email, customer_id, 
        inspection_date, inspection_time, appointment_date, appointment_time,
        inspection_notes, inspection_type 
    } = req.body;

    if (!make || !model) return res.status(400).json({ message: 'Make and model are required' });

    let resolvedCustomerId = customer_id || null;
    if (!resolvedCustomerId && req.headers.authorization) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded && decoded.id) resolvedCustomerId = decoded.id;
        } catch (e) {}
    }

    const data = {
        make, model, variant, year, km,
        fuel_type: fuelType || fuel_type,
        transmission, ownership, location, asking_price, description,
        customer_name, customer_phone, customer_email,
        customer_id: resolvedCustomerId,
        inspection_date: inspection_date || appointment_date || null,
        inspection_time: inspection_time || appointment_time || null,
        inspection_notes: inspection_notes || (inspection_type ? `Type: ${inspection_type}` : null),
        status: 'pending'
    };

    db.query('INSERT INTO sell_requests SET ?', data, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        createNotification('CAR_SELL_REQUEST', `New car sell request from ${customer_name}`, resolvedCustomerId, result.insertId);

        // Gallabox WhatsApp Automated Trigger for Customer
        sendGallaboxWhatsAppNotification('sell_request', customer_phone, {
            customer_name: customer_name || 'Valued Seller',
            car_name: `${year || ''} ${make || ''} ${model || ''} ${variant || ''}`.trim(),
            request_id: `#SELL-${result.insertId}`
        });

        // Gallabox WhatsApp Alert for Admin
        sendAdminWhatsAppAlert('admin_sell_request', {
            customer_name: customer_name || 'Valued Seller',
            customer_phone: customer_phone || 'N/A',
            car_name: `${year || ''} ${make || ''} ${model || ''} ${variant || ''}`.trim(),
            request_id: `#SELL-${result.insertId}`
        });

        res.status(201).json({ id: result.insertId, ...data });
    });
});

app.put('/api/sell-requests/:id/inspection', (req, res) => {
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
                        car_name: `${sr.year || ''} ${sr.make || ''} ${sr.model || ''} ${sr.variant || ''}`.trim(),
                        date_slot: `${appointmentDate || sr.inspection_date || ''} ${time || appointmentTime || sr.inspection_time || ''}`.trim(),
                        request_id: `#SELL-${reqId}`
                    });
                }
                createNotification('CAR_SELL_REQUEST', `Inspection scheduled for Sell Request #${reqId} on ${appointmentDate || sr.inspection_date} (${time || appointmentTime || sr.inspection_time})`, sr.customer_id, reqId);
            }
        });

        res.status(200).json({ message: 'Inspection appointment booked successfully', id: reqId });
    });
});

app.get('/api/sell-requests', authMiddleware, isAdmin, (req, res) => {
    const query = `SELECT sr.*, c.first_name, c.last_name FROM sell_requests sr LEFT JOIN customers c ON sr.customer_id = c.id ORDER BY sr.created_at DESC`;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/sell-requests/mine', customerAuth, (req, res) => {
    const custId = req.user.id;
    const custPhone = req.user.phone || '';
    db.query('SELECT * FROM sell_requests WHERE customer_id = ? OR (customer_phone IS NOT NULL AND customer_phone = ?) ORDER BY created_at DESC', [custId, custPhone], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/sell-requests/:id/documents', (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (e) {
            console.error("Doc upload token error:", e.message);
        }
    }
    next();
}, (req, res, next) => {
    upload.fields([
        { name: 'rc_document', maxCount: 1 },
        { name: 'insurance_document', maxCount: 1 },
        { name: 'other_document', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            console.error("Multer doc upload error:", err.message);
            return res.status(400).json({ message: err.message || 'File upload error' });
        }
        next();
    });
}, convertRequestImagesToWebp, (req, res) => {
    const requestId = req.params.id;
    const updateData = {};

    if (req.files) {
        if (req.files.rc_document && req.files.rc_document[0]) {
            updateData.rc_document = `/uploads/${req.files.rc_document[0].filename}`;
        }
        if (req.files.insurance_document && req.files.insurance_document[0]) {
            updateData.insurance_document = `/uploads/${req.files.insurance_document[0].filename}`;
        }
        if (req.files.other_document && req.files.other_document[0]) {
            updateData.other_document = `/uploads/${req.files.other_document[0].filename}`;
        }
    }

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No documents uploaded' });
    }

    db.query('UPDATE sell_requests SET ? WHERE id = ?', [updateData, requestId], (err, result) => {
        if (err) {
            console.error("Error updating sell_requests documents:", err.message);
            return res.status(500).json({ message: err.message });
        }
        res.json({ message: 'Documents uploaded successfully', updated: updateData });
    });
});

app.put('/api/sell-requests/:id', customerAuth, (req, res) => {
    const { make, model, variant, year, km, fuel_type, transmission, ownership, location, asking_price, customer_phone } = req.body;
    db.query('SELECT * FROM sell_requests WHERE id = ? AND customer_id = ?', [req.params.id, req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Request not found' });
        
        const updateFields = {};
        if (make !== undefined) updateFields.make = make;
        if (model !== undefined) updateFields.model = model;
        if (variant !== undefined) updateFields.variant = variant;
        if (year !== undefined) updateFields.year = year;
        if (km !== undefined) updateFields.km = km;
        if (fuel_type !== undefined) updateFields.fuel_type = fuel_type;
        if (transmission !== undefined) updateFields.transmission = transmission;
        if (ownership !== undefined) updateFields.ownership = ownership;
        if (location !== undefined) updateFields.location = location;
        if (asking_price !== undefined) updateFields.asking_price = asking_price;
        if (customer_phone !== undefined) updateFields.customer_phone = customer_phone;

        db.query('UPDATE sell_requests SET ? WHERE id = ?', [updateFields, req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Sell request updated successfully' });
        });
    });
});

app.put('/api/sell-requests/:id/status', authMiddleware, isAdmin, (req, res) => {
    const { status, admin_notes, make, model, variant, year, km, fuel_type, transmission, ownership, location, asking_price, description } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    
    db.query('SELECT * FROM sell_requests WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Not found' });
        
        const existing = results[0];
        const previousStatus = existing.status;

        const updateFields = { status, admin_notes: admin_notes || null };
        if (make !== undefined) updateFields.make = make;
        if (model !== undefined) updateFields.model = model;
        if (variant !== undefined) updateFields.variant = variant;
        if (year !== undefined) updateFields.year = year;
        if (km !== undefined) updateFields.km = km;
        if (fuel_type !== undefined) updateFields.fuel_type = fuel_type;
        if (transmission !== undefined) updateFields.transmission = transmission;
        if (ownership !== undefined) updateFields.ownership = ownership;
        if (location !== undefined) updateFields.location = location;
        if (asking_price !== undefined) updateFields.asking_price = asking_price;
        if (description !== undefined) updateFields.description = description;

        db.query('UPDATE sell_requests SET ? WHERE id = ?', [updateFields, req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Trigger status change WhatsApp notification to seller
            if (status !== previousStatus) {
                if (status === 'approved') {
                    sendGallaboxWhatsAppNotification('sell_request_approved', existing.customer_phone, {
                        customer_name: existing.customer_name || 'Valued Seller',
                        car_name: `${existing.year || ''} ${existing.make || ''} ${existing.model || ''} ${existing.variant || ''}`.trim(),
                        request_id: `#SELL-${req.params.id}`,
                        status: 'Approved & Listed in Catalog'
                    });
                } else if (status === 'rejected') {
                    sendGallaboxWhatsAppNotification('sell_request_rejected', existing.customer_phone, {
                        customer_name: existing.customer_name || 'Valued Seller',
                        car_name: `${existing.year || ''} ${existing.make || ''} ${existing.model || ''} ${existing.variant || ''}`.trim(),
                        request_id: `#SELL-${req.params.id}`,
                        status: 'Rejected',
                        reason: admin_notes || 'Vehicle specifications could not be verified'
                    });
                }
            }

            if (status === 'approved' && !existing.car_id) {
                const finalCar = { ...existing, ...updateFields };
                const carData = {
                    make: finalCar.make || 'Unknown', 
                    model: finalCar.model || 'Unknown', 
                    variant: finalCar.variant, 
                    year: finalCar.year, 
                    km: finalCar.km, 
                    fuel_type: finalCar.fuel_type, 
                    transmission: finalCar.transmission, 
                    ownership: finalCar.ownership, 
                    location: finalCar.location, 
                    price: finalCar.asking_price || 0,
                    description: finalCar.description,
                    status: 'active'
                };
                db.query('INSERT INTO cars SET ?', carData, (insertErr, result) => {
                    if (insertErr) {
                        console.error("Failed to auto-create car:", insertErr);
                        return res.json({ message: 'Status updated but failed to create car' });
                    }
                    // Update sell_requests with the new car_id
                    db.query('UPDATE sell_requests SET car_id = ? WHERE id = ?', [result.insertId, req.params.id], (updateErr) => {
                        if (updateErr) console.error("Failed to link car_id to sell request:", updateErr);
                        return res.json({ message: 'Status updated and car created' });
                    });
                });
            } else {
                res.json({ message: 'Status updated' });
            }
        });
    });
});

app.delete('/api/sell-requests/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('DELETE FROM sell_requests WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted successfully' });
    });
});

// ============================================================
// LEADS API
// ============================================================
app.post('/api/leads', (req, res) => {
    db.query('INSERT INTO leads SET ?', req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, ...req.body });
    });
});

app.get('/api/leads', authMiddleware, isAdmin, (req, res) => {
    db.query('SELECT l.*, c.make, c.model FROM leads l LEFT JOIN cars c ON l.car_id = c.id ORDER BY l.created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ============================================================
// TEST DRIVE BOOKING API
// ============================================================
app.post('/api/test-drives', customerAuth, (req, res) => {
    const { car_id, location, date_label, date_day, slot } = req.body;
    if (!car_id || !location || !date_label || !date_day || !slot) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    db.query('SELECT status FROM cars WHERE id = ?', [car_id], (carErr, carRows) => {
        if (!carErr && carRows.length > 0 && carRows[0].status === 'coming_soon') {
            return res.status(400).json({ message: 'Test drives are not available for cars with Coming Soon status.' });
        }

        const testDrive = {
            customer_id: req.user.id,
            car_id,
            location,
            date_label,
            date_day,
            slot,
            status: 'pending'
        };

        db.query('INSERT INTO test_drives SET ?', testDrive, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            createNotification('TEST_DRIVE', `New test drive request booked`, req.user.id, result.insertId);

            // Gallabox WhatsApp Automated Trigger
            db.query('SELECT c.first_name, c.last_name, c.phone, car.make, car.model, car.variant, car.year FROM customers c JOIN cars car ON car.id = ? WHERE c.id = ?', [car_id, req.user.id], (cErr, cRows) => {
                if (!cErr && cRows.length > 0) {
                    const info = cRows[0];
                    sendGallaboxWhatsAppNotification('test_drive', info.phone || req.user.phone, {
                        customer_name: `${info.first_name || ''} ${info.last_name || ''}`.trim() || 'Valued Customer',
                        car_name: `${info.year || ''} ${info.make || ''} ${info.model || ''} ${info.variant || ''}`.trim(),
                        date_slot: `${date_day} (${date_label}) ${slot}`,
                        location: location
                    });
                }
            });

            res.status(201).json({ message: 'Test drive booked successfully', id: result.insertId });
        });
    });
});

app.get('/api/test-drives', (req, res) => {
    // Determine if admin or customer
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin') {
            const query = `
                SELECT t.*, c.first_name, c.last_name, c.phone, c.email, 
                       car.make, car.model, car.variant, car.year, car.price, car.fuel_type, car.transmission, car.location as car_location, car.registration_no, car.image
                FROM test_drives t
                JOIN customers c ON t.customer_id = c.id
                JOIN cars car ON t.car_id = car.id
                ORDER BY t.created_at DESC
            `;
            db.query(query, (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(results);
            });
        } else {
            const query = `
                SELECT t.*, car.make, car.model, car.variant, car.year, car.price, car.fuel_type, car.transmission, car.location as car_location, car.registration_no, car.image
                FROM test_drives t
                JOIN cars car ON t.car_id = car.id
                WHERE t.customer_id = ?
                ORDER BY t.created_at DESC
            `;
            db.query(query, [decoded.id], (err, results) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(results);
            });
        }
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
});

app.put('/api/test-drives/:id/status', authMiddleware, isAdmin, (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });

    db.query('UPDATE test_drives SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Status updated successfully' });
    });
});

// ============================================================
// ADMIN STAFF & PERMISSIONS API
// ============================================================
app.get('/api/users', authMiddleware, isAdmin, (req, res) => {
    db.query('SELECT id, first_name, last_name, email, role, job_title, permissions, created_at FROM users ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const usersWithPermissions = results.map(u => {
            let perms = [];
            if (u.permissions) {
                try {
                    perms = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions;
                } catch {
                    perms = typeof u.permissions === 'string' ? u.permissions.split(',').map(s => s.trim()) : [];
                }
            }
            return {
                ...u,
                permissions: Array.isArray(perms) ? perms : []
            };
        });
        res.json(usersWithPermissions);
    });
});

app.post('/api/users', authMiddleware, isAdmin, async (req, res) => {
    const { password, permissions, ...rest } = req.body;
    const hashed = password ? await bcrypt.hash(password, 10) : null;
    const permsString = permissions ? (Array.isArray(permissions) ? JSON.stringify(permissions) : String(permissions)) : JSON.stringify([]);
    db.query('INSERT INTO users SET ?', { ...rest, permissions: permsString, password: hashed }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, ...rest, permissions: Array.isArray(permissions) ? permissions : [] });
    });
});

app.put('/api/users/:id', authMiddleware, isAdmin, async (req, res) => {
    const { password, permissions, ...rest } = req.body;
    const updates = { ...rest };
    if (password && password.trim() !== "") {
        updates.password = await bcrypt.hash(password, 10);
    }
    if (permissions !== undefined) {
        updates.permissions = Array.isArray(permissions) ? JSON.stringify(permissions) : String(permissions);
    }
    db.query('UPDATE users SET ? WHERE id = ?', [updates, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User updated successfully' });
    });
});

// Update specific staff member permissions directly
app.put('/api/admin/users/:id/permissions', authMiddleware, isAdmin, (req, res) => {
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) {
        return res.status(400).json({ error: 'Permissions must be an array of module keys' });
    }
    const permsString = JSON.stringify(permissions);
    db.query('UPDATE users SET permissions = ? WHERE id = ?', [permsString, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Permissions updated successfully', permissions });
    });
});

app.delete('/api/users/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User deleted successfully' });
    });
});

// ============================================================
// PROFILE API (Admin Staff)
// ============================================================
app.get('/api/profile', authMiddleware, (req, res) => {
    db.query('SELECT * FROM users WHERE id = ?', [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Profile not found' });
        const u = results[0]; delete u.password;
        let perms = [];
        if (u.permissions) {
            try {
                perms = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions;
            } catch {
                perms = typeof u.permissions === 'string' ? u.permissions.split(',').map(s => s.trim()) : [];
            }
        }
        u.permissions = Array.isArray(perms) ? perms : [];
        res.json(u);
    });
});

app.put('/api/profile', authMiddleware, async (req, res) => {
    const data = { ...req.body };
    delete data.id;
    if (req.user.role !== 'admin') {
        delete data.role;
    }
    if (data.password && data.password.trim() !== "") {
        data.password = await bcrypt.hash(data.password, 10);
    } else {
        delete data.password;
    }
    db.query('UPDATE users SET ? WHERE id = ?', [data, req.user.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profile updated successfully' });
    });
});

// ============================================================
// CALENDAR EVENTS API
// ============================================================
app.get('/api/calendar-events', authMiddleware, (req, res) => {
    db.query('SELECT * FROM calendar_events ORDER BY start_date ASC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/calendar-events', authMiddleware, (req, res) => {
    const { title, start_date, end_date, color, reminder_time, description } = req.body;
    const data = { title, start_date, end_date: end_date || null, color: color || 'Primary', reminder_time: reminder_time || null, description: description || '' };
    db.query('INSERT INTO calendar_events SET ?', data, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, ...data });
    });
});

app.put('/api/calendar-events/:id', authMiddleware, (req, res) => {
    const { title, start_date, end_date, color, reminder_time, description } = req.body;
    const data = { title, start_date, end_date: end_date || null, color: color || 'Primary', reminder_time: reminder_time || null, description: description || '' };
    db.query('UPDATE calendar_events SET ? WHERE id = ?', [data, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Event updated' });
    });
});

app.delete('/api/calendar-events/:id', authMiddleware, (req, res) => {
    db.query('DELETE FROM calendar_events WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Event deleted' });
    });
});

// ============================================================
// LOAN APPLICATIONS
// ============================================================

const loanUploadFields = upload.fields([
    { name: 'pan_card', maxCount: 1 },
    { name: 'aadhar_card', maxCount: 1 },
    { name: 'bank_statement', maxCount: 1 },
    { name: 'salary_slip', maxCount: 1 },
    { name: 'gst_certificate', maxCount: 1 },
    { name: 'gumasta_license', maxCount: 1 },
    { name: 'electricity_bill', maxCount: 1 },
    { name: 'msme_certificate', maxCount: 1 }
]);

app.post('/api/loan-application', customerAuth, loanUploadFields, (req, res) => {
    const { profession_type } = req.body;
    const loanData = {
        customer_id: req.user.id,
        profession_type: req.body.profession_type,
        application_no: `LN-${Math.floor(100000 + Math.random() * 900000)}`,
    };
    
    // Add file paths to loanData
    if (req.files) {
        Object.keys(req.files).forEach(fieldName => {
            loanData[fieldName] = `/uploads/${req.files[fieldName][0].filename}`;
        });
    }

    db.query('INSERT INTO loan_applications SET ?', loanData, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        createNotification('LOAN_APPLICATION', `New loan application: ${loanData.application_no}`, req.user.id, result.insertId);

        // Gallabox WhatsApp Automated Trigger
        db.query('SELECT first_name, last_name, phone FROM customers WHERE id = ?', [req.user.id], (cErr, cRows) => {
            if (!cErr && cRows.length > 0) {
                const cust = cRows[0];
                sendGallaboxWhatsAppNotification('emi_query', cust.phone || req.user.phone, {
                    customer_name: `${cust.first_name || ''} ${cust.last_name || ''}`.trim() || 'Valued Customer',
                    car_name: req.body.car_name || 'Vehicle Loan Application',
                    loan_amount: req.body.loan_amount || '₹5,00,000',
                    monthly_emi: req.body.monthly_emi || '₹9,500'
                });
            }
        });

        res.status(201).json({ 
            message: 'Loan application submitted successfully', 
            id: result.insertId,
            application_no: loanData.application_no
        });
    });
});

app.get('/api/loan-applications', (req, res, next) => {
    // This route needs to handle both admins (staff) and customers.
    // We'll manually check the token here to decide the query.
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        
        // If Admin: show all. If Customer: show own.
        // req.user.role is 'admin' for staff and 'customer' for users.
        const isAdmin = req.user.role === 'admin';
        const query = isAdmin
            ? 'SELECT l.*, c.first_name, c.last_name, c.email, c.phone FROM loan_applications l LEFT JOIN customers c ON l.customer_id = c.id ORDER BY l.created_at DESC'
            : 'SELECT * FROM loan_applications WHERE customer_id = ? ORDER BY created_at DESC';
            
        db.query(query, isAdmin ? [] : [req.user.id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Update loan application status (Admin only)
app.put('/api/loan-applications/:id/status', authMiddleware, isAdmin, (req, res) => {
    const { status } = req.body;
    db.query('UPDATE loan_applications SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Status updated' });
    });
});

// ============================================================
// CAR INSURANCE REQUESTS API
// ============================================================

// Submit Insurance Quote Request (Public or Customer)
app.post('/api/insurance/request', (req, res) => {
    const { vehicle_number, phone, plan_type, customer_id } = req.body;
    if (!vehicle_number || !phone) {
        return res.status(400).json({ message: 'Vehicle number and phone number are required' });
    }

    const cleanVehicle = String(vehicle_number).replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 10);
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);

    if (cleanVehicle.length < 8 || cleanVehicle.length > 10) {
        return res.status(400).json({ message: 'Invalid vehicle registration number format' });
    }
    if (cleanPhone.length !== 10) {
        return res.status(400).json({ message: 'Invalid 10-digit mobile number' });
    }

    // Try to resolve customer_id from token if provided in header
    let resolvedCustomerId = customer_id || null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded && decoded.id) {
                resolvedCustomerId = decoded.id;
            }
        } catch (e) {
            // Non-blocking for public submission
        }
    }

    const requestNo = `INS-${Math.floor(100000 + Math.random() * 900000)}`;

    const insuranceData = {
        request_no: requestNo,
        customer_id: resolvedCustomerId,
        vehicle_number: cleanVehicle,
        phone: cleanPhone,
        plan_type: plan_type || 'Comprehensive Plan',
        status: 'pending'
    };

    db.query('INSERT INTO insurance_requests SET ?', insuranceData, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        createNotification(
            'LEAD',
            `New Insurance Quote Request for vehicle ${cleanVehicle} (${cleanPhone})`,
            resolvedCustomerId,
            result.insertId
        );

        res.status(201).json({
            success: true,
            message: 'Insurance quote request submitted successfully',
            request_no: requestNo,
            id: result.insertId
        });
    });
});

// Get Insurance Requests (Admin / Staff)
app.get('/api/admin/insurance-requests', authMiddleware, isAdmin, (req, res) => {
    const query = `
        SELECT 
            i.*, 
            c.first_name, 
            c.last_name, 
            c.email AS customer_email, 
            c.phone AS customer_phone
        FROM insurance_requests i
        LEFT JOIN customers c ON i.customer_id = c.id
        ORDER BY i.created_at DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Update Insurance Request Status & Notes (Admin / Staff)
app.put('/api/admin/insurance-requests/:id/status', authMiddleware, isAdmin, (req, res) => {
    const { status, notes } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    db.query('UPDATE insurance_requests SET ? WHERE id = ?', [updates, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Insurance request updated successfully' });
    });
});

// Delete Insurance Request (Admin only)
app.delete('/api/admin/insurance-requests/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('DELETE FROM insurance_requests WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Insurance request deleted successfully' });
    });
});

// ============================================================
// CAR BOOKINGS API
// ============================================================
app.post('/api/bookings', customerAuth, (req, res) => {
    const { car_id, final_amount, booking_amount } = req.body;
    if (!car_id || !final_amount) {
        return res.status(400).json({ message: 'Missing car_id or final_amount' });
    }

    const { interested_in_loan } = req.body;

    const bookingData = {
        customer_id: req.user.id,
        car_id,
        booking_amount: booking_amount || 5000,
        final_amount,
        booking_no: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
        payment_status: 'pending',
        booking_status: 'pending',
        interested_in_loan: interested_in_loan ? 1 : 0
    };

    db.query('SELECT status FROM cars WHERE id = ?', [car_id], (carErr, carRows) => {
        if (!carErr && carRows.length > 0 && carRows[0].status === 'coming_soon') {
            return res.status(400).json({ message: 'Car bookings are not available for vehicles with Coming Soon status.' });
        }

        db.query('INSERT INTO bookings SET ?', bookingData, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            createNotification('PAYMENT', `New car booking created: ${bookingData.booking_no}`, req.user.id, result.insertId);

        // Gallabox WhatsApp Automated Trigger
        db.query('SELECT c.first_name, c.last_name, c.phone, car.make, car.model, car.variant, car.year FROM customers c JOIN cars car ON car.id = ? WHERE c.id = ?', [car_id, req.user.id], (cErr, cRows) => {
            if (!cErr && cRows.length > 0) {
                const info = cRows[0];
                sendGallaboxWhatsAppNotification('car_booking', info.phone || req.user.phone, {
                    customer_name: `${info.first_name || ''} ${info.last_name || ''}`.trim() || 'Valued Buyer',
                    car_name: `${info.year || ''} ${info.make || ''} ${info.model || ''} ${info.variant || ''}`.trim(),
                    amount: `₹${Number(bookingData.booking_amount).toLocaleString()}`,
                    booking_id: bookingData.booking_no
                });
            }
             res.status(201).json({ 
                message: 'Booking created successfully', 
                id: result.insertId,
                booking_no: bookingData.booking_no 
            });
        });
    });
});
});

app.get('/api/bookings', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const isAdmin = decoded.role === 'admin';
        
        const query = isAdmin
            ? `SELECT b.*, c.first_name, c.last_name, c.email, c.phone, 
               car.make, car.model, car.year, car.image, car.price, car.fuel_type, 
               car.transmission, car.km, car.ownership, car.reg_state, car.variant, car.registration_no,
               td.location AS test_drive_location, td.date_day AS test_drive_date, 
               td.slot AS test_drive_slot, td.status AS test_drive_status
               FROM bookings b 
               JOIN customers c ON b.customer_id = c.id 
               JOIN cars car ON b.car_id = car.id 
               LEFT JOIN (
                   SELECT customer_id, car_id, location, date_day, slot, status
                   FROM test_drives
                   WHERE (customer_id, car_id, id) IN (
                       SELECT customer_id, car_id, MAX(id)
                       FROM test_drives
                       GROUP BY customer_id, car_id
                   )
               ) td ON td.customer_id = b.customer_id AND td.car_id = b.car_id
               ORDER BY b.created_at DESC`
            : `SELECT b.*, car.make, car.model, car.year, car.image, car.price, car.fuel_type, 
               car.transmission, car.km, car.ownership, car.reg_state, car.variant, car.registration_no,
               td.location AS test_drive_location, td.date_day AS test_drive_date, 
               td.slot AS test_drive_slot, td.status AS test_drive_status
               FROM bookings b 
               JOIN cars car ON b.car_id = car.id 
               LEFT JOIN (
                   SELECT customer_id, car_id, location, date_day, slot, status
                   FROM test_drives
                   WHERE (customer_id, car_id, id) IN (
                       SELECT customer_id, car_id, MAX(id)
                       FROM test_drives
                       GROUP BY customer_id, car_id
                   )
               ) td ON td.customer_id = b.customer_id AND td.car_id = b.car_id
               WHERE b.customer_id = ? 
               ORDER BY b.created_at DESC`;

        db.query(query, isAdmin ? [] : [decoded.id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

app.put('/api/bookings/:id/status', authMiddleware, isAdmin, (req, res) => {
    const { booking_status, payment_status, remaining_payment_mode, remaining_payment_date } = req.body;
    const updateData = {};
    if (booking_status) updateData.booking_status = booking_status;
    if (payment_status) updateData.payment_status = payment_status;
    if (remaining_payment_mode) updateData.remaining_payment_mode = remaining_payment_mode;
    if (remaining_payment_date) updateData.remaining_payment_date = remaining_payment_date;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No status provided' });
    }

    db.query('UPDATE bookings SET ? WHERE id = ?', [updateData, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Booking status updated successfully' });
    });
});

app.get('/api/reports/payments', authMiddleware, isAdmin, (req, res) => {
    const query = `
        SELECT 
            b.booking_no,
            b.created_at as transaction_date,
            b.booking_amount,
            b.final_amount,
            b.payment_status,
            b.booking_status,
            b.remaining_payment_mode,
            b.remaining_payment_date,
            c.first_name,
            c.last_name,
            c.phone,
            car.id as car_id,
            car.make as brand,
            car.model,
            car.registration_no
        FROM bookings b
        JOIN customers c ON b.customer_id = c.id
        JOIN cars car ON b.car_id = car.id
        ORDER BY b.created_at DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/reports/wishlist', authMiddleware, isAdmin, (req, res) => {
    const query = `
        SELECT 
            w.id,
            w.created_at as wishlisted_at,
            c.first_name,
            c.last_name,
            c.phone,
            c.city,
            c.state,
            car.make,
            car.model,
            car.year,
            car.variant,
            car.image,
            car.price,
            car.location as car_location
        FROM wishlists w
        JOIN customers c ON w.customer_id = c.id
        JOIN cars car ON w.car_id = car.id
        ORDER BY w.created_at DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ============================================================
// DASHBOARD API
// ============================================================
app.get('/api/dashboard/stats', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { period, startDate, endDate } = req.query;

        const buildDateClause = (dateCol = 'created_at') => {
            if (!period || period === 'all') return '';
            if (period === 'today') return `WHERE DATE(${dateCol}) = CURRENT_DATE`;
            if (period === '7days') return `WHERE ${dateCol} >= CURRENT_DATE - INTERVAL 7 DAY`;
            if (period === '30days') return `WHERE ${dateCol} >= CURRENT_DATE - INTERVAL 30 DAY`;
            if (period === 'thisMonth') return `WHERE MONTH(${dateCol}) = MONTH(CURRENT_DATE) AND YEAR(${dateCol}) = YEAR(CURRENT_DATE)`;
            if (period === 'custom' && startDate && endDate) {
                return `WHERE ${dateCol} >= '${startDate} 00:00:00' AND ${dateCol} <= '${endDate} 23:59:59'`;
            }
            return '';
        };

        const getCountSafely = async (table, extraCond = "", dateCol = "created_at") => {
            try {
                const dateClause = buildDateClause(dateCol);
                let whereStr = '';
                if (dateClause && extraCond) {
                    whereStr = `${dateClause} AND (${extraCond})`;
                } else if (dateClause) {
                    whereStr = dateClause;
                } else if (extraCond) {
                    whereStr = `WHERE ${extraCond}`;
                }
                const query = `SELECT COUNT(*) AS count FROM ${table} ${whereStr}`;
                const [result] = await queryAsync(query);
                return result ? result.count : 0;
            } catch (err) {
                console.error(`Error querying count for ${table}:`, err.message);
                return 0;
            }
        };

        const customersTotal = await getCountSafely('customers');
        const ordersTotal = await getCountSafely('bookings');
        const carsTotal = await getCountSafely('cars');
        const soldOutTotal = await getCountSafely('cars', "status = 'sold_out'");
        const testDrivesTotal = await getCountSafely('test_drives');
        const wishlistsTotal = await getCountSafely('wishlists');
        const sellRequestsTotal = await getCountSafely('sell_requests');
        const loanApplicationsTotal = await getCountSafely('loan_applications');
        const locationsTotal = await getCountSafely('locations');
        const bannersTotal = await getCountSafely('banners');
        const blogPostsTotal = await getCountSafely('blog_posts');
        const testimonialsTotal = await getCountSafely('video_testimonials');
        const brandsTotal = await getCountSafely('brands');
        const modelsTotal = await getCountSafely('models');
        const staffTotal = await getCountSafely('users');
        const calendarEventsTotal = await getCountSafely('calendar_events');
        
        const [targetRow] = await queryAsync('SELECT target_amount FROM dashboard_targets WHERE id = 1');
        const monthlyTarget = targetRow ? parseFloat(targetRow.target_amount) : 20000;

        const [todayRevData] = await queryAsync('SELECT SUM(booking_amount) AS total FROM bookings WHERE DATE(created_at) = CURRENT_DATE');
        const [monthRevData] = await queryAsync('SELECT SUM(booking_amount) AS total FROM bookings WHERE MONTH(created_at) = MONTH(CURRENT_DATE) AND YEAR(created_at) = YEAR(CURRENT_DATE)');

        const monthlyData = await queryAsync('SELECT MONTH(created_at) as month, COUNT(*) as sales, SUM(booking_amount) as revenue FROM bookings WHERE YEAR(created_at) = YEAR(CURRENT_DATE) GROUP BY month');
        
        const demographics = await queryAsync("SELECT state as location, COUNT(*) as count FROM customers WHERE state IS NOT NULL AND state != '' GROUP BY state ORDER BY count DESC LIMIT 3");
        
        const recentOrders = await queryAsync(`
            SELECT b.id, b.booking_no as orderId, b.booking_status as status, c.make, c.model, c.body_type as category, c.price, c.image 
            FROM bookings b 
            JOIN cars c ON b.car_id = c.id 
            ORDER BY b.created_at DESC 
            LIMIT 5
        `);

        const recentTestDrives = await queryAsync(`
            SELECT t.id, t.status, t.location, t.date_label, t.slot, t.created_at,
                   cu.first_name, cu.last_name, cu.phone,
                   car.make, car.model, car.year, car.image
            FROM test_drives t
            JOIN customers cu ON t.customer_id = cu.id
            JOIN cars car ON t.car_id = car.id
            ORDER BY t.created_at DESC
            LIMIT 5
        `);

        // Format chart data (12 months)
        const salesChart = Array(12).fill(0);
        const revenueChart = Array(12).fill(0);
        monthlyData.forEach(row => {
            if (row.month >= 1 && row.month <= 12) {
                salesChart[row.month - 1] = row.sales;
                revenueChart[row.month - 1] = parseFloat(row.revenue || 0);
            }
        });

        res.json({
            metrics: {
                totalCustomers: customersTotal,
                totalOrders: ordersTotal,
                totalCars: carsTotal,
                soldOutCars: soldOutTotal,
                testDrivesBooked: testDrivesTotal,
                wishlistedCars: wishlistsTotal,
                sellRequests: sellRequestsTotal,
                loanApplications: loanApplicationsTotal,
                locations: locationsTotal,
                banners: bannersTotal,
                blogPosts: blogPostsTotal,
                testimonials: testimonialsTotal,
                brands: brandsTotal,
                models: modelsTotal,
                staff: staffTotal,
                calendarEvents: calendarEventsTotal,
                customersChange: 12.5, // Mocked for UI, could calculate
                ordersChange: 5.2 
            },
            target: {
                monthlyTarget,
                todayRevenue: parseFloat(todayRevData.total || 0),
                monthlyRevenue: parseFloat(monthRevData.total || 0),
                progress: monthlyTarget > 0 ? (parseFloat(monthRevData.total || 0) / monthlyTarget) * 100 : 0
            },
            charts: {
                sales: salesChart,
                revenue: revenueChart
            },
            demographics,
            recentOrders,
            recentTestDrives
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/dashboard/target', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { target } = req.body;
        await queryAsync('INSERT INTO dashboard_targets (id, target_amount) VALUES (1, ?) ON DUPLICATE KEY UPDATE target_amount = ?', [target, target]);
        res.json({ message: 'Monthly target updated successfully', target });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// SITE SETTINGS & PAYMENTS
// ============================================================

const getSetting = (key) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT setting_value FROM site_settings WHERE setting_key = ?', [key], (err, results) => {
            if (err) return reject(err);
            resolve(results.length > 0 ? results[0].setting_value : null);
        });
    });
};

app.get('/api/settings', authMiddleware, isAdmin, (req, res) => {
    db.query('SELECT * FROM site_settings', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/settings', authMiddleware, isAdmin, (req, res) => {
    const settings = req.body; // Expecting { key: value, ... } or [{key, value}, ...]
    
    const entries = Array.isArray(settings) 
        ? settings.map(item => [item.key || item.setting_key, item.value || item.setting_value])
        : Object.entries(settings);

    const queries = entries.map(([key, value]) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT setting_value FROM site_settings WHERE setting_key = ?', [key], (selErr, selRes) => {
                const oldVal = selRes && selRes[0] ? selRes[0].setting_value : null;

                db.query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [key, value, value], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (oldVal && oldVal !== value && typeof oldVal === 'string' && oldVal.startsWith('/uploads/')) {
                            deleteLocalUploadFile(oldVal);
                        }
                        resolve();
                    }
                });
            });
        });
    });

    Promise.all(queries)
        .then(() => res.json({ message: 'Settings updated successfully' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.post('/api/settings/upload', authMiddleware, isAdmin, upload.any(), convertRequestImagesToWebp, async (req, res) => {
    try {
        const files = req.files || [];
        const queries = [];

        for (const file of files) {
            const key = file.fieldname;
            const filePath = `/uploads/${file.filename}`;

            queries.push(new Promise((resolve, reject) => {
                // Find old setting to clean up file if replaced
                db.query('SELECT setting_value FROM site_settings WHERE setting_key = ?', [key], (selErr, selRes) => {
                    const oldVal = selRes && selRes[0] ? selRes[0].setting_value : null;

                    db.query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', 
                    [key, filePath, filePath], (err) => {
                        if (err) {
                            console.error(`DB Query error for key ${key}:`, err);
                            reject(err);
                        } else {
                            if (oldVal && oldVal !== filePath && oldVal.startsWith('/uploads/')) {
                                deleteLocalUploadFile(oldVal);
                            }
                            resolve();
                        }
                    });
                });
            }));
        }

        await Promise.all(queries);
        res.json({ message: 'Site images uploaded and updated successfully' });
    } catch (error) {
        console.error('Site Settings Upload Error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

app.get('/api/settings/public', (req, res) => {
    db.query('SELECT setting_key, setting_value FROM site_settings', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const settings = {};
        if (Array.isArray(results)) {
            results.forEach(row => {
                settings[row.setting_key] = row.setting_value;
            });
        }
        
        res.json({
            ...settings,
            razorpay_key_id: settings.razorpay_key_id || null,
            maintenance_mode: settings.maintenance_mode === 'true',
            maintenance_message: settings.maintenance_message || "We'll be back soon! The site is currently undergoing maintenance.",
            auth_logo: settings.auth_logo || null,
            admin_logo: settings.admin_logo || null,
            admin_logo_dark: settings.admin_logo_dark || null,
            admin_logo_icon: settings.admin_logo_icon || null,
            auth_logo_light: settings.auth_logo_light || null,
            frontend_header_logo: settings.frontend_header_logo || null,
            frontend_footer_logo: settings.frontend_footer_logo || null,
            buy_cars_marquee_text: settings.buy_cars_marquee_text || "MONSOON OFFER: UP TO 45% OFF • FREEBIES ABOVE ₹1,999 • NEW LAUNCH: ZERO COMMISSION • 200-POINT INSPECTED • FAIR PRICED",
            extra_card_title: settings.extra_card_title || "Get a used car loan up to",
            extra_card_value: settings.extra_card_value || "₹35,000,000*",
            extra_card_details: settings.extra_card_details || "Up to zero:Down payment|Starting @10.99%:Interest rate|Up to 84:Months tenure",
            extra_card_btn_text: settings.extra_card_btn_text || "Check loan offer",
            extra_card_btn_link: settings.extra_card_btn_link || "#",
            extra_card_logo_url: settings.extra_card_logo_url || "",
            extra_card_bg_gradient: settings.extra_card_bg_gradient || "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
            extra_card_is_active: settings.extra_card_is_active !== 'false'
        });
    });
});

// Razorpay Order Creation
app.post('/api/payments/create-order', customerAuth, async (req, res) => {
    const { amount, currency = 'INR', receipt } = req.body;

    try {
        const keyId = await getSetting('razorpay_key_id');
        const keySecret = await getSetting('razorpay_key_secret');

        if (!keyId || !keySecret || keyId === 'rzp_test_placeholder') {
            return res.status(400).json({ message: 'Razorpay credentials not configured' });
        }

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        });

        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paise)
            currency,
            receipt: receipt || `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Razorpay Payment Verification
app.post('/api/payments/verify', customerAuth, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;

    try {
        const keySecret = await getSetting('razorpay_key_secret');
        const generated_signature = crypto
            .createHmac('sha256', keySecret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // Payment verified
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
                                    customer_name: `${info.first_name || ''} ${info.last_name || ''}`.trim() || 'Valued Buyer',
                                    car_name: `${info.year || ''} ${info.make || ''} ${info.model || ''} ${info.variant || ''}`.trim(),
                                    amount: `₹${Number(info.booking_amount || 5000).toLocaleString('en-IN')}`,
                                    booking_id: info.booking_no || `BK-${booking_id}`
                                });
                                createNotification('PAYMENT', `Token payment of ₹${Number(info.booking_amount || 5000).toLocaleString('en-IN')} received for booking #${info.booking_no} (${info.make} ${info.model})`, req.user.id, booking_id);
                            }
                        }
                    );

                    // Send email notification asynchronously
                    sendPaymentSuccessEmail(booking_id).catch(console.error);
                }
            );
        } else {
            res.status(400).json({ message: 'Invalid signature' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// EMAIL NOTIFICATIONS
// ============================================================
async function sendPaymentSuccessEmail(bookingId) {
    try {
        const [bookingDetails] = await queryAsync(`
            SELECT b.*, c.email, c.first_name, c.last_name, car.make, car.model, car.year, car.price 
            FROM bookings b 
            JOIN customers c ON b.customer_id = c.id 
            JOIN cars car ON b.car_id = car.id 
            WHERE b.id = ?
        `, [bookingId]);

        if (!bookingDetails) return;

        const smtpHost = await getSetting('smtp_host');
        const smtpPort = await getSetting('smtp_port') || 587;
        const smtpUser = await getSetting('smtp_user');
        const smtpPass = await getSetting('smtp_pass');
        const contactEmail = await getSetting('contact_email') || 'hello@selectt.in';

        if (!smtpHost || !smtpUser || !smtpPass) {
            console.log("SMTP not configured. Skipping email.");
            return;
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort),
            secure: parseInt(smtpPort) === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        const mailOptions = {
            from: '"Selectt Cars" <' + contactEmail + '>',
            to: bookingDetails.email,
            subject: 'Payment Successful - Car Booking Confirmed',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #00A884;">Payment Successful!</h2>
                    <p>Dear ${bookingDetails.first_name} ${bookingDetails.last_name},</p>
                    <p>Thank you for choosing Selectt Cars. We have successfully received your payment.</p>
                    
                    <h3>Booking Details</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Booking ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookingDetails.booking_no}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Transaction ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookingDetails.razorpay_payment_id || 'N/A'}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Amount Paid:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${bookingDetails.booking_amount.toLocaleString()}</td></tr>
                    </table>

                    <h3>Car Details</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Car:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookingDetails.year} ${bookingDetails.make} ${bookingDetails.model}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Final Price:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${bookingDetails.price.toLocaleString()}</td></tr>
                    </table>

                    <p>Our executive will contact you shortly regarding the next steps and delivery process.</p>
                    <p>For any queries, feel free to reply to this email.</p>
                    
                    <p>Best regards,<br>The Selectt Cars Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("Payment success email sent to", bookingDetails.email);
    } catch (error) {
        console.error("Error sending payment success email:", error);
    }
}

// ============================================================
// LOCATIONS API
// ============================================================
app.get('/api/locations', (req, res) => {
    db.query('SELECT * FROM locations ORDER BY is_popular DESC, name ASC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/locations', authMiddleware, isAdmin, (req, res) => {
    const { name, image, is_popular } = req.body;
    if (!name) return res.status(400).json({ message: 'Location name is required' });
    
    const data = { name, image: image || null, is_popular: is_popular || 0 };
    db.query('INSERT INTO locations SET ?', data, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, ...data });
    });
});

app.put('/api/locations/:id', authMiddleware, isAdmin, (req, res) => {
    const { name, image, is_popular } = req.body;
    const data = { name, image, is_popular };
    
    db.query('UPDATE locations SET ? WHERE id = ?', [data, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Location updated successfully' });
    });
});

app.delete('/api/locations/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('DELETE FROM locations WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Location deleted successfully' });
    });
});

// ============================================================
// ADMIN PROFILE & AUTH
// ============================================================

app.post('/api/upload-avatar', authMiddleware, upload.single('avatar'), convertRequestImagesToWebp, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    
    let targetUserId = req.user.id;
    const providedId = req.body.userId || req.query.userId;
    if (providedId) {
        const reqUserId = parseInt(providedId);
        if (reqUserId === req.user.id || req.user.role === 'admin') {
            targetUserId = reqUserId;
        } else {
            return res.status(403).json({ message: 'Unauthorized to update avatar for this user' });
        }
    }
    
    db.query('UPDATE users SET image = ? WHERE id = ?', [imageUrl, targetUserId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Avatar updated successfully', imageUrl });
    });
});

// ImageKit Authentication Endpoint for Client Direct Uploads
app.get('/api/imagekit/auth', (req, res) => {
    try {
        const authParams = getAuthenticationParameters();
        res.json(authParams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/upload', authMiddleware, isAdmin, upload.single('file'), convertRequestImagesToWebp, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const localUrl = `/uploads/${req.file.filename}`;
    const localThumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;
    const ext = path.extname(req.file.filename).toLowerCase();
    const isVideo = ['.mp4', '.mov', '.webm', '.mkv', '.avi'].includes(ext) || (req.file.mimetype && req.file.mimetype.startsWith('video/'));

    // 1. VIDEO UPLOAD: Direct to Bunny.net Stream Video Library
    if (isVideo) {
        try {
            console.log(`[Upload] Uploading video to Bunny Stream: ${req.file.filename} (${(req.file.size / (1024 * 1024)).toFixed(1)} MB)`);
            const filePath = req.file.path;
            const fileBuffer = fs.readFileSync(filePath);
            const bunnyResult = await bunnyStream.createAndUploadVideo({
                title: req.body.title || req.file.originalname || `Vehicle_Video_${Date.now()}`,
                fileBuffer: fileBuffer
            });

            console.log(`[Bunny Stream] Video uploaded successfully! ID: ${bunnyResult.videoId}`);
            return res.json({
                success: true,
                mediaType: 'video',
                provider: 'bunny_stream',
                url: bunnyResult.embedUrl, // Direct iframe embed URL
                embedUrl: bunnyResult.embedUrl,
                hlsUrl: bunnyResult.hlsUrl,
                thumbnailUrl: bunnyResult.thumbnailUrl || localThumbnailUrl,
                videoId: bunnyResult.videoId,
                libraryId: bunnyResult.libraryId
            });
        } catch (bunnyErr) {
            console.error('⚠️ Bunny Stream upload failed, falling back to local/CDN storage:', bunnyErr.message || bunnyErr);
            return res.json({
                success: true,
                mediaType: 'video',
                provider: 'local',
                url: localUrl,
                thumbnailUrl: localThumbnailUrl
            });
        }
    }

    // 2. IMAGE UPLOAD: Direct to ImageKit CDN
    try {
        const filePath = req.file.path;
        const fileBuffer = fs.readFileSync(filePath);
        const ikResult = await uploadToImageKit({
            file: fileBuffer,
            fileName: req.file.filename,
            folder: '/selectt/uploads'
        });

        return res.json({
            success: true,
            mediaType: 'image',
            provider: 'imagekit',
            url: ikResult.url || localUrl,
            thumbnailUrl: ikResult.thumbnailUrl || ikResult.url || localThumbnailUrl,
            fileId: ikResult.fileId,
            name: ikResult.name
        });
    } catch (ikErr) {
        console.warn('⚠️ ImageKit upload fallback to local storage:', ikErr.message);
        return res.json({
            success: true,
            mediaType: 'image',
            provider: 'local',
            url: localUrl,
            thumbnailUrl: localThumbnailUrl
        });
    }
});

app.get('/api/media', authMiddleware, isAdmin, (req, res) => {
    const dirPath = path.join(__dirname, 'public/uploads');
    
    // Ensure the uploads directory exists
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.readdir(dirPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to scan uploads directory' });
        }
        const mediaExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.mp4', '.mov', '.webm', '.pdf'];
        
        // Map files with extra stats like file size and date uploaded
        const mediaFiles = [];
        files.forEach(file => {
            const ext = path.extname(file).toLowerCase();
            if (mediaExtensions.includes(ext)) {
                const filePath = path.join(dirPath, file);
                const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext);
                const isVideo = ['.mp4', '.mov', '.webm'].includes(ext);
                
                if (isImage) {
                    generateThumbnail(file).catch(() => {});
                }

                try {
                    const stats = fs.statSync(filePath);
                    mediaFiles.push({
                        url: `/uploads/${file}`,
                        filename: file,
                        thumbnailUrl: isImage ? `/uploads/thumbnails/${file}` : `/uploads/${file}`,
                        size: stats.size,
                        createdAt: stats.birthtime || stats.mtime,
                        type: isImage ? 'image' : (isVideo ? 'video' : 'document')
                    });
                } catch (e) {
                    mediaFiles.push({
                        url: `/uploads/${file}`,
                        filename: file,
                        thumbnailUrl: `/uploads/${file}`,
                        size: 0,
                        createdAt: new Date(),
                        type: isImage ? 'image' : (isVideo ? 'video' : 'document')
                    });
                }
            }
        });
        
        // Sort files by creation date (newest first)
        mediaFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        db.query('SELECT * FROM media_alt_tags', (dbErr, dbResults) => {
            const altMap = {};
            if (!dbErr && Array.isArray(dbResults)) {
                dbResults.forEach(row => {
                    altMap[row.file_path] = row.alt_text;
                    const bName = path.basename(row.file_path);
                    altMap[`/uploads/${bName}`] = row.alt_text;
                });
            }
            const altStore = readAltStore();
            const results = mediaFiles.map(f => ({
                ...f,
                alt: altMap[f.url] || altStore[f.url] || ""
            }));
            res.json(results);
        });
    });
});

app.post('/api/media/alt', authMiddleware, isAdmin, (req, res) => {
    const { filePath, altText } = req.body;
    if (!filePath) return res.status(400).json({ message: 'filePath is required' });
    const text = altText || "";
    db.query(
        'INSERT INTO media_alt_tags (file_path, alt_text) VALUES (?, ?) ON DUPLICATE KEY UPDATE alt_text = ?',
        [filePath, text, text],
        (err) => {
            if (err) console.error('Error saving alt tag:', err.message);
        }
    );
    const altStore = readAltStore();
    altStore[filePath] = text;
    writeAltStore(altStore);
    res.json({ success: true, message: 'Alt text updated successfully', alt: text });
});

app.delete('/api/media', authMiddleware, isAdmin, (req, res) => {
    const filePath = req.query.filePath || req.body.filePath;
    if (!filePath) return res.status(400).json({ message: 'filePath is required' });
    
    deleteLocalUploadFile(filePath);
    res.json({ message: 'Media deleted successfully' });
});

app.post('/api/media/bulk-delete', authMiddleware, isAdmin, (req, res) => {
    const { filePaths } = req.body;
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
        return res.status(400).json({ message: 'filePaths array is required' });
    }
    filePaths.forEach(fp => deleteLocalUploadFile(fp));
    res.json({ success: true, message: `Successfully deleted ${filePaths.length} file(s)`, count: filePaths.length });
});

// NOTE: /api/profile GET and PUT are defined above (lines ~1394-1418)
// Duplicate definitions removed to avoid dead code

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid email or password' });

        const user = results[0];
        let isMatch = false;
        // SEC-002 FIX: Only use bcrypt comparison — removed plaintext password fallback
        try { isMatch = await bcrypt.compare(password, user.password); } catch {}
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

        let permissions = [];
        if (user.permissions) {
            try {
                permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
            } catch {
                permissions = typeof user.permissions === 'string' ? user.permissions.split(',').map(s => s.trim()) : [];
            }
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, permissions }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role, image: user.image, permissions: Array.isArray(permissions) ? permissions : [] } });
    });
});

// ==================== BANNER MANAGEMENT ====================

// Public: Get banners by page (home, buy-cars) and optionally type
app.get('/api/banners', (req, res) => {
    const { page, type } = req.query;
    let q = 'SELECT * FROM banners WHERE is_active = 1';
    const params = [];
    if (page) { q += ' AND page = ?'; params.push(page); }
    if (type) { q += ' AND type = ?'; params.push(type); }
    q += ' ORDER BY sort_order ASC, id ASC';
    db.query(q, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Admin: Get all banners
app.get('/api/admin/banners', authMiddleware, isAdmin, (req, res) => {
    db.query('SELECT * FROM banners ORDER BY page, sort_order ASC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Admin: Create banner (with optional image upload)
const bannerUpload = multer({ storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, `banner_${Date.now()}_${file.originalname.replace(/\s/g,'_')}`)
}) });

app.post('/api/admin/banners', authMiddleware, isAdmin, bannerUpload.single('image'), convertRequestImagesToWebp, (req, res) => {
    const { page, type, title, subtitle, cta_text, cta_link, sort_order, image_url, flip_image } = req.body;
    const img = req.file ? `/uploads/${req.file.filename}` : (image_url || null);
    if (!page || !type) return res.status(400).json({ message: 'page and type are required' });
    db.query(
        'INSERT INTO banners (page, type, title, subtitle, cta_text, cta_link, image_url, sort_order, flip_image) VALUES (?,?,?,?,?,?,?,?,?)',
        [page, type, title, subtitle, cta_text, cta_link, img, sort_order || 0, flip_image !== undefined ? Number(flip_image) : 0],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, message: 'Banner created' });
        }
    );
});

// Admin: Update banner
app.put('/api/admin/banners/:id', authMiddleware, isAdmin, bannerUpload.single('image'), convertRequestImagesToWebp, (req, res) => {
    const { id } = req.params;
    const { page, type, title, subtitle, cta_text, cta_link, sort_order, is_active, image_url, flip_image } = req.body;
    const img = req.file ? `/uploads/${req.file.filename}` : (image_url || null);
    const updates = { page, type, title, subtitle, cta_text, cta_link, sort_order, is_active };
    if (img) updates.image_url = img;
    if (flip_image !== undefined) updates.flip_image = flip_image ? Number(flip_image) : 0;

    db.query('SELECT image_url FROM banners WHERE id = ?', [id], (findErr, findRes) => {
        const oldImg = findRes && findRes[0] ? findRes[0].image_url : null;
        db.query('UPDATE banners SET ? WHERE id = ?', [updates, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            if (oldImg && img && oldImg !== img) {
                deleteLocalUploadFile(oldImg);
            }
            res.json({ message: 'Banner updated' });
        });
    });
});

// Admin: Delete banner
app.delete('/api/admin/banners/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('SELECT image_url FROM banners WHERE id = ?', [req.params.id], (findErr, findRes) => {
        const oldImg = findRes && findRes[0] ? findRes[0].image_url : null;
        db.query('DELETE FROM banners WHERE id = ?', [req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            if (oldImg) deleteLocalUploadFile(oldImg);
            res.json({ message: 'Banner deleted' });
        });
    });
});

// ==================== SITE CONTENT (KV store for mobile hero, sell section etc.) ====================

// Public: get all site content or by key
app.get('/api/site-content', (req, res) => {
    const { key } = req.query;
    if (key) {
        db.query('SELECT * FROM site_content WHERE content_key = ?', [key], (err, r) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(r[0] || null);
        });
    } else {
        db.query('SELECT * FROM site_content', (err, r) => {
            if (err) return res.status(500).json({ error: err.message });
            // Return as key-value map
            const map = {};
            r.forEach(row => { map[row.content_key] = row.content_value; });
            res.json(map);
        });
    }
});

// Admin: update or insert site content
app.put('/api/admin/site-content', authMiddleware, isAdmin, bannerUpload.single('file'), convertRequestImagesToWebp, (req, res) => {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ message: 'key is required' });
    const val = req.file ? `/uploads/${req.file.filename}` : value;

    db.query('SELECT content_value FROM site_content WHERE content_key = ?', [key], (findErr, findRes) => {
        const oldVal = findRes && findRes[0] ? findRes[0].content_value : null;

        db.query(
            'INSERT INTO site_content (content_key, content_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE content_value = ?',
            [key, val, val],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });
                if (oldVal && val && oldVal !== val && oldVal.startsWith('/uploads/')) {
                    deleteLocalUploadFile(oldVal);
                }
                res.json({ message: 'Content updated', value: val });
            }
        );
    });
});

// Admin: delete site content by key
app.delete('/api/admin/site-content/:key', authMiddleware, isAdmin, (req, res) => {
    const { key } = req.params;
    if (!key) return res.status(400).json({ message: 'key is required' });

    db.query('SELECT content_value FROM site_content WHERE content_key = ?', [key], (findErr, findRes) => {
        const oldVal = findRes && findRes[0] ? findRes[0].content_value : null;
        db.query('DELETE FROM site_content WHERE content_key = ?', [key], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            if (oldVal && oldVal.startsWith('/uploads/')) {
                deleteLocalUploadFile(oldVal);
            }
            res.json({ message: 'Content removed successfully' });
        });
    });
});

// ==================== VIDEO TESTIMONIALS ====================

// Public: get active video testimonials
app.get('/api/video-testimonials', (req, res) => {
    db.query('SELECT * FROM video_testimonials WHERE is_active = 1 ORDER BY sort_order ASC, id ASC', (err, r) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(r);
    });
});

// Admin: get all video testimonials
app.get('/api/admin/video-testimonials', authMiddleware, isAdmin, (req, res) => {
    db.query('SELECT * FROM video_testimonials ORDER BY sort_order ASC', (err, r) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(r);
    });
});

// Admin: create video testimonial
app.post('/api/admin/video-testimonials', authMiddleware, isAdmin, bannerUpload.fields([
    { name: 'video', maxCount: 1 }, { name: 'poster', maxCount: 1 }
]), convertRequestImagesToWebp, (req, res) => {
    const { name, location, testimony, sort_order, video_url, poster_url } = req.body;
    const vid = req.files?.video?.[0] ? `/uploads/${req.files.video[0].filename}` : (video_url || null);
    const pos = req.files?.poster?.[0] ? `/uploads/${req.files.poster[0].filename}` : (poster_url || null);
    db.query(
        'INSERT INTO video_testimonials (video_url, poster_url, name, location, testimony, sort_order) VALUES (?,?,?,?,?,?)',
        [vid, pos, name, location, testimony, sort_order || 0],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: result.insertId, message: 'Testimonial created' });
        }
    );
});

// Admin: update video testimonial
app.put('/api/admin/video-testimonials/:id', authMiddleware, isAdmin, bannerUpload.fields([
    { name: 'video', maxCount: 1 }, { name: 'poster', maxCount: 1 }
]), convertRequestImagesToWebp, (req, res) => {
    const { id } = req.params;
    const { name, location, testimony, sort_order, is_active, video_url, poster_url } = req.body;
    const updates = { name, location, testimony, sort_order, is_active };
    const vid = req.files?.video?.[0] ? `/uploads/${req.files.video[0].filename}` : (video_url || null);
    const pos = req.files?.poster?.[0] ? `/uploads/${req.files.poster[0].filename}` : (poster_url || null);
    if (vid) updates.video_url = vid;
    if (pos) updates.poster_url = pos;

    db.query('SELECT video_url, poster_url FROM video_testimonials WHERE id = ?', [id], (findErr, findRes) => {
        const oldRow = findRes && findRes[0] ? findRes[0] : {};
        db.query('UPDATE video_testimonials SET ? WHERE id = ?', [updates, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            if (vid && oldRow.video_url && oldRow.video_url !== vid) {
                deleteLocalUploadFile(oldRow.video_url);
            }
            if (pos && oldRow.poster_url && oldRow.poster_url !== pos) {
                deleteLocalUploadFile(oldRow.poster_url);
            }
            res.json({ message: 'Testimonial updated' });
        });
    });
});

// Admin: delete video testimonial
app.delete('/api/admin/video-testimonials/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('SELECT video_url, poster_url FROM video_testimonials WHERE id = ?', [req.params.id], (findErr, findRes) => {
        const oldRow = findRes && findRes[0] ? findRes[0] : {};
        db.query('DELETE FROM video_testimonials WHERE id = ?', [req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            if (oldRow.video_url) deleteLocalUploadFile(oldRow.video_url);
            if (oldRow.poster_url) deleteLocalUploadFile(oldRow.poster_url);
            res.json({ message: 'Testimonial deleted' });
        });
    });
});

// ==================== BLOG MANAGEMENT ====================

// Public: Get all categories
app.get('/api/blog/categories', (req, res) => {
    db.query('SELECT *, (SELECT COUNT(*) FROM blog_post_categories bpc JOIN blog_posts bp ON bpc.post_id = bp.id WHERE bpc.category_id = blog_categories.id AND bp.status = "published") as post_count FROM blog_categories ORDER BY name', (err, r) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(r);
    });
});

// Public: Get all tags
app.get('/api/blog/tags', (req, res) => {
    db.query('SELECT *, (SELECT COUNT(*) FROM blog_post_tags bpt JOIN blog_posts bp ON bpt.post_id = bp.id WHERE bpt.tag_id = blog_tags.id AND bp.status = "published") as post_count FROM blog_tags ORDER BY name', (err, r) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(r);
    });
});

// Public: Get published posts (paginated)
app.get('/api/blog/posts', (req, res) => {
    const { page = 1, limit = 10, category, tag, search } = req.query;
    const offset = (page - 1) * limit;
    let q = `SELECT bp.*, u.first_name, u.last_name,
        (SELECT GROUP_CONCAT(bc.name SEPARATOR ',') FROM blog_post_categories bpc JOIN blog_categories bc ON bpc.category_id = bc.id WHERE bpc.post_id = bp.id) as categories,
        (SELECT GROUP_CONCAT(bc.slug SEPARATOR ',') FROM blog_post_categories bpc JOIN blog_categories bc ON bpc.category_id = bc.id WHERE bpc.post_id = bp.id) as category_slugs,
        (SELECT GROUP_CONCAT(bt.name SEPARATOR ',') FROM blog_post_tags bpt JOIN blog_tags bt ON bpt.tag_id = bt.id WHERE bpt.post_id = bp.id) as tags
        FROM blog_posts bp LEFT JOIN users u ON bp.author_id = u.id
        WHERE bp.status = 'published'`;
    const params = [];
    if (category) { q += ` AND EXISTS (SELECT 1 FROM blog_post_categories bpc JOIN blog_categories bc ON bpc.category_id = bc.id WHERE bpc.post_id = bp.id AND bc.slug = ?)`; params.push(category); }
    if (tag) { q += ` AND EXISTS (SELECT 1 FROM blog_post_tags bpt JOIN blog_tags bt ON bpt.tag_id = bt.id WHERE bpt.post_id = bp.id AND bt.slug = ?)`; params.push(tag); }
    if (search) { q += ` AND (bp.title LIKE ? OR bp.excerpt LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
    q += ` ORDER BY bp.published_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    db.query(q, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        db.query(`SELECT COUNT(*) as total FROM blog_posts WHERE status = 'published'`, (err2, count) => {
            res.json({ posts: rows, total: count?.[0]?.total || 0, page: parseInt(page), limit: parseInt(limit) });
        });
    });
});

// Public: Get single post by slug
app.get('/api/blog/posts/:slug', (req, res) => {
    const q = `SELECT bp.*, u.first_name, u.last_name,
        (SELECT GROUP_CONCAT(bc.name SEPARATOR ',') FROM blog_post_categories bpc JOIN blog_categories bc ON bpc.category_id = bc.id WHERE bpc.post_id = bp.id) as categories,
        (SELECT GROUP_CONCAT(bc.slug SEPARATOR ',') FROM blog_post_categories bpc JOIN blog_categories bc ON bpc.category_id = bc.id WHERE bpc.post_id = bp.id) as category_slugs,
        (SELECT GROUP_CONCAT(bt.name SEPARATOR ',') FROM blog_post_tags bpt JOIN blog_tags bt ON bpt.tag_id = bt.id WHERE bpt.post_id = bp.id) as tags
        FROM blog_posts bp LEFT JOIN users u ON bp.author_id = u.id
        WHERE bp.slug = ? AND bp.status = 'published'`;
    db.query(q, [req.params.slug], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows.length) return res.status(404).json({ message: 'Post not found' });
        // Get related posts
        db.query(`SELECT bp.id, bp.title, bp.slug, bp.featured_image, bp.published_at, bp.excerpt,
            (SELECT GROUP_CONCAT(bc.name SEPARATOR ',') FROM blog_post_categories bpc JOIN blog_categories bc ON bpc.category_id = bc.id WHERE bpc.post_id = bp.id) as categories,
            (SELECT GROUP_CONCAT(bc.slug SEPARATOR ',') FROM blog_post_categories bpc JOIN blog_categories bc ON bpc.category_id = bc.id WHERE bpc.post_id = bp.id) as category_slugs
            FROM blog_posts bp WHERE bp.status='published' AND bp.id != ? ORDER BY bp.published_at DESC LIMIT 6`, [rows[0].id], (err2, related) => {
            res.json({ post: rows[0], related: related || [] });
        });
    });
});

// Admin: Get all posts (any status)
app.get('/api/admin/blog/posts', authMiddleware, isAdmin, (req, res) => {
    const q = `SELECT bp.id, bp.title, bp.slug, bp.status, bp.featured_image, bp.created_at, bp.updated_at, bp.published_at,
        u.first_name, u.last_name,
        (SELECT GROUP_CONCAT(bc.name SEPARATOR ', ') FROM blog_post_categories bpc JOIN blog_categories bc ON bpc.category_id = bc.id WHERE bpc.post_id = bp.id) as categories
        FROM blog_posts bp LEFT JOIN users u ON bp.author_id = u.id ORDER BY bp.updated_at DESC`;
    db.query(q, (err, r) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(r);
    });
});

// Admin: Get single post for editing
app.get('/api/admin/blog/posts/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('SELECT * FROM blog_posts WHERE id = ?', [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows.length) return res.status(404).json({ message: 'Not found' });
        // Get categories and tags
        db.query('SELECT category_id FROM blog_post_categories WHERE post_id = ?', [req.params.id], (e2, cats) => {
            db.query('SELECT tag_id FROM blog_post_tags WHERE post_id = ?', [req.params.id], (e3, tgs) => {
                res.json({ ...rows[0], category_ids: cats.map(c => c.category_id), tag_ids: tgs.map(t => t.tag_id) });
            });
        });
    });
});

// Admin: Create post
app.post('/api/admin/blog/posts', authMiddleware, isAdmin, bannerUpload.single('featured_image'), convertRequestImagesToWebp, (req, res) => {
    const { title, slug, content, excerpt, video_url, video_type, status, meta_title, meta_description, published_at, category_ids, tag_ids, image_url } = req.body;
    const img = req.file ? `/uploads/${req.file.filename}` : (image_url || null);
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    db.query(
        'INSERT INTO blog_posts (title, slug, content, excerpt, featured_image, video_url, video_type, status, meta_title, meta_description, author_id, published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        [title, finalSlug, content, excerpt, img, video_url, video_type || 'youtube', status || 'draft', meta_title || title, meta_description || excerpt, req.user.id, status === 'published' ? (published_at || new Date()) : published_at],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            const postId = result.insertId;
            // Insert categories
            if (category_ids) {
                const cats = (Array.isArray(category_ids) ? category_ids : [category_ids]).map(cid => [postId, parseInt(cid)]);
                if (cats.length) db.query('INSERT IGNORE INTO blog_post_categories (post_id, category_id) VALUES ?', [cats], () => {});
            }
            // Insert tags
            if (tag_ids) {
                const tags = (Array.isArray(tag_ids) ? tag_ids : [tag_ids]).map(tid => [postId, parseInt(tid)]);
                if (tags.length) db.query('INSERT IGNORE INTO blog_post_tags (post_id, tag_id) VALUES ?', [tags], () => {});
            }
            res.status(201).json({ id: postId, slug: finalSlug, message: 'Post created' });
        }
    );
});

// Admin: Update post
app.put('/api/admin/blog/posts/:id', authMiddleware, isAdmin, bannerUpload.single('featured_image'), convertRequestImagesToWebp, (req, res) => {
    const { id } = req.params;
    const { title, slug, content, excerpt, video_url, video_type, status, meta_title, meta_description, published_at, category_ids, tag_ids, image_url } = req.body;
    const img = req.file ? `/uploads/${req.file.filename}` : (image_url || null);
    const updates = { title, slug, content, excerpt, video_url, video_type, status, meta_title, meta_description };
    if (img) updates.featured_image = img;
    if (status === 'published' && !updates.published_at) updates.published_at = published_at || new Date();
    db.query('UPDATE blog_posts SET ? WHERE id = ?', [updates, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        // Sync categories
        db.query('DELETE FROM blog_post_categories WHERE post_id = ?', [id], () => {
            if (category_ids) {
                const cats = (Array.isArray(category_ids) ? category_ids : [category_ids]).map(cid => [parseInt(id), parseInt(cid)]);
                if (cats.length) db.query('INSERT IGNORE INTO blog_post_categories (post_id, category_id) VALUES ?', [cats], () => {});
            }
        });
        // Sync tags
        db.query('DELETE FROM blog_post_tags WHERE post_id = ?', [id], () => {
            if (tag_ids) {
                const tags = (Array.isArray(tag_ids) ? tag_ids : [tag_ids]).map(tid => [parseInt(id), parseInt(tid)]);
                if (tags.length) db.query('INSERT IGNORE INTO blog_post_tags (post_id, tag_id) VALUES ?', [tags], () => {});
            }
        });
        res.json({ message: 'Post updated' });
    });
});

// Admin: Delete post
app.delete('/api/admin/blog/posts/:id', authMiddleware, isAdmin, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM blog_post_categories WHERE post_id = ?', [id], () => {});
    db.query('DELETE FROM blog_post_tags WHERE post_id = ?', [id], () => {});
    db.query('DELETE FROM blog_posts WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Post deleted' });
    });
});

// Admin: CRUD categories
app.post('/api/admin/blog/categories', authMiddleware, isAdmin, (req, res) => {
    const { name, slug, description } = req.body;
    const s = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    db.query('INSERT INTO blog_categories (name, slug, description) VALUES (?,?,?)', [name, s, description], (err, r) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: r.insertId, message: 'Category created' });
    });
});
app.delete('/api/admin/blog/categories/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('DELETE FROM blog_categories WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Category deleted' });
    });
});

// Admin: CRUD tags
app.post('/api/admin/blog/tags', authMiddleware, isAdmin, (req, res) => {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    db.query('INSERT IGNORE INTO blog_tags (name, slug) VALUES (?,?)', [name, slug], (err, r) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: r.insertId, message: 'Tag created' });
    });
});
app.delete('/api/admin/blog/tags/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('DELETE FROM blog_tags WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Tag deleted' });
    });
});

// ============================================================
// BRANDS & MODELS API
// ============================================================

// Public: Get all brands with their models and variants
app.get('/api/brands', (req, res) => {
    db.query('SELECT * FROM brands ORDER BY name ASC', (err, brands) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.query('SELECT * FROM models ORDER BY name ASC', (err, models) => {
            if (err) return res.status(500).json({ error: err.message });
            
            db.query('SELECT * FROM variants ORDER BY name ASC', (err, variants) => {
                const varList = err ? [] : (variants || []);
                const brandsWithModels = brands.map(b => ({
                    id: b.id,
                    name: b.name,
                    logo_url: b.logo_url,
                    models: models.filter(m => m.brand_id === b.id).map(m => ({
                        id: m.id,
                        brand_id: m.brand_id,
                        name: m.name,
                        variants: varList.filter(v => v.model_id === m.id).map(v => ({ id: v.id, model_id: v.model_id, name: v.name }))
                    }))
                }));
                
                res.json(brandsWithModels);
            });
        });
    });
});

// Public: Get models (optionally filtered by ?brand_id=...)
app.get(['/api/models', '/api/car-models'], (req, res) => {
    let query = 'SELECT m.*, b.name as brand_name FROM models m LEFT JOIN brands b ON m.brand_id = b.id';
    let params = [];
    if (req.query.brand_id) {
        query += ' WHERE m.brand_id = ?';
        params.push(req.query.brand_id);
    }
    query += ' ORDER BY m.name ASC';
    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Admin: Add a brand
app.post('/api/admin/brands', authMiddleware, isAdmin, upload.single('logo'), convertRequestImagesToWebp, (req, res) => {
    const { name } = req.body;
    let logo_url = req.body.logo_url || null; // Support sending URL directly
    if (req.file) {
        logo_url = `/uploads/${req.file.filename}`;
    }
    
    db.query('INSERT INTO brands (name, logo_url) VALUES (?, ?)', [name, logo_url], (err, r) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: r.insertId, name, logo_url, message: 'Brand created successfully' });
    });
});

// Admin: Edit a brand
app.put('/api/admin/brands/:id', authMiddleware, isAdmin, upload.single('logo'), convertRequestImagesToWebp, (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    
    let query = 'UPDATE brands SET name = ?';
    let params = [name];
    
    // Support URL direct strings or File uploads
    if (req.file) {
        query += ', logo_url = ?';
        params.push(`/uploads/${req.file.filename}`);
    } else if (req.body.logo_url) {
        query += ', logo_url = ?';
        params.push(req.body.logo_url);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    db.query(query, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Brand updated successfully' });
    });
});

// Admin: Delete a brand
app.delete('/api/admin/brands/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('DELETE FROM brands WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Brand deleted successfully' });
    });
});

// Admin: Add a model
app.post('/api/admin/models', authMiddleware, isAdmin, (req, res) => {
    const { brand_id, name } = req.body;
    db.query('INSERT INTO models (brand_id, name) VALUES (?, ?)', [brand_id, name], (err, r) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: r.insertId, brand_id, name, message: 'Model created successfully' });
    });
});

// Admin: Edit a model
app.put('/api/admin/models/:id', authMiddleware, isAdmin, (req, res) => {
    const { name } = req.body;
    db.query('UPDATE models SET name = ? WHERE id = ?', [name, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Model updated successfully' });
    });
});

// Admin: Delete a model
app.delete('/api/admin/models/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('DELETE FROM models WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Model deleted successfully' });
    });
});

// Admin: Add a variant
app.post('/api/admin/variants', authMiddleware, isAdmin, (req, res) => {
    const { model_id, name } = req.body;
    db.query('INSERT INTO variants (model_id, name) VALUES (?, ?)', [model_id, name], (err, r) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: r.insertId, model_id, name, message: 'Variant created successfully' });
    });
});

// Admin: Edit a variant
app.put('/api/admin/variants/:id', authMiddleware, isAdmin, (req, res) => {
    const { name } = req.body;
    db.query('UPDATE variants SET name = ? WHERE id = ?', [name, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Variant updated successfully' });
    });
});

// Admin: Delete a variant
app.delete('/api/admin/variants/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('DELETE FROM variants WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Variant deleted successfully' });
    });
});

// Admin: Bulk Import Brands, Models & Variants via CSV
app.post('/api/admin/brands/import-csv', authMiddleware, isAdmin, async (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'No CSV data provided' });
    }

    let brandsAdded = 0;
    let modelsAdded = 0;
    let variantsAdded = 0;
    let totalProcessed = 0;

    const promiseQuery = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    };

    try {
        for (const item of items) {
            const brandName = (item.brand || item.Brand || item.make || item.Make || '').toString().trim();
            const modelName = (item.model || item.Model || '').toString().trim();
            const variantName = (item.variant || item.Variant || '').toString().trim();
            const logoUrl = (item.logo_url || item.logo || item.Logo || item.Logo_URL || item.logo_path || '').toString().trim();

            if (!brandName) continue;
            totalProcessed++;

            // 1. Find or create brand
            let brandRows = await promiseQuery('SELECT id, logo_url FROM brands WHERE LOWER(name) = LOWER(?) LIMIT 1', [brandName]);
            let brandId;

            if (brandRows.length === 0) {
                const brandInsert = await promiseQuery('INSERT INTO brands (name, logo_url) VALUES (?, ?)', [brandName, logoUrl || null]);
                brandId = brandInsert.insertId;
                brandsAdded++;
            } else {
                brandId = brandRows[0].id;
                if (logoUrl && !brandRows[0].logo_url) {
                    await promiseQuery('UPDATE brands SET logo_url = ? WHERE id = ?', [logoUrl, brandId]);
                }
            }

            // 2. Find or create model (if modelName provided)
            let modelId = null;
            if (modelName) {
                let modelRows = await promiseQuery('SELECT id FROM models WHERE brand_id = ? AND LOWER(name) = LOWER(?) LIMIT 1', [brandId, modelName]);
                if (modelRows.length === 0) {
                    const modelInsert = await promiseQuery('INSERT INTO models (brand_id, name) VALUES (?, ?)', [brandId, modelName]);
                    modelId = modelInsert.insertId;
                    modelsAdded++;
                } else {
                    modelId = modelRows[0].id;
                }
            }

            // 3. Find or create variant (if variantName provided and model exists)
            if (modelId && variantName) {
                let variantRows = await promiseQuery('SELECT id FROM variants WHERE model_id = ? AND LOWER(name) = LOWER(?) LIMIT 1', [modelId, variantName]);
                if (variantRows.length === 0) {
                    await promiseQuery('INSERT INTO variants (model_id, name) VALUES (?, ?)', [modelId, variantName]);
                    variantsAdded++;
                }
            }
        }

        res.json({
            success: true,
            message: `Successfully processed ${totalProcessed} records (${brandsAdded} new brands, ${modelsAdded} new models, ${variantsAdded} new variants).`,
            stats: {
                totalProcessed,
                brandsAdded,
                modelsAdded,
                variantsAdded
            }
        });
    } catch (err) {
        console.error('CSV Import Error:', err);
        res.status(500).json({ success: false, message: 'Failed to import CSV: ' + err.message });
    }
});


// ============================================================
// Customer Reviews API
// ============================================================
app.get('/api/customer-reviews', (req, res) => {
    const { type, category } = req.query;
    let query = 'SELECT * FROM customer_reviews';
    const params = [];
    const conditions = [];
    
    if (type) {
        conditions.push('review_type = ?');
        params.push(type);
    }
    if (category && category !== 'All Reviews') {
        conditions.push('category = ?');
        params.push(category);
    }
    
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/admin/customer-reviews', authMiddleware, isAdmin, (req, res) => {
    const { name, review_date, location, rating, review_text, review_type, category } = req.body;
    if (!name || !review_date || !location || !rating || !review_text) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const query = 'INSERT INTO customer_reviews (name, review_date, location, rating, review_text, review_type, category) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name, review_date, location, rating, review_text, review_type || 'buyer', category || 'All Reviews'], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, message: 'Review added successfully' });
    });
});

app.put('/api/admin/customer-reviews/:id', authMiddleware, isAdmin, (req, res) => {
    const { name, review_date, location, rating, review_text, review_type, category } = req.body;
    if (!name || !review_date || !location || !rating || !review_text) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const query = 'UPDATE customer_reviews SET name = ?, review_date = ?, location = ?, rating = ?, review_text = ?, review_type = ?, category = ? WHERE id = ?';
    db.query(query, [name, review_date, location, rating, review_text, review_type, category, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Review updated successfully' });
    });
});

app.delete('/api/admin/customer-reviews/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('DELETE FROM customer_reviews WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Review deleted successfully' });
    });
});

// ============================================================
// Car Hub Locations API
// ============================================================
// Ensure phone column exists
db.query("ALTER TABLE car_hub_locations ADD COLUMN phone VARCHAR(50) DEFAULT NULL", (err) => {
    if (err && !err.message.includes("Duplicate column name")) {
        // Ignored if column already exists
    }
});

app.get(['/api/car-hub-locations', '/api/car-hubs', '/api/hubs'], (req, res) => {
    db.query('SELECT * FROM car_hub_locations ORDER BY city ASC, name ASC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/admin/car-hub-locations', authMiddleware, isAdmin, (req, res) => {
    const { name, city, address, open_hours, image_path, car_count, phone } = req.body;
    if (!name || !city || !address) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const query = 'INSERT INTO car_hub_locations (name, city, address, open_hours, image_path, car_count, phone) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name, city, address, open_hours || '10am - 8pm (Mon - Sun)', image_path || null, car_count || 0, phone || null], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, message: 'Car Hub added successfully' });
    });
});

app.put('/api/admin/car-hub-locations/:id', authMiddleware, isAdmin, (req, res) => {
    const { name, city, address, open_hours, image_path, car_count, phone } = req.body;
    if (!name || !city || !address) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const query = 'UPDATE car_hub_locations SET name = ?, city = ?, address = ?, open_hours = ?, image_path = ?, car_count = ?, phone = ? WHERE id = ?';
    db.query(query, [name, city, address, open_hours, image_path, car_count, phone || null, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Car Hub updated successfully' });
    });
});

app.delete('/api/admin/car-hub-locations/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('DELETE FROM car_hub_locations WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Car Hub deleted successfully' });
    });
});

// Ensure autoplay column exists
db.query("ALTER TABLE video_testimonials ADD COLUMN autoplay TINYINT(1) DEFAULT 1 AFTER sort_order", (err) => {
    if (err && !err.message.includes("Duplicate column name")) {
        // Ignored if column already exists
    }
    db.query("UPDATE video_testimonials SET autoplay = 1 WHERE autoplay IS NULL", () => {});
});

// ============================================================
// Bunny Stream Video Management API
// ============================================================
app.post('/api/admin/videos/upload-bunny', authMiddleware, isAdmin, upload.single('video'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
    }

    try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const title = req.body.title || req.file.originalname;

        const result = await bunnyStream.createAndUploadVideo({
            title,
            fileBuffer
        });

        // Clean up temporary local file
        try { fs.unlinkSync(req.file.path); } catch (e) {}

        res.json({
            success: true,
            videoId: result.videoId,
            embedUrl: result.embedUrl,
            hlsUrl: result.hlsUrl,
            thumbnailUrl: result.thumbnailUrl,
            title: result.title
        });
    } catch (err) {
        console.error('Bunny Stream Upload Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/videos/bunny-status/:id', authMiddleware, isAdmin, async (req, res) => {
    try {
        const status = await bunnyStream.getVideoStatus(req.params.id);
        res.json(status);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Test ImageKit API credentials
app.post('/api/admin/imagekit/test-connection', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { publicKey, privateKey, urlEndpoint } = req.body;
        const result = await testImageKitConnection({ publicKey, privateKey, urlEndpoint });
        // Reinitialize runtime instance with verified keys
        initImageKit({ publicKey, privateKey, urlEndpoint });
        res.json(result);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// Test Bunny Stream API credentials
app.post('/api/admin/bunny/test-connection', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { libraryId, apiKey } = req.body;
        const result = await bunnyStream.testBunnyConnection({ libraryId, apiKey });
        res.json(result);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// ============================================================
// Video Testimonials / Video Reviews API
// ============================================================
app.get('/api/video-testimonials', (req, res) => {
    db.query('SELECT * FROM video_testimonials WHERE is_active = 1 ORDER BY sort_order ASC, id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/admin/video-testimonials', authMiddleware, isAdmin, (req, res) => {
    db.query('SELECT * FROM video_testimonials ORDER BY sort_order ASC, id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/admin/video-testimonials', authMiddleware, isAdmin, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'poster', maxCount: 1 }]), convertRequestImagesToWebp, (req, res) => {
    const { name, location, testimony, youtube_url, sort_order, is_active, autoplay } = req.body;
    let video_url = req.body.video_url || youtube_url || '';
    let poster_url = req.body.poster_url || null;

    if (req.files) {
        if (req.files.video && req.files.video[0]) {
            video_url = '/uploads/' + req.files.video[0].filename;
        }
        if (req.files.poster && req.files.poster[0]) {
            poster_url = '/uploads/' + req.files.poster[0].filename;
        }
    }

    const parseAutoplay = (val) => (val === '1' || val === 1 || val === 'true' || val === true ? 1 : 0);
    const isAutoplay = autoplay !== undefined ? parseAutoplay(autoplay) : 1;
    const query = 'INSERT INTO video_testimonials (name, location, testimony, video_url, youtube_url, poster_url, sort_order, is_active, autoplay) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name || '', location || '', testimony || '', video_url, youtube_url || null, poster_url, parseInt(sort_order) || 0, is_active !== undefined ? parseInt(is_active) : 1, isAutoplay], (err, result) => {
        if (err) return res.status(500).json({ error: err.message, message: err.message });
        res.json({ id: result.insertId, message: 'Video review added successfully' });
    });
});

app.put('/api/admin/video-testimonials/:id', authMiddleware, isAdmin, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'poster', maxCount: 1 }]), convertRequestImagesToWebp, (req, res) => {
    const { name, location, testimony, youtube_url, sort_order, is_active, autoplay } = req.body;
    let video_url = req.body.video_url || youtube_url || '';
    let poster_url = req.body.poster_url || null;

    if (req.files) {
        if (req.files.video && req.files.video[0]) {
            video_url = '/uploads/' + req.files.video[0].filename;
        }
        if (req.files.poster && req.files.poster[0]) {
            poster_url = '/uploads/' + req.files.poster[0].filename;
        }
    }

    const parseAutoplay = (val) => (val === '1' || val === 1 || val === 'true' || val === true ? 1 : 0);
    const isAutoplay = autoplay !== undefined ? parseAutoplay(autoplay) : 1;
    const query = 'UPDATE video_testimonials SET name = ?, location = ?, testimony = ?, video_url = COALESCE(?, video_url), youtube_url = ?, poster_url = COALESCE(?, poster_url), sort_order = ?, is_active = ?, autoplay = ? WHERE id = ?';
    db.query(query, [name, location, testimony, video_url, youtube_url || null, poster_url, parseInt(sort_order) || 0, parseInt(is_active) || 1, isAutoplay, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message, message: err.message });
        res.json({ success: true, message: 'Video review updated successfully' });
    });
});

app.patch('/api/admin/video-testimonials/:id/autoplay', authMiddleware, isAdmin, (req, res) => {
    const { autoplay } = req.body;
    const isAutoplay = parseInt(autoplay) === 1 ? 1 : 0;
    db.query('UPDATE video_testimonials SET autoplay = ? WHERE id = ?', [isAutoplay, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, autoplay: isAutoplay });
    });
});

app.delete('/api/admin/video-testimonials/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('DELETE FROM video_testimonials WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Video review deleted successfully' });
    });
});

// Bulk status update (Publish / Draft)
app.post('/api/admin/video-testimonials/bulk-status', authMiddleware, isAdmin, (req, res) => {
    const { ids, is_active } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'No IDs provided' });
    }
    const query = 'UPDATE video_testimonials SET is_active = ? WHERE id IN (?)';
    db.query(query, [parseInt(is_active) ? 1 : 0, ids], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Status updated for selected items' });
    });
});

// Bulk delete
app.post('/api/admin/video-testimonials/bulk-delete', authMiddleware, isAdmin, (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'No IDs provided' });
    }
    const query = 'DELETE FROM video_testimonials WHERE id IN (?)';
    db.query(query, [ids], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Selected items deleted successfully' });
    });
});

// Up / Down Sort position swap / reorder
app.post('/api/admin/video-testimonials/reorder', authMiddleware, isAdmin, (req, res) => {
    const { items } = req.body; // Array of { id, sort_order }
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'No items provided' });
    }
    let completed = 0;
    let hasError = false;
    items.forEach(item => {
        db.query('UPDATE video_testimonials SET sort_order = ? WHERE id = ?', [parseInt(item.sort_order), parseInt(item.id)], (err) => {
            completed++;
            if (err) {
                console.error('Reorder DB error:', err);
                hasError = true;
            }
            if (completed === items.length) {
                if (hasError) return res.status(500).json({ error: 'Failed to reorder items' });
                res.json({ success: true, message: 'Positions updated successfully' });
            }
        });
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// WEBSITE VISITOR TRACKING & ANALYTICS API
// ──────────────────────────────────────────────────────────────────────────────

// Public Tracking Endpoint (called by frontend tracker hook)
app.post('/api/analytics/track', (req, res) => {
    try {
        const {
            visit_id,
            session_id,
            visitor_id,
            page_url,
            page_title,
            referrer,
            device_type = 'Desktop',
            browser = 'Chrome',
            os = 'Windows',
            city,
            region,
            country,
            duration_seconds = 0,
            is_ping = false
        } = req.body;

        if (!session_id || !visitor_id) {
            return res.status(400).json({ error: 'Missing session_id or visitor_id' });
        }

        // Detect IP
        let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        if (clientIp.includes(',')) {
            clientIp = clientIp.split(',')[0].trim();
        }
        if (clientIp.startsWith('::ffff:')) {
            clientIp = clientIp.replace('::ffff:', '');
        }

        const fallbackCity = city || 'Mumbai';
        const fallbackRegion = region || 'Maharashtra';
        const fallbackCountry = country || 'India';

        // Heartbeat / duration update ping
        if (is_ping && (visit_id || (session_id && page_url))) {
            const updateDuration = Math.max(0, parseInt(duration_seconds) || 0);
            const isBounce = updateDuration >= 15 ? 0 : 1;

            if (visit_id) {
                db.query(
                    `UPDATE website_visitors 
                     SET duration_seconds = GREATEST(duration_seconds, ?), 
                         is_bounce = CASE WHEN ? >= 15 THEN 0 ELSE is_bounce END,
                         updated_at = NOW() 
                     WHERE id = ?`,
                    [updateDuration, updateDuration, visit_id],
                    (err) => {
                        if (err) console.error('Error updating visitor ping by visit_id:', err);
                        res.json({ success: true, updated: true });
                    }
                );
            } else {
                db.query(
                    `UPDATE website_visitors 
                     SET duration_seconds = GREATEST(duration_seconds, ?), 
                         is_bounce = CASE WHEN ? >= 15 THEN 0 ELSE is_bounce END,
                         updated_at = NOW() 
                     WHERE session_id = ? AND page_url = ? 
                     ORDER BY id DESC LIMIT 1`,
                    [updateDuration, updateDuration, session_id, page_url],
                    (err) => {
                        if (err) console.error('Error updating visitor ping by session:', err);
                        res.json({ success: true, updated: true });
                    }
                );
            }
            return;
        }

        // New page visit: mark previous visits in the same session as not bounced (since multi-page)
        db.query(
            `UPDATE website_visitors SET is_bounce = 0 WHERE session_id = ? AND is_bounce = 1`,
            [session_id],
            () => {}
        );

        // Insert new visit record
        const insertSql = `
            INSERT INTO website_visitors 
            (session_id, visitor_id, ip_address, city, region, country, page_url, page_title, referrer, device_type, browser, os, duration_seconds, is_bounce, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
        `;

        db.query(
            insertSql,
            [
                session_id,
                visitor_id,
                clientIp,
                fallbackCity,
                fallbackRegion,
                fallbackCountry,
                page_url || '/',
                page_title || 'Selectt',
                referrer || 'Direct',
                device_type,
                browser,
                os,
                parseInt(duration_seconds) || 0
            ],
            (err, result) => {
                if (err) {
                    console.error('Error recording website visitor:', err);
                    return res.status(500).json({ error: 'Failed to record visitor' });
                }
                res.json({
                    success: true,
                    visit_id: result.insertId
                });
            }
        );
    } catch (e) {
        console.error('Visitor tracking exception:', e);
        res.status(500).json({ error: 'Server error tracking visitor' });
    }
});

// Admin Analytics Overview (KPIs, Charts, Top Pages, Geo Breakdown, Devices)
app.get('/api/admin/analytics/overview', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { period = '30days', startDate, endDate } = req.query;

        let dateWhere = '1=1';
        let queryParams = [];

        if (startDate && endDate) {
            dateWhere = 'created_at >= ? AND created_at <= ?';
            queryParams = [`${startDate} 00:00:00`, `${endDate} 23:59:59`];
        } else if (period === 'today') {
            dateWhere = 'created_at >= CURDATE()';
        } else if (period === '7days') {
            dateWhere = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        } else if (period === '30days') {
            dateWhere = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        } else if (period === 'thisMonth') {
            dateWhere = "created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')";
        } else if (period === 'all') {
            dateWhere = '1=1';
        }

        // 1. Overall KPIs
        const kpiQuery = `
            SELECT 
                COUNT(*) as total_pageviews,
                COUNT(DISTINCT session_id) as total_sessions,
                COUNT(DISTINCT visitor_id) as unique_visitors,
                COALESCE(AVG(duration_seconds), 0) as avg_duration_seconds,
                COALESCE(SUM(CASE WHEN is_bounce = 1 THEN 1 ELSE 0 END), 0) as bounce_count
            FROM website_visitors
            WHERE ${dateWhere}
        `;

        // Live visitors in last 5 minutes
        const liveQuery = `
            SELECT COUNT(DISTINCT visitor_id) as live_count 
            FROM website_visitors 
            WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        `;

        // 2. Timeline Chart data
        let chartQuery = '';
        if (period === 'today') {
            chartQuery = `
                SELECT 
                    DATE_FORMAT(created_at, '%H:00') as label,
                    COUNT(DISTINCT visitor_id) as visitors,
                    COUNT(*) as pageviews
                FROM website_visitors
                WHERE ${dateWhere}
                GROUP BY DATE_FORMAT(created_at, '%H:00')
                ORDER BY MIN(created_at) ASC
            `;
        } else {
            chartQuery = `
                SELECT 
                    DATE_FORMAT(created_at, '%b %d') as label,
                    COUNT(DISTINCT visitor_id) as visitors,
                    COUNT(*) as pageviews
                FROM website_visitors
                WHERE ${dateWhere}
                GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%b %d')
                ORDER BY DATE(created_at) ASC
            `;
        }

        // 3. Top Pages
        const topPagesQuery = `
            SELECT 
                page_url,
                COALESCE(MAX(page_title), page_url) as page_title,
                COUNT(*) as views,
                COUNT(DISTINCT visitor_id) as visitors,
                ROUND(AVG(duration_seconds)) as avg_duration
            FROM website_visitors
            WHERE ${dateWhere}
            GROUP BY page_url
            ORDER BY views DESC
            LIMIT 10
        `;

        // 4. Top Locations (Cities)
        const topLocationsQuery = `
            SELECT 
                COALESCE(city, 'Unknown') as city,
                COALESCE(region, '') as region,
                COALESCE(country, 'India') as country,
                COUNT(DISTINCT visitor_id) as visitors,
                COUNT(*) as pageviews
            FROM website_visitors
            WHERE ${dateWhere}
            GROUP BY city, region, country
            ORDER BY visitors DESC
            LIMIT 8
        `;

        // 5. Device Breakdown
        const deviceQuery = `
            SELECT 
                COALESCE(device_type, 'Desktop') as device_type,
                COUNT(*) as count
            FROM website_visitors
            WHERE ${dateWhere}
            GROUP BY device_type
            ORDER BY count DESC
        `;

        // 6. Browser Breakdown
        const browserQuery = `
            SELECT 
                COALESCE(browser, 'Other') as browser,
                COUNT(*) as count
            FROM website_visitors
            WHERE ${dateWhere}
            GROUP BY browser
            ORDER BY count DESC
            LIMIT 6
        `;

        // 7. Top Referrers
        const referrerQuery = `
            SELECT 
                CASE 
                    WHEN referrer IS NULL OR referrer = '' OR referrer LIKE '%direct%' THEN 'Direct / Direct Link'
                    WHEN referrer LIKE '%google%' THEN 'Google Search'
                    WHEN referrer LIKE '%instagram%' THEN 'Instagram'
                    WHEN referrer LIKE '%facebook%' THEN 'Facebook'
                    WHEN referrer LIKE '%youtube%' THEN 'YouTube'
                    ELSE referrer 
                END as source,
                COUNT(*) as count
            FROM website_visitors
            WHERE ${dateWhere}
            GROUP BY source
            ORDER BY count DESC
            LIMIT 6
        `;

        const [kpiRes, liveRes, chartRes, topPagesRes, topLocationsRes, deviceRes, browserRes, referrerRes] = await Promise.all([
            queryAsync(kpiQuery, queryParams),
            queryAsync(liveQuery, []),
            queryAsync(chartQuery, queryParams),
            queryAsync(topPagesQuery, queryParams),
            queryAsync(topLocationsQuery, queryParams),
            queryAsync(deviceQuery, queryParams),
            queryAsync(browserQuery, queryParams),
            queryAsync(referrerQuery, queryParams)
        ]);

        const totalPageviews = kpiRes[0]?.total_pageviews || 0;
        const totalSessions = kpiRes[0]?.total_sessions || 0;
        const uniqueVisitors = kpiRes[0]?.unique_visitors || 0;
        const avgDuration = Math.round(kpiRes[0]?.avg_duration_seconds || 0);
        const bounceCount = kpiRes[0]?.bounce_count || 0;
        const bounceRate = totalPageviews > 0 ? ((bounceCount / totalPageviews) * 100).toFixed(1) : '0.0';
        const liveVisitors = liveRes[0]?.live_count || 0;

        // Calculate location percentages
        const topLocations = (topLocationsRes || []).map(loc => ({
            ...loc,
            percentage: uniqueVisitors > 0 ? Math.round((loc.visitors / uniqueVisitors) * 100) : 0
        }));

        // Calculate device percentages
        const deviceBreakdown = (deviceRes || []).map(dev => ({
            ...dev,
            percentage: totalPageviews > 0 ? Math.round((dev.count / totalPageviews) * 100) : 0
        }));

        res.json({
            success: true,
            kpis: {
                total_pageviews: totalPageviews,
                total_sessions: totalSessions,
                unique_visitors: uniqueVisitors,
                avg_duration_seconds: avgDuration,
                bounce_rate: parseFloat(bounceRate),
                live_active_visitors: liveVisitors
            },
            chart: chartRes || [],
            top_pages: topPagesRes || [],
            top_locations: topLocations,
            device_breakdown: deviceBreakdown,
            browser_breakdown: browserRes || [],
            traffic_sources: referrerRes || []
        });
    } catch (err) {
        console.error('Analytics overview error:', err);
        res.status(500).json({ error: 'Failed to fetch analytics overview' });
    }
});

// Admin Granular Visitor Logs (Paginated & Filterable)
app.get('/api/admin/analytics/logs', authMiddleware, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const search = req.query.search?.trim() || '';
        const city = req.query.city?.trim() || '';
        const device = req.query.device?.trim() || '';
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const sortBy = req.query.sortBy || 'created_at';
        const sortOrder = req.query.sortOrder === 'ASC' ? 'ASC' : 'DESC';

        let whereConditions = ['1=1'];
        let params = [];

        if (search) {
            whereConditions.push('(page_url LIKE ? OR page_title LIKE ? OR ip_address LIKE ? OR city LIKE ? OR visitor_id LIKE ? OR referrer LIKE ?)');
            const s = `%${search}%`;
            params.push(s, s, s, s, s, s);
        }

        if (city && city !== 'all') {
            whereConditions.push('city = ?');
            params.push(city);
        }

        if (device && device !== 'all') {
            whereConditions.push('device_type = ?');
            params.push(device);
        }

        if (startDate && endDate) {
            whereConditions.push('created_at >= ? AND created_at <= ?');
            params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
        }

        const whereClause = whereConditions.join(' AND ');

        // Safe columns for sorting
        const allowedSortCols = ['id', 'created_at', 'duration_seconds', 'city', 'page_url', 'device_type'];
        const safeSortBy = allowedSortCols.includes(sortBy) ? sortBy : 'created_at';

        const countQuery = `SELECT COUNT(*) as total FROM website_visitors WHERE ${whereClause}`;
        const countRes = await queryAsync(countQuery, params);
        const total = countRes[0]?.total || 0;

        const dataQuery = `
            SELECT 
                id,
                session_id,
                visitor_id,
                ip_address,
                city,
                region,
                country,
                page_url,
                page_title,
                referrer,
                device_type,
                browser,
                os,
                duration_seconds,
                is_bounce,
                created_at,
                updated_at
            FROM website_visitors
            WHERE ${whereClause}
            ORDER BY ${safeSortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;

        const logs = await queryAsync(dataQuery, [...params, limit, offset]);

        // Get unique cities for filter dropdown
        const citiesList = await queryAsync('SELECT DISTINCT city FROM website_visitors WHERE city IS NOT NULL AND city != "" ORDER BY city ASC');

        res.json({
            success: true,
            logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            filterOptions: {
                cities: citiesList.map(c => c.city)
            }
        });
    } catch (err) {
        console.error('Analytics logs error:', err);
        res.status(500).json({ error: 'Failed to fetch visitor logs' });
    }
});

// Admin Real-Time Live Visitors Stream
app.get('/api/admin/analytics/live', authMiddleware, isAdmin, async (req, res) => {
    try {
        const liveQuery = `
            SELECT 
                id,
                session_id,
                visitor_id,
                ip_address,
                city,
                region,
                country,
                page_url,
                page_title,
                device_type,
                browser,
                os,
                duration_seconds,
                is_bounce,
                created_at,
                updated_at,
                TIMESTAMPDIFF(SECOND, updated_at, NOW()) as seconds_ago
            FROM website_visitors
            WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
            ORDER BY updated_at DESC
            LIMIT 30
        `;

        let activeVisitors = await queryAsync(liveQuery, []);
        
        // Fallback to most recent visitors if none in last 5 minutes
        if (!activeVisitors || activeVisitors.length === 0) {
            const fallbackQuery = `
                SELECT 
                    id,
                    session_id,
                    visitor_id,
                    ip_address,
                    city,
                    region,
                    country,
                    page_url,
                    page_title,
                    device_type,
                    browser,
                    os,
                    duration_seconds,
                    is_bounce,
                    created_at,
                    updated_at,
                    TIMESTAMPDIFF(SECOND, updated_at, NOW()) as seconds_ago
                FROM website_visitors
                ORDER BY updated_at DESC
                LIMIT 8
            `;
            activeVisitors = await queryAsync(fallbackQuery, []);
        }

        const distinctLiveCount = new Set(activeVisitors.map(v => v.visitor_id)).size;

        // Group active pages
        const pageCounts = {};
        activeVisitors.forEach(v => {
            const url = v.page_url || '/';
            pageCounts[url] = (pageCounts[url] || 0) + 1;
        });
        const activePages = Object.keys(pageCounts).map(url => ({
            page_url: url,
            count: pageCounts[url]
        })).sort((a, b) => b.count - a.count);

        // Group active cities
        const cityCounts = {};
        activeVisitors.forEach(v => {
            const city = v.city || 'Mumbai';
            cityCounts[city] = (cityCounts[city] || 0) + 1;
        });
        const activeCities = Object.keys(cityCounts).map(city => ({
            city,
            count: cityCounts[city]
        })).sort((a, b) => b.count - a.count);

        res.json({
            success: true,
            live_count: distinctLiveCount,
            active_visitors: activeVisitors,
            active_pages: activePages,
            active_cities: activeCities,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('Live analytics error:', err);
        res.status(500).json({ error: 'Failed to fetch live analytics' });
    }
});

// Admin Delete Single Visitor Log
app.delete('/api/admin/analytics/logs/:id', authMiddleware, isAdmin, (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM website_visitors WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Visitor record deleted successfully' });
    });
});

// Admin Bulk Delete Visitor Logs
app.post('/api/admin/analytics/logs/bulk-delete', authMiddleware, isAdmin, (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'No IDs provided' });
    }
    db.query('DELETE FROM website_visitors WHERE id IN (?)', [ids], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Selected visitor records deleted' });
    });
});

// ──────────────────────────────────────────────────────────────────────────────

// Global Error Handler (production-aware: no stack traces exposed)
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.error(`[Error] ${req.method} ${req.url}:`, err.message);

    res.status(statusCode).json({
        message: statusCode === 500 && isProduction ? 'Internal Server Error' : err.message,
        ...(isProduction ? {} : { stack: err.stack })
    });
});

const server = app.listen(port, () => console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`));

// Graceful Shutdown
const shutdown = (signal) => {
    console.log(`${signal} signal received: closing HTTP server`);
    server.close(() => {
        console.log('HTTP server closed');
        db.end((err) => {
            console.log('MySQL Pool closed');
            process.exit(err ? 1 : 0);
        });
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

