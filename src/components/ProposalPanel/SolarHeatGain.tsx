'use client';

import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { getFaceDirections, directionLabel } from '@/utils/passiveDesign';
import { estimateRegion } from '@/utils/regionEstimation';

// 方位係数（省エネ基準 別表第5, 6地域の値）
// 冷房期（ηAC）と暖房期（ηAH）で係数が異なる
// 方位は北=0°基準、16方位に対応
const ORIENTATION_FACTORS_COOLING: Record<string, number> = {
  '北': 0.291, '北北東': 0.295, '北東': 0.370, '東北東': 0.489,
  '東': 0.583, '東南東': 0.616, '南東': 0.569, '南南東': 0.459,
  '南': 0.349, '南南西': 0.459, '南西': 0.569, '西南西': 0.616,
  '西': 0.583, '西北西': 0.489, '北西': 0.370, '北北西': 0.295,
};

const ORIENTATION_FACTORS_HEATING: Record<string, number> = {
  '北': 0.260, '北北東': 0.270, '北東': 0.326, '東北東': 0.416,
  '東': 0.458, '東南東': 0.518, '南東': 0.588, '南南東': 0.617,
  '南': 0.613, '南南西': 0.617, '南西': 0.588, '西南西': 0.518,
  '西': 0.458, '西北西': 0.416, '北西': 0.326, '北北西': 0.270,
};

// 窓の日射熱取得率（ガラスの種類別）
const GLASS_TYPES = [
  { label: 'Low-E複層（遮熱型）', eta: 0.40 },
  { label: 'Low-E複層（断熱型）', eta: 0.51 },
  { label: '複層ガラス（透明）', eta: 0.64 },
  { label: '単板ガラス', eta: 0.79 },
];

export default function SolarHeatGain() {
  const { buildingAzimuth, manualBlocks, latitude } = useStore();
  const subjectBlocks = manualBlocks.filter((b) => b.blockType === 'subject');

  const result = useMemo(() => {
    if (subjectBlocks.length === 0) return null;

    const block = subjectBlocks[0];
    const faces = getFaceDirections(buildingAzimuth);

    // 各面の窓面積を概算（壁面積の20%を窓と仮定）
    const faceList = [
      { name: '正面', dir: faces.front, wallW: block.width },
      { name: '右側面', dir: faces.right, wallW: block.depth },
      { name: '背面', dir: faces.back, wallW: block.width },
      { name: '左側面', dir: faces.left, wallW: block.depth },
    ];

    // 外皮面積合計
    const floorArea = block.width * block.depth;
    const roofArea = floorArea;
    const wallTotalArea = 2 * (block.width + block.depth) * block.height;
    const totalEnvelope = wallTotalArea + roofArea + floorArea;

    // ガラス種類ごとにηAC/ηAHを計算
    return GLASS_TYPES.map((glass) => {
      let sumCooling = 0;
      let sumHeating = 0;

      faceList.forEach((face) => {
        const windowArea = face.wallW * block.height * 0.2; // 各面の壁面積の20%
        const dir = directionLabel(face.dir);
        const fCooling = ORIENTATION_FACTORS_COOLING[dir] || 0.4;
        const fHeating = ORIENTATION_FACTORS_HEATING[dir] || 0.4;

        sumCooling += windowArea * glass.eta * fCooling;
        sumHeating += windowArea * glass.eta * fHeating;
      });

      const etaAC = Math.round((sumCooling / totalEnvelope) * 10000) / 100;
      const etaAH = Math.round((sumHeating / totalEnvelope) * 10000) / 100;

      return { ...glass, etaAC, etaAH };
    });
  }, [subjectBlocks, buildingAzimuth]);

  if (!result) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">日射取得量（ηAC/ηAH値）</h3>
        <p className="text-[11px] text-gray-400">本物件を配置すると、冷暖房期の日射取得率をガラス種類別に計算します。</p>
      </div>
    );
  }

  // 地域別ηAC基準値（平成28年省エネ基準）
  const STANDARD_AC: Record<number, number> = {
    1: 2.8, 2: 2.8, 3: 2.8, 4: 2.9, 5: 3.0, 6: 3.0, 7: 3.0, 8: 6.7,
  };
  const region = estimateRegion(latitude);
  const standardAC = STANDARD_AC[region] || 3.0;
  const faces = getFaceDirections(buildingAzimuth);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">日射取得量（ηAC/ηAH値）</h3>
      <p className="text-[11px] text-gray-400">窓のガラス種類と方位から、冷暖房期の日射熱取得率を計算します。</p>

      {/* 方位情報 */}
      <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500">
        <span>正面: {directionLabel(faces.front)}向き</span>
        <span>右側面: {directionLabel(faces.right)}向き</span>
        <span>背面: {directionLabel(faces.back)}向き</span>
        <span>左側面: {directionLabel(faces.left)}向き</span>
      </div>

      {/* ガラス別結果 */}
      <div className="space-y-2">
        {result.map((r) => (
          <div key={r.label} className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">{r.label}</span>
              <span className="text-[10px] text-gray-400">η={r.eta}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center">
                <p className="text-[10px] text-gray-400">冷房期 ηAC</p>
                <p className={`text-sm font-bold ${r.etaAC <= standardAC ? 'text-green-600' : 'text-red-600'}`}>
                  {r.etaAC}
                </p>
                <p className="text-[9px] text-gray-400">
                  基準{standardAC}以下: {r.etaAC <= standardAC ? 'OK' : 'NG'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400">暖房期 ηAH</p>
                <p className="text-sm font-bold text-orange-600">{r.etaAH}</p>
                <p className="text-[9px] text-gray-400">大きいほど有利</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-amber-50 p-2">
        <p className="text-[10px] text-amber-700">
          ※窓面積率20%・6地域基準で概算。遮熱型Low-Eは夏の日射を抑え、断熱型Low-Eは冬の日射取得に有利です。
        </p>
      </div>
    </div>
  );
}
