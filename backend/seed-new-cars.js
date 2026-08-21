const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const SRC_DIR = 'D:\\selectt\\new-car-upload-img-vid';
const DEST_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure destination directory exists
if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

// 12 Cars metadata and details
const CARS_DETAILS = [
    {
        folderName: "2019 Dec Creta SX photos and video",
        make: "Hyundai", model: "Creta", variant: "SX", year: 2019, price: 985000, emi: 17500, km: 42000, fuel_type: "Petrol", transmission: "Manual", location: "New Delhi",
        is_assured: 1, tag: "Top Rated", hub: "Selectt Hub, Rohini", ownership: "1st Owner", engine_capacity: "1591 cc", reg_year: 2019, reg_state: "Delhi", spare_key: "Yes", insurance_status: "Active", color: "White", body_type: "SUV",
        description: "An extremely well-maintained Hyundai Creta SX. The paint is entirely original, and the engine feels as good as new. Features a panoramic sunroof, cruise control, and clean touchscreen infotainment.",
        reasons_to_buy: [
            { icon: "ShieldCheck", title: "Original Paint", description: "No panels have been repainted or replaced." },
            { icon: "Diamond", title: "Premium Ride Quality", description: "Suspension and engine are in mint condition." }
        ],
        specifications: [
            { label: "Mileage", value: "15.8 kmpl", icon: "Gauge" },
            { label: "Power", value: "121 bhp", icon: "Cpu" },
            { label: "Ground Clearance", value: "190 mm", icon: "Settings" }
        ],
        features: {
            "Comfort & Convenience": ["Air Conditioner", "Power Windows", "Keyless Entry", "Rear AC Vents", "Automatic Climate Control"],
            "Safety": ["Anti-Lock Braking System", "Airbags", "EBD", "Rear Camera"],
            "Exterior": ["Fog Lights", "Alloy Wheels", "LED Headlights"]
        },
        quality_report: { summary: "Excellent city SUV with clean interiors and no mechanical faults.", coreScore: "9.6", supportingScore: "9.4", interiorsScore: "9.5", exteriorsScore: "9.4", wearTearScore: "9.2" }
    },
    {
        folderName: "2022 Safari XZA Photo and Video",
        make: "Tata", model: "Safari", variant: "XZA Plus", year: 2022, price: 1795000, emi: 32000, km: 28000, fuel_type: "Diesel", transmission: "Automatic", location: "Mumbai",
        is_assured: 1, tag: "Premium SUV", hub: "Selectt Hub, Goregaon", ownership: "1st Owner", engine_capacity: "1956 cc", reg_year: 2022, reg_state: "Maharashtra", spare_key: "Yes", insurance_status: "Active", color: "Blue", body_type: "SUV",
        description: "The ultimate 7-seater SUV from Tata. Features a powerful Kryotec 2.0L turbocharged engine, smooth automatic transmission, massive panoramic sunroof, ventilated captain seats, and premium JBL sound system.",
        reasons_to_buy: [
            { icon: "Shield", title: "5-Star Safety Feel", description: "Robust build quality with advanced safety features." },
            { icon: "History", title: "Ventilated Seats", description: "Captain seats in the middle row provide high comfort." }
        ],
        specifications: [
            { label: "Max Power", value: "168 bhp", icon: "Cpu" },
            { label: "Seating Capacity", value: "7 Seater", icon: "Users" },
            { label: "Mileage", value: "14.0 kmpl", icon: "Gauge" }
        ],
        features: {
            "Comfort & Convenience": ["Air Conditioner", "Power Windows", "Keyless Entry", "Rear AC Vents", "Automatic Climate Control", "Cruise Control", "Sunroof"],
            "Safety": ["Anti-Lock Braking System", "Airbags", "EBD", "Rear Camera", "Brake Assist", "Central Locking"],
            "Exterior": ["Alloy Wheels", "Fog Lights", "LED Headlights", "Roof Rails"]
        },
        quality_report: { summary: "Showroom condition Safari with immaculate interiors and powerful road presence.", coreScore: "9.8", supportingScore: "9.7", interiorsScore: "9.8", exteriorsScore: "9.7", wearTearScore: "9.6" }
    },
    {
        folderName: "2022 Virtus",
        make: "Volkswagen", model: "Virtus", variant: "Topline 1.0 TSI", year: 2022, price: 1195000, emi: 21000, km: 19500, fuel_type: "Petrol", transmission: "Automatic", location: "Bangalore",
        is_assured: 1, tag: "Performance", hub: "Selectt Hub, Indiranagar", ownership: "1st Owner", engine_capacity: "999 cc", reg_year: 2022, reg_state: "Karnataka", spare_key: "Yes", insurance_status: "Active", color: "Red", body_type: "Sedan",
        description: "European elegance combined with German performance. Powered by a highly efficient 1.0L TSI engine paired with a quick-shifting 6-speed torque converter. Pristine paint and interior finish.",
        reasons_to_buy: [
            { icon: "Diamond", title: "TSI Performance", description: "Punchy mid-range performance with sporty handling." },
            { icon: "ShieldCheck", title: "5-Star Global NCAP", description: "Highest safety standards for your family." }
        ],
        specifications: [
            { label: "Engine Power", value: "114 bhp", icon: "Cpu" },
            { label: "Boot Space", value: "521 Litres", icon: "Box" },
            { label: "Mileage", value: "18.1 kmpl", icon: "Gauge" }
        ],
        features: {
            "Comfort & Convenience": ["Air Conditioner", "Power Windows", "Keyless Entry", "Automatic Climate Control", "Cruise Control", "Sunroof"],
            "Safety": ["Anti-Lock Braking System", "Airbags", "EBD", "Rear Camera", "Tyre Pressure Monitor"],
            "Exterior": ["Alloy Wheels", "LED Headlights", "Turn Indicators on ORVM"]
        },
        quality_report: { summary: "Superb sedan, very clean dashboard, responsive steering, sporty sound.", coreScore: "9.7", supportingScore: "9.6", interiorsScore: "9.8", exteriorsScore: "9.6", wearTearScore: "9.5" }
    },
    {
        folderName: "2022 XL6 ALPHA photos and videos",
        make: "Maruti Suzuki", model: "XL6", variant: "Alpha AT", year: 2022, price: 1045000, emi: 18500, km: 24000, fuel_type: "Petrol", transmission: "Automatic", location: "Gurgaon",
        is_assured: 1, tag: "Spacious", hub: "Selectt Hub, NH8", ownership: "1st Owner", engine_capacity: "1462 cc", reg_year: 2022, reg_state: "Haryana", spare_key: "Yes", insurance_status: "Active", color: "Blue", body_type: "MUV",
        description: "Extremely comfortable 6-seater MUV with premium black leather seats, captain chairs in the 2nd row, and Maruti's reliable K15C Smart Hybrid engine paired with a 6-speed automatic torque converter.",
        reasons_to_buy: [
            { icon: "Diamond", title: "Smart Hybrid Tech", description: "Excellent mileage inside city traffic." },
            { icon: "History", title: "6-Seater Comfort", description: "Middle captain seats offer unmatched premium feel." }
        ],
        specifications: [
            { label: "Mileage", value: "20.2 kmpl", icon: "Gauge" },
            { label: "Engine Capacity", value: "1462 cc", icon: "Cpu" },
            { label: "Fuel Tank", value: "45 L", icon: "Settings" }
        ],
        features: {
            "Comfort & Convenience": ["Air Conditioner", "Power Windows", "Keyless Entry", "Rear AC Vents", "Automatic Climate Control", "Cruise Control"],
            "Safety": ["Anti-Lock Braking System", "Airbags", "EBD", "Rear Camera"],
            "Exterior": ["Alloy Wheels", "LED Headlights", "Roof Rails"]
        },
        quality_report: { summary: "Very well kept family cruiser, smooth gearshifts, high fuel efficiency.", coreScore: "9.6", supportingScore: "9.5", interiorsScore: "9.6", exteriorsScore: "9.5", wearTearScore: "9.3" }
    },
    {
        folderName: "2022 XL6 Zeta MT photo and videos",
        make: "Maruti Suzuki", model: "XL6", variant: "Zeta MT", year: 2022, price: 925000, emi: 16500, km: 32000, fuel_type: "Petrol", transmission: "Manual", location: "New Delhi",
        is_assured: 1, tag: "Value for Money", hub: "Selectt Hub, Rohini", ownership: "1st Owner", engine_capacity: "1462 cc", reg_year: 2022, reg_state: "Delhi", spare_key: "Yes", insurance_status: "Active", color: "Silver", body_type: "MUV",
        description: "A highly affordable variant of XL6 with manual transmission. Features captain seats, smart hybrid K15C engine, rear AC vents, smartplay touchscreen infotainment, and automatic climate control.",
        reasons_to_buy: [
            { icon: "ShieldCheck", title: "Low Maintenance", description: "Low servicing cost with Maruti's wide network." },
            { icon: "Battery", title: "Excellent Mileage", description: "Delivers up to 20.97 kmpl under test conditions." }
        ],
        specifications: [
            { label: "Mileage", value: "20.9 kmpl", icon: "Gauge" },
            { label: "Max Power", value: "102 bhp", icon: "Cpu" },
            { label: "Fuel Type", value: "Petrol Hybrid", icon: "Settings" }
        ],
        features: {
            "Comfort & Convenience": ["Air Conditioner", "Power Windows", "Keyless Entry", "Rear AC Vents", "Automatic Climate Control"],
            "Safety": ["Anti-Lock Braking System", "Airbags", "EBD", "Rear Camera"],
            "Exterior": ["Alloy Wheels", "Fog Lights", "Roof Rails"]
        },
        quality_report: { summary: "Mechanically flawless, smooth manual shifter, minor scratches on rear bumper polished.", coreScore: "9.5", supportingScore: "9.4", interiorsScore: "9.4", exteriorsScore: "9.3", wearTearScore: "9.1" }
    },
    {
        folderName: "2023 Creta photos and videos",
        make: "Hyundai", model: "Creta", variant: "SX (O)", year: 2023, price: 1425000, emi: 25000, km: 12500, fuel_type: "Petrol", transmission: "Automatic", location: "Delhi",
        is_assured: 1, tag: "Trending", hub: "Selectt Hub, Rohini", ownership: "1st Owner", engine_capacity: "1497 cc", reg_year: 2023, reg_state: "Delhi", spare_key: "Yes", insurance_status: "Active", color: "Black", body_type: "SUV",
        description: "Nearly brand new 2023 Hyundai Creta in premium Phantom Black color. Features high-tech IVT automatic gearbox, panoramic sunroof, wireless charging, ventilated seats, and premium Bose audio.",
        reasons_to_buy: [
            { icon: "Diamond", title: "Bose Audio System", description: "Premium studio sound experience inside cabin." },
            { icon: "ShieldCheck", title: "Ventilated Seats", description: "Keeps you cool during hot Indian summers." }
        ],
        specifications: [
            { label: "Mileage", value: "16.8 kmpl", icon: "Gauge" },
            { label: "Engine Power", value: "113 bhp", icon: "Cpu" },
            { label: "Sunroof Type", value: "Panoramic", icon: "Settings" }
        ],
        features: {
            "Comfort & Convenience": ["Air Conditioner", "Power Windows", "Keyless Entry", "Rear AC Vents", "Automatic Climate Control", "Cruise Control", "Sunroof"],
            "Safety": ["Anti-Lock Braking System", "Airbags", "EBD", "Rear Camera", "Tyre Pressure Monitor"],
            "Exterior": ["Alloy Wheels", "LED Headlights", "Fog Lights"]
        },
        quality_report: { summary: "Pristine condition. Inside smells like a new car. Smooth transmission.", coreScore: "9.9", supportingScore: "9.8", interiorsScore: "9.9", exteriorsScore: "9.8", wearTearScore: "9.9" }
    },
    {
        folderName: "2023 Fronx Photo and Video",
        make: "Maruti Suzuki", model: "Fronx", variant: "Alpha 1.0 Turbo", year: 2023, price: 925000, emi: 16500, km: 8200, fuel_type: "Petrol", transmission: "Manual", location: "Pune",
        is_assured: 1, tag: "Hot Deal", hub: "Selectt Hub, Hinjewadi", ownership: "1st Owner", engine_capacity: "998 cc", reg_year: 2023, reg_state: "Maharashtra", spare_key: "Yes", insurance_status: "Active", color: "Grey", body_type: "SUV",
        description: "A compact crossover with sporty design and boosterjet turbo performance. Features a 360-degree camera, HUD display, premium dual-tone interiors, and wireless phone connectivity.",
        reasons_to_buy: [
            { icon: "Diamond", title: "Turbocharged Engine", description: "Punchy performance with sporty exhaust note." },
            { icon: "Shield", title: "360 Degree Camera", description: "Simplifies parking in tight urban spots." }
        ],
        specifications: [
            { label: "Mileage", value: "21.5 kmpl", icon: "Gauge" },
            { label: "Engine", value: "998 cc Turbo", icon: "Cpu" },
            { label: "Ground Clearance", value: "190 mm", icon: "Settings" }
        ],
        features: {
            "Comfort & Convenience": ["Air Conditioner", "Power Windows", "Keyless Entry", "Automatic Climate Control", "Cruise Control"],
            "Safety": ["Anti-Lock Braking System", "Airbags", "EBD", "Rear Camera"],
            "Exterior": ["Alloy Wheels", "LED Headlights"]
        },
        quality_report: { summary: "Excellent sporty SUV, single-hand driven, HUD display tested and certified.", coreScore: "9.8", supportingScore: "9.7", interiorsScore: "9.7", exteriorsScore: "9.8", wearTearScore: "9.7" }
    },
    {
        folderName: "2024 Hyrider G Hybrid",
        make: "Toyota", model: "Urban Cruiser Hyryder", variant: "G e-Drive Hybrid", year: 2024, price: 1625000, emi: 28500, km: 4500, fuel_type: "Petrol", transmission: "Automatic", location: "Bangalore",
        is_assured: 1, tag: "Super Efficient", hub: "Selectt Hub, Indiranagar", ownership: "1st Owner", engine_capacity: "1490 cc", reg_year: 2024, reg_state: "Karnataka", spare_key: "Yes", insurance_status: "Active", color: "White", body_type: "SUV",
        description: "True Toyota Strong Hybrid technology that delivers exceptionally high fuel economy. Operates on full electric mode inside city traffic, saving huge amounts of fuel.",
        reasons_to_buy: [
            { icon: "Battery", title: "Toyota Hybrid Reliability", description: "Runs on electric mode to save up to 40% fuel." },
            { icon: "ShieldCheck", title: "Strong Fuel Economy", description: "Real-world mileage of ~27.9 kmpl in cities." }
        ],
        specifications: [
            { label: "Mileage", value: "27.9 kmpl", icon: "Gauge" },
            { label: "Engine Capacity", value: "1490 cc Hybrid", icon: "Cpu" },
            { label: "Battery Warranty", value: "8 Years Valid", icon: "Shield" }
        ],
        features: {
            "Comfort & Convenience": ["Air Conditioner", "Power Windows", "Keyless Entry", "Rear AC Vents", "Automatic Climate Control", "Cruise Control"],
            "Safety": ["Anti-Lock Braking System", "Airbags", "EBD", "Rear Camera"],
            "Exterior": ["Alloy Wheels", "LED Headlights", "Roof Rails"]
        },
        quality_report: { summary: "Like-new condition. Hybrid battery health certified at 100%. No blemishes.", coreScore: "9.9", supportingScore: "9.9", interiorsScore: "9.9", exteriorsScore: "9.8", wearTearScore: "9.9" }
    },
    {
        folderName: "2025 Grand vitara Photos and video",
        make: "Maruti Suzuki", model: "Grand Vitara", variant: "Zeta MT", year: 2025, price: 1295000, emi: 22500, km: 2300, fuel_type: "Petrol", transmission: "Manual", location: "Gurgaon",
        is_assured: 1, tag: "Like New", hub: "Selectt Hub, NH8", ownership: "1st Owner", engine_capacity: "1462 cc", reg_year: 2025, reg_state: "Haryana", spare_key: "Yes", insurance_status: "Active", color: "Silver", body_type: "SUV",
        description: "Practically showroom condition 2025 Grand Vitara. Smart hybrid technology, premium interiors, 9-inch infotainment display, automatic climate control, and rear parking sensor array.",
        reasons_to_buy: [
            { icon: "Diamond", title: "Showroom Condition", description: "Manufactured recently with under 3,000 km driven." },
            { icon: "ShieldCheck", title: "Smart Hybrid Tech", description: "Saves fuel and reduces emissions automatically." }
        ],
        specifications: [
            { label: "Mileage", value: "21.1 kmpl", icon: "Gauge" },
            { label: "Engine Capacity", value: "1462 cc", icon: "Cpu" },
            { label: "Warranty", value: "Company warranty valid", icon: "Shield" }
        ],
        features: {
            "Comfort & Convenience": ["Air Conditioner", "Power Windows", "Keyless Entry", "Rear AC Vents", "Automatic Climate Control", "Cruise Control"],
            "Safety": ["Anti-Lock Braking System", "Airbags", "EBD", "Rear Camera"],
            "Exterior": ["Alloy Wheels", "LED Headlights", "Roof Rails"]
        },
        quality_report: { summary: "Pristine. Tyres have 99% tread remaining. Perfect paint depth measurement.", coreScore: "10.0", supportingScore: "9.9", interiorsScore: "10.0", exteriorsScore: "9.9", wearTearScore: "10.0" }
    },
    {
        folderName: "2025 Skoda Kylaq AT",
        make: "Skoda", model: "Kylaq", variant: "Signature AT", year: 2025, price: 1145000, emi: 20500, km: 3100, fuel_type: "Petrol", transmission: "Automatic", location: "Mumbai",
        is_assured: 1, tag: "German Engineered", hub: "Selectt Hub, Goregaon", ownership: "1st Owner", engine_capacity: "999 cc", reg_year: 2025, reg_state: "Maharashtra", spare_key: "Yes", insurance_status: "Active", color: "Red", body_type: "SUV",
        description: "Skoda's sub-4 meter compact SUV built on MQB-A0-IN platform. Incredible safety, sporty turbo performance, and smooth automatic transmission with paddle shifters.",
        reasons_to_buy: [
            { icon: "Diamond", title: "Paddle Shifters", description: "Enjoy manual control over gearshifts quickly." },
            { icon: "Shield", title: "Solid Build Quality", description: "Skoda's heavy door thud and high stability." }
        ],
        specifications: [
            { label: "Engine", value: "1.0L TSI Turbo", icon: "Cpu" },
            { label: "Max Torque", value: "178 Nm", icon: "Settings" },
            { label: "Mileage", value: "17.8 kmpl", icon: "Gauge" }
        ],
        features: {
            "Comfort & Convenience": ["Air Conditioner", "Power Windows", "Keyless Entry", "Automatic Climate Control", "Rear AC Vents"],
            "Safety": ["Anti-Lock Braking System", "Airbags", "EBD", "Rear Camera", "Tyre Pressure Monitor"],
            "Exterior": ["Alloy Wheels", "LED Headlights", "Roof Rails"]
        },
        quality_report: { summary: "Excellent new sub-4m SUV, robust steering feel, sports mode tested successfully.", coreScore: "9.9", supportingScore: "9.8", interiorsScore: "9.9", exteriorsScore: "9.8", wearTearScore: "9.9" }
    },
    {
        folderName: "2025 Skoda Kylaq MT",
        make: "Skoda", model: "Kylaq", variant: "Signature MT", year: 2025, price: 995000, emi: 17500, km: 1200, fuel_type: "Petrol", transmission: "Manual", location: "Pune",
        is_assured: 1, tag: "Manual Fun", hub: "Selectt Hub, Hinjewadi", ownership: "1st Owner", engine_capacity: "999 cc", reg_year: 2025, reg_state: "Maharashtra", spare_key: "Yes", insurance_status: "Active", color: "Red", body_type: "SUV",
        description: "Sporty manual transmission version of the Skoda Kylaq. Pure mechanical driving pleasure combined with turbo power. Drives exceptionally well and is very fuel efficient.",
        reasons_to_buy: [
            { icon: "Diamond", title: "German TSI Engine", description: "Unmatched performance in its compact segment." },
            { icon: "ShieldCheck", title: "Practically Brand New", description: "Only driven 1,200 km since delivery." }
        ],
        specifications: [
            { label: "Engine", value: "1.0L TSI Turbo", icon: "Cpu" },
            { label: "Mileage", value: "18.5 kmpl", icon: "Gauge" },
            { label: "Seating Capacity", value: "5 Seater", icon: "Users" }
        ],
        features: {
            "Comfort & Convenience": ["Air Conditioner", "Power Windows", "Keyless Entry", "Automatic Climate Control", "Rear AC Vents"],
            "Safety": ["Anti-Lock Braking System", "Airbags", "EBD", "Rear Camera"],
            "Exterior": ["Alloy Wheels", "LED Headlights", "Roof Rails"]
        },
        quality_report: { summary: "Pristine used compact SUV, zero faults, company warranties fully valid.", coreScore: "10.0", supportingScore: "9.9", interiorsScore: "10.0", exteriorsScore: "9.9", wearTearScore: "10.0" }
    },
    {
        folderName: "2026 KIA SELTOS photos and video",
        make: "Kia", model: "Seltos", variant: "GTX Plus Turbo", year: 2026, price: 1845000, emi: 31000, km: 1500, fuel_type: "Petrol", transmission: "Automatic", location: "New Delhi",
        is_assured: 1, tag: "Top Tier", hub: "Selectt Hub, Rohini", ownership: "1st Owner", engine_capacity: "1482 cc", reg_year: 2026, reg_state: "Delhi", spare_key: "Yes", insurance_status: "Active", color: "White", body_type: "SUV",
        description: "The absolute latest model of Kia Seltos GTX+ with a powerful 1.5L turbocharged engine producing 160hp. Equipped with Level 2 ADAS, dual 10.25-inch curved screens, ventilated seats, and voice control panoramic sunroof.",
        reasons_to_buy: [
            { icon: "Diamond", title: "Level 2 ADAS Safety", description: "Autonomous emergency braking, lane keep assist, etc." },
            { icon: "ShieldCheck", title: "Dual Panoramic Screens", description: "Ultra-premium curved instrumentation panel." }
        ],
        specifications: [
            { label: "Max Power", value: "160 PS", icon: "Cpu" },
            { label: "Transmission", value: "7-Speed DCT", icon: "Settings" },
            { label: "Mileage", value: "17.7 kmpl", icon: "Gauge" }
        ],
        features: {
            "Comfort & Convenience": ["Air Conditioner", "Power Windows", "Keyless Entry", "Rear AC Vents", "Automatic Climate Control", "Cruise Control", "Sunroof"],
            "Safety": ["Anti-Lock Braking System", "Airbags", "EBD", "Rear Camera", "Tyre Pressure Monitor", "Brake Assist", "Central Locking"],
            "Exterior": ["Alloy Wheels", "LED Headlights", "Fog Lights", "Rear Spoiler"]
        },
        quality_report: { summary: "Brand new showroom condition GTX+ model. Drives like a dream. Level 2 ADAS fully calibrated.", coreScore: "10.0", supportingScore: "10.0", interiorsScore: "10.0", exteriorsScore: "10.0", wearTearScore: "10.0" }
    }
];

