import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, 'sales_cache');
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

// Search terms that cover our ingredient list
const SEARCH_TERMS = [
  'eggs', 'chicken', 'turkey', 'tuna', 'beans', 'chickpeas',
  'yogurt', 'broccoli', 'spinach', 'sweet potato', 'cabbage',
  'carrots', 'zucchini', 'tomatoes', 'rice', 'oats', 'olive oil',
  'lemon', 'onion', 'garlic', 'broth', 'ground beef', 'pork',
  'salmon', 'shrimp', 'pasta', 'bread', 'cheese', 'bacon',
  'sausage', 'tortillas', 'avocado', 'mushrooms', 'potatoes',
];

// Map Flipp merchant names to OSM brand/name patterns — covers major US grocery chains
const STORE_ALIASES = {
  // National chains
  'Walmart': ['Walmart', 'Walmart Supercenter', 'Walmart Neighborhood Market'],
  'Target': ['Target'],
  'Costco': ['Costco'],
  "Sam's Club": ["Sam's Club", 'Sams Club'],
  'Aldi': ['Aldi', 'ALDI'],
  'Dollar General': ['Dollar General'],
  'Dollar Tree': ['Dollar Tree'],
  'Family Dollar': ['Family Dollar'],
  'Save-A-Lot': ['Save-A-Lot', 'Save A Lot'],
  'IGA': ['IGA'],
  "BJ's Wholesale Club": ["BJ's", 'BJs'],

  // Kroger family
  'Kroger': ['Kroger'],
  "Fred Meyer": ['Fred Meyer'],
  "Fry's Food": ["Fry's", 'Frys Food'],
  "Fry's": ["Fry's", 'Frys'],
  'Ralphs': ['Ralphs'],
  'Smith\'s': ["Smith's", 'Smiths'],
  'King Soopers': ['King Soopers'],
  'QFC': ['QFC', 'Quality Food Centers'],
  'Harris Teeter': ['Harris Teeter'],
  'Pick \'n Save': ["Pick 'n Save", 'Pick n Save'],
  'Metro Market': ['Metro Market'],
  'Mariano\'s': ["Mariano's", 'Marianos'],
  'Baker\'s': ["Baker's", 'Bakers'],
  'City Market': ['City Market'],
  'Dillons': ['Dillons'],
  'Food 4 Less': ['Food 4 Less'],
  'Foods Co': ['Foods Co'],
  'Gerbes': ['Gerbes'],
  'Jay C': ['Jay C'],
  'Owen\'s': ["Owen's"],
  'Pay Less': ['Pay Less', 'Pay-Less'],
  'Ruler Foods': ['Ruler Foods'],

  // Southeast
  'Publix': ['Publix'],
  'Winn-Dixie': ['Winn-Dixie', 'Winn Dixie'],
  'Food Lion': ['Food Lion'],
  'Piggly Wiggly': ['Piggly Wiggly'],
  'Harvey\'s Supermarket': ["Harvey's"],
  'Ingles': ['Ingles'],
  'Bi-Lo': ['Bi-Lo', 'BiLo'],

  // Texas / Southwest
  'H-E-B': ['H-E-B', 'HEB', 'H E B'],
  'Central Market': ['Central Market'],
  'Fiesta Mart': ['Fiesta Mart', 'Fiesta'],
  'Brookshire\'s': ["Brookshire's", 'Brookshires'],
  'United Supermarkets': ['United Supermarkets'],
  'Albertsons': ['Albertsons'],
  'Tom Thumb': ['Tom Thumb'],
  'Randalls': ['Randalls'],

  // West Coast
  'Safeway': ['Safeway'],
  'Vons': ['Vons'],
  'Pavilions': ['Pavilions'],
  'WinCo': ['WinCo', 'WinCo Foods'],
  'Grocery Outlet': ['Grocery Outlet'],
  'Sprouts': ['Sprouts', 'Sprouts Farmers Market'],
  'Trader Joe\'s': ["Trader Joe's", 'Trader Joes'],
  'Smart & Final': ['Smart & Final'],
  'Stater Bros': ['Stater Bros', 'Stater Brothers'],
  'Food Maxx': ['Food Maxx'],
  'Lucky': ['Lucky Supermarkets', 'Lucky'],
  'Raley\'s': ["Raley's", 'Raleys'],
  'Cardenas': ['Cardenas'],
  'Vallarta': ['Vallarta'],
  'El Super': ['El Super'],
  'Northgate Market': ['Northgate'],

  // Midwest
  'Hy-Vee': ['Hy-Vee', 'Hy Vee', 'HyVee'],
  'Schnucks': ['Schnucks'],
  'Fareway': ['Fareway'],
  'Price Chopper': ['Price Chopper'],
  'Price Chopper KC': ['Price Chopper'],
  'Meijer': ['Meijer'],
  'Woodman\'s': ["Woodman's", 'Woodmans'],
  'Festival Foods': ['Festival Foods'],
  'Cub Foods': ['Cub Foods', 'Cub'],
  'Coborn\'s': ["Coborn's", 'Coborns'],
  'Hy-Vee': ['Hy-Vee', 'Hy Vee', 'HyVee'],
  'Jewel-Osco': ['Jewel-Osco', 'Jewel Osco', 'Jewel'],
  'County Market': ['County Market'],
  'Harps': ['Harps', 'Harps Food'],

  // Northeast
  'Stop & Shop': ['Stop & Shop', 'Stop and Shop'],
  'ShopRite': ['ShopRite', 'Shop Rite'],
  'Wegmans': ['Wegmans'],
  'Giant': ['Giant', 'Giant Food'],
  'Giant Eagle': ['Giant Eagle'],
  'Hannaford': ['Hannaford'],
  'Market Basket': ['Market Basket'],
  'Acme': ['Acme', 'Acme Markets'],
  'Price Rite': ['Price Rite'],
  'Tops': ['Tops', 'Tops Markets'],
  'Big Y': ['Big Y'],
  'Weis': ['Weis', 'Weis Markets'],
  'Key Food': ['Key Food'],
  'C-Town': ['C-Town', 'CTown'],
  'Food Bazaar': ['Food Bazaar'],
  'Western Beef': ['Western Beef'],
  'Foodtown': ['Foodtown'],

  // Mid-Atlantic / Southeast
  'Lidl': ['Lidl'],
  'Lowes Foods': ['Lowes Foods'],
  'Earth Fare': ['Earth Fare'],
  'Fresh Market': ['Fresh Market', 'The Fresh Market'],

  // Pacific Northwest
  'Haggen': ['Haggen'],
  'New Seasons': ['New Seasons'],

  // Natural / Specialty (nationwide)
  'Whole Foods': ['Whole Foods', 'Whole Foods Market'],
  'Fresh Thyme': ['Fresh Thyme'],
  'Natural Grocers': ['Natural Grocers'],

  // Warehouse / Discount
  '99 Cents Only': ['99 Cents Only'],
  'Marc\'s': ["Marc's", 'Marcs'],
  'Ruler Foods': ['Ruler Foods'],

  // Additional chains found via Flipp
  'Stater Bros. Markets': ['Stater Bros'],
  'Superior Grocers': ['Superior Grocers', 'Superior'],
  'Super King Markets': ['Super King'],
  'Big Saver Foods': ['Big Saver'],
  'Bristol Farms': ['Bristol Farms'],
  "Gelson's Market": ["Gelson's", 'Gelsons'],
  'H Mart': ['H Mart', 'HMart'],
  'Jons International Marketplace': ['Jons', 'Jons Marketplace'],
  "Bob's Market": ["Bob's Market"],
  'Restaurant Depot': ['Restaurant Depot'],
  'Wild Fork': ['Wild Fork'],
  'Co-opportunity': ['Co-opportunity'],
  '99 Ranch Market': ['99 Ranch'],
  'Mitsuwa': ['Mitsuwa'],
  'Marukai': ['Marukai'],
  'Northgate González': ['Northgate'],
  'Food Depot': ['Food Depot'],
  'Bravo Supermarkets': ['Bravo'],
  'Sedano\'s': ["Sedano's", 'Sedanos'],
  'Presidente': ['Presidente'],
  'Compare Foods': ['Compare Foods'],
  'Associated': ['Associated'],
  'C-Town Supermarkets': ['C-Town', 'CTown'],
  'Gristedes': ['Gristedes'],
  'Morton Williams': ['Morton Williams'],
  'Fairway Market': ['Fairway'],
  'Stew Leonard\'s': ["Stew Leonard's"],
  'Market 32': ['Market 32'],
  'Lucky\'s Market': ["Lucky's Market"],
  'Ruler Foods': ['Ruler Foods'],
  'Gordon Food Service': ['Gordon Food Service', 'GFS'],
  'Cash & Carry': ['Cash & Carry'],
  'Smart Foodservice': ['Smart Foodservice'],
  'Cardenas Markets': ['Cardenas'],
  'El Rancho': ['El Rancho'],
  'La Michoacana': ['La Michoacana'],
  'Fiesta Mart': ['Fiesta'],
  'Mi Pueblo': ['Mi Pueblo'],
};

