import { H_BASE, MIN_EAVES } from '@/constants/defaults';

export interface EavesResult {
  D: number;
  D_recommended: number;
  isBehind: boolean;
  theta: number;
  theta_eff: number;
}

export function calcEaves(
  theta: number,
  A_sun: number,
  buildingAzimuth: number
): EavesResult {
  if (theta <= 0) {
    return { D: 0, D_recommended: 0, isBehind: true, theta: 0, theta_eff: 0 };
  }
  const alpha = buildingAzimuth * (Math.PI / 180);
  const cosVal = Math.cos(A_sun - alpha);
  if (Math.abs(cosVal) < 0.001) {
    return { D: 0, D_recommended: 0, isBehind: true, theta: Math.round(theta * (180 / Math.PI) * 10) / 10, theta_eff: 0 };
  }
  const theta_eff = Math.atan(Math.tan(theta) / cosVal);
  if (theta_eff <= 0 || !isFinite(theta_eff)) {
    return { D: 0, D_recommended: 0, isBehind: true, theta: Math.round(theta * (180 / Math.PI) * 10) / 10, theta_eff: 0 };
  }
  const D = H_BASE / Math.tan(theta_eff);
  return {
    D: Math.round(D * 100) / 100,
    D_recommended: Math.round(Math.max(D, MIN_EAVES) * 100) / 100,
    isBehind: false,
    theta: Math.round(theta * (180 / Math.PI) * 10) / 10,
    theta_eff: Math.round(theta_eff * (180 / Math.PI) * 10) / 10,
  };
}
