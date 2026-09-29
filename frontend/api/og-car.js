export default async function handler(req, res) {
  const { id, brand, model, variant, slug } = req.query;

  // Extract ID from query params or request URL if passed as path
  let carId = id;
  if (!carId && req.url) {
    const segments = req.url.split('?')[0].split('/').filter(Boolean);
    carId = segments[segments.length - 1];
  }

  if (!carId) {
    return res.redirect(302, 'https://selectt.in/buy-cars');
  }

  const isBot = /facebookexternalhit|Facebot|WhatsApp|Twitterbot|TelegramBot|Slackbot|LinkedInBot|Discordbot|Pinterest|SkypeUriPreview/i.test(
    req.headers['user-agent'] || ''
  );

  let car = null;
  try {
    const apiRes = await fetch(`https://api.selectt.in/api/cars/${carId}`);
    if (apiRes.ok) {
      car = await apiRes.json();
    }
  } catch (err) {
    console.error('Error fetching car for OG:', err);
  }

  if (!car || !car.id) {
    if (!isBot) {
      return res.redirect(302, `https://selectt.in/car/${carId}`);
    }
    return res.status(404).send('Car not found');
  }

  // Build Title
  const year = car.year || car.manufacturing_year || '';
  const make = car.make || car.brand || '';
  const modelName = car.model || '';
  const carVariant = car.variant || '';
  const carTitle = `${year} ${make} ${modelName} ${carVariant}`.trim() || 'Certified Pre-Owned Car';

  // Build Description & Price
  const formattedPrice = car.price ? `₹${Number(car.price).toLocaleString('en-IN')}` : 'Fair Price';
  const km = (car.kms_driven || car.km_driven || car.mileage) ? `${Number(car.kms_driven || car.km_driven || car.mileage).toLocaleString('en-IN')} km` : '';
  const fuel = car.fuel_type || '';
  const transmission = car.transmission || '';
  const city = car.city || car.location || 'Mumbai';

  const descParts = [formattedPrice, km, fuel, transmission, city, '200-Point Inspected', 'Selectt Assured'].filter(Boolean);
  const description = descParts.join(' • ');

  // Extract Main Image
  let imageUrl = 'https://selectt.in/img/selectt-og.png';
  if (car.primary_image) {
    imageUrl = car.primary_image;
  } else if (Array.isArray(car.images) && car.images.length > 0) {
    const firstImg = car.images[0];
    imageUrl = typeof firstImg === 'string' ? firstImg : (firstImg.url || firstImg.image_url || firstImg.path);
  } else if (car.image) {
    imageUrl = car.image;
  }

  if (imageUrl && !imageUrl.startsWith('http')) {
    if (imageUrl.startsWith('/uploads/')) {
      imageUrl = `https://api.selectt.in${imageUrl}`;
    } else if (imageUrl.startsWith('/')) {
      imageUrl = `https://selectt.in${imageUrl}`;
    }
  }

  // Canonical URL
  const slugPart = [make, modelName, carVariant].filter(Boolean).map(s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')).join('/');
  const canonicalUrl = slugPart ? `https://selectt.in/car/${slugPart}/${car.id}` : `https://selectt.in/car/${car.id}`;

  // If regular browser user visits this function directly, redirect to the real SPA page
  if (!isBot) {
    return res.redirect(302, canonicalUrl);
  }

  // Return server-rendered HTML with full Open Graph meta tags for scrapers
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

  return res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${carTitle} | Selectt Mumbai</title>
  <meta name="description" content="${description}" />
  
  <!-- Open Graph / WhatsApp / Facebook / Instagram / Social Previews -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Selectt" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${carTitle} | ${formattedPrice}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${carTitle}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="${carTitle} | ${formattedPrice}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />

  <!-- Canonical -->
  <link rel="canonical" href="${canonicalUrl}" />
</head>
<body>
  <h1>${carTitle}</h1>
  <p>${description}</p>
  <img src="${imageUrl}" alt="${carTitle}" />
  <p><a href="${canonicalUrl}">View Car on Selectt.in</a></p>
</body>
</html>`);
}