// Non-grocery merchants to always exclude
const BLOCKED_MERCHANTS = new Set([
  'Ulta', 'Ulta Beauty',
  'Menards',
  'Five Below',
  'Bath & Body Works',
  'Best Buy',
  'Home Depot', 'The Home Depot',
  "Lowe's", 'Lowes',
  'AutoZone',
  "O'Reilly Auto Parts",
  'Ace Hardware',
  'Petco', 'PetSmart',
  'Staples',
  'Office Depot',
  'Michaels',
  'Hobby Lobby',
  'GameStop',
  'Bed Bath & Beyond',
  'Big Lots',
  'Harbor Freight',
  'Tractor Supply',
  'Sally Beauty',
  'GNC',
  'Vitamin Shoppe',
  'T.J. Maxx', 'TJ Maxx',
  'Marshalls',
  'Ross',
  'Shoe Carnival',
  'Old Navy',
  'JCPenney',
  'Kohl\'s', 'Kohls',
  'Sephora',
  'Walgreens',
  'CVS', 'CVS Pharmacy',
]);

// Separate cache for verified store locations (persists longer than sales)
const STORES_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function loadStoresCache(zip, radius) {
  const file = join(CACHE_DIR, `stores_${zip}_${radius}mi.json`);
  if (!existsSync(file)) return null;
  try {
    const data = JSON.parse(readFileSync(file, 'utf-8'));
    const age = Date.now() - new Date(data.cachedAt).getTime();
    if (age < STORES_CACHE_TTL_MS) return data.stores;
  } catch {}
  return null;
}

