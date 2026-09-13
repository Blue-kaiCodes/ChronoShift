/**
 * Global Public Holidays & Weekend Awareness Utility
 * Maps recurring and fixed national holidays for major countries.
 */

// Key global holidays mapped by country and M-D format
const GLOBAL_HOLIDAYS = {
  "United States": [
    { name: "New Year's Day", month: 1, day: 1 },
    { name: "MLK Jr. Day", month: 1, day: 19 }, // 3rd Mon Jan approx
    { name: "Memorial Day", month: 5, day: 25 }, // last Mon May approx
    { name: "Juneteenth", month: 6, day: 19 },
    { name: "Independence Day", month: 7, day: 4 },
    { name: "Labor Day", month: 9, day: 7 }, // 1st Mon Sep approx
    { name: "Thanksgiving", month: 11, day: 26 }, // 4th Thu Nov approx
    { name: "Christmas Day", month: 12, day: 25 }
  ],
  "United Kingdom": [
    { name: "New Year's Day", month: 1, day: 1 },
    { name: "Good Friday", month: 4, day: 3 },
    { name: "Easter Monday", month: 4, day: 6 },
    { name: "Early May Bank Holiday", month: 5, day: 4 },
    { name: "Spring Bank Holiday", month: 5, day: 25 },
    { name: "Summer Bank Holiday", month: 8, day: 31 },
    { name: "Christmas Day", month: 12, day: 25 },
    { name: "Boxing Day", month: 12, day: 26 }
  ],
  "India": [
    { name: "Republic Day", month: 1, day: 26 },
    { name: "Holi", month: 3, day: 4 },
    { name: "Independence Day", month: 8, day: 15 },
    { name: "Gandhi Jayanti", month: 10, day: 2 },
    { name: "Dussehra", month: 10, day: 20 },
    { name: "Diwali", month: 11, day: 8 },
    { name: "Christmas Day", month: 12, day: 25 }
  ],
  "Germany": [
    { name: "New Year's Day", month: 1, day: 1 },
    { name: "Good Friday", month: 4, day: 3 },
    { name: "Easter Monday", month: 4, day: 6 },
    { name: "Labour Day", month: 5, day: 1 },
    { name: "Ascension Day", month: 5, day: 14 },
    { name: "Whit Monday", month: 5, day: 25 },
    { name: "German Unity Day", month: 10, day: 3 },
    { name: "Christmas Day", month: 12, day: 25 },
    { name: "Boxing Day", month: 12, day: 26 }
  ],
  "Japan": [
    { name: "New Year's Day", month: 1, day: 1 },
    { name: "Coming of Age Day", month: 1, day: 12 },
    { name: "National Foundation Day", month: 2, day: 11 },
    { name: "Emperor's Birthday", month: 2, day: 23 },
    { name: "Vernal Equinox Day", month: 3, day: 20 },
    { name: "Showa Day", month: 4, day: 29 },
    { name: "Constitution Memorial Day", month: 5, day: 3 },
    { name: "Greenery Day", month: 5, day: 4 },
    { name: "Children's Day", month: 5, day: 5 },
    { name: "Marine Day", month: 7, day: 20 },
    { name: "Mountain Day", month: 8, day: 11 },
    { name: "Respect for the Aged Day", month: 9, day: 21 },
    { name: "Culture Day", month: 11, day: 3 },
    { name: "Labor Thanksgiving Day", month: 11, day: 23 }
  ],
  "Australia": [
    { name: "New Year's Day", month: 1, day: 1 },
    { name: "Australia Day", month: 1, day: 26 },
    { name: "Good Friday", month: 4, day: 3 },
    { name: "Easter Monday", month: 4, day: 6 },
    { name: "ANZAC Day", month: 4, day: 25 },
    { name: "King's Birthday", month: 6, day: 8 },
    { name: "Christmas Day", month: 12, day: 25 },
    { name: "Boxing Day", month: 12, day: 26 }
  ],
  "Canada": [
    { name: "New Year's Day", month: 1, day: 1 },
    { name: "Good Friday", month: 4, day: 3 },
    { name: "Victoria Day", month: 5, day: 18 },
    { name: "Canada Day", month: 7, day: 1 },
    { name: "Labour Day", month: 9, day: 7 },
    { name: "National Day for Truth and Reconciliation", month: 9, day: 30 },
    { name: "Thanksgiving", month: 10, day: 12 },
    { name: "Remembrance Day", month: 11, day: 11 },
    { name: "Christmas Day", month: 12, day: 25 },
    { name: "Boxing Day", month: 12, day: 26 }
  ],
  "France": [
    { name: "New Year's Day", month: 1, day: 1 },
    { name: "Easter Monday", month: 4, day: 6 },
    { name: "Labour Day", month: 5, day: 1 },
    { name: "Victory Day", month: 5, day: 8 },
    { name: "Ascension Day", month: 5, day: 14 },
    { name: "Whit Monday", month: 5, day: 25 },
    { name: "Bastille Day", month: 7, day: 14 },
    { name: "Assumption Day", month: 8, day: 15 },
    { name: "All Saints' Day", month: 11, day: 1 },
    { name: "Armistice Day", month: 11, day: 11 },
    { name: "Christmas Day", month: 12, day: 25 }
  ]
};

/**
 * Checks if a given date is a weekend (Saturday or Sunday by default).
 * @param {Date} date 
 * @param {Array<number>} weekendDays e.g. [0, 6] for Sun, Sat
 * @returns {boolean}
 */
export function isWeekend(date, weekendDays = [0, 6]) {
  const day = date.getDay();
  return weekendDays.includes(day);
}

/**
 * Checks if a given date coincides with a public holiday for a country.
 * @param {string} country 
 * @param {Date} date 
 * @returns {object|null} The holiday object or null
 */
export function getPublicHoliday(country, date) {
  if (!country) return null;
  const holidays = GLOBAL_HOLIDAYS[country];
  if (!holidays) return null;

  const month = date.getMonth() + 1; // 1-indexed
  const day = date.getDate();

  return holidays.find(h => h.month === month && h.day === day) || null;
}
