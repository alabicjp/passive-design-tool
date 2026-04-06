'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';

interface GeoResult {
  lat: number;
  lng: number;
  title: string;
  precise: boolean;
}

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Google Geocoding API（最優先 — 地番にも対応）
async function searchGoogle(query: string): Promise<GeoResult | null> {
  if (!GOOGLE_API_KEY) return null;
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&region=jp&language=ja&key=${GOOGLE_API_KEY}`
    );
    const data = await res.json();
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const { lat, lng } = result.geometry.location;
      const title = result.formatted_address?.replace(/^日本、〒[\d\-]+\s*/, '') || query;
      // ROOFTOP or RANGE_INTERPOLATED は精度高い
      const precise = ['ROOFTOP', 'RANGE_INTERPOLATED'].includes(result.geometry.location_type);
      return { lat, lng, title, precise };
    }
  } catch { /* Google検索失敗を無視 */ }
  return null;
}

// GSI geocoder API（フォールバック）
async function searchGSI(query: string): Promise<GeoResult | null> {
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

// 住所を正規化（県名が省略されている場合に補完）
function normalizeQuery(query: string): string[] {
  const trimmed = query.trim();
  const queries = [trimmed];

  const hasKen = /^(北海道|東京都|大阪府|京都府|.{2,3}県)/.test(trimmed);
  if (!hasKen && /^[^\d]+[市町村]/.test(trimmed)) {
    queries.unshift('三重県' + trimmed);
  }

  return queries;
}

async function geocode(query: string): Promise<GeoResult | null> {
  const queries = normalizeQuery(query);

  for (const q of queries) {
    // Google APIを優先、なければGSIにフォールバック
    const google = await searchGoogle(q);
    if (google?.precise) return google;

    const gsi = await searchGSI(q);
    if (google) return google;
    if (gsi) return gsi;
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
      <p className="text-[11px] text-gray-400">住所や地番を入力してください。地図をクリックしても位置を変更できます。</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="例: 伊賀市上野丸之内116 / 名張市平尾3207-10"
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