function saveStoresCache(stores, zip, radius) {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
  const file = join(CACHE_DIR, `stores_${zip}_${radius}mi.json`);
  writeFileSync(file, JSON.stringify({ stores, cachedAt: new Date().toISOString() }, null, 2));
}

function cacheKey(zip, radius) {
  return `sales_${zip}_${radius}mi`;
}

function cacheFileForKey(key) {
  return join(CACHE_DIR, `${key}.json`);
}

function loadCache(zip, radius) {
  const file = cacheFileForKey(cacheKey(zip, radius));
  if (!existsSync(file)) return null;
  try {
    const data = JSON.parse(readFileSync(file, 'utf-8'));
    const age = Date.now() - new Date(data.cachedAt).getTime();
    if (age < CACHE_TTL_MS) return data;
  } catch {
    // ignore
  }
  return null;
}

function saveCache(data, zip, radius) {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
  const file = cacheFileForKey(cacheKey(zip, radius));
  writeFileSync(file, JSON.stringify({ ...data, cachedAt: new Date().toISOString() }, null, 2));
}

// Get lat/lng for a zip code
async function getZipCoords(zip) {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.places && data.places[0]) {
      return {
        lat: parseFloat(data.places[0].latitude),
        lng: parseFloat(data.places[0].longitude),
      };
    }
  } catch {
    // ignore
  }
  return null;
}

