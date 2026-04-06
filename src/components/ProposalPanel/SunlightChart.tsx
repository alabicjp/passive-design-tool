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
import { useStore } from '@/store/useStore';
import { getFaceDirections } from '@/utils/passiveDesign';
import { calcSunlightHours } from '@/utils/sunlightHours';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
      <p className="text-[11px] text-gray-400">建物の各面が1日に受ける日照時間を、夏至と冬至で比較したグラフです。</p>
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
