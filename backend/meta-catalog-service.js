const fs = require('fs');
const path = require('path');

/**
 * Meta Catalog & Facebook Commerce Platform Integration Service
 * Supporting:
 * 1. Automotive & Product Scheduled CSV & XML Data Feeds for Meta Commerce Manager
 * 2. Meta Graph API (v21.0) Real-Time Batch Catalog Item Sync
 */

// Helper to escape CSV fields safely
function escapeCsv(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
    return `"${str}"`;
}

// Clean text for XML
function escapeXml(val) {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Build full asset URL
function buildFullUrl(uri, baseUrl) {
    if (!uri) return '';
    if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
    const cleanBase = (baseUrl || 'https://selectt.in').replace(/\/+$/, '');
    const cleanUri = uri.startsWith('/') ? uri : `/${uri}`;
    return `${cleanBase}${cleanUri}`;
}

// Format Car for Meta Automotive / Product Catalog
function formatCarForMeta(car, baseUrl, defaultBrand = 'Selectt Cars') {
    const siteUrl = (baseUrl || 'https://selectt.in').replace(/\/+$/, '');
    const priceNum = Number(car.price || 0);
    const offerPriceNum = car.offer_price ? Number(car.offer_price) : null;
    const effectivePrice = offerPriceNum && offerPriceNum > 0 ? offerPriceNum : priceNum;
    
    // Status & Availability mapping
    const isActive = car.status === 'active' || car.status === 'in_stock' || !car.status;
    const availability = isActive ? 'in stock' : 'out of stock';

    // Title construction
    const yearStr = car.year ? `${car.year} ` : '';
    const makeStr = car.make || defaultBrand;
    const modelStr = car.model ? ` ${car.model}` : '';
    const variantStr = car.variant ? ` ${car.variant}` : '';
    const title = `${yearStr}${makeStr}${modelStr}${variantStr}`.trim() || 'Selectt Pre-Owned Car';

    // Description construction
    const kmStr = car.km ? `${Number(car.km).toLocaleString('en-IN')} KM` : 'Low Mileage';
    const fuelStr = car.fuel_type || 'Petrol';
    const transStr = car.transmission || 'Manual';
    const locationStr = car.location || 'Mumbai Hub';
    const ownerStr = car.ownership ? `${car.ownership} Owner` : 'Certified Pre-Owned';
    const assuredStr = car.is_assured ? '✓ Selectt Assured with 1-Year Warranty & 7-Day Money Back' : '✓ Inspected Quality Used Car';
    
    const description = car.description 
        ? `${title} - ${car.description.slice(0, 4500)} | ${kmStr}, ${fuelStr}, ${transStr}, ${locationStr}. ${assuredStr}`
        : `${title} available for sale at Selectt Cars. Driven ${kmStr}, Fuel: ${fuelStr}, Transmission: ${transStr}, Location: ${locationStr}, ${ownerStr}. ${assuredStr}. Certified with rigorous 140+ quality inspection points.`;

    // Car URL Link
    const link = `${siteUrl}/buy-cars?id=${car.id}&ref=meta_catalog`;
    const canonicalLink = `${siteUrl}/cars/${car.id}`;

    // Main Image Link
    const imageLink = car.image ? buildFullUrl(car.image, siteUrl) : buildFullUrl('/img/suv.png', siteUrl);

    // Additional Images
    let additionalImages = [];
    if (car.more_images) {
        try {
            const parsed = typeof car.more_images === 'string' ? JSON.parse(car.more_images) : car.more_images;
            if (Array.isArray(parsed)) {
                additionalImages = parsed.map(img => buildFullUrl(img, siteUrl)).filter(Boolean);
            }
        } catch (_) {}
    }

    return {
        id: `SELECTT-CAR-${car.id}`,
        retailer_id: `SELECTT-CAR-${car.id}`,
        car_id: car.id,
        title,
        description,
        availability,
        condition: 'used',
        price: `${priceNum} INR`,
        sale_price: offerPriceNum && offerPriceNum < priceNum ? `${offerPriceNum} INR` : '',
        effective_price: effectivePrice,
        link: canonicalLink,
        image_link: imageLink,
        additional_image_link: additionalImages.join(','),
        additional_images_array: additionalImages,
        brand: car.make || defaultBrand,
        make: car.make || defaultBrand,
        model: car.model || 'Model',
        year: Number(car.year || new Date().getFullYear()),
        mileage_value: car.km ? Number(car.km) : 0,
        mileage_unit: 'KM',
        transmission: car.transmission || 'Manual',
        fuel_type: car.fuel_type || 'Petrol',
        body_style: car.body_type || 'Hatchback',
        color: car.color || 'Standard',
        state_of_vehicle: 'Used',
        registration_no: car.registration_no || '',
        location: locationStr,
        is_assured: Boolean(car.is_assured),
        custom_label_0: car.is_assured ? 'Selectt Assured' : 'Selectt Certified',
        custom_label_1: ownerStr,
        custom_label_2: locationStr,
        custom_label_3: car.status || 'in_stock',
        custom_label_4: car.listing_type || 'standard',
        fb_page_id: ''
    };
}

/**
 * Generate Meta Catalog CSV Feed (Automotive / Product standard format)
 */
function generateMetaCatalogCsv(cars, baseUrl, defaultBrand) {
    const headers = [
        'id',
        'title',
        'description',
        'availability',
        'condition',
        'price',
        'sale_price',
        'link',
        'image_link',
        'additional_image_link',
        'brand',
        'make',
        'model',
        'year',
        'mileage.value',
        'mileage.unit',
        'transmission',
        'fuel_type',
        'body_style',
        'color',
        'google_product_category',
        'fb_product_category',
        'state_of_vehicle',
        'custom_label_0',
        'custom_label_1',
        'custom_label_2',
        'custom_label_3',
        'custom_label_4'
    ];

    const rows = cars.map(car => {
        const item = formatCarForMeta(car, baseUrl, defaultBrand);
        return [
            escapeCsv(item.id),
            escapeCsv(item.title),
            escapeCsv(item.description),
            escapeCsv(item.availability),
            escapeCsv(item.condition),
            escapeCsv(item.price),
            escapeCsv(item.sale_price),
            escapeCsv(item.link),
            escapeCsv(item.image_link),
            escapeCsv(item.additional_image_link),
            escapeCsv(item.brand),
            escapeCsv(item.make),
            escapeCsv(item.model),
            escapeCsv(item.year),
            escapeCsv(item.mileage_value),
            escapeCsv(item.mileage_unit),
            escapeCsv(item.transmission),
            escapeCsv(item.fuel_type),
            escapeCsv(item.body_style),
            escapeCsv(item.color),
            escapeCsv('Vehicles & Parts > Vehicles > Motor Vehicles > Cars'),
            escapeCsv('Vehicles & Parts > Vehicles > Motor Vehicles > Cars'),
            escapeCsv(item.state_of_vehicle),
            escapeCsv(item.custom_label_0),
            escapeCsv(item.custom_label_1),
            escapeCsv(item.custom_label_2),
            escapeCsv(item.custom_label_3),
            escapeCsv(item.custom_label_4)
        ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

/**
 * Generate Meta Catalog XML Feed (Google Merchant & RSS 2.0 format supported by Meta)
 */
function generateMetaCatalogXml(cars, baseUrl, defaultBrand) {
    const siteUrl = (baseUrl || 'https://selectt.in').replace(/\/+$/, '');
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>Selectt Used Cars Meta Inventory Catalog</title>\n`;
    xml += `    <link>${escapeXml(siteUrl)}</link>\n`;
    xml += `    <description>Verified Pre-Owned Cars and Vehicles by Selectt India</description>\n`;
    xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;

    for (const car of cars) {
        const item = formatCarForMeta(car, baseUrl, defaultBrand);
        xml += `    <item>\n`;
        xml += `      <g:id>${escapeXml(item.id)}</g:id>\n`;
        xml += `      <g:title>${escapeXml(item.title)}</g:title>\n`;
        xml += `      <g:description>${escapeXml(item.description)}</g:description>\n`;
        xml += `      <g:link>${escapeXml(item.link)}</g:link>\n`;
        xml += `      <g:image_link>${escapeXml(item.image_link)}</g:image_link>\n`;
        if (item.additional_images_array.length > 0) {
            item.additional_images_array.slice(0, 10).forEach(addImg => {
                xml += `      <g:additional_image_link>${escapeXml(addImg)}</g:additional_image_link>\n`;
            });
        }
        xml += `      <g:availability>${escapeXml(item.availability)}</g:availability>\n`;
        xml += `      <g:price>${escapeXml(item.price)}</g:price>\n`;
        if (item.sale_price) {
            xml += `      <g:sale_price>${escapeXml(item.sale_price)}</g:sale_price>\n`;
        }
        xml += `      <g:condition>${escapeXml(item.condition)}</g:condition>\n`;
        xml += `      <g:brand>${escapeXml(item.brand)}</g:brand>\n`;
        xml += `      <g:make>${escapeXml(item.make)}</g:make>\n`;
        xml += `      <g:model>${escapeXml(item.model)}</g:model>\n`;
        xml += `      <g:year>${escapeXml(item.year)}</g:year>\n`;
        xml += `      <g:mileage>${escapeXml(item.mileage_value)} ${escapeXml(item.mileage_unit)}</g:mileage>\n`;
        xml += `      <g:transmission>${escapeXml(item.transmission)}</g:transmission>\n`;
        xml += `      <g:fuel_type>${escapeXml(item.fuel_type)}</g:fuel_type>\n`;
        xml += `      <g:body_style>${escapeXml(item.body_style)}</g:body_style>\n`;
        xml += `      <g:color>${escapeXml(item.color)}</g:color>\n`;
        xml += `      <g:custom_label_0>${escapeXml(item.custom_label_0)}</g:custom_label_0>\n`;
        xml += `      <g:custom_label_1>${escapeXml(item.custom_label_1)}</g:custom_label_1>\n`;
        xml += `      <g:custom_label_2>${escapeXml(item.custom_label_2)}</g:custom_label_2>\n`;
        xml += `      <g:custom_label_3>${escapeXml(item.custom_label_3)}</g:custom_label_3>\n`;
        xml += `    </item>\n`;
    }

    xml += `  </channel>\n`;
    xml += `</rss>`;
    return xml;
}

/**
 * Test Meta Graph API Connection against Catalog ID
 */
async function testMetaCatalogConnection({ catalogId, accessToken }) {
    if (!catalogId || !accessToken) {
        return { success: false, message: 'Meta Catalog ID and System User Access Token are required.' };
    }

    try {
        const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(catalogId)}?fields=id,name,vertical,product_count,catalog_store&access_token=${encodeURIComponent(accessToken)}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || data.error) {
            return {
                success: false,
                message: data.error?.message || 'Failed to authenticate with Meta Graph API.',
                error: data.error
            };
        }

        return {
            success: true,
            catalog_id: data.id,
            catalog_name: data.name || 'Meta Automotive Catalog',
            vertical: data.vertical || 'vehicles',
            product_count: data.product_count || 0,
            message: `Successfully connected to Meta Catalog "${data.name || data.id}"!`
        };
    } catch (err) {
        return {
            success: false,
            message: `Network error connecting to Meta Graph API: ${err.message}`
        };
    }
}

/**
 * Push Batch of items to Meta Graph API (items_batch endpoint)
 */
async function pushBatchToMetaGraphApi({ catalogId, accessToken, items, method = 'UPDATE' }) {
    if (!catalogId || !accessToken) {
        return { success: false, message: 'Missing Meta Catalog ID or Access Token' };
    }

    if (!Array.isArray(items) || items.length === 0) {
        return { success: true, message: 'No items to sync', count: 0 };
    }

    // Prepare batch payload for Meta Catalog items_batch API
    const requests = items.map(item => {
        return {
            method: method,
            retailer_id: item.id,
            data: {
                id: item.id,
                title: item.title,
                description: item.description,
                availability: item.availability,
                condition: item.condition,
                price: item.price,
                sale_price: item.sale_price || undefined,
                url: item.link,
                image_url: item.image_link,
                additional_image_urls: item.additional_images_array?.slice(0, 10),
                brand: item.brand,
                make: item.make,
                model: item.model,
                year: item.year,
                mileage: {
                    value: item.mileage_value,
                    unit: item.mileage_unit
                },
                transmission: item.transmission,
                fuel_type: item.fuel_type,
                body_style: item.body_style,
                color: item.color,
                state_of_vehicle: item.state_of_vehicle,
                custom_label_0: item.custom_label_0,
                custom_label_1: item.custom_label_1,
                custom_label_2: item.custom_label_2,
                custom_label_3: item.custom_label_3
            }
        };
    });

    try {
        const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(catalogId)}/items_batch`;
        
        // Chunk requests in batches of 100
        const batchSize = 100;
        let successCount = 0;
        let lastResponse = null;

        for (let i = 0; i < requests.length; i += batchSize) {
            const chunk = requests.slice(i, i + batchSize);
            const body = {
                item_type: 'PRODUCT_ITEM',
                requests: chunk
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            lastResponse = data;

            if (res.ok && !data.error) {
                successCount += chunk.length;
            } else {
                console.error('[Meta Graph Batch Sync Error]:', data.error);
                return {
                    success: false,
                    message: data.error?.message || 'Meta batch sync rejected.',
                    error: data.error,
                    synced_so_far: successCount
                };
            }
        }

        return {
            success: true,
            synced_count: successCount,
            response: lastResponse,
            message: `Successfully synchronized ${successCount} vehicle(s) with Meta Catalog!`
        };
    } catch (err) {
        console.error('[Meta Graph API Exception]:', err);
        return {
            success: false,
            message: `Exception sending batch to Meta: ${err.message}`
        };
    }
}

/**
 * Health check on car catalog items to diagnose issues before Meta feed ingestion
 */
function analyzeCatalogHealth(cars, baseUrl) {
    let missingImages = 0;
    let missingPrices = 0;
    let missingMakes = 0;
    let missingYears = 0;
    let readyCount = 0;
    const issues = [];

    cars.forEach(car => {
        const carIssues = [];
        if (!car.image) {
            missingImages++;
            carIssues.push('Missing main vehicle photo');
        }
        if (!car.price || Number(car.price) <= 0) {
            missingPrices++;
            carIssues.push('Price is 0 or unassigned');
        }
        if (!car.make) {
            missingMakes++;
            carIssues.push('Brand / Make name missing');
        }
        if (!car.year) {
            missingYears++;
            carIssues.push('Manufacturing year missing');
        }

        if (carIssues.length === 0) {
            readyCount++;
        } else {
            issues.push({
                id: car.id,
                title: `${car.year || ''} ${car.make || 'Car'} ${car.model || ''}`.trim(),
                issues: carIssues
            });
        }
    });

    const healthPercentage = cars.length > 0 ? Math.round((readyCount / cars.length) * 100) : 100;

    return {
        total_cars: cars.length,
        ready_for_meta: readyCount,
        health_percentage: healthPercentage,
        missing_images: missingImages,
        missing_prices: missingPrices,
        missing_makes: missingMakes,
        missing_years: missingYears,
        problematic_items: issues.slice(0, 15) // Top 15 issues for admin inspection
    };
}

module.exports = {
    formatCarForMeta,
    generateMetaCatalogCsv,
    generateMetaCatalogXml,
    testMetaCatalogConnection,
    pushBatchToMetaGraphApi,
    analyzeCatalogHealth,
    buildFullUrl
};
