'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import SunCalc from 'suncalc';
import { useStore } from '@/store/useStore';
import { getFaceDirections } from '@/utils/passiveDesign';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function calcSunlightHours(
  lat: number,
  lng: number,
  month: number,
  day: number,
  faceDir: number
): number {
  const year = new Date().getFullYear();
  let hours = 0;

  for (let h = 6; h <= 18; h += 0.5) {
    const hr = Math.floor(h);
    const min = (h - hr) * 60;
    const date = new Date(year, month - 1, day, hr, min, 0);
    const pos = SunCalc.getPosition(date, lat, lng);

    if (pos.altitude <= 0) continue;

    // SunCalc azimuth (南=0) → 北=0基準に変換
    const sunAzNorth = (((pos.azimuth * 180) / Math.PI + 180) % 360 + 360) % 360;
    const diff = Math.abs(((sunAzNorth - faceDir + 540) % 360) - 180);

    if (diff <= 90) {
      hours += 0.5;
    }
  }

  return Math.round(hours * 10) / 10;
}

export default function SunlightChart() {
  const { latitude, longitude, buildingAzimuth } = useStore();

  const chartData = useMemo(() => {
    const faces = getFaceDirections(buildingAzimuth);
    const faceList = [
      { label: '正面', dir: faces.front },
      { label: '右側面', dir: faces.right },
      { label: '左側面', dir: faces.left },
      { label: '背面', dir: faces.back },
    ];

    const summerHours = faceList.map((f) => calcSunlightHours(latitude, longitude, 6, 21, f.dir));
    const winterHours = faceList.map((f) => calcSunlightHours(latitude, longitude, 12, 21, f.dir));

    return {
      labels: faceList.map((f) => f.label),
      datasets: [
        {
          label: '夏至',
          data: summerHours,
          backgroundColor: 'rgba(251, 146, 60, 0.8)',
        },
        {
          label: '冬至',
          data: winterHours,
          backgroundColor: 'rgba(96, 165, 250, 0.8)',
        },
      ],
    };
  }, [latitude, longitude, buildingAzimuth]);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">日照分析（各面の日照時間）</h3>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 11 } } },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: '時間 (h)', font: { size: 10 } },
            },
          },
        }}
        height={200}
      />
    </div>
  );
}
