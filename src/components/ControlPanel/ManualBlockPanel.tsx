'use client';

import { useStore } from '@/store/useStore';
import { ManualBlock } from '@/types';

const BUILDING_PRESETS = [
  { label: '平屋(3m)', height: 3 },
  { label: '2階建(6m)', height: 6 },
  { label: '3階建(9m)', height: 9 },
  { label: 'マンション(15m)', height: 15 },
];

const SIZE_PRESETS = [
  { label: '小さめ住宅', width: 7, depth: 6 },
  { label: '標準住宅', width: 9, depth: 7 },
  { label: '大きめ住宅', width: 12, depth: 9 },
];

function BlockCard({ block, index, updateBlock, removeBlock }: {
  block: ManualBlock;
  index: number;
  updateBlock: (id: string, updates: Partial<ManualBlock>) => void;
  removeBlock: (id: string) => void;
}) {
  const isSubject = block.blockType === 'subject';
  const area = block.width * block.depth;
  const tsubo = Math.round(area / 3.30578 * 10) / 10;

  return (
    <div className={`rounded-lg p-3 space-y-2 border-l-4 ${
      isSubject ? 'bg-orange-50 border-orange-500' : 'bg-slate-50 border-slate-400'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-3 h-3 rounded-sm ${isSubject ? 'bg-orange-500' : 'bg-slate-400'}`} />
          <span className="text-sm font-medium text-gray-700">
            {isSubject ? '本物件' : `隣地建物 ${index}`}
          </span>
        </div>
        <button
          onClick={() => removeBlock(block.id)}
          className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
        >
          削除
        </button>
      </div>

      {/* 建物サイズプリセット */}
      <div className="space-y-1">
        <label className="text-xs text-gray-500">建物サイズ</label>
        <div className="flex gap-1 flex-wrap">
          {SIZE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => updateBlock(block.id, { width: preset.width, depth: preset.depth })}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                block.width === preset.width && block.depth === preset.depth
                  ? isSubject ? 'bg-orange-500 text-white' : 'bg-slate-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 高さプリセット */}
      <div className="space-y-1">
        <label className="text-xs text-gray-500">高さ</label>
        <div className="flex gap-1 flex-wrap">
          {BUILDING_PRESETS.map((preset) => (
            <button
              key={preset.height}
              onClick={() => updateBlock(block.id, { height: preset.height })}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                block.height === preset.height
                  ? isSubject ? 'bg-orange-500 text-white' : 'bg-slate-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 数値入力 */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-gray-500">幅 (m)</label>
          <input
            type="number"
            value={block.width}
            onChange={(e) => { const v = Number(e.target.value); if (v >= 1 && v <= 100) updateBlock(block.id, { width: v }); }}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            min={1}
            max={100}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">奥行き (m)</label>
          <input
            type="number"
            value={block.depth}
            onChange={(e) => { const v = Number(e.target.value); if (v >= 1 && v <= 100) updateBlock(block.id, { depth: v }); }}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            min={1}
            max={100}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">高さ (m)</label>
          <input
            type="number"
            value={block.height}
            onChange={(e) => { const v = Number(e.target.value); if (v >= 1 && v <= 100) updateBlock(block.id, { height: v }); }}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            min={1}
            max={100}
          />
        </div>
      </div>

      {/* 回転 */}
      <div className="space-y-1">
        <label className="text-xs text-gray-500">回転: {block.rotation}°</label>
        <input
          type="range"
          min={0}
          max={360}
          step={5}
          value={block.rotation}
          onChange={(e) => updateBlock(block.id, { rotation: Number(e.target.value) })}
          className="w-full accent-blue-600"
        />
      </div>

      {/* 面積表示 */}
      <p className="text-[11px] text-gray-400">
        建築面積: {area}m2 ({tsubo}坪)
      </p>
    </div>
  );
}

function SiteCard() {
  const { siteArea, updateSiteArea, setSiteArea } = useStore();
  if (!siteArea) return null;

  const area = siteArea.width * siteArea.depth;
  const tsubo = Math.round(area / 3.30578 * 10) / 10;

  const SITE_PRESETS = [
    { label: '小(10×15)', width: 10, depth: 15 },
    { label: '中(15×20)', width: 15, depth: 20 },
    { label: '大(20×25)', width: 20, depth: 25 },
  ];

  return (
    <div className="rounded-lg p-3 space-y-2 border-l-4 bg-green-50 border-green-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-green-500" />
          <span className="text-sm font-medium text-gray-700">敷地</span>
        </div>
        <button
          onClick={() => setSiteArea(null)}
          className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
        >
          削除
        </button>
      </div>

      {/* 敷地プリセット */}
      <div className="flex gap-1 flex-wrap">
        {SITE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => updateSiteArea({ width: preset.width, depth: preset.depth })}
            className={`rounded px-2 py-1 text-xs transition-colors ${
              siteArea.width === preset.width && siteArea.depth === preset.depth
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500">間口 (m)</label>
          <input
            type="number"
            value={siteArea.width}
            onChange={(e) => updateSiteArea({ width: Number(e.target.value) })}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            min={1}
            max={200}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">奥行き (m)</label>
          <input
            type="number"
            value={siteArea.depth}
            onChange={(e) => updateSiteArea({ depth: Number(e.target.value) })}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            min={1}
            max={200}
          />
        </div>
      </div>

      <p className="text-[11px] text-gray-400">
        敷地面積: {area}m2 ({tsubo}坪)
      </p>
    </div>
  );
}

export default function ManualBlockPanel() {
  const { manualBlocks, siteArea, updateBlock, removeBlock, clearAllBlocks } = useStore();

  const subjectBlocks = manualBlocks.filter((b) => b.blockType === 'subject');
  const neighborBlocks = manualBlocks.filter((b) => b.blockType !== 'subject');

  let neighborIndex = 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">敷地・建物配置</label>
        {(manualBlocks.length > 0 || siteArea) && (
          <button
            onClick={clearAllBlocks}
            className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-200 transition-colors"
          >
            全て削除
          </button>
        )}
      </div>

      <p className="text-[11px] text-gray-400">地図上のボタンから敷地・建物を配置してください。サイズは下記で調整できます。</p>

      {/* 凡例 */}
      <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-green-500" /> 敷地
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-orange-500" /> 本物件
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-slate-400" /> 隣地建物
        </span>
      </div>

      <div className="space-y-2">
        {/* 敷地カード */}
        <SiteCard />

        {/* 建物カード */}
        {manualBlocks.map((block) => {
          const isNeighbor = block.blockType !== 'subject';
          if (isNeighbor) neighborIndex++;
          return (
            <BlockCard
              key={block.id}
              block={block}
              index={isNeighbor ? neighborIndex : 0}
              updateBlock={updateBlock}
              removeBlock={removeBlock}
            />
          );
        })}
        {manualBlocks.length === 0 && !siteArea && (
          <p className="text-xs text-gray-400">
            地図上のボタンから敷地・本物件・隣地建物を配置してください
          </p>
        )}
      </div>

      {/* サマリー */}
      {(manualBlocks.length > 0 || siteArea) && (
        <div className="text-xs text-gray-400 pt-1 border-t border-gray-100">
          {siteArea ? `敷地: ${siteArea.width}×${siteArea.depth}m / ` : ''}
          本物件: {subjectBlocks.length}棟 / 隣地建物: {neighborBlocks.length}棟
        </div>
      )}
    </div>
  );
}