// Find actual grocery stores within radius using OpenStreetMap Overpass API
// Returns an array (possibly empty) on a successful API call, or `null` when the call failed —
// callers use null to mean "uncertain, fall back" and [] to mean "verified zero stores in range".
async function findNearbyStores(lat, lng, radiusMiles) {
  const radiusMeters = Math.round(radiusMiles * 1609.34);
  const query = `[out:json][timeout:15];(nwr["shop"="supermarket"](around:${radiusMeters},${lat},${lng});nwr["shop"="grocery"](around:${radiusMeters},${lat},${lng});nwr["shop"="convenience"]["brand"](around:${radiusMeters},${lat},${lng}););out center body;`;

  try {
    const url = `https://overpass-api.de/api/interpreter`;
    const res = await fetch(url, {
      method: 'POST',
      body: 'data=' + encodeURIComponent(query),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'MealMakerApp/1.0',
      },
    });
    if (!res.ok) {
      console.warn(`[overpass] HTTP ${res.status} — store lookup failed`);
      return null;
    }
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.warn('[overpass] Non-JSON response — likely rate limited');
      return null;
    }

    const stores = (data.elements || []).map(el => {
      const tags = el.tags || {};
      return {
        name: tags.name || 'Unknown',
        brand: tags.brand || tags.operator || tags.name || '',
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon,
      };
    });

    console.log(`[overpass] Found ${stores.length} physical stores within ${radiusMiles}mi:`);
    for (const s of stores) {
      console.log(`  ${s.name} (${s.brand})`);
    }

    return stores;
  } catch (err) {
    console.warn('[overpass] Store lookup failed:', err.message);
    return null;
  }
}

// Only these grocery stores are allowed through — everything else is excluded
const ALLOWED_GROCERS = new Set([
  ...Object.keys(STORE_ALIASES),
  ...Object.keys(STORE_ALIASES).map(k => k.toUpperCase()),
  ...Object.keys(STORE_ALIASES).map(k => k.toLowerCase()),
]);

// Check if a Flipp merchant is an allowed grocer with a physical store within radius
function merchantHasNearbyStore(merchantName, nearbyStores) {
  const merchant = merchantName.trim();
  const merchantLower = merchant.toLowerCase();

  // Always block non-grocery merchants
  for (const blocked of BLOCKED_MERCHANTS) {
    if (merchantLower === blocked.toLowerCase()) return false;
  }

  // Check if merchant matches any known grocery store (partial/fuzzy match)
  let isKnownGrocer = false;
  for (const [key, aliases] of Object.entries(STORE_ALIASES)) {
    const keyLower = key.toLowerCase();
    if (merchantLower === keyLower || merchantLower.includes(keyLower) || keyLower.includes(merchantLower)) {
      isKnownGrocer = true; break;
    }
    for (const alias of aliases) {
      const aliasLower = alias.toLowerCase();
      if (merchantLower.includes(aliasLower) || aliasLower.includes(merchantLower)) {
        isKnownGrocer = true; break;
      }
    }
    if (isKnownGrocer) break;
  }
  if (!isKnownGrocer) return false;

  // If Overpass failed, returned empty, or coords failed — allow known grocers through
  if (!nearbyStores || nearbyStores.length === 0) return true;

  // Verify the grocery store actually has a physical location within radius
  for (const store of nearbyStores) {
    const storeName = (store.name + ' ' + store.brand).toLowerCase();
    // Direct merchant-to-store match
    if (storeName.includes(merchantLower) || merchantLower.includes(storeName)) return true;
    // Check via aliases
    for (const [, aliases] of Object.entries(STORE_ALIASES)) {
      for (const alias of aliases) {
        const aliasLower = alias.toLowerCase();
        if (merchantLower.includes(aliasLower) && storeName.includes(aliasLower)) return true;
      }
    }
  }
  return false;
}

