/**
 * Global Public Holidays & Weekend Awareness Module.
 * Integrates live holiday fetching with backward-compatible synchronous utilities.
 */

import {
  fetchCountryHolidays,
  getHolidayForDate,
  isWeekend as isWeekendCore,
  OFFLINE_FALLBACK_HOLIDAYS
} from "./holidayService";

export { fetchCountryHolidays, getHolidayForDate };
export const OFFLINE_HOLIDAYS = OFFLINE_FALLBACK_HOLIDAYS;

export function isWeekend(date, weekendDays = [0, 6]) {
  return isWeekendCore(date, weekendDays);
}

/**
 * Synchronous holiday check from cached session data or offline verified database.
 * Used for instant timeline renders.
 * 
 * Supports both signatures:
 * (countryOrCode, date) or (date, countryOrCode)
 * 
 * @param {string|Date} arg1 - Country code/name or Date
 * @param {Date|string} [arg2=new Date()] - Date or Country code/name
 * @returns {{ name: string, isHoliday: boolean } | null}
 */
export function getPublicHoliday(arg1, arg2 = new Date()) {
  let countryOrCode;
  let date;

  if (arg1 instanceof Date) {
    date = arg1;
    countryOrCode = typeof arg2 === "string" ? arg2 : "US";
  } else if (arg2 instanceof Date) {
    countryOrCode = arg1;
    date = arg2;
  } else if (typeof arg1 === "string" && !isNaN(Date.parse(arg1)) && typeof arg2 === "string" && arg2.length <= 3) {
    date = new Date(arg1);
    countryOrCode = arg2;
  } else {
    countryOrCode = arg1;
    date = arg2 ? new Date(arg2) : new Date();
  }

  if (!countryOrCode) return null;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Country name mapping to ISO 3166-1 alpha-2
  const COUNTRY_TO_CODE = {
    "united states": "US",
    "usa": "US",
    "united kingdom": "GB",
    "uk": "GB",
    "great britain": "GB",
    "india": "IN",
    "germany": "DE",
    "japan": "JP",
    "australia": "AU",
    "canada": "CA",
    "france": "FR",
    "singapore": "SG",
    "brazil": "BR",
    "ireland": "IE",
    "netherlands": "NL"
  };

  const code = (COUNTRY_TO_CODE[String(countryOrCode).toLowerCase()] || countryOrCode).toUpperCase();
  const cacheKey = `chronoshift_holidays_${code}_${year}`;

  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const found = list.find(h => h.date === dateStr);
          if (found) {
            return { name: found.name, isHoliday: true, countryCode: code };
          }
        }
      }
    }
  } catch {
    // fallback
  }

  // Check offline fallback database
  const fallbackList = OFFLINE_FALLBACK_HOLIDAYS[code];
  if (fallbackList) {
    const match = fallbackList.find(h => h.month === month && h.day === day);
    if (match) {
      return { name: match.name, isHoliday: true, countryCode: code };
    }
  }

  return null;
}
