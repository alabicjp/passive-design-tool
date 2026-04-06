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

type AddMode = false | BlockType | 'site';

// 住宅向けの現実的なデフォルト値
const BLOCK_DEFAULTS: Record<BlockType, { width: number; depth: number; height: number }> = {
  subject: { width: 9, depth: 7, height: 6 },    // 一般住宅: 9m×7m, 2階建て6m
  neighbor: { width: 9, depth: 7, height: 6 },    // 隣家も同程度
};

export default function MapView() {
  const [addMode, setAddMode] = useState<AddMode>(false);
  const [mapStyle, setMapStyle] = useState<'osm' | 'photo'>('photo');
  const { addBlock, setPosition, manualBlocks, siteArea, setSiteArea } = useStore();

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (addMode === 'site') {
        setSiteArea({
          latitude: lat,
          longitude: lng,
          width: 15,   // 典型的な敷地: 15m×20m
          depth: 20,
          rotation: 0,
        });
        setAddMode(false);
      } else if (addMode === 'subject' || addMode === 'neighbor') {
        const defaults = BLOCK_DEFAULTS[addMode];
        addBlock({
          id: crypto.randomUUID(),
          latitude: lat,
          longitude: lng,
          ...defaults,
          rotation: 0,
          blockType: addMode,
        });
        setAddMode(false);
      } else {
        setPosition(lat, lng);
      }
    },
    [addMode, addBlock, setPosition, setSiteArea]
  );

  const modeLabel = addMode === 'site' ? '敷地' : addMode === 'subject' ? '本物件' : '隣地建物';

  return (
    <div className="map-view flex-1 min-w-0 relative h-full">
      <DeckGLMap isAddMode={!!addMode} onMapClick={handleMapClick} mapStyle={mapStyle} />
      {/* 太陽位置オーバーレイ */}
      <SunOverlay />
      {/* 上部コントロール */}
      <div className="absolute top-3 left-3 z-10 flex gap-2 flex-wrap">
        {!addMode ? (
          <>
            {!siteArea && (
              <button
                onClick={() => setAddMode('site')}
                aria-label="敷地範囲を地図上に配置する"
                className="rounded-lg px-3 py-2 text-sm font-medium shadow-md transition-colors bg-green-600 text-white hover:bg-green-700"
              >
                + 敷地を配置
              </button>
            )}
            <button
              onClick={() => setAddMode('subject')}
              aria-label="本物件を地図上に配置する"
              className="rounded-lg px-3 py-2 text-sm font-medium shadow-md transition-colors bg-orange-500 text-white hover:bg-orange-600"
            >
              + 本物件を配置
            </button>
            <button
              onClick={() => setAddMode('neighbor')}
              aria-label="隣地建物を地図上に配置する"
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
              addMode === 'site'
                ? 'bg-green-100 text-green-800'
                : addMode === 'subject'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-slate-100 text-slate-800'
            }`}>
              地図をクリック → {modeLabel}を配置
            </span>
          </>
        )}
      </div>
      {/* 初期案内テキスト */}
      {!addMode && manualBlocks.length === 0 && !siteArea && (
        <div className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 pointer-events-none">
          <div className="rounded-xl bg-white/90 backdrop-blur-sm px-5 py-3 shadow-lg text-center">
            <p className="text-sm font-medium text-gray-600">住所を検索したら、上のボタンで敷地と建物を配置してください</p>
            <p className="text-[11px] text-gray-400 mt-1">「+ 敷地を配置」→「+ 本物件を配置」の順がおすすめです</p>
          </div>
        </div>
      )}
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
