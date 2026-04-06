import SunCalc from 'suncalc';

export function calcSunlightHours(
  lat: number,
  lng: number,
  month: number,
  day: number,
  faceDir: number
): number {
  const year = new Date().getFullYear();
  let hours = 0;

  for (let h = 6; h <= 18; h += 0.5) {
    const hr = Math.floor(h);
    const min = (h - hr) * 60;
    const date = new Date(year, month - 1, day, hr, min, 0);
    const pos = SunCalc.getPosition(date, lat, lng);

    if (pos.altitude <= 0) continue;

    // SunCalc azimuth (南=0) → 北=0基準に変換
    const sunAzNorth = (((pos.azimuth * 180) / Math.PI + 180) % 360 + 360) % 360;
    const diff = Math.abs(((sunAzNorth - faceDir + 540) % 360) - 180);

    if (diff <= 90) {
      hours += 0.5;
    }
  }

  return Math.round(hours * 10) / 10;
}
