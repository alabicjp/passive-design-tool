'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';

// 省エネ基準の地域区分別UA値基準
const REGION_STANDARDS: Record<number, { ua: number; zeh: number; label: string }> = {
  1: { ua: 0.46, zeh: 0.40, label: '1地域（旭川等）' },
  2: { ua: 0.46, zeh: 0.40, label: '2地域（札幌等）' },
  3: { ua: 0.56, zeh: 0.50, label: '3地域（盛岡等）' },
  4: { ua: 0.75, zeh: 0.60, label: '4地域（仙台等）' },
  5: { ua: 0.87, zeh: 0.60, label: '5地域（東京等）' },
  6: { ua: 0.87, zeh: 0.60, label: '6地域（名古屋・三重等）' },
  7: { ua: 0.87, zeh: 0.60, label: '7地域（鹿児島等）' },
  8: { ua: 0.87, zeh: 0.60, label: '8地域（沖縄等）' },
};

// 緯度から地域区分を簡易推定
function estimateRegion(lat: number): number {
  if (lat >= 43.5) return 1;
  if (lat >= 42.0) return 2;
  if (lat >= 39.5) return 3;
  if (lat >= 37.0) return 4;
  if (lat >= 35.5) return 5;
  if (lat >= 33.0) return 6;
  if (lat >= 27.0) return 7;
  return 8;
}

// 壁の仕様
const WALL_SPECS = [
  { label: '高断熱（付加断熱）', u: 0.20 },
  { label: '高性能GW 105mm', u: 0.35 },
  { label: '一般GW 105mm', u: 0.49 },
  { label: '一般GW 75mm', u: 0.67 },
];

// 屋根の仕様
const ROOF_SPECS = [
  { label: '高断熱（200mm以上）', u: 0.15 },
  { label: '高性能GW 155mm', u: 0.24 },
  { label: '一般GW 100mm', u: 0.40 },
];

// 床の仕様
const FLOOR_SPECS = [
  { label: '基礎断熱（外張り）', u: 0.20 },
  { label: '床下断熱 XPS 50mm', u: 0.34 },
  { label: '床下断熱 GW 42mm', u: 0.48 },
  { label: '無断熱', u: 1.80 },
];

// 窓の仕様
const WINDOW_SPECS = [
  { label: 'トリプルLow-E（樹脂枠）', u: 0.90 },
  { label: 'ペアLow-E（樹脂枠）', u: 1.30 },
  { label: 'ペアLow-E（アルミ樹脂複合）', u: 2.33 },
  { label: 'ペアガラス（アルミ枠）', u: 3.49 },
  { label: '単板ガラス（アルミ枠）', u: 6.51 },
];

// 断熱等性能等級の判定（地域区分対応）
// 等級基準値は告示に基づく地域別UA値（W/m2K）
const GRADE_BY_REGION: Record<number, { g7: number; g6: number; g5: number; g4: number }> = {
  1: { g7: 0.20, g6: 0.28, g5: 0.40, g4: 0.46 },
  2: { g7: 0.20, g6: 0.28, g5: 0.40, g4: 0.46 },
  3: { g7: 0.20, g6: 0.28, g5: 0.50, g4: 0.56 },
  4: { g7: 0.23, g6: 0.34, g5: 0.60, g4: 0.75 },
  5: { g7: 0.26, g6: 0.46, g5: 0.60, g4: 0.87 },
  6: { g7: 0.26, g6: 0.46, g5: 0.60, g4: 0.87 },
  7: { g7: 0.26, g6: 0.46, g5: 0.60, g4: 0.87 },
  8: { g7: 0.26, g6: 0.46, g5: 0.60, g4: 0.87 },
};

function getInsulationGrade(ua: number, region: number): { grade: number; label: string; color: string } {
  const g = GRADE_BY_REGION[region] || GRADE_BY_REGION[6];
  if (ua <= g.g7) return { grade: 7, label: '等級7（HEAT20 G3相当）', color: 'text-purple-700 bg-purple-100' };
  if (ua <= g.g6) return { grade: 6, label: '等級6（HEAT20 G2相当）', color: 'text-blue-700 bg-blue-100' };
  if (ua <= g.g5) return { grade: 5, label: '等級5（ZEH基準）', color: 'text-green-700 bg-green-100' };
  if (ua <= g.g4) return { grade: 4, label: '等級4（省エネ基準）', color: 'text-yellow-700 bg-yellow-100' };
  return { grade: 3, label: '等級3以下', color: 'text-red-700 bg-red-100' };
}

