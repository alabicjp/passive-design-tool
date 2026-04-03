'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { getNearestWindData } from '@/constants/windData';
import { directionLabel, getFaceDirections } from '@/utils/passiveDesign';

export default function VentilationProposal() {
  const { latitude, longitude, buildingAzimuth, season } = useStore();
  const windData = useMemo(() => getNearestWindData(latitude, longitude), [latitude, longitude]);
  const defaultDir = season === 'winter_solstice' ? windData.winter : windData.summer;
  const [manualDir, setManualDir] = useState<number | null>(null);
  const windDir = manualDir ?? defaultDir;

  const faces = getFaceDirections(buildingAzimuth);

  // 風上・風下の面を判定
  const faceEntries = [
    { name: '正面', dir: faces.front },
    { name: '右側面', dir: faces.right },
    { name: '背面', dir: faces.back },
    { name: '左側面', dir: faces.left },
  ];

  type FaceWithDiff = { name: string; dir: number; diff: number };

  const windward = faceEntries.reduce<FaceWithDiff>((best, f) => {
    const diff = Math.abs(((f.dir - windDir + 540) % 360) - 180);
    return diff < best.diff ? { ...f, diff } : best;
  }, { name: '', dir: 0, diff: 360 });

  const leeward = faceEntries.reduce<FaceWithDiff>((best, f) => {
    const diff = Math.abs(((f.dir - ((windDir + 180) % 360) + 540) % 360) - 180);
    return diff < best.diff ? { ...f, diff } : best;
  }, { name: '', dir: 0, diff: 360 });

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">通風提案</h3>

      {/* 風向表示 */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 rounded-full border-2 border-gray-200 flex items-center justify-center">
          <span className="absolute -top-2 text-[10px] text-gray-400">N</span>
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            style={{ transform: `rotate(${windDir}deg)` }}
            className="transition-transform duration-300"
          >
            <polygon points="16,4 20,24 16,20 12,24" fill="#3b82f6" />
          </svg>
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm text-gray-600">
            卓越風向: <span className="font-bold">{directionLabel(windDir)}</span> ({windDir}°)
          </p>
          <p className="text-xs text-gray-400">最寄り観測点: {windData.city}</p>
          <input
            type="number"
            min={0}
            max={360}
            value={manualDir ?? ''}
            onChange={(e) => setManualDir(e.target.value ? Number(e.target.value) : null)}
            placeholder="手動調整 (0-360°)"
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
          />
        </div>
      </div>

      {/* 通風提案 */}
      <div className="space-y-1 text-sm">
        <p className="text-green-700">
          <span className="font-medium">{windward.name}</span>に開口部を設けて給気
        </p>
        <p className="text-blue-700">
          <span className="font-medium">{leeward.name}</span>に排気用開口部を設ける
        </p>
      </div>

      {/* 注意書き */}
      <div className="rounded-lg bg-amber-50 p-2">
        <p className="text-xs text-amber-700">
          ※気象庁観測データに基づく参考値です。実際の風向きは隣家・微地形によって異なります。
        </p>
      </div>
    </div>
  );
}
