'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';

interface WeatherInfo {
  annualRadiation: number;   // 年間日射量 kWh/m2
  avgTempSummer: number;     // 夏季平均気温
  avgTempWinter: number;     // 冬季平均気温
  avgWindSpeed: number;      // 年間平均風速
  maxTemp: number;           // 年間最高気温
  minTemp: number;           // 年間最低気温
}

async function fetchWeatherData(lat: number, lng: number): Promise<WeatherInfo | null> {
  try {
    // Open-Meteo API: 過去1年の気象データを取得
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,shortwave_radiation_sum,windspeed_10m_max&start_date=${startStr}&end_date=${endStr}&timezone=Asia/Tokyo`;

    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    if (!data.daily) return null;

    const temps_max = data.daily.temperature_2m_max as number[];
    const temps_min = data.daily.temperature_2m_min as number[];
    const radiation = data.daily.shortwave_radiation_sum as number[];
    const windspeed = data.daily.windspeed_10m_max as number[];

    // 年間日射量（MJ/m2 → kWh/m2: ÷3.6）
    const annualRadiation = Math.round(radiation.reduce((s: number, v: number) => s + (v || 0), 0) / 3.6);

    // 夏季（6-8月）・冬季（12-2月）の平均気温
    const summerTemps: number[] = [];
    const winterTemps: number[] = [];
    data.daily.temperature_2m_max.forEach((max: number, i: number) => {
      const date = new Date(data.daily.time[i]);
      const month = date.getMonth() + 1;
      const avg = ((max || 0) + (temps_min[i] || 0)) / 2;
      if (month >= 6 && month <= 8) summerTemps.push(avg);
      if (month === 12 || month <= 2) winterTemps.push(avg);
    });

    const avgTempSummer = summerTemps.length > 0
      ? Math.round(summerTemps.reduce((s, v) => s + v, 0) / summerTemps.length * 10) / 10
      : 0;
    const avgTempWinter = winterTemps.length > 0
      ? Math.round(winterTemps.reduce((s, v) => s + v, 0) / winterTemps.length * 10) / 10
      : 0;

    const avgWindSpeed = Math.round(windspeed.reduce((s: number, v: number) => s + (v || 0), 0) / windspeed.length * 10) / 10;
    const validMax = temps_max.filter((v: number) => v != null);
    const validMin = temps_min.filter((v: number) => v != null);
    const maxTemp = validMax.length > 0 ? Math.round(Math.max(...validMax) * 10) / 10 : 0;
    const minTemp = validMin.length > 0 ? Math.round(Math.min(...validMin) * 10) / 10 : 0;

    return { annualRadiation, avgTempSummer, avgTempWinter, avgWindSpeed, maxTemp, minTemp };
  } catch {
    return null;
  }
}

export default function WeatherData() {
  const { latitude, longitude } = useStore();
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    const data = await fetchWeatherData(latitude, longitude);
    setWeather(data);
    setLoading(false);
    setFetched(true);
  };

  // 位置が変わったらリセット
  useEffect(() => {
    setWeather(null);
    setFetched(false);
  }, [latitude, longitude]);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">気象データ（実測値）</h3>
      <p className="text-[11px] text-gray-400">敷地周辺の過去1年間の気象データをOpen-Meteo APIから取得します。</p>

      {!fetched && (
        <button
          onClick={handleFetch}
          disabled={loading}
          className="w-full rounded-lg bg-slate-100 py-2 text-xs font-medium text-gray-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          {loading ? '取得中...' : '気象データを取得'}
        </button>
      )}

      {weather && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-amber-50 p-2 text-center">
              <p className="text-[10px] text-gray-500">年間日射量</p>
              <p className="text-lg font-bold text-amber-600">{weather.annualRadiation}</p>
              <p className="text-[9px] text-gray-400">kWh/m2</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-2 text-center">
              <p className="text-[10px] text-gray-500">平均風速</p>
              <p className="text-lg font-bold text-blue-600">{weather.avgWindSpeed}</p>
              <p className="text-[9px] text-gray-400">m/s</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-red-50 p-2 text-center">
              <p className="text-[10px] text-gray-500">夏季平均気温</p>
              <p className="text-sm font-bold text-red-600">{weather.avgTempSummer}°C</p>
              <p className="text-[9px] text-gray-400">最高 {weather.maxTemp}°C</p>
            </div>
            <div className="rounded-lg bg-cyan-50 p-2 text-center">
              <p className="text-[10px] text-gray-500">冬季平均気温</p>
              <p className="text-sm font-bold text-cyan-600">{weather.avgTempWinter}°C</p>
              <p className="text-[9px] text-gray-400">最低 {weather.minTemp}°C</p>
            </div>
          </div>

          {/* 日射量の評価 */}
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-[10px] text-gray-600">
              {weather.annualRadiation >= 1400
                ? '日射量が豊富な地域です。太陽光発電・パッシブソーラーに適しています。'
                : weather.annualRadiation >= 1200
                ? '平均的な日射量の地域です。パッシブデザインの効果が見込めます。'
                : '日射量がやや少ない地域です。断熱性能の強化を優先してください。'}
            </p>
          </div>
        </div>
      )}

      {fetched && !weather && (
        <p className="text-xs text-red-500">気象データの取得に失敗しました。</p>
      )}

      <p className="text-[9px] text-gray-400">データ提供: Open-Meteo API（無料・APIキー不要）</p>
    </div>
  );
}
