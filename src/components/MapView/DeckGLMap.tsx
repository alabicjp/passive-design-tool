'use client';

import { useCallback, useMemo, useRef, useEffect, useState, Component, ReactNode } from 'react';
import { Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DeckGL as DeckGLBase } from '@deck.gl/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DeckGL = DeckGLBase as any;
import { TerrainLayer } from '@deck.gl/geo-layers';
import { LightingEffect, _SunLight as SunLight, AmbientLight, WebMercatorViewport } from '@deck.gl/core';
import { useStore } from '@/store/useStore';
import { SEASON_CONFIG } from '@/constants/seasons';
import { useDebounce } from '@/hooks/useDebounce';
import { useManualBlockLayers } from './ManualBlocks';

const INITIAL_VIEW_STATE = {
  latitude: 35.6812,
  longitude: 139.7671,
  zoom: 18,
  pitch: 45,
  bearing: 0,
  maxPitch: 85,
  minZoom: 5,
  maxZoom: 20,
};

type MapStyle = 'osm' | 'photo';

const MAP_STYLES: Record<MapStyle, { tiles: string[]; maxzoom: number; attribution: string }> = {
  osm: {
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    maxzoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  photo: {
    tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],
    maxzoom: 18,
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
  },
};

interface DeckGLMapProps {
  isAddMode: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  mapStyle: MapStyle;
}

export default function DeckGLMap({ isAddMode, onMapClick, mapStyle }: DeckGLMapProps) {
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

  // MapLibre初期化（マウント時 + mapStyle変更時）
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    const tileConfig = MAP_STYLES[mapStyle];
    const map = new MapLibreMap({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'base-tiles': {
            type: 'raster',
            tiles: tileConfig.tiles,
            tileSize: 256,
            attribution: tileConfig.attribution,
            maxzoom: tileConfig.maxzoom,
          },
        },
        layers: [
          {
            id: 'base-layer',
            type: 'raster',
            source: 'base-tiles',
            minzoom: 0,
            maxzoom: 20,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapStyle]);

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
      if (!onMapClick) return;
      if (info.coordinate) {
        const [lng, lat] = info.coordinate;
        onMapClick(lat, lng);
      } else if (info.x !== undefined && info.y !== undefined) {
        // Fallback: unproject screen coordinates when no pickable layer is hit
        const viewport = new WebMercatorViewport(viewState);
        const [lng, lat] = viewport.unproject([info.x, info.y]);
        onMapClick(lat, lng);
      }
    },
    [onMapClick, viewState]
  );

  return (
    <WebGLErrorBoundary>
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
          onError={() => {}}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
      </div>
    </WebGLErrorBoundary>
  );
}

// WebGLエラーをキャッチしてフォールバック表示
class WebGLErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center w-full h-full bg-slate-100">
          <div className="text-center p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">3D地図の表示に失敗しました</p>
            <p className="text-xs text-gray-400 mb-3">WebGLに対応したブラウザ（Chrome/Edge推奨）をご使用ください。</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs text-white hover:bg-blue-700"
            >
              再読み込み
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
