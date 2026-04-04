'use client';

import { useMemo } from 'react';
import SunCalc from 'suncalc';
import { useStore } from '@/store/useStore';
import { SEASON_CONFIG } from '@/constants/seasons';

export default function SunOverlay() {
  const { latitude, longitude, season, timeHour } = useStore();

  const sunInfo = useMemo(() => {
    const cfg = SEASON_CONFIG[season];
    const year = new Date().getFullYear();
    const hours = Math.floor(timeHour);
    const minutes = Math.round((timeHour - hours) * 60);
    const sunDate = new Date(year, cfg.month - 1, cfg.day, hours, minutes, 0);
    const pos = SunCalc.getPosition(sunDate, latitude, longitude);

    const altDeg = Math.round((pos.altitude * 180) / Math.PI);
    // SunCalc azimuth: 南=0, 西=正 → 北基準に変換
    const azNorth = ((pos.azimuth * 180) / Math.PI + 180 + 360) % 360;
    const azDeg = Math.round(azNorth);

    // 太陽の方角を日本語で
    const dirs = ['北', '北東', '東', '南東', '南', '南西', '西', '北西'];
    const dirLabel = dirs[Math.round(azNorth / 45) % 8];

    // コンパスの針方向（CSS transform用、北=0度で時計回り）
    const arrowRotation = azNorth;

    return { altDeg, azDeg, dirLabel, arrowRotation, isNight: pos.altitude <= 0 };
  }, [latitude, longitude, season, timeHour]);

  return (
    <div className="absolute bottom-3 left-3 z-10 flex items-end gap-2">
      {/* 太陽コンパス */}
      <div className="rounded-xl bg-white/90 backdrop-blur-sm p-3 shadow-lg">
        <div className="relative w-16 h-16">
          {/* コンパス円 */}
          <svg viewBox="0 0 64 64" className="w-full h-full">
            <circle cx="32" cy="32" r="30" fill="none" stroke="#e5e7eb" strokeWidth="1.5" />
            {/* 方位マーク */}
            <text x="32" y="10" textAnchor="middle" fontSize="8" fill="#6b7280" fontWeight="bold">N</text>
            <text x="56" y="35" textAnchor="middle" fontSize="7" fill="#9ca3af">E</text>
            <text x="32" y="60" textAnchor="middle" fontSize="7" fill="#9ca3af">S</text>
            <text x="8" y="35" textAnchor="middle" fontSize="7" fill="#9ca3af">W</text>
            {/* 太陽方向の矢印 */}
            <g transform={`rotate(${sunInfo.arrowRotation}, 32, 32)`}>
              <line x1="32" y1="32" x2="32" y2="6" stroke={sunInfo.isNight ? '#64748b' : '#f59e0b'} strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="32,4 28,12 36,12" fill={sunInfo.isNight ? '#64748b' : '#f59e0b'} />
            </g>
            {/* 中心の太陽マーク */}
            <circle cx="32" cy="32" r="4" fill={sunInfo.isNight ? '#475569' : '#fbbf24'} />
          </svg>
        </div>
      </div>

      {/* 太陽情報テキスト */}
      <div className="rounded-xl bg-white/90 backdrop-blur-sm px-3 py-2 shadow-lg">
        <div className="text-[10px] font-medium text-gray-500 mb-0.5">太陽位置</div>
        {sunInfo.isNight ? (
          <div className="text-sm font-bold text-slate-500">日没後</div>
        ) : (
          <>
            <div className="text-sm font-bold text-amber-600">
              {sunInfo.dirLabel} {sunInfo.azDeg}°
            </div>
            <div className="text-xs text-gray-500">
              高度 {sunInfo.altDeg}°
            </div>
          </>
        )}
        <div className="text-[10px] text-gray-400 mt-0.5">
          {SEASON_CONFIG[season].label} {Math.floor(timeHour)}:{String(Math.round((timeHour % 1) * 60)).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}
