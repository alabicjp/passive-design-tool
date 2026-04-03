'use client';

import { useStore } from '@/store/useStore';

export default function AzimuthSlider() {
  const { buildingAzimuth, setBuildingAzimuth } = useStore();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        建物方位角: <span className="font-bold text-blue-700">{buildingAzimuth}°</span>
        <span className="ml-1 text-xs text-gray-400">(真南=0°)</span>
      </label>
      <input
        type="range"
        min={-90}
        max={90}
        step={1}
        value={buildingAzimuth}
        onChange={(e) => setBuildingAzimuth(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>東寄り -90°</span>
        <span>真南 0°</span>
        <span>西寄り +90°</span>
      </div>
    </div>
  );
}
