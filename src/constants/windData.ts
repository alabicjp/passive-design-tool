export const WIND_DATA: Record<string, { summer: number; winter: number; lat: number; lng: number }> = {
  sapporo:   { summer: 180, winter: 315, lat: 43.06, lng: 141.35 },
  sendai:    { summer: 180, winter: 330, lat: 38.27, lng: 140.87 },
  tokyo:     { summer: 180, winter: 330, lat: 35.68, lng: 139.77 },
  nagoya:    { summer: 180, winter: 300, lat: 35.17, lng: 136.91 },
  osaka:     { summer: 210, winter: 300, lat: 34.69, lng: 135.50 },
  hiroshima: { summer: 210, winter: 315, lat: 34.39, lng: 132.45 },
  fukuoka:   { summer: 210, winter: 270, lat: 33.59, lng: 130.40 },
  naha:      { summer: 225, winter: 45,  lat: 26.21, lng: 127.68 },
};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNearestWindData(lat: number, lng: number) {
  let nearest = 'tokyo';
  let minDist = Infinity;
  for (const [key, val] of Object.entries(WIND_DATA)) {
    const dist = haversineDistance(lat, lng, val.lat, val.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = key;
    }
  }
  return { city: nearest, ...WIND_DATA[nearest] };
}
