'use client';

import { useStore } from '@/store/useStore';

function getDirectionLabel(deg: number): string {
  const abs = Math.abs(deg);
  if (abs <= 22) return '南向き';
  if (abs <= 67) return deg < 0 ? '東南向き' : '南西向き';
  if (abs <= 112) return deg < 0 ? '東向き' : '西向き';
  if (abs <= 157) return deg < 0 ? '北東向き' : '北西向き';
  return '北向き';
}

export default function AzimuthSlider() {
  const { buildingAzimuth, setBuildingAzimuth } = useStore();
  const dirLabel = getDirectionLabel(buildingAzimuth);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        建物方位角: <span className="font-bold text-blue-700">{buildingAzimuth}°</span>
        <span className="ml-1 text-xs text-gray-400">({dirLabel})</span>
      </label>
      <input
        type="range"
        min={-180}
        max={180}
        step={1}
        value={buildingAzimuth}
        onChange={(e) => setBuildingAzimuth(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>北 -180°</span>
        <span>東 -90°</span>
        <span>南 0°</span>
        <span>西 90°</span>
        <span>北 180°</span>
      </div>
      <p className="text-[11px] text-gray-400">建物正面が向く方角です。真南=0°、東寄りはマイナス、西寄りはプラスです。</p>
    </div>
  );
}
