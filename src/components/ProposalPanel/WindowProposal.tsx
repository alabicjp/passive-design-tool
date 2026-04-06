'use client';

import { useStore } from '@/store/useStore';
import { getWindowRecommendations } from '@/utils/passiveDesign';

const sizeColors: Record<string, string> = {
  '大開口': 'bg-orange-100 text-orange-700',
  '中程度': 'bg-yellow-100 text-yellow-700',
  '小窓＋外付け遮蔽': 'bg-purple-100 text-purple-700',
  '小窓': 'bg-gray-100 text-gray-600',
};

export default function WindowProposal() {
  const { buildingAzimuth } = useStore();
  const recommendations = getWindowRecommendations(buildingAzimuth);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">窓配置提案</h3>
      <p className="text-[11px] text-gray-400">建物の各面について、窓の大きさと注意点を提案します。</p>
      <div className="space-y-2">
        {recommendations.map((rec) => (
          <div key={rec.face} className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {rec.face}
                <span className="ml-1 text-xs text-gray-400">({rec.direction})</span>
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sizeColors[rec.size] || 'bg-gray-100'}`}>
                {rec.size}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{rec.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
