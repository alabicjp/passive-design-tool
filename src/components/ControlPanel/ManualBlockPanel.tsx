'use client';

import { useStore } from '@/store/useStore';
import { ManualBlock } from '@/types';

function BlockCard({ block, index, updateBlock, removeBlock }: {
  block: ManualBlock;
  index: number;
  updateBlock: (id: string, updates: Partial<ManualBlock>) => void;
  removeBlock: (id: string) => void;
}) {
  const isSubject = block.blockType === 'subject';
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
      <div className="space-y-1">
        <label className="text-xs text-gray-500">高さ (m)</label>
        <div className="flex gap-1">
          {[
            { label: '2階(6m)', value: 6 },
            { label: '3階(9m)', value: 9 },
            { label: 'マンション(15m)', value: 15 },
          ].map((preset) => (
            <button
              key={preset.value}
              onClick={() => updateBlock(block.id, { height: preset.value })}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                block.height === preset.value
                  ? isSubject ? 'bg-orange-500 text-white' : 'bg-slate-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={block.height}
          onChange={(e) => updateBlock(block.id, { height: Number(e.target.value) })}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          min={1}
          max={100}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500">幅 (m)</label>
          <input
            type="number"
            value={block.width}
            onChange={(e) => updateBlock(block.id, { width: Number(e.target.value) })}
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
            onChange={(e) => updateBlock(block.id, { depth: Number(e.target.value) })}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            min={1}
            max={100}
          />
        </div>
      </div>
    </div>
  );
}

export default function ManualBlockPanel() {
  const { manualBlocks, updateBlock, removeBlock, clearAllBlocks } = useStore();

  const subjectBlocks = manualBlocks.filter((b) => b.blockType === 'subject');
  const neighborBlocks = manualBlocks.filter((b) => b.blockType !== 'subject');

  let neighborIndex = 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">建物配置</label>
        {manualBlocks.length > 0 && (
          <button
            onClick={clearAllBlocks}
            className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-200 transition-colors"
          >
            全て削除
          </button>
        )}
      </div>

      {/* 凡例 */}
      <div className="flex gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-orange-500" /> 本物件
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-slate-400" /> 隣地建物
        </span>
      </div>

      <div className="space-y-2">
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
        {manualBlocks.length === 0 && (
          <p className="text-xs text-gray-400">
            地図上のボタンから本物件・隣地建物を配置してください
          </p>
        )}
      </div>

      {/* サマリー */}
      {manualBlocks.length > 0 && (
        <div className="text-xs text-gray-400 pt-1 border-t border-gray-100">
          本物件: {subjectBlocks.length}棟 / 隣地建物: {neighborBlocks.length}棟
        </div>
      )}
    </div>
  );
}
