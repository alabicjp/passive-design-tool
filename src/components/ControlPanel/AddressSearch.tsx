'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';

interface GeoResult {
  lat: number;
  lng: number;
  title: string;
  precise: boolean;
}

// GSI geocoder API（より正確な住所検索）
async function searchGSIGeo(query: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(
      `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    if (data.length > 0) {
      const [lng, lat] = data[0].geometry.coordinates;
      const title = data[0].properties.title || query;
      const precise = /\d/.test(title);
      return { lat, lng, title, precise };
    }
  } catch { /* GSI検索失敗を無視 */ }
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
      const precise = ['house', 'building', 'residential'].includes(data[0].type);
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        title: data[0].display_name?.split(',')[0] || query,
        precise,
      };
    }
  } catch { /* Nominatim検索失敗を無視 */ }
  return null;
}

// 住所を正規化（県名が省略されている場合に補完候補を生成）
function normalizeQuery(query: string): string[] {
  const trimmed = query.trim();
  const queries = [trimmed];

  // 県名が含まれていない場合、主要な県名を付加して検索候補を作る
  const hasKen = /^(北海道|東京都|大阪府|京都府|.{2,3}県)/.test(trimmed);
  if (!hasKen) {
    // 市名から始まっている場合、三重県をデフォルトで追加（工務店の主要エリア）
    if (/^[^\d]+市/.test(trimmed)) {
      queries.unshift('三重県' + trimmed);
    }
  }

  return queries;
}

// 番地部分を除去して再検索用
function removeHouseNumber(query: string): string | null {
  const stripped = query.replace(/[\d\-－ー０-９]+$/, '').trim();
  return stripped !== query ? stripped : null;
}

async function geocode(query: string): Promise<GeoResult | null> {
  const queries = normalizeQuery(query);

  for (const q of queries) {
    // GSIとNominatimを並行検索
    const [gsi, nom] = await Promise.all([
      searchGSIGeo(q),
      searchNominatim(q),
    ]);

    // 精度が高い方を優先
    if (gsi?.precise) return gsi;
    if (nom?.precise) return nom;
    if (gsi) return gsi;
    if (nom) return nom;
  }

  // 番地を除いて再検索
  const simpler = removeHouseNumber(query);
  if (simpler) {
    const simplerQueries = normalizeQuery(simpler);
    for (const q of simplerQueries) {
      const [gsi2, nom2] = await Promise.all([
        searchGSIGeo(q),
        searchNominatim(q),
      ]);
      if (gsi2) return { ...gsi2, precise: false };
      if (nom2) return { ...nom2, precise: false };
    }
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
      <p className="text-[11px] text-gray-400">建設予定地の住所を入力してください。地図をクリックしても位置を変更できます。</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="例: 伊賀市上野丸之内 または 三重県名張市平尾"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '...' : '検索'}
        </button>
      </div>
      {info && <p className="text-xs text-amber-600">{info}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
