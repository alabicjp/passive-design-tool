'use client';

import { useStore } from '@/store/useStore';
import { SEASON_CONFIG } from '@/constants/seasons';
import { Season } from '@/types';

const seasons: Season[] = ['summer_solstice', 'winter_solstice', 'equinox'];

export default function SeasonSelector() {
  const { season, setSeason } = useStore();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">季節</label>
      <div className="flex gap-2">
        {seasons.map((s) => (
          <button
            key={s}
            onClick={() => setSeason(s)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              season === s
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {SEASON_CONFIG[s].label}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-gray-400">太陽の高さは季節で大きく変わります。夏至は高く、冬至は低くなります。</p>
    </div>
  );
}
