// aqi.js
// Fetches live AQI data from Airly API for each monster location
// Caches results in localStorage for 30 minutes to stay within rate limits

import { monsterLocations, getMonsterFromAQI } from '/js/monsters.js';

const AIRLY_API_KEY = 'dSeM6XKmuLNT4pa83gD4EKmDlh3Snv58';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const REQUEST_DELAY_MS = 1300; // ~46 requests/min, safely under 50/min limit
const CACHE_KEY_PREFIX = 'aqi_cache_';

// ─── Fetch AQI for a single location ─────────────────────────────────────────
async function fetchAQI(lat, lon) {
    const url = `https://airapi.airly.eu/v2/measurements/nearest?lat=${lat}&lng=${lon}&maxDistanceKM=5`;

    try {
        const response = await fetch(url, {
            headers: {
                'apikey': AIRLY_API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.log(`❌ Airly API error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        // Extract AIRLY_CAQI index value from current measurements
        const indexes = data?.current?.indexes;
        if (indexes && indexes.length > 0) {
            const caqiIndex = indexes.find(i => i.name === 'AIRLY_CAQI');
            if (caqiIndex && caqiIndex.value !== null) {
                return Math.round(caqiIndex.value);
            }
        }

        // Fallback: use PM2.5 value if no index available
        const values = data?.current?.values;
        if (values && values.length > 0) {
            const pm25 = values.find(v => v.name === 'PM25');
            if (pm25) return Math.round(pm25.value);
        }

        return null;
    } catch (err) {
        console.log(`❌ Fetch error for (${lat}, ${lon}):`, err);
        return null;
    }
}

// ─── Cache helpers ────────────────────────────────────────────────────────────
function getCached(id) {
    try {
        const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${id}`);
        if (!cached) return null;
        const parsed = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        if (age < CACHE_DURATION_MS) {
            return parsed.aqi;
        }
        return null; // expired
    } catch {
        return null;
    }
}

function setCache(id, aqi) {
    try {
        localStorage.setItem(`${CACHE_KEY_PREFIX}${id}`, JSON.stringify({
            aqi,
            timestamp: Date.now()
        }));
    } catch (err) {
        console.log('❌ Cache write error:', err);
    }
}

// ─── Delay helper ─────────────────────────────────────────────────────────────
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Main: update all monster locations with live AQI ─────────────────────────
export async function initAQI() {
    console.log('🌬️ Starting AQI fetch for all locations...');

    let fetchCount = 0;
    let cacheHits = 0;

    for (const monster of monsterLocations) {
        // Check cache first
        const cached = getCached(monster.id);
        if (cached !== null) {
            monster.aqiValue = cached;
            monster.monsterType = getMonsterFromAQI(cached);
            monster.hasData = true;
            cacheHits++;
            continue;
        }

        // Add delay between API requests to stay under rate limit
        if (fetchCount > 0) {
            await delay(REQUEST_DELAY_MS);
        }

        const aqi = await fetchAQI(monster.lat, monster.lon);

        if (aqi !== null) {
            monster.aqiValue = aqi;
            monster.monsterType = getMonsterFromAQI(aqi);
            monster.hasData = true;
            setCache(monster.id, aqi);
            console.log(`✅ ${monster.name}: AQI ${aqi} → ${monster.monsterType}`);
        } else {
            monster.hasData = false;
            console.log(`⚠️ ${monster.name}: no data, monster suppressed`);
        }

        fetchCount++;
    }

    console.log(`🌬️ AQI init complete — ${fetchCount} fetched, ${cacheHits} from cache`);
}

// ─── Get AQI for a single monster by id (used for catch card display) ─────────
export function getMonsterAQI(monsterId) {
    const cached = getCached(monsterId);
    return cached !== null ? cached : null;
}