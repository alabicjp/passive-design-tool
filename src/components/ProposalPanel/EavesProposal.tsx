'use client';

import { useStore } from '@/store/useStore';
import { useEavesCalculation, useSeasonalBadges } from '@/hooks/useEavesCalculation';
import { H_BASE } from '@/constants/defaults';

export default function EavesProposal() {
  const { latitude, longitude, season, timeHour, buildingAzimuth } = useStore();
  const eaves = useEavesCalculation(latitude, longitude, season, timeHour, buildingAzimuth);
  const badges = useSeasonalBadges(latitude, longitude, buildingAzimuth);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">軒の出提案</h3>

      {eaves.isBehind ? (
        <p className="text-sm text-gray-400">太陽が建物背面にあるため遮蔽不要です</p>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-4">
            <div className="flex-1 rounded-lg bg-blue-50 p-3 text-center">
              <p className="text-xs text-gray-500">理論値</p>
              <p className="text-2xl font-bold text-blue-700 transition-all duration-300">{eaves.D}m</p>
            </div>
            <div className="flex-1 rounded-lg bg-green-50 p-3 text-center">
              <p className="text-xs text-gray-500">推奨値</p>
              <p className="text-2xl font-bold text-green-700 transition-all duration-300">{eaves.D_recommended}m</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            H_base={H_BASE}m / 方位角={buildingAzimuth}° / 太陽高度={eaves.theta}° / 実効高度={eaves.theta_eff}°
          </p>
        </div>
      )}

      {/* 季節バッジ */}
      <div className="flex gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          badges.summerOk ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
        }`}>
          夏至: {badges.summerOk ? '遮蔽OK' : '-'}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          badges.winterOk ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
        }`}>
          冬至: {badges.winterOk ? '取得OK' : '-'}
        </span>
      </div>
    </div>
  );
}
