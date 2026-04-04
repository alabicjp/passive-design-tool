'use client';

import { useStore } from '@/store/useStore';
import { useEavesProposal } from '@/hooks/useEavesCalculation';
import { H_BASE } from '@/constants/defaults';

export default function EavesProposal() {
  const { latitude, longitude, buildingAzimuth } = useStore();
  const { summerEaves, winterEaves, winterCanTakeIn } = useEavesProposal(latitude, longitude, buildingAzimuth);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">軒の出提案</h3>

      {summerEaves.isBehind ? (
        <p className="text-sm text-gray-400">正面が北向きのため、軒による日射遮蔽は不要です</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">夏至の南中時に日射を遮る軒の出</p>
          <div className="flex gap-4">
            <div className="flex-1 rounded-lg bg-orange-50 p-3 text-center">
              <p className="text-xs text-gray-500">理論値</p>
              <p className="text-2xl font-bold text-orange-600 transition-all duration-300">{summerEaves.D}m</p>
            </div>
            <div className="flex-1 rounded-lg bg-green-50 p-3 text-center">
              <p className="text-xs text-gray-500">推奨値</p>
              <p className="text-2xl font-bold text-green-700 transition-all duration-300">{summerEaves.D_recommended}m</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            H_base={H_BASE}m / 方位角={buildingAzimuth}° / 夏至太陽高度={summerEaves.theta}° / 実効高度={summerEaves.theta_eff}°
          </p>
        </div>
      )}

      {/* 検証結果 */}
      <div className="space-y-1">
        <div className="flex gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            !summerEaves.isBehind ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'
          }`}>
            夏至: {!summerEaves.isBehind ? '遮蔽OK' : '-'}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            winterCanTakeIn ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'
          }`}>
            冬至: {winterCanTakeIn ? '日射取得OK' : '日射不足の恐れ'}
          </span>
        </div>
        {!winterEaves.isBehind && (
          <p className="text-xs text-gray-400">
            冬至南中: 太陽高度={winterEaves.theta}° → 軒なしで{winterEaves.D}m先まで日射到達
          </p>
        )}
      </div>
    </div>
  );
}