// Helper function to recursively find all files in a directory
function getFilesRecursively(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getFilesRecursively(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    }
    return fileList;
}

async function seed() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'selectt-db'
    });

    try {
        console.log('Clearing existing cars from database...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('DELETE FROM cars');
        console.log('Existing cars cleared.');

        // Seed brands Skoda and Toyota if missing
        const [allBrands] = await connection.query('SELECT * FROM brands');
        const brandNames = allBrands.map(b => b.name);
        
        if (!brandNames.includes('Toyota')) {
            console.log('Seeding Toyota brand...');
            const [toyotaRes] = await connection.query("INSERT INTO brands (name, logo_url) VALUES ('Toyota', '/img/toyota.png')");
            const toyotaId = toyotaRes.insertId;
            await connection.query("INSERT INTO models (brand_id, name) VALUES (?, 'Urban Cruiser Hyryder')", [toyotaId]);
        }
        if (!brandNames.includes('Skoda')) {
            console.log('Seeding Skoda brand...');
            const [skodaRes] = await connection.query("INSERT INTO brands (name, logo_url) VALUES ('Skoda', '/img/skoda.png')");
            const skodaId = skodaRes.insertId;
            await connection.query("INSERT INTO models (brand_id, name) VALUES (?, 'Kylaq')", [skodaId]);
        }

        // Process each car and copy assets
        for (let i = 0; i < CARS_DETAILS.length; i++) {
            const car = CARS_DETAILS[i];
            console.log(`\n--------------------------------------------`);
            console.log(`Processing [${i + 1}/${CARS_DETAILS.length}]: ${car.year} ${car.make} ${car.model}`);
            
            const carFolder = path.join(SRC_DIR, car.folderName);
            if (!fs.existsSync(carFolder)) {
                console.error(`Folder not found: ${carFolder}`);
                continue;
            }

            // Find all files in the car folder
            const allFiles = getFilesRecursively(carFolder);
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP'];
            const videoExtensions = ['.mp4', '.mov', '.MP4', '.MOV'];

            const imageFiles = allFiles.filter(f => imageExtensions.includes(path.extname(f)));
            const videoFiles = allFiles.filter(f => videoExtensions.includes(path.extname(f)));

            console.log(`Found ${imageFiles.length} images and ${videoFiles.length} videos.`);

            // Copy images to public/uploads
            const copiedImageUrls = [];
            for (let j = 0; j < imageFiles.length; j++) {
                const srcPath = imageFiles[j];
                const fileExt = path.extname(srcPath).toLowerCase();
                const uniqueName = `car_${i + 1}_photo_${j + 1}_${Date.now()}${fileExt}`;
                const destPath = path.join(DEST_DIR, uniqueName);
                
                fs.copyFileSync(srcPath, destPath);
                copiedImageUrls.push(`/uploads/${uniqueName}`);
            }

            // Copy video to public/uploads
            let copiedVideoUrl = null;
            if (videoFiles.length > 0) {
                // If there are multiple videos, choose the first walkaround video or first video
                const srcPath = videoFiles.find(v => v.toLowerCase().includes('walkround') || v.toLowerCase().includes('walkaround')) || videoFiles[0];
                const fileExt = path.extname(srcPath).toLowerCase();
                const uniqueName = `car_${i + 1}_video_${Date.now()}${fileExt}`;
                const destPath = path.join(DEST_DIR, uniqueName);
                
                console.log(`Copying video: ${path.basename(srcPath)} -> ${uniqueName} (${(fs.statSync(srcPath).size / (1024 * 1024)).toFixed(2)} MB)`);
                fs.copyFileSync(srcPath, destPath);
                copiedVideoUrl = `/uploads/${uniqueName}`;
            }

            // Set main image and additional images
            const mainImage = copiedImageUrls.length > 0 
                ? copiedImageUrls.find(url => url.toLowerCase().includes('exterior_img') || url.toLowerCase().includes('exterior_file') || url.toLowerCase().includes('generated20image201')) || copiedImageUrls[0]
                : "/uploads/placeholder.jpg";
                
            const moreImages = copiedImageUrls.filter(url => url !== mainImage);

            // Prepare database values
            const values = {
                make: car.make,
                model: car.model,
                variant: car.variant,
                year: car.year,
                price: car.price,
                emi: car.emi,
                km: car.km,
                fuel_type: car.fuel_type,
                transmission: car.transmission,
                location: car.location,
                image: mainImage,
                is_assured: car.is_assured,
                tag: car.tag,
                hub: car.hub,
                ownership: car.ownership,
                engine_capacity: car.engine_capacity,
                reg_year: car.reg_year,
                reg_state: car.reg_state,
                spare_key: car.spare_key,
                insurance_status: car.insurance_status,
                color: car.color,
                body_type: car.body_type,
                description: car.description,
                reasons_to_buy: JSON.stringify(car.reasons_to_buy),
                specifications: JSON.stringify(car.specifications),
                features: JSON.stringify(car.features),
                quality_report: JSON.stringify(car.quality_report),
                more_images: JSON.stringify(moreImages),
                video_url: copiedVideoUrl
            };

            await connection.query('INSERT INTO cars SET ?', values);
            console.log(`Added database record with main image: ${mainImage} and video: ${copiedVideoUrl || 'None'}`);
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('\nSeeding completed successfully! Total 12 new premium cars added.');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await connection.end();
    }
}

seed();
