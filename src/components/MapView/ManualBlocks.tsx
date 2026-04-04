'use client';

import { useMemo } from 'react';
import { SolidPolygonLayer } from '@deck.gl/layers';
import SunCalc from 'suncalc';
import { useStore } from '@/store/useStore';
import { SEASON_CONFIG } from '@/constants/seasons';
import { ManualBlock } from '@/types';

// メートルを経度・緯度の差分に変換（近似）
function metersToLngLat(lat: number) {
  const latPerMeter = 1 / 111320;
  const lngPerMeter = 1 / (111320 * Math.cos((lat * Math.PI) / 180));
  return { latPerMeter, lngPerMeter };
}

// ブロックの4頂点を計算（rotation考慮）
function blockToPolygon(block: ManualBlock): [number, number][] {
  const { latPerMeter, lngPerMeter } = metersToLngLat(block.latitude);
  const hw = (block.width / 2) * lngPerMeter;
  const hd = (block.depth / 2) * latPerMeter;
  const rot = (block.rotation * Math.PI) / 180;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);

  const corners: [number, number][] = [
    [-hw, -hd],
    [hw, -hd],
    [hw, hd],
    [-hw, hd],
  ];

  return corners.map(([dx, dy]) => [
    block.longitude + (dx * cos - dy * sin),
    block.latitude + (dx * sin + dy * cos),
  ]);
}

// 建物の影ポリゴンを計算
function blockToShadowPolygon(
  block: ManualBlock,
  sunAltitude: number,
  sunAzimuth: number
): [number, number][] | null {
  if (sunAltitude <= 0.05) return null; // 太陽高度3°未満は非表示

  const { latPerMeter, lngPerMeter } = metersToLngLat(block.latitude);

  // 影の長さ（メートル）建物高さの3倍を上限とする
  const MAX_SHADOW_RATIO = 3;
  const rawLength = block.height / Math.tan(sunAltitude);
  const shadowLength = Math.min(rawLength, block.height * MAX_SHADOW_RATIO);

  // SunCalcのazimuth: 南=0, 西=正, 東=負（ラジアン）
  // 太陽が東(az<0)→影は西(-lng), 太陽が西(az>0)→影は東(+lng)
  // 太陽が南(az≈0)→影は北(+lat)
  const shadowDx = Math.sin(sunAzimuth) * shadowLength;
  const shadowDy = Math.cos(sunAzimuth) * shadowLength;

  // 影のオフセット（経緯度単位）
  const offsetLng = shadowDx * lngPerMeter;
  const offsetLat = shadowDy * latPerMeter;

  const topPolygon = blockToPolygon(block);

  // 建物の底面 + 影先端の頂点で影ポリゴンを構成
  const shadowTips = topPolygon.map(([lng, lat]) => [
    lng + offsetLng,
    lat + offsetLat,
  ] as [number, number]);

  // 建物底面4点 + 影先端4点で影の形状を作成
  // 底面の各辺から影先端への台形を結合
  const n = topPolygon.length;
  const shadowPolygon: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    shadowPolygon.push(topPolygon[i]);
  }
  for (let i = n - 1; i >= 0; i--) {
    shadowPolygon.push(shadowTips[i]);
  }

  return shadowPolygon;
}

export function useManualBlockLayers() {
  const { manualBlocks, latitude, longitude, season, timeHour } = useStore();

  return useMemo(() => {
    if (manualBlocks.length === 0) return [];

    // 太陽位置を計算
    const cfg = SEASON_CONFIG[season];
    const year = new Date().getFullYear();
    const hours = Math.floor(timeHour);
    const minutes = Math.round((timeHour - hours) * 60);
    const sunDate = new Date(year, cfg.month - 1, cfg.day, hours, minutes, 0);
    const sunPos = SunCalc.getPosition(sunDate, latitude, longitude);

    // 影ポリゴンデータ
    const shadowData = manualBlocks
      .map((block) => ({
        polygon: blockToShadowPolygon(block, sunPos.altitude, sunPos.azimuth),
        block,
      }))
      .filter((d) => d.polygon !== null);

    // 本物件と隣地建物を分離
    const subjectBlocks = manualBlocks.filter((b) => b.blockType === 'subject');
    const neighborBlocks = manualBlocks.filter((b) => b.blockType !== 'subject');

    const layers = [
      // 影レイヤー（地面レベル、半透明の暗い色）
      new SolidPolygonLayer({
        id: 'block-shadows',
        data: shadowData,
        getPolygon: (d: { polygon: [number, number][] }) => d.polygon,
        getElevation: 0,
        getFillColor: [40, 40, 40, 160],
        extruded: false,
      }),
      // 隣地建物レイヤー（グレー）
      new SolidPolygonLayer({
        id: 'neighbor-blocks',
        data: neighborBlocks,
        getPolygon: (d: ManualBlock) => blockToPolygon(d),
        getElevation: (d: ManualBlock) => d.height,
        getFillColor: [148, 163, 184, 200],
        extruded: true,
        _shadow: true,
      }),
      // 本物件レイヤー（オレンジ）
      new SolidPolygonLayer({
        id: 'subject-blocks',
        data: subjectBlocks,
        getPolygon: (d: ManualBlock) => blockToPolygon(d),
        getElevation: (d: ManualBlock) => d.height,
        getFillColor: [234, 88, 12, 230],
        extruded: true,
        _shadow: true,
      }),
    ];

    return layers;
  }, [manualBlocks, latitude, longitude, season, timeHour]);
}
