'use client';

import { useStore } from '@/store/useStore';

export default function PerformanceToggle() {
  const { performanceMode, setPerformanceMode } = useStore();

  return (
    <div className="space-y-2">
      <label id="perf-label" className="text-sm font-medium text-gray-700">パフォーマンスモード</label>
      <div className="flex gap-2" role="group" aria-labelledby="perf-label">
        <button
          onClick={() => setPerformanceMode('high')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            performanceMode === 'high'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          高画質（PC）
        </button>
        <button
          onClick={() => setPerformanceMode('light')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            performanceMode === 'light'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          軽量（タブレット）
        </button>
      </div>
      <p className="text-[11px] text-gray-400">動作が重い場合は「軽量」に切り替えてください。</p>
    </div>
  );
}
