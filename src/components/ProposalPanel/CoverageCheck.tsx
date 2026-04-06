'use client';

import { useStore } from '@/store/useStore';

const ZONE_LIMITS: { label: string; coverage: number; far: number }[] = [
  { label: '第一種低層住居専用地域', coverage: 50, far: 100 },
  { label: '第一種低層(60/150)', coverage: 60, far: 150 },
  { label: '第二種低層住居専用地域', coverage: 60, far: 150 },
  { label: '第一種中高層住居専用地域', coverage: 60, far: 200 },
  { label: '第一種住居地域', coverage: 60, far: 200 },
  { label: '第二種住居地域', coverage: 60, far: 200 },
  { label: '準住居地域', coverage: 60, far: 200 },
  { label: '近隣商業地域', coverage: 80, far: 200 },
  { label: '商業地域', coverage: 80, far: 400 },
  { label: '準工業地域', coverage: 60, far: 200 },
];

export default function CoverageCheck() {
  const { siteArea, manualBlocks } = useStore();

  const subjectBlocks = manualBlocks.filter((b) => b.blockType === 'subject');

  if (!siteArea || subjectBlocks.length === 0) {
    return (
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">建蔽率・容積率</h3>
        <p className="text-[11px] text-gray-400">敷地と本物件を配置すると、建蔽率・容積率を自動計算します。</p>
        <p className="text-xs text-gray-400">地図上で「+ 敷地を配置」→「+ 本物件を配置」してください。</p>
      </div>
    );
  }

  const siteAreaM2 = siteArea.width * siteArea.depth;
  const buildingAreaM2 = subjectBlocks.reduce((sum, b) => sum + b.width * b.depth, 0);
  // 階数推定: 高さ÷3m（1階あたり3m）
  const totalFloorArea = subjectBlocks.reduce((sum, b) => {
    const floors = Math.max(1, Math.round(b.height / 3));
    return sum + b.width * b.depth * floors;
  }, 0);

  const coverageRatio = Math.round((buildingAreaM2 / siteAreaM2) * 1000) / 10;
  const floorAreaRatio = Math.round((totalFloorArea / siteAreaM2) * 1000) / 10;

  const siteTsubo = Math.round(siteAreaM2 / 3.30578 * 10) / 10;
  const buildTsubo = Math.round(buildingAreaM2 / 3.30578 * 10) / 10;
  const floorTsubo = Math.round(totalFloorArea / 3.30578 * 10) / 10;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">建蔽率・容積率</h3>
      <p className="text-[11px] text-gray-400">敷地面積と建物サイズから自動計算しています。</p>

      {/* 面積一覧 */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-green-50 p-2">
          <p className="text-[10px] text-gray-500">敷地面積</p>
          <p className="text-sm font-bold text-green-700">{siteAreaM2}m<sup>2</sup></p>
          <p className="text-[10px] text-gray-400">{siteTsubo}坪</p>
        </div>
        <div className="rounded-lg bg-orange-50 p-2">
          <p className="text-[10px] text-gray-500">建築面積</p>
          <p className="text-sm font-bold text-orange-600">{buildingAreaM2}m<sup>2</sup></p>
          <p className="text-[10px] text-gray-400">{buildTsubo}坪</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-2">
          <p className="text-[10px] text-gray-500">延床面積</p>
          <p className="text-sm font-bold text-blue-600">{totalFloorArea}m<sup>2</sup></p>
          <p className="text-[10px] text-gray-400">{floorTsubo}坪</p>
        </div>
      </div>

      {/* 建蔽率・容積率 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-[10px] text-gray-500">建蔽率</p>
          <p className="text-2xl font-bold text-gray-800">{coverageRatio}<span className="text-sm">%</span></p>
        </div>
        <div className="rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-[10px] text-gray-500">容積率</p>
          <p className="text-2xl font-bold text-gray-800">{floorAreaRatio}<span className="text-sm">%</span></p>
        </div>
      </div>

      {/* 用途地域別判定 */}
      <div className="space-y-1">
        <p className="text-[11px] font-medium text-gray-500">用途地域別の適合判定</p>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {ZONE_LIMITS.map((zone) => {
            const coverageOk = coverageRatio <= zone.coverage;
            const farOk = floorAreaRatio <= zone.far;
            const ok = coverageOk && farOk;
            return (
              <div key={zone.label} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 truncate flex-1">{zone.label}</span>
                <span className="text-gray-400 mx-1">{zone.coverage}/{zone.far}%</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {ok ? 'OK' : 'NG'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-gray-400">※階数は高さ÷3mで推定しています。正確な値は設計図をご確認ください。</p>
    </div>
  );
}
