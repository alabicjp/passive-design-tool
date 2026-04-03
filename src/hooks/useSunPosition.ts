import { useMemo } from 'react';
import SunCalc from 'suncalc';

export interface SunPosition {
  altitude: number;
  azimuth: number;
  date: Date;
}

export function useSunPosition(lat: number, lng: number, date: Date): SunPosition {
  const timestamp = date.getTime();
  return useMemo(() => {
    const d = new Date(timestamp);
    const pos = SunCalc.getPosition(d, lat, lng);
    return {
      altitude: pos.altitude,
      azimuth: pos.azimuth,
      date: d,
    };
  }, [lat, lng, timestamp]);
}
