import { useMemo } from 'react';
import SunCalc from 'suncalc';
import { calcEaves, EavesResult } from '@/utils/solarCalculations';
import { SEASON_CONFIG } from '@/constants/seasons';
import { Season } from '@/types';

export function useEavesCalculation(
  lat: number,
  lng: number,
  season: Season,
  timeHour: number,
  buildingAzimuth: number
): EavesResult {
  return useMemo(() => {
    const cfg = SEASON_CONFIG[season];
    const year = new Date().getFullYear();
    const hours = Math.floor(timeHour);
    const minutes = Math.round((timeHour - hours) * 60);
    const date = new Date(year, cfg.month - 1, cfg.day, hours, minutes, 0);
    const pos = SunCalc.getPosition(date, lat, lng);
    return calcEaves(pos.altitude, pos.azimuth, buildingAzimuth);
  }, [lat, lng, season, timeHour, buildingAzimuth]);
}

export function useSeasonalBadges(
  lat: number,
  lng: number,
  buildingAzimuth: number
) {
  return useMemo(() => {
    const year = new Date().getFullYear();

    // 夏至南中
    const summerNoon = new Date(year, 5, 21, 12, 0, 0);
    const summerPos = SunCalc.getPosition(summerNoon, lat, lng);
    const summerEaves = calcEaves(summerPos.altitude, summerPos.azimuth, buildingAzimuth);

    // 冬至南中
    const winterNoon = new Date(year, 11, 21, 12, 0, 0);
    const winterPos = SunCalc.getPosition(winterNoon, lat, lng);
    const winterEaves = calcEaves(winterPos.altitude, winterPos.azimuth, buildingAzimuth);

    return {
      summerOk: !summerEaves.isBehind,
      winterOk: !winterEaves.isBehind,
      summerD: summerEaves.D_recommended,
      winterD: winterEaves.D_recommended,
    };
  }, [lat, lng, buildingAzimuth]);
}
