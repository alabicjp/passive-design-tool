'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';

interface GeoResult {
  lat: number;
  lng: number;
  title: string;
  precise: boolean;
}

// GSI検索（番地レベルの精度がある場合も）
async function searchGSI(query: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(
      `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    if (data.length > 0) {
      const [lng, lat] = data[0].geometry.coordinates;
      const title = data[0].properties.title || query;
      // 番地が含まれていれば精度高い
      const precise = /\d+番地/.test(title);
      return { lat, lng, title, precise };
    }
  } catch { /* ignore */ }
  return null;
}

// Nominatim（OSM）検索
async function searchNominatim(query: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=jp&format=json&limit=1`,
      { headers: { 'Accept-Language': 'ja' } }
    );
    const data = await res.json();
    if (data.length > 0) {
      const precise = ['house', 'building'].includes(data[0].type);
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        title: data[0].display_name?.split(',')[0] || query,
        precise,
      };
    }
  } catch { /* ignore */ }
  return null;
}

// 番地部分を除去して再検索用
function removeHouseNumber(query: string): string | null {
  const stripped = query.replace(/[\d\-－ー０-９]+$/, '').trim();
  return stripped !== query ? stripped : null;
}

async function geocode(query: string): Promise<GeoResult | null> {
  // Step 1: GSIとNominatimを並行検索
  const [gsi, nom] = await Promise.all([
    searchGSI(query),
    searchNominatim(query),
  ]);

  // 精度が高い方を優先
  if (gsi?.precise) return gsi;
  if (nom?.precise) return nom;
  if (gsi) return gsi;
  if (nom) return nom;

  // Step 2: 番地を除いて再検索
  const simpler = removeHouseNumber(query);
  if (simpler) {
    const [gsi2, nom2] = await Promise.all([
      searchGSI(simpler),
      searchNominatim(simpler),
    ]);
    if (gsi2) return { ...gsi2, precise: false };
    if (nom2) return { ...nom2, precise: false };
  }

  return null;
}

export default function AddressSearch() {
  const [query, setQuery] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAddress, setPosition } = useStore();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const result = await geocode(query);
      if (result) {
        setPosition(result.lat, result.lng);
        setAddress(result.title);
        if (!result.precise) {
          setInfo('おおよその位置です。航空写真で確認し、地図クリックで微調整できます。');
        }
      } else {
        setError('該当する住所が見つかりませんでした。地図上で直接クリックして設定してください。');
      }
    } catch {
      setError('住所検索に失敗しました。ネットワーク接続を確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">住所検索</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="例: 名張市平尾3207-10"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '...' : '検索'}
        </button>
      </div>
      {info && <p className="text-xs text-amber-600">{info}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
