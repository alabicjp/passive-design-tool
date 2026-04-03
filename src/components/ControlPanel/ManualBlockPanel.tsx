'use client';

import { useStore } from '@/store/useStore';

export default function ManualBlockPanel() {
  const { manualBlocks, updateBlock, removeBlock } = useStore();

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">周辺建物モデリング</label>

      <div className="space-y-2">
        {manualBlocks.map((block, i) => (
          <div key={block.id} className="rounded-lg bg-gray-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">建物 {i + 1}</span>
              <button
                onClick={() => removeBlock(block.id)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                🗑
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
                        ? 'bg-blue-600 text-white'
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
        ))}
        {manualBlocks.length === 0 && (
          <p className="text-xs text-gray-400">地図上をクリックして建物を追加してください</p>
        )}
      </div>
    </div>
  );
}
