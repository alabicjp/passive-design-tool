'use client';

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DeckGL as DeckGLBase } from '@deck.gl/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DeckGL = DeckGLBase as any;
import { TerrainLayer } from '@deck.gl/geo-layers';
import { LightingEffect, _SunLight as SunLight, AmbientLight } from '@deck.gl/core';
import { useStore } from '@/store/useStore';
import { SEASON_CONFIG } from '@/constants/seasons';
import { useDebounce } from '@/hooks/useDebounce';
import { useManualBlockLayers } from './ManualBlocks';

const INITIAL_VIEW_STATE = {
  latitude: 35.6812,
  longitude: 139.7671,
  zoom: 15,
  pitch: 45,
  bearing: 0,
  maxPitch: 85,
  minZoom: 5,
  maxZoom: 18,
};

interface DeckGLMapProps {
  isAddMode: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

export default function DeckGLMap({ isAddMode, onMapClick }: DeckGLMapProps) {
  const { latitude, longitude, season, timeHour, performanceMode } = useStore();
  const mapRef = useRef<MapLibreMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewState, setViewState] = useState({
    ...INITIAL_VIEW_STATE,
    latitude,
    longitude,
  });

  const debouncedTimeHour = useDebounce(timeHour, 500);
  const effectiveTimeHour = performanceMode === 'light' ? debouncedTimeHour : timeHour;

  const sunDate = useMemo(() => {
    const cfg = SEASON_CONFIG[season];
    const year = new Date().getFullYear();
    const hours = Math.floor(effectiveTimeHour);
    const minutes = Math.round((effectiveTimeHour - hours) * 60);
    return new Date(year, cfg.month - 1, cfg.day, hours, minutes, 0);
  }, [season, effectiveTimeHour]);

  const lightingEffect = useMemo(() => {
    const sunLight = new SunLight({
      timestamp: sunDate.getTime(),
      color: [255, 255, 255],
      intensity: 1.0,
      _shadow: true,
    });
    const ambientLight = new AmbientLight({
      color: [255, 255, 255],
      intensity: 0.4,
    });
    return new LightingEffect({ sunLight, ambientLight });
  }, [sunDate]);

  const terrainLayers = useMemo(() => {
    return [
      new TerrainLayer({
        id: 'terrain',
        minZoom: 0,
        maxZoom: 15,
        elevationDecoder: {
          rScaler: 256,
          gScaler: 1,
          bScaler: 1 / 256,
          offset: -100000,
        },
        elevationData: 'https://cyberjapandata.gsi.go.jp/xyz/dem_png/{z}/{x}/{y}.png',
        texture: 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
        meshMaxError: performanceMode === 'light' ? 10 : 4,
        onTileError: () => {},
      }),
    ];
  }, [performanceMode]);

  const blockLayers = useManualBlockLayers();
  const allLayers = useMemo(() => [...terrainLayers, ...blockLayers], [terrainLayers, blockLayers]);

  // MapLibre初期化（マウント時のみ）
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'gsi-pale': {
            type: 'raster',
            tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
          },
        },
        layers: [
          {
            id: 'gsi-pale-layer',
            type: 'raster',
            source: 'gsi-pale',
            minzoom: 0,
            maxzoom: 18,
          },
        ],
      },
      center: [longitude, latitude],
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing,
      interactive: false,
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    setViewState((prev) => ({ ...prev, latitude, longitude }));
    if (mapRef.current) {
      mapRef.current.jumpTo({ center: [longitude, latitude] });
    }
  }, [latitude, longitude]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onViewStateChange = useCallback(({ viewState: vs }: any) => {
    setViewState(vs);
    if (mapRef.current) {
      mapRef.current.jumpTo({
        center: [vs.longitude, vs.latitude],
        zoom: vs.zoom,
        bearing: vs.bearing,
        pitch: vs.pitch,
      });
    }
  }, []);

  const handleClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (info: any) => {
      if (info.coordinate && onMapClick) {
        const [lng, lat] = info.coordinate;
        onMapClick(lat, lng);
      }
    },
    [onMapClick]
  );

  return (
    <div className="relative w-full h-full" style={{ cursor: isAddMode ? 'crosshair' : undefined }}>
      <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      <DeckGL
        viewState={viewState}
        onViewStateChange={onViewStateChange}
        controller={true}
        layers={allLayers}
        effects={[lightingEffect]}
        glOptions={{ preserveDrawingBuffer: true }}
        onClick={handleClick}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
}
