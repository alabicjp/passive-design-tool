'use client';

import { useMemo } from 'react';
import { SolidPolygonLayer } from '@deck.gl/layers';
import { useStore } from '@/store/useStore';
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

export function useManualBlockLayers() {
  const { manualBlocks } = useStore();

  return useMemo(() => {
    if (manualBlocks.length === 0) return [];

    return [
      new SolidPolygonLayer({
        id: 'manual-blocks',
        data: manualBlocks,
        getPolygon: (d: ManualBlock) => blockToPolygon(d),
        getElevation: (d: ManualBlock) => d.height,
        getFillColor: [100, 150, 255, 180],
        extruded: true,
        _shadow: true,
      }),
    ];
  }, [manualBlocks]);
}
