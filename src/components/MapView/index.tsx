'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';
import { BlockType } from '@/types';
import SunOverlay from './SunOverlay';

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

type AddMode = false | BlockType;

export default function MapView() {
  const [addMode, setAddMode] = useState<AddMode>(false);
  const [mapStyle, setMapStyle] = useState<'osm' | 'photo'>('photo');
  const { addBlock, setPosition } = useStore();

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (addMode) {
        addBlock({
          id: crypto.randomUUID(),
          latitude: lat,
          longitude: lng,
          width: 8,
          depth: 10,
          height: 6,
          rotation: 0,
          blockType: addMode,
        });
        setAddMode(false);
      } else {
        setPosition(lat, lng);
      }
    },
    [addMode, addBlock, setPosition]
  );

  return (
    <div className="map-view flex-1 min-w-0 relative h-full">
      <DeckGLMap isAddMode={!!addMode} onMapClick={handleMapClick} mapStyle={mapStyle} />
      {/* 太陽位置オーバーレイ */}
      <SunOverlay />
      {/* 上部コントロール */}
      <div className="absolute top-3 left-3 z-10 flex gap-2 flex-wrap">
        {!addMode ? (
          <>
            <button
              onClick={() => setAddMode('subject')}
              className="rounded-lg px-3 py-2 text-sm font-medium shadow-md transition-colors bg-orange-500 text-white hover:bg-orange-600"
            >
              + 本物件を配置
            </button>
            <button
              onClick={() => setAddMode('neighbor')}
              className="rounded-lg px-3 py-2 text-sm font-medium shadow-md transition-colors bg-white text-gray-700 hover:bg-gray-100"
            >
              + 隣地建物を配置
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setAddMode(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium shadow-md transition-colors bg-red-500 text-white hover:bg-red-600"
            >
              配置モードを解除
            </button>
            <span className={`flex items-center rounded-lg px-3 py-2 text-xs shadow-md ${
              addMode === 'subject'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-slate-100 text-slate-800'
            }`}>
              地図をクリック → {addMode === 'subject' ? '本物件' : '隣地建物'}を配置
            </span>
          </>
        )}
      </div>
      {/* 地図切り替えボタン */}
      <div className="absolute top-3 right-3 z-10 flex rounded-lg shadow-md overflow-hidden">
        <button
          onClick={() => setMapStyle('photo')}
          className={`px-3 py-2 text-xs font-medium transition-colors ${
            mapStyle === 'photo'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          航空写真
        </button>
        <button
          onClick={() => setMapStyle('osm')}
          className={`px-3 py-2 text-xs font-medium transition-colors ${
            mapStyle === 'osm'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          地図
        </button>
      </div>
    </div>
  );
}
