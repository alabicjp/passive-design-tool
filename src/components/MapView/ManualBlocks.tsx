'use client';

import { useMemo } from 'react';
import { SolidPolygonLayer, PathLayer } from '@deck.gl/layers';
import SunCalc from 'suncalc';
import { useStore } from '@/store/useStore';
import { SEASON_CONFIG } from '@/constants/seasons';
import { ManualBlock, SiteArea } from '@/types';

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

// 敷地の4頂点を計算
function siteToPolygon(site: SiteArea): [number, number][] {
  const { latPerMeter, lngPerMeter } = metersToLngLat(site.latitude);
  const hw = (site.width / 2) * lngPerMeter;
  const hd = (site.depth / 2) * latPerMeter;
  const rot = (site.rotation * Math.PI) / 180;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);

  const corners: [number, number][] = [
    [-hw, -hd],
    [hw, -hd],
    [hw, hd],
    [-hw, hd],
  ];

  return corners.map(([dx, dy]) => [
    site.longitude + (dx * cos - dy * sin),
    site.latitude + (dx * sin + dy * cos),
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

  // 影の長さ（メートル）建物高さの10倍を上限とする（冬の朝夕に対応）
  const MAX_SHADOW_RATIO = 10;
  const tanAlt = Math.tan(sunAltitude);
  const rawLength = tanAlt > 0.001 ? block.height / tanAlt : block.height * MAX_SHADOW_RATIO;
  const shadowLength = Math.min(rawLength, block.height * MAX_SHADOW_RATIO);

  // SunCalcのazimuth: 南=0, 西=正, 東=負（ラジアン）
  // 影は太陽の反対方向に伸びるため符号を反転
  const shadowDx = -Math.sin(sunAzimuth) * shadowLength;
  const shadowDy = -Math.cos(sunAzimuth) * shadowLength;

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
  const { manualBlocks, siteArea, latitude, longitude, season, timeHour } = useStore();

  return useMemo(() => {
    const layers = [];

    // 敷地レイヤー（薄い緑の枠線）
    if (siteArea) {
      const sitePolygon = siteToPolygon(siteArea);
      // 閉じたパスにする
      const sitePath = [...sitePolygon, sitePolygon[0]];

      layers.push(
        // 敷地の塗りつぶし（薄い半透明）
        new SolidPolygonLayer({
          id: 'site-area-fill',
          data: [{ polygon: sitePolygon }],
          getPolygon: (d: { polygon: [number, number][] }) => d.polygon,
          getFillColor: [34, 197, 94, 40],
          extruded: false,
        }),
        // 敷地の境界線
        new PathLayer({
          id: 'site-area-border',
          data: [{ path: sitePath }],
          getPath: (d: { path: [number, number][] }) => d.path,
          getColor: [34, 197, 94, 200],
          getWidth: 2,
          widthUnits: 'pixels' as const,
        }),
      );
    }

    if (manualBlocks.length === 0 && !siteArea) return layers;

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

    layers.push(
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
    );

    return layers;
  }, [manualBlocks, siteArea, latitude, longitude, season, timeHour]);
}
