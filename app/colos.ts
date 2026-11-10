// City names for common Cloudflare data centres, keyed by the IATA airport code
// that /cdn-cgi/trace reports as `colo`. Anything missing shows as just the code.
export const COLO_CITIES: Record<string, string> = {
  // North America
  ATL: "Atlanta", AUS: "Austin", BNA: "Nashville", BOS: "Boston", BUF: "Buffalo",
  CLE: "Cleveland", CLT: "Charlotte", CMH: "Columbus", DEN: "Denver", DFW: "Dallas",
  DTW: "Detroit", EWR: "Newark", HNL: "Honolulu", IAD: "Ashburn", IAH: "Houston",
  IND: "Indianapolis", JAX: "Jacksonville", LAS: "Las Vegas", LAX: "Los Angeles",
  MCI: "Kansas City", MEM: "Memphis", MIA: "Miami", MSP: "Minneapolis", OKC: "Oklahoma City",
  OMA: "Omaha", ORD: "Chicago", PDX: "Portland", PHL: "Philadelphia", PHX: "Phoenix",
  PIT: "Pittsburgh", RDU: "Raleigh", RIC: "Richmond", SAN: "San Diego", SAT: "San Antonio",
  SEA: "Seattle", SJC: "San Jose", SLC: "Salt Lake City", SMF: "Sacramento", STL: "St. Louis",
  TPA: "Tampa", YEG: "Edmonton", YHZ: "Halifax", YOW: "Ottawa", YUL: "Montréal",
  YVR: "Vancouver", YWG: "Winnipeg", YYC: "Calgary", YYZ: "Toronto", MEX: "Mexico City",
  // Europe and the Middle East
  AMS: "Amsterdam", ARN: "Stockholm", ATH: "Athens", BCN: "Barcelona", BRU: "Brussels",
  BUD: "Budapest", CDG: "Paris", CPH: "Copenhagen", DUB: "Dublin", DUS: "Düsseldorf",
  EDI: "Edinburgh", FCO: "Rome", FRA: "Frankfurt", HAM: "Hamburg", HEL: "Helsinki",
  IST: "Istanbul", LHR: "London", LIS: "Lisbon", MAD: "Madrid", MAN: "Manchester",
  MRS: "Marseille", MUC: "Munich", MXP: "Milan", OSL: "Oslo", OTP: "Bucharest",
  PRG: "Prague", SOF: "Sofia", VIE: "Vienna", WAW: "Warsaw", ZRH: "Zurich",
  DOH: "Doha", DXB: "Dubai", TLV: "Tel Aviv",
  // Asia Pacific
  AKL: "Auckland", BKK: "Bangkok", BLR: "Bengaluru", BNE: "Brisbane", BOM: "Mumbai",
  CGK: "Jakarta", DEL: "New Delhi", HKG: "Hong Kong", HYD: "Hyderabad", ICN: "Seoul",
  KIX: "Osaka", KUL: "Kuala Lumpur", MAA: "Chennai", MEL: "Melbourne", MNL: "Manila",
  NRT: "Tokyo", PER: "Perth", SGN: "Ho Chi Minh City", SIN: "Singapore", SYD: "Sydney",
  TPE: "Taipei",
  // South America and Africa
  BOG: "Bogotá", EZE: "Buenos Aires", GIG: "Rio de Janeiro", GRU: "São Paulo", LIM: "Lima",
  SCL: "Santiago", CAI: "Cairo", CPT: "Cape Town", JNB: "Johannesburg", LOS: "Lagos",
  NBO: "Nairobi",
};
