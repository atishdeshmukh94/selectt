export const shortenLocation = (loc) => {
  if (!loc) return '';
  const str = String(loc).trim();
  if (!str) return '';

  const parts = str.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return str;

  // Filter out generic country like 'India'
  const filtered = parts.filter(p => p.toLowerCase() !== 'india');

  if (filtered.length <= 2) {
    const combined = filtered.join(', ');
    return combined.length > 35 ? combined.slice(0, 35) + '...' : combined;
  }

  // If multi-part full address e.g. "Infinity Mall Link Road, Oshiwara, Andheri West, Mumbai, Maharashtra"
  const city = filtered[filtered.length - 2] || filtered[filtered.length - 1];
  const locality = filtered[filtered.length - 3] || filtered[0];

  if (locality && city && locality.toLowerCase() !== city.toLowerCase()) {
    const candidate = `${locality}, ${city}`;
    if (candidate.length <= 35) return candidate;
  }

  const firstTwo = filtered.slice(0, 2).join(', ');
  if (firstTwo.length <= 35) return firstTwo;

  const fallback = filtered[filtered.length - 2]
    ? `${filtered[filtered.length - 2]}, ${filtered[filtered.length - 1]}`
    : filtered[0];

  return fallback.length > 35 ? fallback.slice(0, 35) + '...' : fallback;
};

export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const getCarDetailsUrl = (car) => {
  if (!car) return '/buy-cars';
  const id = car.id || car._id;
  if (!id) return '/buy-cars';

  const make = slugify(car.make || car.brand || 'car');
  const model = slugify(car.model || 'model');
  const carName = slugify(car.name || car.variant || `${car.year || ''}-${car.make || ''}-${car.model || ''}` || 'details');

  return `/car/${make}/${model}/${carName}/${id}`;
};
