/**
 * Rich database of major global cities.
 * Includes accurate IANA timezone identifiers and approximate coordinates
 * to allow projection onto a custom minimalist SVG world map.
 */
export const CITIES_DB = [
  { name: "London", country: "United Kingdom", timezone: "Europe/London", lat: 51.5074, lng: -0.1278 },
  { name: "New York", country: "United States", timezone: "America/New_York", lat: 40.7128, lng: -74.0060 },
  { name: "Los Angeles", country: "United States", timezone: "America/Los_Angeles", lat: 34.0522, lng: -118.2437 },
  { name: "San Francisco", country: "United States", timezone: "America/Los_Angeles", lat: 37.7749, lng: -122.4194 },
  { name: "Chicago", country: "United States", timezone: "America/Chicago", lat: 41.8781, lng: -87.6298 },
  { name: "Miami", country: "United States", timezone: "America/New_York", lat: 25.7617, lng: -80.1918 },
  { name: "Toronto", country: "Canada", timezone: "America/Toronto", lat: 43.6532, lng: -79.3832 },
  { name: "Vancouver", country: "Canada", timezone: "America/Vancouver", lat: 49.2827, lng: -123.1207 },
  { name: "Mexico City", country: "Mexico", timezone: "America/Mexico_City", lat: 19.4326, lng: -99.1332 },
  { name: "Sao Paulo", country: "Brazil", timezone: "America/Sao_Paulo", lat: -23.5505, lng: -46.6333 },
  { name: "Buenos Aires", country: "Argentina", timezone: "America/Argentina/Buenos_Aires", lat: -34.6037, lng: -58.3816 },
  { name: "Santiago", country: "Chile", timezone: "America/Santiago", lat: -33.4489, lng: -70.6693 },
  { name: "Reykjavik", country: "Iceland", timezone: "Atlantic/Reykjavik", lat: 64.1466, lng: -21.9426 },
  { name: "Paris", country: "France", timezone: "Europe/Paris", lat: 48.8566, lng: 2.3522 },
  { name: "Berlin", country: "Germany", timezone: "Europe/Berlin", lat: 52.5200, lng: 13.4050 },
  { name: "Rome", country: "Italy", timezone: "Europe/Rome", lat: 41.9028, lng: 12.4964 },
  { name: "Madrid", country: "Spain", timezone: "Europe/Madrid", lat: 40.4168, lng: -3.7038 },
  { name: "Athens", country: "Greece", timezone: "Europe/Athens", lat: 37.9838, lng: 23.7275 },
  { name: "Istanbul", country: "Turkey", timezone: "Europe/Istanbul", lat: 41.0082, lng: 28.9784 },
  { name: "Cairo", country: "Egypt", timezone: "Africa/Cairo", lat: 30.0444, lng: 31.2357 },
  { name: "Johannesburg", country: "South Africa", timezone: "Africa/Johannesburg", lat: -26.2041, lng: 28.0473 },
  { name: "Cape Town", country: "South Africa", timezone: "Africa/Cape_Town", lat: -33.9249, lng: 18.4241 },
  { name: "Nairobi", country: "Kenya", timezone: "Africa/Nairobi", lat: -1.2921, lng: 36.8219 },
  { name: "Lagos", country: "Nigeria", timezone: "Africa/Lagos", lat: 6.5244, lng: 3.3792 },
  { name: "Moscow", country: "Russia", timezone: "Europe/Moscow", lat: 55.7558, lng: 37.6173 },
  { name: "Dubai", country: "United Arab Emirates", timezone: "Asia/Dubai", lat: 25.2048, lng: 55.2708 },
  { name: "Riyadh", country: "Saudi Arabia", timezone: "Asia/Riyadh", lat: 24.7136, lng: 46.6753 },
  { name: "Karachi", country: "Pakistan", timezone: "Asia/Karachi", lat: 24.8607, lng: 67.0011 },
  { name: "New Delhi", country: "India", timezone: "Asia/Kolkata", lat: 28.6139, lng: 77.2090 },
  { name: "Mumbai", country: "India", timezone: "Asia/Kolkata", lat: 19.0760, lng: 72.8777 },
  { name: "Bangalore", country: "India", timezone: "Asia/Kolkata", lat: 12.9716, lng: 77.5946 },
  { name: "Dhaka", country: "Bangladesh", timezone: "Asia/Dhaka", lat: 23.8103, lng: 90.4125 },
  { name: "Bangkok", country: "Thailand", timezone: "Asia/Bangkok", lat: 13.7563, lng: 100.5018 },
  { name: "Jakarta", country: "Indonesia", timezone: "Asia/Jakarta", lat: -6.2088, lng: 106.8456 },
  { name: "Singapore", country: "Singapore", timezone: "Asia/Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Hong Kong", country: "China", timezone: "Asia/Hong_Kong", lat: 22.3193, lng: 114.1694 },
  { name: "Shanghai", country: "China", timezone: "Asia/Shanghai", lat: 31.2304, lng: 121.4737 },
  { name: "Beijing", country: "China", timezone: "Asia/Shanghai", lat: 39.9042, lng: 116.4074 },
  { name: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Seoul", country: "South Korea", timezone: "Asia/Seoul", lat: 37.5665, lng: 126.9780 },
  { name: "Taipei", country: "Taiwan", timezone: "Asia/Taipei", lat: 25.0330, lng: 121.5654 },
  { name: "Perth", country: "Australia", timezone: "Australia/Perth", lat: -31.9505, lng: 115.8605 },
  { name: "Sydney", country: "Australia", timezone: "Australia/Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Melbourne", country: "Australia", timezone: "Australia/Melbourne", lat: -37.8136, lng: 144.9631 },
  { name: "Auckland", country: "New Zealand", timezone: "Pacific/Auckland", lat: -36.8485, lng: 174.7633 },
  { name: "Honolulu", country: "United States", timezone: "Pacific/Honolulu", lat: 21.3069, lng: -157.8583 },
  { name: "Anchorage", country: "United States", timezone: "America/Anchorage", lat: 61.2181, lng: -149.9003 },
  { name: "Manila", country: "Philippines", timezone: "Asia/Manila", lat: 14.5995, lng: 120.9842 },
  { name: "Kuala Lumpur", country: "Malaysia", timezone: "Asia/Kuala_Lumpur", lat: 3.1390, lng: 101.6869 },
  { name: "Stockholm", country: "Sweden", timezone: "Europe/Stockholm", lat: 59.3293, lng: 18.0686 },
  { name: "Oslo", country: "Norway", timezone: "Europe/Oslo", lat: 59.9139, lng: 10.7522 },
  { name: "Zurich", country: "Switzerland", timezone: "Europe/Zurich", lat: 47.3769, lng: 8.5417 }
];

/**
 * Returns the search options grouped or sorted.
 */
export function searchCities(query) {
  if (!query) return CITIES_DB.slice(0, 10);
  const clean = query.toLowerCase().trim();
  return CITIES_DB.filter(
    c => c.name.toLowerCase().includes(clean) || c.country.toLowerCase().includes(clean)
  ).slice(0, 10);
}
