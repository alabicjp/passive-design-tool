'use client';

import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { estimateRegion } from '@/utils/regionEstimation';

// 地域別の暖房度日（HDD: 基準温度18℃）と冷房度日（CDD: 基準温度24℃）の概算値
// 出典: 気象庁アメダス30年平均値（1991-2020）に基づく各地域代表都市の概算
const CLIMATE_DATA: Record<number, { hdd: number; cdd: number; label: string }> = {
  1: { hdd: 5500, cdd: 50, label: '1地域' },
  2: { hdd: 4500, cdd: 100, label: '2地域' },
  3: { hdd: 3800, cdd: 150, label: '3地域' },
  4: { hdd: 3000, cdd: 250, label: '4地域' },
  5: { hdd: 2200, cdd: 400, label: '5地域' },
  6: { hdd: 2000, cdd: 450, label: '6地域' },
  7: { hdd: 1500, cdd: 550, label: '7地域' },
  8: { hdd: 500, cdd: 800, label: '8地域' },
};

// 電気代単価（円/kWh）- 2024年度全国平均
const ELECTRICITY_RATE = 31;

// 概算光熱費の計算（簡易定常計算法）
// 熱損失量 = UA値 × 延床面積 × 暖房度日(HDD18℃基準) × 24h / 1000 → kWh/年
// 冷房負荷 = UA値 × 延床面積 × 冷房度日(CDD24℃基準) × 24h / 1000 → kWh/年
// 消費電力 = 熱負荷 ÷ COP（暖房3.5, 冷房4.0: エアコン年間平均）
// 参考: 住宅の省エネルギー基準における簡易計算手法に準拠した概算
function calcAnnualEnergy(ua: number, floorArea: number, region: number) {
  const climate = CLIMATE_DATA[region] || CLIMATE_DATA[6];
  const heatingLoad = (ua * floorArea * climate.hdd * 24) / 1000; // kWh
  const coolingLoad = (ua * floorArea * climate.cdd * 24) / 1000; // kWh
  const heatingElec = heatingLoad / 3.5; // COP 3.5
  const coolingElec = coolingLoad / 4.0; // COP 4.0
  const totalElec = heatingElec + coolingElec;
  const annualCost = Math.round(totalElec * ELECTRICITY_RATE);
  return {
    heatingElec: Math.round(heatingElec),
    coolingElec: Math.round(coolingElec),
    totalElec: Math.round(totalElec),
    annualCost,
  };
}

// 比較用の仕様パターン
const COMPARISON_SPECS = [
  { label: '一般仕様（等級4相当）', ua: 0.87 },
  { label: '高断熱仕様（等級5相当）', ua: 0.60 },
  { label: 'ZEH仕様（等級6相当）', ua: 0.46 },
  { label: '最高断熱（等級7相当）', ua: 0.26 },
];

export default function EnergyCostComparison() {
  const { latitude, manualBlocks } = useStore();
  const region = estimateRegion(latitude);
  const subjectBlocks = manualBlocks.filter((b) => b.blockType === 'subject');

  const results = useMemo(() => {
    if (subjectBlocks.length === 0) return null;

    const block = subjectBlocks[0];
    const floors = Math.max(1, Math.round(block.height / 3));
    const floorArea = block.width * block.depth * floors;

    return COMPARISON_SPECS.map((spec) => ({
      ...spec,
      ...calcAnnualEnergy(spec.ua, floorArea, region),
      floorArea,
    }));
  }, [subjectBlocks, region]);

  if (!results) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">年間光熱費の比較</h3>
        <p className="text-[11px] text-gray-400">本物件を配置すると、断熱仕様ごとの年間光熱費を概算比較します。</p>
        <p className="text-xs text-gray-400">地図上で「+ 本物件を配置」してください。</p>
      </div>
    );
  }

  const baselineCost = results[0].annualCost;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">年間光熱費の比較</h3>
      <p className="text-[11px] text-gray-400">断熱仕様を変えると年間の冷暖房費がどう変わるか概算しています。</p>

      {/* 比較テーブル */}
      <div className="space-y-2">
        {results.map((r, i) => {
          const saving = baselineCost - r.annualCost;
          const barWidth = baselineCost > 0
            ? Math.max(5, Math.round((r.annualCost / baselineCost) * 100))
            : 5;

          return (
            <div key={r.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">{r.label}</span>
                <span className="font-bold text-gray-800">
                  約{(r.annualCost / 10000).toFixed(1)}万円/年
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      i === 0 ? 'bg-red-400' :
                      i === 1 ? 'bg-yellow-400' :
                      i === 2 ? 'bg-green-400' :
                      'bg-blue-400'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                {saving > 0 && (
                  <span className="text-[10px] text-green-600 font-medium shrink-0">
                    -{(saving / 10000).toFixed(1)}万円
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 30年間の差額 */}
      {results.length >= 3 && (
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <p className="text-[10px] text-gray-500">一般仕様 → ZEH仕様にすると</p>
          <p className="text-lg font-bold text-blue-700">
            30年間で約{((baselineCost - results[2].annualCost) * 30 / 10000).toFixed(0)}万円おトク
          </p>
          <p className="text-[10px] text-gray-400">
            年間差額 約{Math.round((baselineCost - results[2].annualCost) / 1000)}千円 × 30年
          </p>
        </div>
      )}

      {/* 前提条件 */}
      <div className="rounded-lg bg-amber-50 p-2">
        <p className="text-[10px] text-amber-700">
          ※概算値です。電気代{ELECTRICITY_RATE}円/kWh、エアコンCOP暖房3.5/冷房4.0で計算。
          実際の光熱費は生活スタイル・設備・気象条件により異なります。
        </p>
      </div>
    </div>
  );
}
