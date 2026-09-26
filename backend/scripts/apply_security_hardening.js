const fs = require('fs');
const path = require('path');

const indexJsPath = path.join(__dirname, '..', 'index.js');
let code = fs.readFileSync(indexJsPath, 'utf8');

console.log('Applying security hardening to backend/index.js...');

// 1. Update auth-middleware import
code = code.replace(
    "const { authMiddleware, isAdmin } = require('./auth-middleware');",
    "const { authMiddleware, isAdmin, adminAuth, customerAuth } = require('./auth-middleware');"
);

// 2. Remove fallback weak secret in jwt.verify
code = code.replace(
    "const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');",
    "const decoded = jwt.verify(token, process.env.JWT_SECRET);"
);
code = code.replace(
    "const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');",
    "const decoded = jwt.verify(token, process.env.JWT_SECRET);"
);

// 3. Remove inline redundant customerAuth definition if present
const inlineCustomerAuthRegex = /\/\/ Customer middleware\s*\nfunction customerAuth\(req, res, next\) \{[\s\S]*?\n\}/;
if (inlineCustomerAuthRegex.test(code)) {
    code = code.replace(inlineCustomerAuthRegex, '// customerAuth imported from ./auth-middleware');
    console.log('Replaced inline customerAuth with imported middleware.');
}

// 4. Harden CORS origin validation
const oldCorsRegex = /app\.use\(cors\(\{[\s\S]*?credentials: true\s*\}\)\);/;
const hardenedCors = `// Hardened CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://selectt.in', 'https://admin.selectt.in'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (/^https:\\/\\/([a-zA-Z0-9-]+\\.)?selectt\\.in$/.test(origin) || /^https:\\/\\/([a-zA-Z0-9-]+\\.)?wepnex\\.com$/.test(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS policy'));
    },
    credentials: true
}));`;

code = code.replace(oldCorsRegex, hardenedCors);

// 5. Add rate limiters for customer auth, leads, and insurance
const rateLimiterAdditions = `// Strict Authentication & OTP Rate Limiter (Anti-Brute-Force & Anti-SMS-Abuse)
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
app.use(['/api/leads', '/api/insurance/request', '/api/sell-requests'], formSubmissionLimiter);`;

const oldAuthLimiterRegex = /\/\/ Strict Authentication & OTP Rate Limiter[\s\S]*?app\.use\(\['\/api\/login', '\/api\/admin\/login', '\/api\/auth\/send-otp', '\/api\/auth\/verify-otp', '\/api\/auth\/whatsapp-otp'\], authLimiter\);/;
code = code.replace(oldAuthLimiterRegex, rateLimiterAdditions);

// 6. Protect Admin Endpoints with isAdmin
// Update admin car routes
code = code.replace("app.post('/api/cars', authMiddleware,", "app.post('/api/cars', authMiddleware, isAdmin,");
code = code.replace("app.put('/api/cars/:id', authMiddleware,", "app.put('/api/cars/:id', authMiddleware, isAdmin,");
code = code.replace("app.patch('/api/cars/bulk-update', authMiddleware,", "app.patch('/api/cars/bulk-update', authMiddleware, isAdmin,");
code = code.replace("app.patch('/api/cars/:id', authMiddleware,", "app.patch('/api/cars/:id', authMiddleware, isAdmin,");
code = code.replace("app.delete('/api/cars/:id', authMiddleware,", "app.delete('/api/cars/:id', authMiddleware, isAdmin,");

// Update admin customer routes
code = code.replace("app.post('/api/customers/:id/avatar', authMiddleware,", "app.post('/api/customers/:id/avatar', authMiddleware, isAdmin,");
code = code.replace("app.get('/api/customers', authMiddleware,", "app.get('/api/customers', authMiddleware, isAdmin,");
code = code.replace("app.get('/api/customers/:id', authMiddleware,", "app.get('/api/customers/:id', authMiddleware, isAdmin,");
code = code.replace("app.put('/api/customers/:id', authMiddleware,", "app.put('/api/customers/:id', authMiddleware, isAdmin,");
code = code.replace("app.delete('/api/customers/:id', authMiddleware,", "app.delete('/api/customers/:id', authMiddleware, isAdmin,");

// Update admin sell requests & leads & insurance routes
code = code.replace("app.get('/api/sell-requests', authMiddleware,", "app.get('/api/sell-requests', authMiddleware, isAdmin,");
code = code.replace("app.put('/api/sell-requests/:id/status', authMiddleware,", "app.put('/api/sell-requests/:id/status', authMiddleware, isAdmin,");
code = code.replace("app.delete('/api/sell-requests/:id', authMiddleware,", "app.delete('/api/sell-requests/:id', authMiddleware, isAdmin,");
code = code.replace("app.get('/api/leads', authMiddleware,", "app.get('/api/leads', authMiddleware, isAdmin,");
code = code.replace("app.put('/api/test-drives/:id/status', authMiddleware,", "app.put('/api/test-drives/:id/status', authMiddleware, isAdmin,");
code = code.replace("app.get('/api/admin/insurance-requests', authMiddleware,", "app.get('/api/admin/insurance-requests', authMiddleware, isAdmin,");
code = code.replace("app.put('/api/admin/insurance-requests/:id/status', authMiddleware,", "app.put('/api/admin/insurance-requests/:id/status', authMiddleware, isAdmin,");
code = code.replace("app.delete('/api/admin/insurance-requests/:id', authMiddleware,", "app.delete('/api/admin/insurance-requests/:id', authMiddleware, isAdmin,");

// Update admin media upload & management routes
code = code.replace("app.post('/api/upload', authMiddleware,", "app.post('/api/upload', authMiddleware, isAdmin,");
code = code.replace("app.get('/api/media', authMiddleware,", "app.get('/api/media', authMiddleware, isAdmin,");
code = code.replace("app.post('/api/media/alt', authMiddleware,", "app.post('/api/media/alt', authMiddleware, isAdmin,");
code = code.replace("app.delete('/api/media', authMiddleware,", "app.delete('/api/media', authMiddleware, isAdmin,");
code = code.replace("app.post('/api/media/bulk-delete', authMiddleware,", "app.post('/api/media/bulk-delete', authMiddleware, isAdmin,");

// Update admin notifications
code = code.replace("app.get('/api/admin/notifications', authMiddleware,", "app.get('/api/admin/notifications', authMiddleware, isAdmin,");
code = code.replace("app.put('/api/admin/notifications/:id/read', authMiddleware,", "app.put('/api/admin/notifications/:id/read', authMiddleware, isAdmin,");
code = code.replace("app.put('/api/admin/notifications/read-all', authMiddleware,", "app.put('/api/admin/notifications/read-all', authMiddleware, isAdmin,");
code = code.replace("app.post('/api/admin/whatsapp/test-send', authMiddleware,", "app.post('/api/admin/whatsapp/test-send', authMiddleware, isAdmin,");

fs.writeFileSync(indexJsPath, code, 'utf8');
console.log('Security hardening successfully applied to backend/index.js');
