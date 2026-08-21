const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const cars = [
    {
        make: "Maruti Suzuki", model: "Swift", variant: "VXI", year: 2019, price: 525000, emi: 9500, km: 32000, fuel_type: "Petrol", transmission: "Manual", location: "New Delhi",
        image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800",
        is_assured: 1, tag: "Top Rated", hub: "Selectt Hub, Rohini",
        ownership: "1st Owner", engine_capacity: "1197 cc", reg_year: 2019, reg_state: "Delhi", spare_key: "Yes", insurance_status: "Active", color: "White", body_type: "Hatchback",
        description: "Peppy car in excellent condition.",
        reasons_to_buy: JSON.stringify([{ icon: "ShieldCheck", title: "Low Maintenance", description: "Inexpensive to service and run." }]),
        specifications: JSON.stringify([{ label: "Mileage", value: "21.0 kmpl", icon: "Gauge" }]),
        features: JSON.stringify([{ icon: "Smartphone", label: "BT Audio" }]),
        quality_report: JSON.stringify({ summary: "Reliable city car.", coreScore: "9.5", supportingScore: "9.2", interiorsScore: "9.4", exteriorsScore: "9.3", wearTearScore: "9.0" }),
        more_images: JSON.stringify([])
    },
    {
        make: "Hyundai", model: "Creta", variant: "SX (O) Petrol", year: 2021, price: 1450000, emi: 24000, km: 15400, fuel_type: "Petrol", transmission: "Automatic", location: "Gurgaon",
        image: "https://images.unsplash.com/photo-1623161394541-e9451978d387?auto=format&fit=crop&q=80&w=800",
        is_assured: 1, tag: "Trending", hub: "Selectt Hub, MG Road",
        ownership: "1st Owner", engine_capacity: "1497 cc", reg_year: 2021, reg_state: "Haryana", spare_key: "Yes", insurance_status: "Active", color: "Black", body_type: "SUV",
        description: "Feature-loaded SUV.",
        reasons_to_buy: JSON.stringify([{ icon: "Sun", title: "Panoramic Sunroof", description: "Large sunroof for premium feel." }]),
        specifications: JSON.stringify([{ label: "Mileage", value: "16.8 kmpl", icon: "Gauge" }]),
        features: JSON.stringify([{ icon: "Wind", label: "Auto AC" }]),
        quality_report: JSON.stringify({ summary: "Mint condition.", coreScore: "9.8", supportingScore: "9.7", interiorsScore: "9.8", exteriorsScore: "9.6", wearTearScore: "9.5" }),
        more_images: JSON.stringify([])
    },
    {
        make: "Honda", model: "City", variant: "V MT", year: 2018, price: 780000, emi: 12500, km: 45000, fuel_type: "Diesel", transmission: "Manual", location: "Noida",
        image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800",
        is_assured: 1, tag: "Comfort", hub: "Selectt Hub, Sec 62",
        ownership: "2nd Owner", engine_capacity: "1498 cc", reg_year: 2018, reg_state: "UP", spare_key: "Yes", insurance_status: "Active", color: "Silver", body_type: "Sedan",
        description: "Comfortable sedan.",
        reasons_to_buy: JSON.stringify([{ icon: "Check", title: "Honda Reliability", description: "Engine is in perfect shape." }]),
        specifications: JSON.stringify([{ label: "Mileage", value: "25.6 kmpl", icon: "Gauge" }]),
        features: JSON.stringify([{ icon: "Play", label: "Push Start" }]),
        quality_report: JSON.stringify({ summary: "Great highway cruiser.", coreScore: "9.4", supportingScore: "9.2", interiorsScore: "9.1", exteriorsScore: "9.0", wearTearScore: "8.8" }),
        more_images: JSON.stringify([])
    },
    {
        make: "Toyota", model: "Fortuner", variant: "2.8L 4x4 AT", year: 2022, price: 3850000, emi: 65000, km: 12000, fuel_type: "Diesel", transmission: "Automatic", location: "Mumbai",
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
        is_assured: 1, tag: "Premium SUV", hub: "Selectt Hub, Goregaon",
        ownership: "1st Owner", engine_capacity: "2755 cc", reg_year: 2022, reg_state: "Maharashtra", spare_key: "Yes", insurance_status: "Active", color: "White", body_type: "SUV",
        description: "Showroom condition SUV.",
        reasons_to_buy: JSON.stringify([{ icon: "ShieldCheck", title: "Built to Last", description: "Industrial grade reliability." }]),
        specifications: JSON.stringify([{ label: "Engine", value: "2755 cc", icon: "Cpu" }]),
        features: JSON.stringify([{ icon: "Disc", label: "Alloys" }]),
        quality_report: JSON.stringify({ summary: "Excellent.", coreScore: "10.0", supportingScore: "9.9", interiorsScore: "9.9", exteriorsScore: "9.9", wearTearScore: "9.8" }),
        more_images: JSON.stringify([])
    },
    {
        make: "Mahindra", model: "XUV700", variant: "AX7 Luxury", year: 2021, price: 2150000, emi: 38000, km: 18000, fuel_type: "Petrol", transmission: "Automatic", location: "Bangalore",
        image: "https://images.unsplash.com/photo-1623161394541-e9451978d387?auto=format&fit=crop&q=80&w=800",
        is_assured: 1, tag: "Smart SUV", hub: "Selectt Hub, Indiranagar",
        ownership: "1st Owner", engine_capacity: "1997 cc", reg_year: 2021, reg_state: "Karnataka", spare_key: "Yes", insurance_status: "Active", color: "White", body_type: "SUV",
        description: "Advanced tech-loaded SUV.",
        reasons_to_buy: JSON.stringify([{ icon: "Eye", title: "Advanced Safety", description: "ADAS functionality verified." }]),
        specifications: JSON.stringify([{ label: "Power", value: "200hp", icon: "Cpu" }]),
        features: JSON.stringify([{ icon: "Monitor", label: "Dual Screen" }]),
        quality_report: JSON.stringify({ summary: "High tech condition.", coreScore: "9.9", supportingScore: "9.8", interiorsScore: "9.8", exteriorsScore: "9.7", wearTearScore: "9.6" }),
        more_images: JSON.stringify([])
    },
    {
        make: "Tata", model: "Nexon", variant: "XZA+ (O)", year: 2020, price: 925000, emi: 16500, km: 28000, fuel_type: "Petrol", transmission: "Automatic", location: "Pune",
        image: "https://images.unsplash.com/photo-1606148632399-5264d416196a?auto=format&fit=crop&q=80&w=800",
        is_assured: 1, tag: "Safest", hub: "Selectt Hub, Hinjewadi",
        ownership: "1st Owner", engine_capacity: "1199 cc", reg_year: 2020, reg_state: "Maharashtra", spare_key: "Yes", insurance_status: "Active", color: "Blue", body_type: "SUV",
        description: "5-star safety rated car.",
        reasons_to_buy: JSON.stringify([{ icon: "Shield", title: "Top Safety", description: "Peace of mind for family." }]),
        specifications: JSON.stringify([{ label: "Safety", value: "5 Star", icon: "ShieldCheck" }]),
        features: JSON.stringify([{ icon: "Sun", label: "Sunroof" }]),
        quality_report: JSON.stringify({ summary: "Solid build.", coreScore: "9.7", supportingScore: "9.6", interiorsScore: "9.6", exteriorsScore: "9.5", wearTearScore: "9.4" }),
        more_images: JSON.stringify([])
    },
    {
        make: "Maruti Suzuki", model: "Baleno", variant: "Alpha 1.2", year: 2022, price: 795000, emi: 14000, km: 8500, fuel_type: "Petrol", transmission: "Manual", location: "Delhi",
        image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800",
        is_assured: 1, tag: "Low KM", hub: "Selectt Hub, Rohini",
        ownership: "1st Owner", engine_capacity: "1197 cc", reg_year: 2022, reg_state: "Delhi", spare_key: "Yes", insurance_status: "Active", color: "Blue", body_type: "Hatchback",
        description: "Practically new Baleno.",
        reasons_to_buy: JSON.stringify([{ icon: "Zap", title: "Efficiency", description: "Hybrid tech for better city use." }]),
        specifications: JSON.stringify([{ label: "Mileage", value: "22.3 kmpl", icon: "Gauge" }]),
        features: JSON.stringify([{ icon: "Camera", label: "360 Cam" }]),
        quality_report: JSON.stringify({ summary: "Pristine.", coreScore: "9.9", supportingScore: "9.9", interiorsScore: "9.8", exteriorsScore: "9.8", wearTearScore: "9.9" }),
        more_images: JSON.stringify([])
    },
    {
        make: "Hyundai", model: "Verna", variant: "1.5 Turbo GDI SX (O)", year: 2022, price: 1675000, emi: 28000, km: 5400, fuel_type: "Petrol", transmission: "Automatic", location: "Gurgaon",
        image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800",
        is_assured: 1, tag: "Performance", hub: "Selectt Hub, MG Road",
        ownership: "1st Owner", engine_capacity: "1482 cc", reg_year: 2022, reg_state: "Haryana", spare_key: "Yes", insurance_status: "Active", color: "Black", body_type: "Sedan",
        description: "Turbocharged speed and luxury.",
        reasons_to_buy: JSON.stringify([{ icon: "Wind", title: "Ventilated Seats", description: "Luxury specs at every corner." }]),
        specifications: JSON.stringify([{ label: "Power", value: "160PS", icon: "Cpu" }]),
        features: JSON.stringify([{ icon: "Speaker", label: "BOSE Audio" }]),
        quality_report: JSON.stringify({ summary: "Turbocharged gem.", coreScore: "10.0", supportingScore: "9.9", interiorsScore: "9.9", exteriorsScore: "9.9", wearTearScore: "9.9" }),
        more_images: JSON.stringify([])
    },
    {
        make: "Toyota", model: "Innova Crysta", variant: "2.4 GX 7 STR", year: 2018, price: 1650000, emi: 28500, km: 75000, fuel_type: "Diesel", transmission: "Manual", location: "Noida",
        image: "https://images.unsplash.com/photo-1581235720704-06d3acfcba8e?auto=format&fit=crop&q=80&w=800",
        is_assured: 1, tag: "Comfort", hub: "Selectt Hub, Sec 62",
        ownership: "1st Owner", engine_capacity: "2393 cc", reg_year: 2018, reg_state: "UP", spare_key: "Yes", insurance_status: "Active", color: "Silver", body_type: "MPV",
        description: "The ultimate long-distance car.",
        reasons_to_buy: JSON.stringify([{ icon: "Users", title: "Spacious", description: "Fits the whole family easily." }]),
        specifications: JSON.stringify([{ label: "Mileage", value: "13.6 kmpl", icon: "Gauge" }]),
        features: JSON.stringify([{ icon: "Wind", label: "Rear AC" }]),
        quality_report: JSON.stringify({ summary: "Durable workhorse.", coreScore: "9.3", supportingScore: "9.1", interiorsScore: "9.0", exteriorsScore: "8.9", wearTearScore: "8.7" }),
        more_images: JSON.stringify([])
    },
    {
        make: "Mahindra", model: "Thar", variant: "LX 4-Str Hard Top", year: 2021, price: 1425000, emi: 24000, km: 12500, fuel_type: "Diesel", transmission: "Manual", location: "Chandigarh",
        image: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=800",
        is_assured: 1, tag: "Off-roader", hub: "Selectt Hub, Zirakpur",
        ownership: "1st Owner", engine_capacity: "2184 cc", reg_year: 2021, reg_state: "Punjab", spare_key: "Yes", insurance_status: "Active", color: "Red", body_type: "SUV",
        description: "Tough SUV for any terrain.",
        reasons_to_buy: JSON.stringify([{ icon: "MapPin", title: "Off-Road Ready", description: "Proper 4x4 logic." }]),
        specifications: JSON.stringify([{ label: "Drive", value: "4x4", icon: "Settings" }]),
        features: JSON.stringify([{ icon: "Box", label: "Hard Top" }]),
        quality_report: JSON.stringify({ summary: "Adventure king.", coreScore: "9.8", supportingScore: "9.7", interiorsScore: "9.7", exteriorsScore: "9.5", wearTearScore: "9.6" }),
        more_images: JSON.stringify([])
    },
    {
        make: "Tata", model: "Harrier", variant: "XTA Plus", year: 2021, price: 1780000, emi: 31000, km: 22000, fuel_type: "Diesel", transmission: "Automatic", location: "Lucknow",
        image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800",
        is_assured: 1, tag: "Presence", hub: "Selectt Hub, Hazratganj",
        ownership: "1st Owner", engine_capacity: "1956 cc", reg_year: 2021, reg_state: "UP", spare_key: "Yes", insurance_status: "Active", color: "Dark Grey", body_type: "SUV",
        description: "Stunning SUV with massive road presence.",
        reasons_to_buy: JSON.stringify([{ icon: "Monitor", title: "Infotainment", description: "Large touchscreen with JBL." }]),
        specifications: JSON.stringify([{ label: "Power", value: "170PS", icon: "Cpu" }]),
        features: JSON.stringify([{ icon: "Music", label: "JBL Audio" }]),
        quality_report: JSON.stringify({ summary: "Premium feel.", coreScore: "9.6", supportingScore: "9.5", interiorsScore: "9.6", exteriorsScore: "9.4", wearTearScore: "9.2" }),
        more_images: JSON.stringify([])
    },
    {
        make: "Kia", model: "Seltos", variant: "HTX 1.5", year: 2020, price: 1245000, emi: 21500, km: 34000, fuel_type: "Petrol", transmission: "Manual", location: "Hyderabad",
        image: "https://images.unsplash.com/photo-1629891228224-b1c312760777?auto=format&fit=crop&q=80&w=800",
        is_assured: 1, tag: "Modern", hub: "Selectt Hub, Jubilee Hills",
        ownership: "1st Owner", engine_capacity: "1497 cc", reg_year: 2020, reg_state: "Telangana", spare_key: "Yes", insurance_status: "Active", color: "White", body_type: "SUV",
        description: "Modern SUV with all bells and whistles.",
        reasons_to_buy: JSON.stringify([{ icon: "Star", title: "High Features", description: "Bose sound and air purifier." }]),
        specifications: JSON.stringify([{ label: "Mileage", value: "16.8 kmpl", icon: "Gauge" }]),
        features: JSON.stringify([{ icon: "Wind", label: "Air Purifier" }]),
        quality_report: JSON.stringify({ summary: "Smart SUV.", coreScore: "9.5", supportingScore: "9.4", interiorsScore: "9.5", exteriorsScore: "9.3", wearTearScore: "9.2" }),
        more_images: JSON.stringify([])
    },
    {
        make: "Honda", model: "Amaze", variant: "1.2 VX CVT", year: 2019, price: 685000, emi: 11500, km: 41000, fuel_type: "Petrol", transmission: "Automatic", location: "Kochi",
        image: "https://images.unsplash.com/photo-1589148625904-7ee43cf498bc?auto=format&fit=crop&q=80&w=800",
        is_assured: 1, tag: "City Friendly", hub: "Selectt Hub, Edappally",
        ownership: "1st Owner", engine_capacity: "1199 cc", reg_year: 2019, reg_state: "Kerala", spare_key: "Yes", insurance_status: "Active", color: "Red", body_type: "Sedan",
        description: "Compact sedan with a smooth CVT.",
        reasons_to_buy: JSON.stringify([{ icon: "Play", title: "Smooth Engine", description: "Perfect for city traffic." }]),
        specifications: JSON.stringify([{ label: "Mileage", value: "18.3 kmpl", icon: "Gauge" }]),
        features: JSON.stringify([{ icon: "Smartphone", label: "Touchscreen" }]),
        quality_report: JSON.stringify({ summary: "City gem.", coreScore: "9.4", supportingScore: "9.3", interiorsScore: "9.2", exteriorsScore: "9.1", wearTearScore: "9.0" }),
        more_images: JSON.stringify([])
    },
    {
        make: "Toyota", model: "Glanza", variant: "V Hybrid", year: 2023, price: 985000, emi: 17000, km: 4500, fuel_type: "Petrol", transmission: "Manual", location: "Bangalore",
        image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800",
        is_assured: 1, tag: "Efficient", hub: "Selectt Hub, Indiranagar",
        ownership: "1st Owner", engine_capacity: "1197 cc", reg_year: 2023, reg_state: "Karnataka", spare_key: "Yes", insurance_status: "Active", color: "Blue", body_type: "Hatchback",
        description: "Nearly new Glanza with hybrid tech.",
        reasons_to_buy: JSON.stringify([{ icon: "Zap", title: "Extra Mileage", description: "Hybrid efficiency in city." }]),
        specifications: JSON.stringify([{ label: "Mileage", value: "24.5 kmpl", icon: "Gauge" }]),
        features: JSON.stringify([{ icon: "Wifi", label: "Connect App" }]),
        quality_report: JSON.stringify({ summary: "New condition.", coreScore: "10.0", supportingScore: "10.0", interiorsScore: "9.9", exteriorsScore: "9.9", wearTearScore: "10.0" }),
        more_images: JSON.stringify([])
    },
    {
        make: "Maruti Suzuki", model: "Brezza", variant: "ZXI Plus AT", year: 2022, price: 1225000, emi: 21000, km: 9200, fuel_type: "Petrol", transmission: "Automatic", location: "Gurgaon",
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
        is_assured: 1, tag: "Balanced", hub: "Selectt Hub, NH8",
        ownership: "1st Owner", engine_capacity: "1462 cc", reg_year: 2022, reg_state: "Haryana", spare_key: "Yes", insurance_status: "Active", color: "Brown", body_type: "SUV",
        description: "Robust SUV for daily driving.",
        reasons_to_buy: JSON.stringify([{ icon: "Shield", title: "High Resale", description: "Value for money always." }]),
        specifications: JSON.stringify([{ label: "Mileage", value: "19.8 kmpl", icon: "Gauge" }]),
        features: JSON.stringify([{ icon: "Camera", label: "360 View" }]),
        quality_report: JSON.stringify({ summary: "Great SUV.", coreScore: "9.8", supportingScore: "9.7", interiorsScore: "9.7", exteriorsScore: "9.6", wearTearScore: "9.5" }),
        more_images: JSON.stringify([])
    }
];

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database...');

    db.query('SET FOREIGN_KEY_CHECKS = 0', (err) => {
        if (err) throw err;
        
        db.query('DELETE FROM cars', (err) => {
            if (err) throw err;
            console.log('Cleared existing cars for a clean set of 15.');

            const query = 'INSERT INTO cars (make, model, variant, year, price, emi, km, fuel_type, transmission, location, image, is_assured, tag, hub, ownership, engine_capacity, reg_year, reg_state, spare_key, insurance_status, color, body_type, description, reasons_to_buy, specifications, features, quality_report, more_images) VALUES ?';
            
            const values = cars.map(c => [
                c.make, c.model, c.variant, c.year, c.price, c.emi, c.km, c.fuel_type, c.transmission, c.location, c.image, c.is_assured, c.tag, c.hub, c.ownership, c.engine_capacity, c.reg_year, c.reg_state, c.spare_key, c.insurance_status, c.color, c.body_type, c.description, c.reasons_to_buy, c.specifications, c.features, c.quality_report, c.more_images
            ]);

            db.query(query, [values], (err, result) => {
                if (err) throw err;
                console.log(`Successfully added ${result.affectedRows} high-quality cars! Total: 15.`);
                
                db.query('SET FOREIGN_KEY_CHECKS = 1', (err) => {
                    if (err) throw err;
                    db.end();
                    process.exit();
                });
            });
        });
    });
});
