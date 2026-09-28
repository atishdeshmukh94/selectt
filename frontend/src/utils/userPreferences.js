/**
 * User Preferences & Algorithmic Recommendation Engine for Selectt
 * Tracks browsing behavior (car views, clicks, price range, brand & body type affinity)
 * and generates hyper-personalized car recommendations for:
 * 1. "Handpicked For You" / "Selected for You" (Home Page)
 * 2. "Still Can't Decide?" (Car Details Page)
 */

const STORAGE_KEY_RECENT = 'recently_viewed_cars';
const STORAGE_KEY_PREFS = 'selectt_user_preferences';

/**
 * Track a car view and update user affinity preferences
 * @param {Object} car 
 */
export function trackCarView(car) {
  if (!car || !car.id) return;

  try {
    const rawPrice = Number(car.price) || 0;
    const make = (car.make || car.brand || '').trim();
    const bodyType = (car.bodyType || car.body_type || '').trim();
    const fuelType = (car.fuelType || car.fuel_type || '').trim();
    const transmission = (car.transmission || '').trim();
    const location = (car.location || car.city || '').trim();

    // 1. Update Recently Viewed List (max 15 items, deduplicated, newest first)
    let viewed = [];
    try {
      viewed = JSON.parse(localStorage.getItem(STORAGE_KEY_RECENT)) || [];
    } catch (_) {
      viewed = [];
    }

    // Filter out duplicate of this car
    viewed = viewed.filter(c => String(c.id) !== String(car.id));

    // Prepend current car with timestamp
    viewed.unshift({
      ...car,
      viewedAt: Date.now()
    });

    if (viewed.length > 15) {
      viewed = viewed.slice(0, 15);
    }
    localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(viewed));

    // 2. Update User Profile & Preference Affinity Engine
    let prefs = {};
    try {
      prefs = JSON.parse(localStorage.getItem(STORAGE_KEY_PREFS)) || {};
    } catch (_) {
      prefs = {};
    }

    const brandFreq = prefs.brandFreq || {};
    if (make) brandFreq[make] = (brandFreq[make] || 0) + 1;

    const bodyTypeFreq = prefs.bodyTypeFreq || {};
    if (bodyType) bodyTypeFreq[bodyType] = (bodyTypeFreq[bodyType] || 0) + 1;

    const fuelFreq = prefs.fuelFreq || {};
    if (fuelType) fuelFreq[fuelType] = (fuelFreq[fuelType] || 0) + 1;

    const transFreq = prefs.transFreq || {};
    if (transmission) transFreq[transmission] = (transFreq[transmission] || 0) + 1;

    const prices = Array.isArray(prefs.prices) ? prefs.prices : [];
    if (rawPrice > 0) {
      prices.unshift(rawPrice);
      if (prices.length > 15) prices.pop();
    }

    const avgPrice = prices.length > 0 
      ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length) 
      : rawPrice;

    const updatedPrefs = {
      brandFreq,
      bodyTypeFreq,
      fuelFreq,
      transFreq,
      prices,
      avgPrice,
      lastLocation: location || prefs.lastLocation || '',
      viewCount: (prefs.viewCount || 0) + 1,
      lastViewedCarId: car.id,
      lastUpdated: Date.now()
    };

    localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(updatedPrefs));

    // Set lightweight cookie for session persistence
    try {
      document.cookie = `selectt_pref_city=${encodeURIComponent(location || '')}; path=/; max-age=2592000; SameSite=Lax`;
    } catch (_) {}

  } catch (err) {
    console.error('Error in trackCarView:', err);
  }
}

/**
 * Get stored user preferences
 */
export function getUserPreferences() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_PREFS)) || null;
  } catch (_) {
    return null;
  }
}

/**
 * Get recently viewed cars from localStorage
 */
export function getRecentlyViewedCars() {
  try {
    const viewed = JSON.parse(localStorage.getItem(STORAGE_KEY_RECENT)) || [];
    return viewed.filter(c => c && c.id && c.status !== 'sold_out');
  } catch (_) {
    return [];
  }
}

