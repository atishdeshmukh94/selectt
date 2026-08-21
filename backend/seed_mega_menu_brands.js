const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const megaBrands = [
  {
    make: "Maruti Suzuki",
    models: ["Baleno", "Swift", "Alto 800", "Wagon R", "Ciaz"]
  },
  {
    make: "Hyundai",
    models: ["Grand i10", "i20", "Creta", "Elite i20", "Venue"]
  },
  {
    make: "Honda",
    models: ["City", "Amaze", "Jazz", "Brio", "Elevate"]
  },
  {
    make: "Tata",
    models: ["Nexon", "Tiago", "Altroz", "Punch", "Harrier"]
  },
  {
    make: "Kia",
    models: ["Seltos", "Sonet", "Carens", "Syros", "Carens Clavis"]
  },
  {
    make: "Renault",
    models: ["Kwid", "Kiger", "Triber", "Duster", "Captur"]
  }
];

async function seedBrands() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "selectt_db",
  });

  try {
    console.log("Seeding Brands and Models...");

    for (const b of megaBrands) {
      // Upsert Brand
      const [existingBrand] = await db.query("SELECT id FROM brands WHERE name = ?", [b.make]);
      let brandId;

      if (existingBrand.length > 0) {
        brandId = existingBrand[0].id;
        console.log(`Brand ${b.make} exists (ID: ${brandId})`);
      } else {
        const [result] = await db.query(
          "INSERT INTO brands (name, logo_url) VALUES (?, ?)", 
          [b.make, `https://logo.clearbit.com/${b.make.toLowerCase().replace(" ", "")}.com`]
        );
        brandId = result.insertId;
        console.log(`Created Brand ${b.make} (ID: ${brandId})`);
      }

      // Upsert Models
      for (const m of b.models) {
        const [existingModel] = await db.query("SELECT id FROM models WHERE name = ? AND brand_id = ?", [m, brandId]);
        if (existingModel.length === 0) {
           await db.query("INSERT INTO models (brand_id, name) VALUES (?, ?)", [brandId, m]);
           console.log(`  - Created Model ${m}`);
        } else {
           console.log(`  - Model ${m} exists`);
        }
      }
    }

    console.log("Seeding complete.");
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await db.end();
  }
}

seedBrands();