async function searchFlipp(query, zip) {
  const url = `https://backflipp.wishabi.com/flipp/items/search?q=${encodeURIComponent(query)}&postal_code=${zip}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map(item => ({
      name: item.name || '',
      salePrice: item.current_price || null,
      originalPrice: item.pre_price_text ? parseFloat(item.pre_price_text.replace(/[^0-9.]/g, '')) || null : null,
      store: (item.merchant_name || 'Unknown').trim(),
      validFrom: item.valid_from || null,
      validTo: item.valid_to || null,
      searchTerm: query,
    })).filter(item => item.salePrice && item.salePrice > 0);
  } catch (err) {
    console.warn(`[flipp] Search failed for "${query}":`, err.message);
    return [];
  }
}

export async function getSales(zip = '64683', forceRefresh = false, radiusMiles = 30) {
  if (!forceRefresh) {
    const cached = loadCache(zip, radiusMiles);
    if (cached) {
      console.log(`[flipp] Returning cached sales for ${zip} (${radiusMiles}mi) from`, cached.cachedAt);
      return cached;
    }
  }

  console.log(`[flipp] Fetching deals within ${radiusMiles}mi of ZIP ${zip}...`);

  // Step 1: Find actual store locations within radius.
  // findNearbyStores() now returns `null` on API failure (uncertain) and `[]` for verified-empty.
  const coords = await getZipCoords(zip);
  let nearbyStores = null;
  if (coords) {
    nearbyStores = await findNearbyStores(coords.lat, coords.lng, radiusMiles);
    // Overpass succeeded with results — cache them.
    if (nearbyStores && nearbyStores.length > 0) {
      saveStoresCache(nearbyStores, zip, radiusMiles);
    }
    // Overpass failed (null). Try the stores cache so a transient outage doesn't blank deals.
    if (nearbyStores === null) {
      const cachedStores = loadStoresCache(zip, radiusMiles);
      if (cachedStores && cachedStores.length > 0) {
        console.log(`[overpass] Lookup failed; using cached store locations (${cachedStores.length} stores)`);
        nearbyStores = cachedStores;
      }
    }
    // Overpass verified zero stores within radius — short-circuit, no deals are available here.
    if (Array.isArray(nearbyStores) && nearbyStores.length === 0) {
      console.log(`[overpass] Zero grocery stores within ${radiusMiles}mi of ${zip} — returning no deals.`);
      const empty = { sales: [], scrapedAt: new Date().toISOString(), zip, radiusMiles, noStoresInRadius: true };
      saveCache(empty, zip, radiusMiles);
      return empty;
    }
  }

  // Step 2: Search Flipp for deals
  const results = await Promise.all(
    SEARCH_TERMS.map(term => searchFlipp(term, zip))
  );

  // Step 3: Flatten, deduplicate, and filter to stores within radius
  const seen = new Set();
  const sales = [];
  const filteredStores = new Set();
  for (const items of results) {
    for (const item of items) {
      if (!merchantHasNearbyStore(item.store, nearbyStores)) {
        filteredStores.add(item.store);
        continue;
      }
      const key = `${item.store}:${item.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        sales.push(item);
      }
    }
  }

  if (filteredStores.size > 0) {
    console.log(`[flipp] Filtered out stores with no location within ${radiusMiles}mi:`, [...filteredStores]);
  }
  console.log(`[flipp] Found ${sales.length} deals from ${new Set(sales.map(s => s.store)).size} verified stores`);

  const result = { sales, scrapedAt: new Date().toISOString(), zip, radiusMiles };
  saveCache(result, zip, radiusMiles);
  return result;
}
