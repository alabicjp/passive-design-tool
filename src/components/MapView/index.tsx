'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';

const DeckGLMap = dynamic(() => import('./DeckGLMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-slate-200">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm text-slate-500">3Dマップを読み込み中...</p>
      </div>
    </div>
  ),
});

export default function MapView() {
  const [isAddMode, setIsAddMode] = useState(false);
  const { addBlock, setPosition } = useStore();

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (isAddMode) {
        addBlock({
          id: crypto.randomUUID(),
          latitude: lat,
          longitude: lng,
          width: 8,
          depth: 10,
          height: 6,
          rotation: 0,
        });
        setIsAddMode(false);
      } else {
        setPosition(lat, lng);
      }
    },
    [isAddMode, addBlock, setPosition]
  );

  return (
    <div className="map-view flex-1 min-w-0 relative h-full">
      <DeckGLMap isAddMode={isAddMode} onMapClick={handleMapClick} />
      {/* 追加モードボタン */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        <button
          onClick={() => setIsAddMode(!isAddMode)}
          className={`rounded-lg px-4 py-2 text-sm font-medium shadow-md transition-colors ${
            isAddMode
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {isAddMode ? '配置モードを解除' : '+ 建物を追加'}
        </button>
        {isAddMode && (
          <span className="flex items-center rounded-lg bg-yellow-100 px-3 py-2 text-xs text-yellow-800 shadow-md">
            地図上をクリックして建物を配置
          </span>
        )}
      </div>
    </div>
  );
}
