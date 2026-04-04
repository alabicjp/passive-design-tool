import { useMemo } from 'react';
import SunCalc from 'suncalc';
import { calcEaves, EavesResult } from '@/utils/solarCalculations';

export interface EavesProposalResult {
  summerEaves: EavesResult; // 夏至南中の軒の出（遮蔽用）
  winterEaves: EavesResult; // 冬至南中の軒の出（検証用）
  winterCanTakeIn: boolean; // 冬至に日射取得できるか
}

export function useEavesProposal(
  lat: number,
  lng: number,
  buildingAzimuth: number
): EavesProposalResult {
  return useMemo(() => {
    const year = new Date().getFullYear();

    // 夏至南中（12時）→ この太陽高度で遮蔽できる軒の出を計算
    const summerNoon = new Date(year, 5, 21, 12, 0, 0);
    const summerPos = SunCalc.getPosition(summerNoon, lat, lng);
    const summerEaves = calcEaves(summerPos.altitude, summerPos.azimuth, buildingAzimuth);

    // 冬至南中（12時）→ 夏至の軒の出で冬の日射が入るか検証
    const winterNoon = new Date(year, 11, 21, 12, 0, 0);
    const winterPos = SunCalc.getPosition(winterNoon, lat, lng);
    const winterEaves = calcEaves(winterPos.altitude, winterPos.azimuth, buildingAzimuth);

    // 冬至の太陽が窓に届くか: 冬至に必要な軒の出 > 夏至の軒の出 なら日射取得OK
    // （冬至は太陽高度が低い → 軒で遮らない = 日射が室内に入る）
    const winterCanTakeIn = winterEaves.isBehind || winterEaves.D > summerEaves.D_recommended;

    return { summerEaves, winterEaves, winterCanTakeIn };
  }, [lat, lng, buildingAzimuth]);
}
