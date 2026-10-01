/**
 * Authoritative, verified database of 150+ major global technology and commercial hubs.
 * Includes official IANA timezone identifiers, ISO country codes, accurate coordinates,
 * and alternate search aliases for intelligent fuzzy search.
 */
export const CITIES_DB = [
  // North America — United States & Canada
  { name: "New York", country: "United States", countryCode: "US", timezone: "America/New_York", lat: 40.7128, lng: -74.0060, aliases: ["NYC", "New York City", "Manhattan", "Brooklyn"] },
  { name: "San Francisco", country: "United States", countryCode: "US", timezone: "America/Los_Angeles", lat: 37.7749, lng: -122.4194, aliases: ["SF", "Bay Area", "Silicon Valley"] },
  { name: "Los Angeles", country: "United States", countryCode: "US", timezone: "America/Los_Angeles", lat: 34.0522, lng: -118.2437, aliases: ["LA", "SoCal"] },
  { name: "Seattle", country: "United States", countryCode: "US", timezone: "America/Los_Angeles", lat: 47.6062, lng: -122.3321, aliases: ["SEA"] },
  { name: "Chicago", country: "United States", countryCode: "US", timezone: "America/Chicago", lat: 41.8781, lng: -87.6298, aliases: ["CHI", "Windy City"] },
  { name: "Austin", country: "United States", countryCode: "US", timezone: "America/Chicago", lat: 30.2672, lng: -97.7431, aliases: ["ATX"] },
  { name: "Boston", country: "United States", countryCode: "US", timezone: "America/New_York", lat: 42.3601, lng: -71.0589, aliases: ["BOS", "Cambridge"] },
  { name: "Washington, D.C.", country: "United States", countryCode: "US", timezone: "America/New_York", lat: 38.9072, lng: -77.0369, aliases: ["DC", "Washington DC", "District of Columbia"] },
  { name: "Denver", country: "United States", countryCode: "US", timezone: "America/Denver", lat: 39.7392, lng: -104.9903, aliases: ["DEN", "Mile High"] },
  { name: "Atlanta", country: "United States", countryCode: "US", timezone: "America/New_York", lat: 33.7490, lng: -84.3880, aliases: ["ATL"] },
  { name: "Miami", country: "United States", countryCode: "US", timezone: "America/New_York", lat: 25.7617, lng: -80.1918, aliases: ["MIA", "South Florida"] },
  { name: "Dallas", country: "United States", countryCode: "US", timezone: "America/Chicago", lat: 32.7767, lng: -96.7970, aliases: ["DFW", "Dallas-Fort Worth"] },
  { name: "Houston", country: "United States", countryCode: "US", timezone: "America/Chicago", lat: 29.7604, lng: -95.3698, aliases: ["HOU"] },
  { name: "San Diego", country: "United States", countryCode: "US", timezone: "America/Los_Angeles", lat: 32.7157, lng: -117.1611, aliases: ["SD"] },
  { name: "Phoenix", country: "United States", countryCode: "US", timezone: "America/Phoenix", lat: 33.4484, lng: -112.0740, aliases: ["PHX", "Arizona"] },
  { name: "Salt Lake City", country: "United States", countryCode: "US", timezone: "America/Denver", lat: 40.7608, lng: -111.8910, aliases: ["SLC", "Utah"] },
  { name: "Portland", country: "United States", countryCode: "US", timezone: "America/Los_Angeles", lat: 45.5152, lng: -122.6784, aliases: ["PDX"] },
  { name: "Minneapolis", country: "United States", countryCode: "US", timezone: "America/Chicago", lat: 44.9778, lng: -93.2650, aliases: ["Twin Cities", "MSP"] },
  { name: "Philadelphia", country: "United States", countryCode: "US", timezone: "America/New_York", lat: 39.9526, lng: -75.1652, aliases: ["Philly", "PHL"] },
  { name: "Raleigh", country: "United States", countryCode: "US", timezone: "America/New_York", lat: 35.7796, lng: -78.6382, aliases: ["Research Triangle", "RDU"] },
  { name: "Honolulu", country: "United States", countryCode: "US", timezone: "Pacific/Honolulu", lat: 21.3069, lng: -157.8583, aliases: ["Hawaii", "HNL"] },
  { name: "Anchorage", country: "United States", countryCode: "US", timezone: "America/Anchorage", lat: 61.2181, lng: -149.9003, aliases: ["Alaska", "ANC"] },

  { name: "Toronto", country: "Canada", countryCode: "CA", timezone: "America/Toronto", lat: 43.6532, lng: -79.3832, aliases: ["YYZ", "Ontario"] },
  { name: "Vancouver", country: "Canada", countryCode: "CA", timezone: "America/Vancouver", lat: 49.2827, lng: -123.1207, aliases: ["YVR", "British Columbia"] },
  { name: "Montreal", country: "Canada", countryCode: "CA", timezone: "America/Toronto", lat: 45.5017, lng: -73.5673, aliases: ["YUL", "Quebec"] },
  { name: "Ottawa", country: "Canada", countryCode: "CA", timezone: "America/Toronto", lat: 45.4215, lng: -75.6972, aliases: ["YOW"] },
  { name: "Calgary", country: "Canada", countryCode: "CA", timezone: "America/Edmonton", lat: 51.0447, lng: -114.0719, aliases: ["YYC", "Alberta"] },
  { name: "Edmonton", country: "Canada", countryCode: "CA", timezone: "America/Edmonton", lat: 53.5461, lng: -113.4938, aliases: ["YEG"] },
  { name: "Halifax", country: "Canada", countryCode: "CA", timezone: "America/Halifax", lat: 44.6488, lng: -63.5752, aliases: ["Nova Scotia"] },
  { name: "St. John's", country: "Canada", countryCode: "CA", timezone: "America/St_Johns", lat: 47.5615, lng: -52.7126, aliases: ["Newfoundland"] },

  // Latin America & Caribbean
  { name: "Mexico City", country: "Mexico", countryCode: "MX", timezone: "America/Mexico_City", lat: 19.4326, lng: -99.1332, aliases: ["CDMX"] },
  { name: "Guadalajara", country: "Mexico", countryCode: "MX", timezone: "America/Mexico_City", lat: 20.6597, lng: -103.3496, aliases: ["GDL"] },
  { name: "Monterrey", country: "Mexico", countryCode: "MX", timezone: "America/Monterrey", lat: 25.6866, lng: -100.3161, aliases: ["MTY"] },
  { name: "Sao Paulo", country: "Brazil", countryCode: "BR", timezone: "America/Sao_Paulo", lat: -23.5505, lng: -46.6333, aliases: ["São Paulo", "SP"] },
  { name: "Rio de Janeiro", country: "Brazil", countryCode: "BR", timezone: "America/Sao_Paulo", lat: -22.9068, lng: -43.1729, aliases: ["Rio"] },
  { name: "Brasilia", country: "Brazil", countryCode: "BR", timezone: "America/Sao_Paulo", lat: -15.7975, lng: -47.8919, aliases: ["Brasília"] },
  { name: "Buenos Aires", country: "Argentina", countryCode: "AR", timezone: "America/Argentina/Buenos_Aires", lat: -34.6037, lng: -58.3816, aliases: ["BA", "BUE"] },
  { name: "Santiago", country: "Chile", countryCode: "CL", timezone: "America/Santiago", lat: -33.4489, lng: -70.6693, aliases: ["SCL"] },
  { name: "Bogota", country: "Colombia", countryCode: "CO", timezone: "America/Bogota", lat: 4.7110, lng: -74.0721, aliases: ["Bogotá", "BOG"] },
  { name: "Medellin", country: "Colombia", countryCode: "CO", timezone: "America/Bogota", lat: 6.2442, lng: -75.5812, aliases: ["Medellín"] },
  { name: "Lima", country: "Peru", countryCode: "PE", timezone: "America/Lima", lat: -12.0464, lng: -77.0428, aliases: ["LIM"] },
  { name: "Montevideo", country: "Uruguay", countryCode: "UY", timezone: "America/Montevideo", lat: -34.9011, lng: -56.1645, aliases: ["MVD"] },
  { name: "San Jose", country: "Costa Rica", countryCode: "CR", timezone: "America/Costa_Rica", lat: 9.9281, lng: -84.0907, aliases: ["San José", "SJO"] },
  { name: "Panama City", country: "Panama", countryCode: "PA", timezone: "America/Panama", lat: 8.9824, lng: -79.5199, aliases: ["PTY"] },

  // Europe — Western & Northern
  { name: "London", country: "United Kingdom", countryCode: "GB", timezone: "Europe/London", lat: 51.5074, lng: -0.1278, aliases: ["LDN", "England", "Great Britain"] },
  { name: "Manchester", country: "United Kingdom", countryCode: "GB", timezone: "Europe/London", lat: 53.4808, lng: -2.2426, aliases: ["MAN"] },
  { name: "Edinburgh", country: "United Kingdom", countryCode: "GB", timezone: "Europe/London", lat: 55.9533, lng: -3.1883, aliases: ["Scotland"] },
  { name: "Dublin", country: "Ireland", countryCode: "IE", timezone: "Europe/Dublin", lat: 53.3498, lng: -6.2603, aliases: ["DUB", "Eire"] },
  { name: "Paris", country: "France", countryCode: "FR", timezone: "Europe/Paris", lat: 48.8566, lng: 2.3522, aliases: ["PAR"] },
  { name: "Lyon", country: "France", countryCode: "FR", timezone: "Europe/Paris", lat: 45.7640, lng: 4.8357, aliases: ["LYS"] },
  { name: "Berlin", country: "Germany", countryCode: "DE", timezone: "Europe/Berlin", lat: 52.5200, lng: 13.4050, aliases: ["BER", "Deutschland"] },
  { name: "Munich", country: "Germany", countryCode: "DE", timezone: "Europe/Berlin", lat: 48.1351, lng: 11.5820, aliases: ["München", "MUC"] },
  { name: "Frankfurt", country: "Germany", countryCode: "DE", timezone: "Europe/Berlin", lat: 50.1109, lng: 8.6821, aliases: ["Frankfurt am Main", "FRA"] },
  { name: "Hamburg", country: "Germany", countryCode: "DE", timezone: "Europe/Berlin", lat: 53.5511, lng: 9.9937, aliases: ["HAM"] },
  { name: "Amsterdam", country: "Netherlands", countryCode: "NL", timezone: "Europe/Amsterdam", lat: 52.3676, lng: 4.9041, aliases: ["AMS", "Holland"] },
  { name: "Brussels", country: "Belgium", countryCode: "BE", timezone: "Europe/Brussels", lat: 50.8503, lng: 4.3517, aliases: ["BRU", "Bruxelles"] },
  { name: "Zurich", country: "Switzerland", timezone: "Europe/Zurich", countryCode: "CH", lat: 47.3769, lng: 8.5417, aliases: ["Zürich", "ZRH", "Swiss"] },
  { name: "Geneva", country: "Switzerland", timezone: "Europe/Zurich", countryCode: "CH", lat: 46.2044, lng: 6.1432, aliases: ["Genève", "GVA"] },
  { name: "Vienna", country: "Austria", countryCode: "AT", timezone: "Europe/Vienna", lat: 48.2082, lng: 16.3738, aliases: ["Wien", "VIE"] },
  { name: "Stockholm", country: "Sweden", countryCode: "SE", timezone: "Europe/Stockholm", lat: 59.3293, lng: 18.0686, aliases: ["ARN", "Sverige"] },
  { name: "Oslo", country: "Norway", countryCode: "NO", timezone: "Europe/Oslo", lat: 59.9139, lng: 10.7522, aliases: ["OSL", "Norge"] },
  { name: "Copenhagen", country: "Denmark", countryCode: "DK", timezone: "Europe/Copenhagen", lat: 55.6761, lng: 12.5683, aliases: ["CPH", "København"] },
  { name: "Helsinki", country: "Finland", countryCode: "FI", timezone: "Europe/Helsinki", lat: 60.1699, lng: 24.9384, aliases: ["HEL", "Suomi"] },
  { name: "Reykjavik", country: "Iceland", countryCode: "IS", timezone: "Atlantic/Reykjavik", lat: 64.1466, lng: -21.9426, aliases: ["Reykjavík", "KEF"] },

  // Europe — Southern & Eastern
  { name: "Madrid", country: "Spain", countryCode: "ES", timezone: "Europe/Madrid", lat: 40.4168, lng: -3.7038, aliases: ["MAD", "España"] },
  { name: "Barcelona", country: "Spain", countryCode: "ES", timezone: "Europe/Madrid", lat: 41.3879, lng: 2.1699, aliases: ["BCN", "Catalonia"] },
  { name: "Lisbon", country: "Portugal", countryCode: "PT", timezone: "Europe/Lisbon", lat: 38.7223, lng: -9.1393, aliases: ["Lisboa", "LIS"] },
  { name: "Porto", country: "Portugal", countryCode: "PT", timezone: "Europe/Lisbon", lat: 41.1579, lng: -8.6291, aliases: ["Oporto"] },
  { name: "Rome", country: "Italy", countryCode: "IT", timezone: "Europe/Rome", lat: 41.9028, lng: 12.4964, aliases: ["Roma", "FCO", "Italia"] },
  { name: "Milan", country: "Italy", countryCode: "IT", timezone: "Europe/Rome", lat: 45.4642, lng: 9.1900, aliases: ["Milano", "MXP"] },
  { name: "Warsaw", country: "Poland", countryCode: "PL", timezone: "Europe/Warsaw", lat: 52.2297, lng: 21.0122, aliases: ["Warszawa", "WAW"] },
  { name: "Krakow", country: "Poland", countryCode: "PL", timezone: "Europe/Warsaw", lat: 50.0647, lng: 19.9450, aliases: ["Kraków"] },
  { name: "Prague", country: "Czech Republic", countryCode: "CZ", timezone: "Europe/Prague", lat: 50.0755, lng: 14.4378, aliases: ["Praha", "PRG"] },
  { name: "Budapest", country: "Hungary", countryCode: "HU", timezone: "Europe/Budapest", lat: 47.4979, lng: 19.0402, aliases: ["BUD"] },
  { name: "Bucharest", country: "Romania", countryCode: "RO", timezone: "Europe/Bucharest", lat: 44.4268, lng: 26.1025, aliases: ["București", "OTP"] },
  { name: "Athens", country: "Greece", countryCode: "GR", timezone: "Europe/Athens", lat: 37.9838, lng: 23.7275, aliases: ["ATH", "Ellada"] },
  { name: "Kyiv", country: "Ukraine", countryCode: "UA", timezone: "Europe/Kyiv", lat: 50.4501, lng: 30.5234, aliases: ["Kiev", "IEV"] },
  { name: "Tallinn", country: "Estonia", countryCode: "EE", timezone: "Europe/Tallinn", lat: 59.4370, lng: 24.7536, aliases: ["TLL"] },
  { name: "Vilnius", country: "Lithuania", countryCode: "LT", timezone: "Europe/Vilnius", lat: 54.6872, lng: 25.2797, aliases: ["VNO"] },
  { name: "Riga", country: "Latvia", countryCode: "LV", timezone: "Europe/Riga", lat: 56.9496, lng: 24.1052, aliases: ["RIX"] },
  { name: "Belgrade", country: "Serbia", countryCode: "RS", timezone: "Europe/Belgrade", lat: 44.7866, lng: 20.4489, aliases: ["Beograd", "BEG"] },
  { name: "Zagreb", country: "Croatia", countryCode: "HR", timezone: "Europe/Zagreb", lat: 45.8150, lng: 15.9819, aliases: ["ZAG"] },
  { name: "Istanbul", country: "Turkey", countryCode: "TR", timezone: "Europe/Istanbul", lat: 41.0082, lng: 28.9784, aliases: ["IST", "Türkiye"] },
  { name: "Ankara", country: "Turkey", countryCode: "TR", timezone: "Europe/Istanbul", lat: 39.9334, lng: 32.8597, aliases: ["ESB"] },

  // Asia — South Asia & India
  { name: "Bengaluru", country: "India", countryCode: "IN", timezone: "Asia/Kolkata", lat: 12.9716, lng: 77.5946, aliases: ["Bangalore", "BLR", "Silicon Valley of India"] },
  { name: "Mumbai", country: "India", countryCode: "IN", timezone: "Asia/Kolkata", lat: 19.0760, lng: 72.8777, aliases: ["Bombay", "BOM"] },
  { name: "New Delhi", country: "India", countryCode: "IN", timezone: "Asia/Kolkata", lat: 28.6139, lng: 77.2090, aliases: ["Delhi", "NCR", "DEL"] },
  { name: "Hyderabad", country: "India", countryCode: "IN", timezone: "Asia/Kolkata", lat: 17.3850, lng: 78.4867, aliases: ["HYD", "Cyberabad"] },
  { name: "Chennai", country: "India", countryCode: "IN", timezone: "Asia/Kolkata", lat: 13.0827, lng: 80.2707, aliases: ["Madras", "MAA"] },
  { name: "Pune", country: "India", countryCode: "IN", timezone: "Asia/Kolkata", lat: 18.5204, lng: 73.8567, aliases: ["PNQ"] },
  { name: "Kolkata", country: "India", countryCode: "IN", timezone: "Asia/Kolkata", lat: 22.5726, lng: 88.3639, aliases: ["Calcutta", "CCU"] },
  { name: "Ahmedabad", country: "India", countryCode: "IN", timezone: "Asia/Kolkata", lat: 23.0225, lng: 72.5714, aliases: ["AMD", "Gujarat"] },
  { name: "Karachi", country: "Pakistan", countryCode: "PK", timezone: "Asia/Karachi", lat: 24.8607, lng: 67.0011, aliases: ["KHI"] },
  { name: "Lahore", country: "Pakistan", countryCode: "PK", timezone: "Asia/Karachi", lat: 31.5204, lng: 74.3587, aliases: ["LHE"] },
  { name: "Islamabad", country: "Pakistan", countryCode: "PK", timezone: "Asia/Karachi", lat: 33.6844, lng: 73.0479, aliases: ["ISB"] },
  { name: "Dhaka", country: "Bangladesh", countryCode: "BD", timezone: "Asia/Dhaka", lat: 23.8103, lng: 90.4125, aliases: ["DAC"] },
  { name: "Colombo", country: "Sri Lanka", countryCode: "LK", timezone: "Asia/Colombo", lat: 6.9271, lng: 79.8612, aliases: ["CMB"] },
  { name: "Kathmandu", country: "Nepal", countryCode: "NP", timezone: "Asia/Kathmandu", lat: 27.7172, lng: 85.3240, aliases: ["KTM"] },

  // Asia — East & Southeast Asia
  { name: "Tokyo", country: "Japan", countryCode: "JP", timezone: "Asia/Tokyo", lat: 35.6762, lng: 139.6503, aliases: ["TYO", "Nippon"] },
  { name: "Osaka", country: "Japan", countryCode: "JP", timezone: "Asia/Tokyo", lat: 34.6937, lng: 135.5023, aliases: ["KIX"] },
  { name: "Kyoto", country: "Japan", countryCode: "JP", timezone: "Asia/Tokyo", lat: 35.0116, lng: 135.7681, aliases: [] },
  { name: "Seoul", country: "South Korea", countryCode: "KR", timezone: "Asia/Seoul", lat: 37.5665, lng: 126.9780, aliases: ["SEL", "Korea"] },
  { name: "Singapore", country: "Singapore", countryCode: "SG", timezone: "Asia/Singapore", lat: 1.3521, lng: 103.8198, aliases: ["SIN", "Singapura"] },
  { name: "Hong Kong", country: "China", countryCode: "HK", timezone: "Asia/Hong_Kong", lat: 22.3193, lng: 114.1694, aliases: ["HKG", "HK"] },
  { name: "Taipei", country: "Taiwan", countryCode: "TW", timezone: "Asia/Taipei", lat: 25.0330, lng: 121.5654, aliases: ["TPE", "Formosa"] },
  { name: "Beijing", country: "China", countryCode: "CN", timezone: "Asia/Shanghai", lat: 39.9042, lng: 116.4074, aliases: ["PEK", "Peking"] },
  { name: "Shanghai", country: "China", countryCode: "CN", timezone: "Asia/Shanghai", lat: 31.2304, lng: 121.4737, aliases: ["SHA"] },
  { name: "Shenzhen", country: "China", countryCode: "CN", timezone: "Asia/Shanghai", lat: 22.5431, lng: 114.0579, aliases: ["SZX"] },
  { name: "Bangkok", country: "Thailand", countryCode: "TH", timezone: "Asia/Bangkok", lat: 13.7563, lng: 100.5018, aliases: ["BKK", "Siam"] },
  { name: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", timezone: "Asia/Kuala_Lumpur", lat: 3.1390, lng: 101.6869, aliases: ["KL", "KUL"] },
  { name: "Jakarta", country: "Indonesia", countryCode: "ID", timezone: "Asia/Jakarta", lat: -6.2088, lng: 106.8456, aliases: ["JKT"] },
  { name: "Bali", country: "Indonesia", countryCode: "ID", timezone: "Asia/Makassar", lat: -8.3405, lng: 115.0920, aliases: ["DPS", "Denpasar"] },
  { name: "Manila", country: "Philippines", countryCode: "PH", timezone: "Asia/Manila", lat: 14.5995, lng: 120.9842, aliases: ["MNL"] },
  { name: "Ho Chi Minh City", country: "Vietnam", countryCode: "VN", timezone: "Asia/Ho_Chi_Minh", lat: 10.8231, lng: 106.6297, aliases: ["Saigon", "SGN"] },
  { name: "Hanoi", country: "Vietnam", countryCode: "VN", timezone: "Asia/Bangkok", lat: 21.0285, lng: 105.8542, aliases: ["HAN"] },

  // Middle East & Central Asia
  { name: "Dubai", country: "United Arab Emirates", countryCode: "AE", timezone: "Asia/Dubai", lat: 25.2048, lng: 55.2708, aliases: ["DXB", "UAE"] },
  { name: "Abu Dhabi", country: "United Arab Emirates", countryCode: "AE", timezone: "Asia/Dubai", lat: 24.4539, lng: 54.3773, aliases: ["AUH"] },
  { name: "Riyadh", country: "Saudi Arabia", countryCode: "SA", timezone: "Asia/Riyadh", lat: 24.7136, lng: 46.6753, aliases: ["RUH", "KSA"] },
  { name: "Doha", country: "Qatar", countryCode: "QA", timezone: "Asia/Qatar", lat: 25.2854, lng: 51.5310, aliases: ["DOH"] },
  { name: "Tel Aviv", country: "Israel", countryCode: "IL", timezone: "Asia/Jerusalem", lat: 32.0853, lng: 34.7818, aliases: ["TLV", "Silicon Wadi"] },
  { name: "Jerusalem", country: "Israel", countryCode: "IL", timezone: "Asia/Jerusalem", lat: 31.7683, lng: 35.2137, aliases: [] },
  { name: "Amman", country: "Jordan", countryCode: "JO", timezone: "Asia/Amman", lat: 31.9454, lng: 35.9284, aliases: ["AMM"] },
  { name: "Beirut", country: "Lebanon", countryCode: "LB", timezone: "Asia/Beirut", lat: 33.8938, lng: 35.5018, aliases: ["BEY"] },
  { name: "Kuwait City", country: "Kuwait", countryCode: "KW", timezone: "Asia/Kuwait", lat: 29.3759, lng: 47.9774, aliases: ["KWI"] },
  { name: "Muscat", country: "Oman", countryCode: "OM", timezone: "Asia/Muscat", lat: 23.5880, lng: 58.3829, aliases: ["MCT"] },
  { name: "Almaty", country: "Kazakhstan", countryCode: "KZ", timezone: "Asia/Almaty", lat: 43.2220, lng: 76.8512, aliases: ["ALA"] },
  { name: "Tashkent", country: "Uzbekistan", countryCode: "UZ", timezone: "Asia/Tashkent", lat: 41.2995, lng: 69.2401, aliases: ["TAS"] },
  { name: "Tbilisi", country: "Georgia", countryCode: "GE", timezone: "Asia/Tbilisi", lat: 41.7151, lng: 44.8271, aliases: ["TBS"] },
  { name: "Yerevan", country: "Armenia", countryCode: "AM", timezone: "Asia/Yerevan", lat: 40.1792, lng: 44.4991, aliases: ["EVN"] },
  { name: "Baku", country: "Azerbaijan", countryCode: "AZ", timezone: "Asia/Baku", lat: 40.4093, lng: 49.8671, aliases: ["GYD"] },

  // Africa
  { name: "Cairo", country: "Egypt", countryCode: "EG", timezone: "Africa/Cairo", lat: 30.0444, lng: 31.2357, aliases: ["CAI"] },
  { name: "Johannesburg", country: "South Africa", countryCode: "ZA", timezone: "Africa/Johannesburg", lat: -26.2041, lng: 28.0473, aliases: ["Joburg", "JNB"] },
  { name: "Cape Town", country: "South Africa", countryCode: "ZA", timezone: "Africa/Johannesburg", lat: -33.9249, lng: 18.4241, aliases: ["CPT"] },
  { name: "Nairobi", country: "Kenya", countryCode: "KE", timezone: "Africa/Nairobi", lat: -1.2921, lng: 36.8219, aliases: ["NBO", "Silicon Savannah"] },
  { name: "Lagos", country: "Nigeria", countryCode: "NG", timezone: "Africa/Lagos", lat: 6.5244, lng: 3.3792, aliases: ["LOS"] },
  { name: "Accra", country: "Ghana", countryCode: "GH", timezone: "Africa/Accra", lat: 5.6037, lng: -0.1870, aliases: ["ACC"] },
  { name: "Casablanca", country: "Morocco", countryCode: "MA", timezone: "Africa/Casablanca", lat: 33.5731, lng: -7.5898, aliases: ["CMN"] },
  { name: "Tunis", country: "Tunisia", countryCode: "TN", timezone: "Africa/Tunis", lat: 36.8065, lng: 10.1815, aliases: ["TUN"] },
  { name: "Kigali", country: "Rwanda", countryCode: "RW", timezone: "Africa/Kigali", lat: -1.9706, lng: 30.1044, aliases: ["KGL"] },
  { name: "Addis Ababa", country: "Ethiopia", countryCode: "ET", timezone: "Africa/Addis_Ababa", lat: 9.0320, lng: 38.7482, aliases: ["ADD"] },
  { name: "Dakar", country: "Senegal", countryCode: "SN", timezone: "Africa/Dakar", lat: 14.7167, lng: -17.4677, aliases: ["DKR"] },

  // Oceania — Australia, New Zealand & Pacific
  { name: "Sydney", country: "Australia", countryCode: "AU", timezone: "Australia/Sydney", lat: -33.8688, lng: 151.2093, aliases: ["SYD", "NSW"] },
  { name: "Melbourne", country: "Australia", countryCode: "AU", timezone: "Australia/Melbourne", lat: -37.8136, lng: 144.9631, aliases: ["MEL", "Victoria"] },
  { name: "Brisbane", country: "Australia", countryCode: "AU", timezone: "Australia/Brisbane", lat: -27.4698, lng: 153.0251, aliases: ["BNE", "Queensland"] },
  { name: "Perth", country: "Australia", countryCode: "AU", timezone: "Australia/Perth", lat: -31.9505, lng: 115.8605, aliases: ["PER", "Western Australia"] },
  { name: "Adelaide", country: "Australia", countryCode: "AU", timezone: "Australia/Adelaide", lat: -34.9285, lng: 138.6007, aliases: ["ADL", "South Australia"] },
  { name: "Canberra", country: "Australia", countryCode: "AU", timezone: "Australia/Sydney", lat: -35.2809, lng: 149.1300, aliases: ["CBR", "ACT"] },
  { name: "Auckland", country: "New Zealand", countryCode: "NZ", timezone: "Pacific/Auckland", lat: -36.8485, lng: 174.7633, aliases: ["AKL", "Aotearoa"] },
  { name: "Wellington", country: "New Zealand", countryCode: "NZ", timezone: "Pacific/Auckland", lat: -41.2865, lng: 174.7762, aliases: ["WLG"] },
  { name: "Christchurch", country: "New Zealand", countryCode: "NZ", timezone: "Pacific/Auckland", lat: -43.5321, lng: 172.6362, aliases: ["CHC"] },
  { name: "Suva", country: "Fiji", countryCode: "FJ", timezone: "Pacific/Fiji", lat: -18.1416, lng: 178.4419, aliases: ["SUV"] }
];

/**
 * Intelligent fuzzy search for world cities.
 * Matches against city name, country, ISO country code, IANA timezone, and common aliases.
 * Prefixes and exact matches are ranked ahead of substring matches.
 * 
 * @param {string} query - Search term
 * @param {number} [limit=12] - Maximum results
 * @returns {Array<typeof CITIES_DB[0]>}
 */
export function searchCities(query, limit = 12) {
  if (!query || typeof query !== "string") {
    return CITIES_DB.slice(0, limit);
  }

  const clean = query.toLowerCase().trim();
  if (clean.length === 0) {
    return CITIES_DB.slice(0, limit);
  }

  const scored = [];

  for (const city of CITIES_DB) {
    const nameLower = city.name.toLowerCase();
    const countryLower = city.country.toLowerCase();
    const countryCodeLower = city.countryCode.toLowerCase();
    const tzLower = city.timezone.toLowerCase();
    const aliases = (city.aliases || []).map(a => a.toLowerCase());

    let matchRank = -1;

    // Rank 1: Exact matches
    if (nameLower === clean || countryCodeLower === clean || aliases.includes(clean)) {
      matchRank = 100;
    }
    // Rank 2: Starts with query
    else if (nameLower.startsWith(clean)) {
      matchRank = 80;
    }
    else if (aliases.some(a => a.startsWith(clean))) {
      matchRank = 70;
    }
    else if (countryLower.startsWith(clean)) {
      matchRank = 60;
    }
    // Rank 3: Substring inclusions
    else if (nameLower.includes(clean)) {
      matchRank = 40;
    }
    else if (aliases.some(a => a.includes(clean))) {
      matchRank = 35;
    }
    else if (countryLower.includes(clean)) {
      matchRank = 30;
    }
    else if (tzLower.includes(clean)) {
      matchRank = 20;
    }

    if (matchRank > 0) {
      scored.push({ city, score: matchRank });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.city.name.localeCompare(b.city.name));
  return scored.slice(0, limit).map(s => s.city);
}

/**
 * Helper to find a city by exact name or timezone.
 * 
 * @param {string} identifier - City name or IANA timezone
 * @returns {typeof CITIES_DB[0] | null}
 */
export function findCity(identifier) {
  if (!identifier) return null;
  const lower = identifier.toLowerCase().trim();
  return (
    CITIES_DB.find(c => c.name.toLowerCase() === lower) ||
    CITIES_DB.find(c => c.timezone.toLowerCase() === lower) ||
    CITIES_DB.find(c => (c.aliases || []).some(a => a.toLowerCase() === lower)) ||
    null
  );
}

export const ALL_CITIES = CITIES_DB.map(c => c.name);

