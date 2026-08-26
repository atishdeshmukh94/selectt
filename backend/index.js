const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');
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
const { authMiddleware, isAdmin } = require('./auth-middleware');
const { sendWhatsAppOTP } = require('./whatsapp-service');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(hpp());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Increased for development
    message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use('/api', limiter);

// Logging and Performance
app.use(morgan('combined'));
app.use(compression());

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('ngrok-free.dev') || origin.endsWith('wepnex.com')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));

// Production Health & Monitoring Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Selectt Backend API',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

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
    if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
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
            .webp({ quality: 80 }) // WebP quality 80
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

db.getConnection((err, connection) => {
    if (err) { console.error('Error connecting to MySQL Pool:', err); return; }
    console.log('Connected to MySQL Database Pool');
    connection.release();

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
                        ['Raipur-Selectt Hub', 'Raipur', '36 City mall 2nd floor, Telibandha, Vishal nagar, In front of Magneto mall, Raipur...', '10:00 AM - 07:00 PM (Mon-Sun)', 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400', 45],
                        ['Raipur-Civil Lines Hub', 'Raipur', 'Great Eastern Rd, near Phool Chowk, Civil Lines, Raipur, Chhattisgarh 492001', '10:00 AM - 07:00 PM (Mon-Sun)', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400', 30],
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

// SEC-001 FIX: Admin notifications now require authentication
app.get('/api/admin/notifications', authMiddleware, (req, res) => {
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

app.put('/api/admin/notifications/:id/read', authMiddleware, (req, res) => {
    db.query('UPDATE admin_notifications SET is_read = TRUE WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.put('/api/admin/notifications/read-all', authMiddleware, (req, res) => {
    db.query('UPDATE admin_notifications SET is_read = TRUE WHERE is_read = FALSE', (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, updated: result.affectedRows });
    });
});

// ============================================================
// Helper: map car row to camelCase
// ============================================================
function mapCar(car) {
    return {
        id: car.id,
        make: car.make,
        model: car.model,
        variant: car.variant,
        year: car.year,
        price: Number(car.price),
        emi: Number(car.emi),
        km: car.km,
        fuelType: car.fuel_type,
        transmission: car.transmission,
        location: car.location,
        image: car.image,
        isAssured: Boolean(car.is_assured),
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
        whereClauses.push("(cars.status = 'active' OR cars.status IS NULL OR cars.status = '')");
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
    db.query("SELECT make as name, count(*) as count FROM cars WHERE (status = 'active' OR status IS NULL OR status = '') GROUP BY make", (err, results) => {
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
        if (!isAdminRequest && car.status && car.status !== 'active') {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.json(mapCar(car));
    });
});

app.post('/api/cars', authMiddleware, (req, res) => {
    const { make, model, variant, year, price, emi, km, fuelType, fuel_type, transmission,
        location, image, tag, badgeText, badge_text, hub, isAssured, ownership, engineCapacity, engine_capacity,
        regYear, reg_year, regState, reg_state, spareKey, spare_key, insuranceStatus,
        insurance_status, color, bodyType, body_type, description, videoUrl, video_url, status } = req.body;

    const data = {
        make, model, variant, year, price, emi, km,
        fuel_type: fuelType || fuel_type,
        transmission, location, image, tag, hub,
        badge_text: badgeText || badge_text,
        is_assured: isAssured || false,
        ownership,
        engine_capacity: engineCapacity || engine_capacity,
        reg_year: regYear || reg_year,
        reg_state: regState || reg_state,
        spare_key: spareKey || spare_key,
        insurance_status: insuranceStatus || insurance_status,
        color,
        body_type: bodyType || body_type,
        description,
        reasons_to_buy: req.body.reasonsToBuy ? JSON.stringify(req.body.reasonsToBuy) : null,
        specifications: req.body.specifications ? JSON.stringify(req.body.specifications) : null,
        features: req.body.features ? JSON.stringify(req.body.features) : null,
        quality_report: req.body.qualityReport ? JSON.stringify(req.body.qualityReport) : null,
        more_images: req.body.moreImages ? JSON.stringify(req.body.moreImages) : null,
        video_url: videoUrl || video_url || null,
        status: status || 'active'
    };

    db.query('INSERT INTO cars SET ?', data, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, ...mapCar({ ...data, id: result.insertId }) });
    });
});

app.put('/api/cars/:id', authMiddleware, (req, res) => {
    const { make, model, variant, year, price, emi, km, fuelType, fuel_type, transmission,
        location, image, tag, badgeText, badge_text, hub, isAssured, ownership, engineCapacity, engine_capacity,
        regYear, reg_year, regState, reg_state, spareKey, spare_key, insuranceStatus,
        insurance_status, color, bodyType, body_type, description, videoUrl, video_url, status } = req.body;

    const data = {
        make, model, variant, year, price, emi, km,
        fuel_type: fuelType || fuel_type,
        transmission, location, image, tag, hub,
        badge_text: badgeText || badge_text,
        is_assured: isAssured !== undefined ? isAssured : false,
        ownership,
        engine_capacity: engineCapacity || engine_capacity,
        reg_year: regYear || reg_year,
        reg_state: regState || reg_state,
        spare_key: spareKey || spare_key,
        insurance_status: insuranceStatus || insurance_status,
        color,
        body_type: bodyType || body_type,
        description,
        reasons_to_buy: req.body.reasonsToBuy ? JSON.stringify(req.body.reasonsToBuy) : null,
        specifications: req.body.specifications ? JSON.stringify(req.body.specifications) : null,
        features: req.body.features ? JSON.stringify(req.body.features) : null,
        quality_report: req.body.qualityReport ? JSON.stringify(req.body.qualityReport) : null,
        more_images: req.body.moreImages ? JSON.stringify(req.body.moreImages) : null,
        video_url: videoUrl || video_url || null,
        status: status || 'active'
    };

    db.query('UPDATE cars SET ? WHERE id = ?', [data, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Car updated successfully' });
    });
});

app.patch('/api/cars/bulk-update', authMiddleware, (req, res) => {
    const { ids, status, isAssured } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'ids array is required' });
    }
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (isAssured !== undefined) updateData.is_assured = isAssured;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    db.query('UPDATE cars SET ? WHERE id IN (?)', [updateData, ids], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Updated ${ids.length} cars successfully` });
    });
});

app.patch('/api/cars/:id', authMiddleware, (req, res) => {
    const fieldMap = {
        status: 'status',
        isAssured: 'is_assured',
        is_assured: 'is_assured',
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
        res.json({ message: 'Car updated successfully', updated: updateData });
    });
});


app.delete('/api/cars/:id', authMiddleware, (req, res) => {
    db.query('SELECT image, more_images FROM cars WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Car not found' });
        
        const car = results[0];
        
        // Collect all images that start with '/uploads/'
        const imagesToDelete = [];
        if (car.image && car.image.startsWith('/uploads/')) {
            imagesToDelete.push(car.image);
        }
        if (car.more_images) {
            try {
                const gallery = JSON.parse(car.more_images);
                if (Array.isArray(gallery)) {
                    gallery.forEach(img => {
                        if (img && img.startsWith('/uploads/')) {
                            imagesToDelete.push(img);
                        }
                    });
                }
            } catch (e) {
                console.error('Failed to parse more_images for deletion', e);
            }
        }
        
        // Delete the car from DB
        db.query('DELETE FROM cars WHERE id = ?', [req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Delete files asynchronously
            imagesToDelete.forEach(filePath => {
                const filename = path.basename(filePath);
                const localPath = path.join(__dirname, 'public/uploads', filename);
                fs.unlink(localPath, (err) => {
                    if (err && err.code !== 'ENOENT') {
                        console.error(`Failed to delete car image file: ${localPath}`, err);
                    }
                });
                // Also clean up database alt text
                db.query('DELETE FROM media_alt_tags WHERE file_path = ?', [filePath]);
            });
            
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

// Customer middleware
function customerAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
}

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
app.post('/api/customers/:id/avatar', authMiddleware, upload.single('avatar'), convertRequestImagesToWebp, (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const imageUrl = `/uploads/${req.file.filename}`;
    db.query('UPDATE customers SET avatar_url = ? WHERE id = ?', [imageUrl, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Profile picture updated successfully', imageUrl });
    });
});

// Admin: Get all customers
app.get('/api/customers', authMiddleware, (req, res) => {
    db.query('SELECT id, first_name, last_name, phone, alt_phone, email, city, state, avatar_url, created_at FROM customers ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Admin: Get single customer
app.get('/api/customers/:id', authMiddleware, (req, res) => {
    db.query('SELECT * FROM customers WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Not found' });
        const c = results[0];
        delete c.password;
        res.json(c);
    });
});

// Admin: Update customer
app.put('/api/customers/:id', authMiddleware, (req, res) => {
    const { first_name, last_name, phone, alt_phone, email, address, area, city, state, pincode } = req.body;
    db.query('UPDATE customers SET ? WHERE id = ?', [{ first_name, last_name, phone, alt_phone, email, address, area, city, state, pincode }, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Customer updated successfully' });
    });
});

// Admin: Delete customer
app.delete('/api/customers/:id', authMiddleware, (req, res) => {
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
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
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
        res.status(200).json({ message: 'Inspection appointment booked successfully', id: reqId });
    });
});

app.get('/api/sell-requests', authMiddleware, (req, res) => {
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
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
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

app.put('/api/sell-requests/:id/status', authMiddleware, (req, res) => {
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

app.delete('/api/sell-requests/:id', authMiddleware, (req, res) => {
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

app.get('/api/leads', authMiddleware, (req, res) => {
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
        res.status(201).json({ message: 'Test drive booked successfully', id: result.insertId });
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
                SELECT t.*, c.first_name, c.last_name, c.phone, c.email, car.make, car.model, car.year, car.image
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
                SELECT t.*, car.make, car.model, car.year, car.image
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

app.put('/api/test-drives/:id/status', authMiddleware, (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });

    db.query('UPDATE test_drives SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Status updated successfully' });
    });
});

// ============================================================
// ADMIN STAFF API
// ============================================================
app.get('/api/users', authMiddleware, isAdmin, (req, res) => {
    db.query('SELECT id, first_name, last_name, email, role, job_title, created_at FROM users ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/users', authMiddleware, isAdmin, async (req, res) => {
    const { password, ...rest } = req.body;
    const hashed = password ? await bcrypt.hash(password, 10) : null;
    db.query('INSERT INTO users SET ?', { ...rest, password: hashed }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, ...rest });
    });
});

app.put('/api/users/:id', authMiddleware, isAdmin, async (req, res) => {
    const { password, ...rest } = req.body;
    const updates = { ...rest };
    if (password && password.trim() !== "") {
        updates.password = await bcrypt.hash(password, 10);
    }
    db.query('UPDATE users SET ? WHERE id = ?', [updates, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User updated successfully' });
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

    db.query('INSERT INTO bookings SET ?', bookingData, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        createNotification('PAYMENT', `New car booking created: ${bookingData.booking_no}`, req.user.id, result.insertId);
        res.status(201).json({ 
            message: 'Booking created successfully', 
            id: result.insertId,
            booking_no: bookingData.booking_no
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
               car.transmission, car.km, car.ownership, car.reg_state, car.variant,
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
               car.transmission, car.km, car.ownership, car.reg_state, car.variant,
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
            car.make as brand,
            car.model
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
        const getCountSafely = async (table, condition = "") => {
            try {
                const query = `SELECT COUNT(*) AS count FROM ${table} ${condition}`;
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
        const soldOutTotal = await getCountSafely('cars', "WHERE status = 'sold_out'");
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
    
    const queries = Object.entries(settings).map(([key, value]) => {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', [key, value, value], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });

    Promise.all(queries)
        .then(() => res.json({ message: 'Settings updated successfully' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.post('/api/settings/upload', authMiddleware, isAdmin, upload.any(), convertRequestImagesToWebp, async (req, res) => {
    console.log("--- SITE SETTINGS IMAGE UPLOAD TRIGGERED ---");
    console.log("FILES:", req.files);
    try {
        const files = req.files || [];
        const queries = [];

        for (const file of files) {
            const key = file.fieldname;
            const filePath = `/uploads/${file.filename}`;
            console.log(`Saving file for key ${key}: ${filePath}`);
            queries.push(new Promise((resolve, reject) => {
                db.query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?', 
                [key, filePath, filePath], (err) => {
                    if (err) {
                        console.error(`DB Query error for key ${key}:`, err);
                        reject(err);
                    }
                    else resolve();
                });
            }));
        }

        await Promise.all(queries);
        console.log("All DB updates resolved successfully");
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
                'UPDATE bookings SET payment_status = ?, razorpay_order_id = ?, razorpay_payment_id = ? WHERE id = ?',
                ['paid', razorpay_order_id, razorpay_payment_id, booking_id],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Payment verified and booking updated' });
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
        const contactEmail = await getSetting('contact_email') || 'no-reply@selecttcars.com';

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

app.post('/api/upload', authMiddleware, upload.single('file'), convertRequestImagesToWebp, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, thumbnailUrl: `/uploads/thumbnails/${req.file.filename}` });
});

app.get('/api/media', authMiddleware, (req, res) => {
    const dirPath = path.join(__dirname, 'public/uploads');
    
    // Ensure the uploads directory exists
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.readdir(dirPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to scan uploads directory' });
        }
        const mediaExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.mp4', '.mov'];
        
        // Map files with extra stats like file size and date uploaded
        const mediaFiles = [];
        files.forEach(file => {
            if (mediaExtensions.includes(path.extname(file).toLowerCase())) {
                const filePath = path.join(dirPath, file);
                const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(path.extname(file).toLowerCase());
                
                if (isImage) {
                    generateThumbnail(file).catch(err => console.error(err));
                }

                try {
                    const stats = fs.statSync(filePath);
                    mediaFiles.push({
                        url: `/uploads/${file}`,
                        thumbnailUrl: isImage ? `/uploads/thumbnails/${file}` : `/uploads/${file}`,
                        size: stats.size,
                        createdAt: stats.mtime
                    });
                } catch (e) {
                    mediaFiles.push({
                        url: `/uploads/${file}`,
                        thumbnailUrl: isImage ? `/uploads/thumbnails/${file}` : `/uploads/${file}`,
                        size: 0,
                        createdAt: new Date()
                    });
                }
            }
        });
        
        // Sort files by creation date (newest first)
        mediaFiles.sort((a, b) => b.createdAt - a.createdAt);

        db.query('SELECT * FROM media_alt_tags', (dbErr, dbResults) => {
            if (dbErr) {
                // Fallback if query fails
                return res.json(mediaFiles.map(f => ({ ...f, alt: "" })));
            }
            const altMap = {};
            dbResults.forEach(row => {
                altMap[row.file_path] = row.alt_text;
            });
            const results = mediaFiles.map(f => ({
                ...f,
                alt: altMap[f.url] || ""
            }));
            res.json(results);
        });
    });
});

app.post('/api/media/alt', authMiddleware, (req, res) => {
    const { filePath, altText } = req.body;
    if (!filePath) return res.status(400).json({ message: 'filePath is required' });
    db.query(
        'INSERT INTO media_alt_tags (file_path, alt_text) VALUES (?, ?) ON DUPLICATE KEY UPDATE alt_text = ?',
        [filePath, altText || "", altText || ""],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Alt text updated successfully' });
        }
    );
});

app.delete('/api/media', authMiddleware, (req, res) => {
    const filePath = req.query.filePath || req.body.filePath;
    if (!filePath) return res.status(400).json({ message: 'filePath is required' });
    
    // Construct local absolute path
    const filename = path.basename(filePath);
    const localPath = path.join(__dirname, 'public/uploads', filename);
    
    fs.unlink(localPath, (err) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ error: 'Failed to delete file from filesystem' });
        }
        
        // Also delete alt text
        db.query('DELETE FROM media_alt_tags WHERE file_path = ?', [filePath], (dbErr) => {
            res.json({ message: 'Media deleted successfully' });
        });
    });
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

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role, image: user.image } });
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
    db.query('UPDATE banners SET ? WHERE id = ?', [updates, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Banner updated' });
    });
});

// Admin: Delete banner
app.delete('/api/admin/banners/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('DELETE FROM banners WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Banner deleted' });
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
    db.query(
        'INSERT INTO site_content (content_key, content_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE content_value = ?',
        [key, val, val],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Content updated', value: val });
        }
    );
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
    db.query('UPDATE video_testimonials SET ? WHERE id = ?', [updates, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Testimonial updated' });
    });
});

// Admin: delete video testimonial
app.delete('/api/admin/video-testimonials/:id', authMiddleware, isAdmin, (req, res) => {
    db.query('DELETE FROM video_testimonials WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Testimonial deleted' });
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
        db.query(`SELECT id, title, slug, featured_image, published_at, excerpt FROM blog_posts WHERE status='published' AND id != ? ORDER BY published_at DESC LIMIT 4`, [rows[0].id], (err2, related) => {
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

// Admin: Add a brand
app.post('/api/admin/brands', authMiddleware, isAdmin, upload.single('logo'), (req, res) => {
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
app.put('/api/admin/brands/:id', authMiddleware, isAdmin, upload.single('logo'), (req, res) => {
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


// ─── Media Library API ────────────────────────────────────────────────────────
const MEDIA_ALT_PATH = path.join(__dirname, 'media_alt.json');

function readAltStore() {
    try {
        return JSON.parse(fs.readFileSync(MEDIA_ALT_PATH, 'utf8'));
    } catch {
        return {};
    }
}

function writeAltStore(data) {
    fs.writeFileSync(MEDIA_ALT_PATH, JSON.stringify(data, null, 2));
}

// GET /api/media — list all files in public/uploads/
app.get('/api/media', authMiddleware, isAdmin, (req, res) => {
    const uploadsDir = path.join(__dirname, 'public/uploads');
    const altStore = readAltStore();

    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            if (err.code === 'ENOENT') return res.json([]);
            return res.status(500).json({ error: 'Could not read uploads directory' });
        }

        const mediaItems = files.map(filename => {
            const filePath = path.join(uploadsDir, filename);
            let size = 0;
            let createdAt = new Date().toISOString();
            try {
                const stat = fs.statSync(filePath);
                size = stat.size;
                createdAt = stat.birthtime || stat.mtime;
            } catch {}
            const urlPath = `/uploads/${filename}`;
            return {
                url: urlPath,
                size,
                createdAt,
                alt: altStore[urlPath] || ''
            };
        });

        res.json(mediaItems);
    });
});

// POST /api/media/alt — update alt text for a file
app.post('/api/media/alt', authMiddleware, isAdmin, (req, res) => {
    const { filePath, altText } = req.body;
    if (!filePath) return res.status(400).json({ error: 'filePath required' });
    const altStore = readAltStore();
    altStore[filePath] = altText || '';
    writeAltStore(altStore);
    res.json({ message: 'Alt text updated', filePath, altText });
});

// POST /api/upload — generic file upload for media library
app.post('/api/upload', authMiddleware, isAdmin, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, message: 'File uploaded successfully' });
});

// DELETE /api/media — delete a file from disk
app.delete('/api/media', authMiddleware, isAdmin, (req, res) => {
    const filePath = req.query.filePath;
    if (!filePath) return res.status(400).json({ error: 'filePath query param required' });

    // Sanitize: only allow deleting from /uploads/
    const filename = path.basename(filePath);
    const fullPath = path.join(__dirname, 'public/uploads', filename);

    fs.unlink(fullPath, (err) => {
        if (err) {
            if (err.code === 'ENOENT') return res.status(404).json({ error: 'File not found' });
            return res.status(500).json({ error: 'Failed to delete file' });
        }
        // Remove from alt store too
        const altStore = readAltStore();
        const urlPath = `/uploads/${filename}`;
        delete altStore[urlPath];
        writeAltStore(altStore);

        res.json({ message: 'File deleted successfully' });
    });
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

app.get('/api/car-hub-locations', (req, res) => {
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

