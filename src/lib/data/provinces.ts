/**
 * Data Provinsi Indonesia (Statis)
 * ===========================================
 * Data provinsi jarang berubah, jadi lebih efisien pakai data statis
 * daripada API call yang mahal dan tidak stabil
 * 
 * Total: 38 Provinsi (Update 2024)
 */

export type Province = {
  id: string;
  name: string;
  code: string;
};

export const PROVINCES: Province[] = [
  { id: "ID-AC", name: "Aceh", code: "AC" },
  { id: "ID-SU", name: "Sumatera Utara", code: "SU" },
  { id: "ID-SB", name: "Sumatera Barat", code: "SB" },
  { id: "ID-RI", name: "Riau", code: "RI" },
  { id: "ID-JA", name: "Jambi", code: "JA" },
  { id: "ID-SS", name: "Sumatera Selatan", code: "SS" },
  { id: "ID-BE", name: "Bengkulu", code: "BE" },
  { id: "ID-LA", name: "Lampung", code: "LA" },
  { id: "ID-BB", name: "Kepulauan Bangka Belitung", code: "BB" },
  { id: "ID-KR", name: "Kepulauan Riau", code: "KR" },
  { id: "ID-JK", name: "DKI Jakarta", code: "JK" },
  { id: "ID-JB", name: "Jawa Barat", code: "JB" },
  { id: "ID-JT", name: "Jawa Tengah", code: "JT" },
  { id: "ID-YO", name: "DI Yogyakarta", code: "YO" },
  { id: "ID-JI", name: "Jawa Timur", code: "JI" },
  { id: "ID-BT", name: "Banten", code: "BT" },
  { id: "ID-BA", name: "Bali", code: "BA" },
  { id: "ID-NB", name: "Nusa Tenggara Barat", code: "NB" },
  { id: "ID-NT", name: "Nusa Tenggara Timur", code: "NT" },
  { id: "ID-KB", name: "Kalimantan Barat", code: "KB" },
  { id: "ID-KT", name: "Kalimantan Tengah", code: "KT" },
  { id: "ID-KS", name: "Kalimantan Selatan", code: "KS" },
  { id: "ID-KI", name: "Kalimantan Timur", code: "KI" },
  { id: "ID-KU", name: "Kalimantan Utara", code: "KU" },
  { id: "ID-SA", name: "Sulawesi Utara", code: "SA" },
  { id: "ID-ST", name: "Sulawesi Tengah", code: "ST" },
  { id: "ID-SN", name: "Sulawesi Selatan", code: "SN" },
  { id: "ID-SG", name: "Sulawesi Tenggara", code: "SG" },
  { id: "ID-GO", name: "Gorontalo", code: "GO" },
  { id: "ID-SR", name: "Sulawesi Barat", code: "SR" },
  { id: "ID-MA", name: "Maluku", code: "MA" },
  { id: "ID-MU", name: "Maluku Utara", code: "MU" },
  { id: "ID-PA", name: "Papua", code: "PA" },
  { id: "ID-PB", name: "Papua Barat", code: "PB" },
  { id: "ID-PE", name: "Papua Tengah", code: "PE" },
  { id: "ID-PP", name: "Papua Pegunungan", code: "PP" },
  { id: "ID-PS", name: "Papua Selatan", code: "PS" },
  { id: "ID-PD", name: "Papua Barat Daya", code: "PD" },
];

/**
 * Get province by name
 */
export function getProvinceByName(name: string): Province | undefined {
  return PROVINCES.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get province by code
 */
export function getProvinceByCode(code: string): Province | undefined {
  return PROVINCES.find(
    (p) => p.code.toLowerCase() === code.toLowerCase()
  );
}

/**
 * Search provinces by query
 */
export function searchProvinces(query: string): Province[] {
  if (!query || query.trim().length === 0) {
    return PROVINCES;
  }

  const lowerQuery = query.toLowerCase();
  return PROVINCES.filter((p) =>
    p.name.toLowerCase().includes(lowerQuery)
  );
}