export default function ThermalPerformance() {
  const { latitude, manualBlocks } = useStore();
  const region = estimateRegion(latitude);
  const standard = REGION_STANDARDS[region];

  const [wallIdx, setWallIdx] = useState(1);
  const [roofIdx, setRoofIdx] = useState(1);
  const [floorIdx, setFloorIdx] = useState(1);
  const [windowIdx, setWindowIdx] = useState(1);

  const subjectBlocks = manualBlocks.filter((b) => b.blockType === 'subject');

  const result = useMemo(() => {
    if (subjectBlocks.length === 0) return null;

    const block = subjectBlocks[0];
    const floors = Math.max(1, Math.round(block.height / 3));
    const floorArea = block.width * block.depth;

    // 外皮面積の概算（矩形建物）
    const wallArea = 2 * (block.width + block.depth) * block.height * 0.8; // 80%（窓を除く）
    const windowArea = 2 * (block.width + block.depth) * block.height * 0.2; // 20%（窓面積）
    const roofArea = floorArea;
    const floorAreaCalc = floorArea;
    const totalEnvelope = wallArea + windowArea + roofArea + floorAreaCalc;

    const wallU = WALL_SPECS[wallIdx].u;
    const roofU = ROOF_SPECS[roofIdx].u;
    const floorU = FLOOR_SPECS[floorIdx].u;
    const windowU = WINDOW_SPECS[windowIdx].u;

    // UA値 = Σ(面積 × U値 × 温度差係数) ÷ 外皮面積合計
    // 温度差係数: 壁・屋根・窓=1.0, 床=0.7（床下通気の場合）
    const heatLoss =
      wallArea * wallU * 1.0 +
      roofArea * roofU * 1.0 +
      floorAreaCalc * floorU * 0.7 +
      windowArea * windowU * 1.0;

    const ua = Math.round((heatLoss / totalEnvelope) * 100) / 100;

    return { ua, totalEnvelope, wallArea, windowArea, roofArea, floorArea: floorAreaCalc, floors, floorArea_total: floorArea * floors };
  }, [subjectBlocks, wallIdx, roofIdx, floorIdx, windowIdx]);

  if (!result) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">断熱性能・ZEH判定</h3>
        <p className="text-[11px] text-gray-400">本物件を配置し、壁・屋根・窓の仕様を選ぶとUA値とZEH適合を判定します。</p>
        <p className="text-xs text-gray-400">地図上で「+ 本物件を配置」してください。</p>
      </div>
    );
  }

  const grade = getInsulationGrade(result.ua, region);
  const meetsStandard = result.ua <= standard.ua;
  const meetsZEH = result.ua <= standard.zeh;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">断熱性能・ZEH判定</h3>
      <p className="text-[11px] text-gray-400">壁・屋根・床・窓の仕様を選ぶと、UA値と断熱等級を自動計算します。</p>

      {/* 地域区分 */}
      <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-gray-600">
        推定地域区分: <span className="font-bold">{standard.label}</span>
      </div>

      {/* 仕様選択 */}
      <div className="space-y-2">
        {[
          { label: '壁', specs: WALL_SPECS, idx: wallIdx, set: setWallIdx },
          { label: '屋根', specs: ROOF_SPECS, idx: roofIdx, set: setRoofIdx },
          { label: '床', specs: FLOOR_SPECS, idx: floorIdx, set: setFloorIdx },
          { label: '窓', specs: WINDOW_SPECS, idx: windowIdx, set: setWindowIdx },
        ].map((item) => (
          <div key={item.label}>
            <label className="text-[11px] text-gray-500">{item.label}</label>
            <select
              value={item.idx}
              onChange={(e) => item.set(Number(e.target.value))}
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
            >
              {item.specs.map((spec, i) => (
                <option key={i} value={i}>{spec.label}（U={spec.u}）</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* UA値結果 */}
      <div className="text-center rounded-xl bg-gradient-to-r from-blue-50 to-green-50 p-4">
        <p className="text-[10px] text-gray-500">外皮平均熱貫流率</p>
        <p className="text-3xl font-bold text-gray-800">UA = {result.ua}<span className="text-sm ml-1">W/(m2K)</span></p>
        <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${grade.color}`}>
          {grade.label}
        </span>
      </div>

      {/* 判定バッジ */}
      <div className="flex gap-2 flex-wrap">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          meetsStandard ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          省エネ基準（UA≦{standard.ua}）: {meetsStandard ? '適合' : '不適合'}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          meetsZEH ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'
        }`}>
          ZEH基準（UA≦{standard.zeh}）: {meetsZEH ? '適合' : '不適合'}
        </span>
      </div>

      {/* 補足 */}
      <div className="rounded-lg bg-amber-50 p-2">
        <p className="text-[10px] text-amber-700">
          ※簡易計算です。窓面積率20%、温度差係数は一般値で算出しています。正式な計算は設計担当者にご確認ください。
        </p>
      </div>
    </div>
  );
}