/**
 * Calculate match score for a car based on user preferences
 */
function scoreCar(car, prefs, userCity) {
  let score = 0;
  if (!car) return 0;

  const make = (car.make || car.brand || '').trim();
  const bodyType = (car.bodyType || car.body_type || '').trim();
  const fuelType = (car.fuelType || car.fuel_type || '').trim();
  const carLocation = (car.location || '').toLowerCase();
  const price = Number(car.price) || 0;
  const year = Number(car.year) || 2020;

  // City match (+25 pts)
  if (userCity) {
    const uCity = userCity.toLowerCase();
    if (carLocation.includes(uCity) || uCity.includes(carLocation)) {
      score += 25;
    }
  }

  // Brand affinity (+40 pts max)
  if (prefs?.brandFreq && make) {
    const count = prefs.brandFreq[make] || 0;
    if (count >= 3) score += 40;
    else if (count === 2) score += 30;
    else if (count === 1) score += 20;
  }

  // Body Type affinity (+35 pts max)
  if (prefs?.bodyTypeFreq && bodyType) {
    const count = prefs.bodyTypeFreq[bodyType] || 0;
    if (count >= 3) score += 35;
    else if (count >= 1) score += 25;
  }

  // Price proximity (+30 pts max)
  if (prefs?.avgPrice && prefs.avgPrice > 0 && price > 0) {
    const diffRatio = Math.abs(price - prefs.avgPrice) / prefs.avgPrice;
    if (diffRatio <= 0.15) score += 30; // within 15%
    else if (diffRatio <= 0.30) score += 20; // within 30%
    else if (diffRatio <= 0.50) score += 10;
  }

  // Fuel Type affinity (+15 pts)
  if (prefs?.fuelFreq && fuelType) {
    const count = prefs.fuelFreq[fuelType] || 0;
    if (count >= 1) score += 15;
  }

  // Discount / Offer Zone Bonus (+15 pts)
  if (car.discountType && car.discountType !== 'none') score += 15;
  if (car.badgeText || car.badge_text) score += 10;

  // Modern Year Bonus (+10 pts)
  if (year >= 2022) score += 10;
  else if (year >= 2020) score += 5;

  return score;
}

/**
 * Get personalized recommendations for Home Page ("Handpicked For You" / "Selected For You")
 * @param {Array} allCars - Full car catalog
 * @param {Object} options - { limit = 8, city = '', excludeIds = [] }
 * @returns {Array} List of personalized cars
 */
export function getPersonalizedRecommendations(allCars = [], options = {}) {
  const { limit = 8, city = '', excludeIds = [] } = options;
  if (!Array.isArray(allCars) || allCars.length === 0) return [];

  const availableCars = allCars.filter(c => c && c.id && c.status !== 'sold_out' && !excludeIds.includes(c.id));
  const viewedCars = getRecentlyViewedCars().filter(c => !excludeIds.includes(c.id));
  const prefs = getUserPreferences();

  const isReturningVisitor = viewedCars.length > 0 || (prefs && prefs.viewCount > 0);

  if (isReturningVisitor) {
    // 1. Start with recently viewed cars
    const seenIds = new Set();
    const result = [];

    // Add up to 3 most recently viewed cars
    for (const vCar of viewedCars) {
      if (!seenIds.has(vCar.id) && availableCars.some(c => String(c.id) === String(vCar.id))) {
        seenIds.add(vCar.id);
        result.push(vCar);
      }
      if (result.length >= 3) break;
    }

    // 2. Score and rank remaining available candidate cars
    const candidates = availableCars
      .filter(car => !seenIds.has(car.id))
      .map(car => ({
        car,
        score: scoreCar(car, prefs, city || prefs?.lastLocation)
      }))
      .sort((a, b) => b.score - a.score);

    // Fill remaining slots up to limit
    for (const item of candidates) {
      if (!seenIds.has(item.car.id)) {
        seenIds.add(item.car.id);
        result.push(item.car);
      }
      if (result.length >= limit) break;
    }

    return result;
  }

  // Fallback for New Visitors: Curated Featured & Newest Listings in City
  const scoredDefaults = availableCars.map(car => {
    let defaultScore = 0;
    const carCity = (car.location || '').toLowerCase();
    const targetCity = (city || 'mumbai').toLowerCase();

    if (carCity.includes(targetCity) || targetCity.includes(carCity)) defaultScore += 30;
    if (car.discountType && car.discountType !== 'none') defaultScore += 20;
    if (car.badgeText || car.badge_text) defaultScore += 15;
    if (Number(car.year) >= 2022) defaultScore += 15;
    if (car.created_at || car.createdAt) defaultScore += 10;

    return { car, score: defaultScore };
  }).sort((a, b) => b.score - a.score);

  return scoredDefaults.slice(0, limit).map(item => item.car);
}

