/**
 * Real Public Holidays Service with Transparent Live Data, Caching, and Offline Fallbacks.
 * Powered by the official Nager.Date public API (https://date.nager.at/).
 * Data source is clearly indicated in the UI for trustworthiness.
 */

// In-memory session cache to prevent redundant fetches
const memoryCache = new Map();

// High-confidence offline fallback for primary tech hubs if network is unavailable
export const OFFLINE_FALLBACK_HOLIDAYS = {
  US: [
    { name: "New Year's Day", month: 1, day: 1 },
    { name: "Independence Day", month: 7, day: 4 },
    { name: "Christmas Day", month: 12, day: 25 }
  ],
  GB: [
    { name: "New Year's Day", month: 1, day: 1 },
    { name: "Christmas Day", month: 12, day: 25 },
    { name: "Boxing Day", month: 12, day: 26 }
  ],
  IN: [
    { name: "Republic Day", month: 1, day: 26 },
    { name: "Independence Day", month: 8, day: 15 },
    { name: "Gandhi Jayanti", month: 10, day: 2 },
    { name: "Christmas Day", month: 12, day: 25 }
  ],
  DE: [
    { name: "New Year's Day", month: 1, day: 1 },
    { name: "Labour Day", month: 5, day: 1 },
    { name: "German Unity Day", month: 10, day: 3 },
    { name: "Christmas Day", month: 12, day: 25 }
  ],
  JP: [
    { name: "New Year's Day", month: 1, day: 1 },
    { name: "National Foundation Day", month: 2, day: 11 },
    { name: "Culture Day", month: 11, day: 3 }
  ],
  AU: [
    { name: "New Year's Day", month: 1, day: 1 },
    { name: "Australia Day", month: 1, day: 26 },
    { name: "ANZAC Day", month: 4, day: 25 },
    { name: "Christmas Day", month: 12, day: 25 }
  ],
  CA: [
    { name: "New Year's Day", month: 1, day: 1 },
    { name: "Canada Day", month: 7, day: 1 },
    { name: "Remembrance Day", month: 11, day: 11 },
    { name: "Christmas Day", month: 12, day: 25 }
  ]
};

/**
 * Fetches verified official public holidays for a given ISO 2-letter country code and year.
 * Checks memory cache -> localStorage cache -> live Nager.Date API -> offline fallback.
 * 
 * @param {string} countryCode - ISO 3166-1 alpha-2 (e.g. "US", "GB", "IN")
 * @param {number} year - Calendar year (e.g. 2026)
 * @returns {Promise<{ holidays: Array, source: 'cache' | 'live' | 'offline_fallback', error?: string }>}
 */
export async function fetchCountryHolidays(countryCode, year = new Date().getFullYear()) {
  if (!countryCode || typeof countryCode !== "string") {
    return { holidays: [], source: "offline_fallback" };
  }

  const code = countryCode.toUpperCase().trim();
  const cacheKey = `chronoshift_holidays_${code}_${year}`;

  // 1. Check in-memory cache
  if (memoryCache.has(cacheKey)) {
    return { holidays: memoryCache.get(cacheKey), source: "cache" };
  }

  // 2. Check localStorage cache
  try {
    const rawLocal = localStorage.getItem(cacheKey);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCache.set(cacheKey, parsed);
        return { holidays: parsed, source: "cache" };
      }
    }
  } catch (e) {
    console.warn("Storage cache read warning:", e);
  }

  // 3. Attempt live query to official public Nager.Date API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${code}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const normalized = data.map(h => ({
          date: h.date, // "YYYY-MM-DD"
          name: h.name,
          localName: h.localName,
          countryCode: h.countryCode
        }));

        memoryCache.set(cacheKey, normalized);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(normalized));
        } catch {
          // quota or private browsing
        }

        return { holidays: normalized, source: "live" };
      }
    }
  } catch (err) {
    // Network failure, offline, or timeout
    console.info(`Notice: Could not reach live holiday API for ${code} (${err.message}). Using offline calculations.`);
  }

  // 4. Offline Fallback
  const fallback = (OFFLINE_FALLBACK_HOLIDAYS[code] || []).map(f => ({
    date: `${year}-${String(f.month).padStart(2, "0")}-${String(f.day).padStart(2, "0")}`,
    name: f.name,
    localName: f.name,
    countryCode: code
  }));

  return { holidays: fallback, source: "offline_fallback" };
}

/**
 * Checks whether a given calendar date is an official public holiday in the teammate's country.
 * 
 * @param {string} countryCode - ISO 2-letter country code
 * @param {Date} date - Calendar date to evaluate
 * @returns {Promise<{ isHoliday: boolean, holidayName: string | null, source: string }>}
 */
export async function getHolidayForDate(countryCode, date = new Date()) {
  if (!countryCode) return { isHoliday: false, holidayName: null, source: "none" };

  const year = date.getFullYear();
  const dateStr = `${year}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const { holidays, source } = await fetchCountryHolidays(countryCode, year);
  const match = holidays.find(h => h.date === dateStr);

  return {
    isHoliday: !!match,
    holidayName: match ? match.name : null,
    source
  };
}

/**
 * Checks if a given date falls on a weekend for a team member.
 * Default is Saturday (6) and Sunday (0), but supports regional customizations.
 * 
 * @param {Date} date - Target date
 * @param {Array<number>} [weekendDays=[0, 6]] - Array of day numbers (0 = Sun, 6 = Sat)
 * @returns {boolean}
 */
export function isWeekend(date, weekendDays = [0, 6]) {
  const day = date.getDay();
  return weekendDays.includes(day);
}
