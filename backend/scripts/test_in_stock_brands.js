const mysql = require('mysql2');
const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'selectt-db' });

const carsSql = `
    SELECT 
        TRIM(c.make) as brand_name,
        TRIM(c.model) as model_name,
        COUNT(*) as car_count,
        MAX(c.image) as sample_image
    FROM cars c
    WHERE (c.status IS NULL OR c.status = '' OR c.status = 'active')
      AND c.status != 'sold_out'
      AND c.status != 'draft'
      AND c.make IS NOT NULL AND TRIM(c.make) != ''
      AND c.model IS NOT NULL AND TRIM(c.model) != ''
    GROUP BY TRIM(c.make), TRIM(c.model)
    ORDER BY TRIM(c.make) ASC, car_count DESC, TRIM(c.model) ASC
`;

db.query(carsSql, (carErr, carRows) => {
    if (carErr) {
        console.error(carErr);
        db.end();
        return;
    }

    db.query('SELECT id, name, logo_url, order_index FROM brands ORDER BY order_index ASC, id ASC', (brandErr, brandRows) => {
        const brandsTable = brandRows || [];
        const KNOWN_LOGOS = {
            'maruti suzuki': '/img/maruti-suzuki.webp',
            'maruti': '/img/maruti-suzuki.webp',
            'hyundai': '/img/hyundai.webp',
            'tata': '/img/tata.webp',
            'mahindra': '/img/mahindra.webp',
            'honda': '/img/honda.webp',
            'toyota': '/img/toyota.webp',
            'kia': '/img/kia.webp',
            'volkswagen': '/img/volkswagen.webp',
            'skoda': '/img/skoda.png',
            'mg': '/img/mg.webp',
            'morris garages': '/img/mg.webp',
            'renault': '/img/renault.webp',
            'bmw': '/img/bmw.webp',
            'mercedes-benz': '/img/mercedes-benz.webp',
            'mercedes': '/img/mercedes-benz.webp',
            'audi': '/img/audi.webp',
            'nissan': '/img/nissan.webp',
            'ford': '/img/ford.webp',
            'jeep': '/img/jeep.webp'
        };

        const brandMap = new Map();

        (carRows || []).forEach(row => {
            const rawBrand = (row.brand_name || '').trim();
            const rawModel = (row.model_name || '').trim();
            const count = Number(row.car_count || 1);
            if (!rawBrand || !rawModel || count <= 0) return;

            const lowerBrand = rawBrand.toLowerCase();

            const matchedBrand = brandsTable.find(b => 
                b.name.toLowerCase() === lowerBrand ||
                (lowerBrand.includes('maruti') && b.name.toLowerCase().includes('maruti'))
            );

            let entry = brandMap.get(lowerBrand);
            if (!entry) {
                const brandName = matchedBrand ? matchedBrand.name : rawBrand;
                const logoUrl = (matchedBrand && matchedBrand.logo_url) 
                    ? matchedBrand.logo_url 
                    : (KNOWN_LOGOS[lowerBrand] || KNOWN_LOGOS[brandName.toLowerCase()] || null);
                const orderIndex = matchedBrand && matchedBrand.order_index != null ? matchedBrand.order_index : 999;
                const id = matchedBrand ? matchedBrand.id : null;

                entry = {
                    id,
                    name: brandName,
                    logo_url: logoUrl,
                    order_index: orderIndex,
                    totalCount: 0,
                    models: []
                };
                brandMap.set(lowerBrand, entry);
            }

            entry.totalCount += count;
            entry.models.push({
                name: rawModel,
                count
            });
        });

        const result = Array.from(brandMap.values()).sort((a, b) => {
            if (a.order_index !== b.order_index) {
                return a.order_index - b.order_index;
            }
            return b.totalCount - a.totalCount;
        });

        console.log('Result:', JSON.stringify(result, null, 2));
        db.end();
    });
});