/**
 * Get Similar & Deciding Cars for Car Details Page ("Still Can't Decide?")
 * Combines similarity to the currently viewed car with user's past preferences and recent views.
 * @param {Object} currentCar - The active car being viewed
 * @param {Array} allCars - Full car catalog
 * @param {number} limit - Maximum number of cars to return (default 8)
 * @returns {Array} List of cars
 */
export function getSimilarCarsForCarDetails(currentCar, allCars = [], limit = 8) {
  if (!currentCar || !Array.isArray(allCars) || allCars.length === 0) return [];

  const currId = String(currentCar.id);
  const currMake = (currentCar.make || currentCar.brand || '').toLowerCase().trim();
  const currBodyType = (currentCar.bodyType || currentCar.body_type || '').toLowerCase().trim();
  const currFuel = (currentCar.fuelType || currentCar.fuel_type || '').toLowerCase().trim();
  const currPrice = Number(currentCar.price) || 0;
  const currLocation = (currentCar.location || '').toLowerCase().trim();

  const viewedCars = getRecentlyViewedCars().filter(c => String(c.id) !== currId);
  const prefs = getUserPreferences();

  // Filter available cars excluding current car
  const candidates = allCars.filter(c => c && String(c.id) !== currId && c.status !== 'sold_out');

  // Score candidate cars
  const scored = candidates.map(car => {
    let simScore = 0;
    const cMake = (car.make || car.brand || '').toLowerCase().trim();
    const cBodyType = (car.bodyType || car.body_type || '').toLowerCase().trim();
    const cFuel = (car.fuelType || car.fuel_type || '').toLowerCase().trim();
    const cLoc = (car.location || '').toLowerCase().trim();
    const cPrice = Number(car.price) || 0;

    // Body Type Match (+45 pts) - Most important for car segment decision
    if (currBodyType && cBodyType === currBodyType) simScore += 45;

    // Price proximity within +-25% (+35 pts)
    if (currPrice > 0 && cPrice > 0) {
      const diff = Math.abs(cPrice - currPrice) / currPrice;
      if (diff <= 0.15) simScore += 35;
      else if (diff <= 0.30) simScore += 25;
      else if (diff <= 0.50) simScore += 10;
    }

    // Same Brand / Competitor (+25 pts)
    if (currMake && cMake === currMake) simScore += 25;

    // Fuel Type Match (+15 pts)
    if (currFuel && cFuel === currFuel) simScore += 15;

    // Location Match (+20 pts)
    if (currLocation && (cLoc.includes(currLocation) || currLocation.includes(cLoc))) simScore += 20;

    // User preference affinity bonus (+15 pts)
    if (prefs) {
      if (prefs.brandFreq && prefs.brandFreq[car.make]) simScore += 15;
      if (prefs.bodyTypeFreq && prefs.bodyTypeFreq[car.body_type || car.bodyType]) simScore += 15;
    }

    // Was this car recently viewed by the user? (+30 pts to help them compare)
    if (viewedCars.some(v => String(v.id) === String(car.id))) {
      simScore += 30;
    }

    return { car, score: simScore };
  }).sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(item => item.car);
}
