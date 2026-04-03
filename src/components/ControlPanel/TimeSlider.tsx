'use client';

import { useStore } from '@/store/useStore';

export default function TimeSlider() {
  const { timeHour, setTimeHour } = useStore();

  const hours = Math.floor(timeHour);
  const minutes = Math.round((timeHour - hours) * 60);
  const timeLabel = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        時刻: <span className="font-bold text-blue-700">{timeLabel}</span>
      </label>
      <input
        type="range"
        min={6}
        max={18}
        step={0.5}
        value={timeHour}
        onChange={(e) => setTimeHour(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>6:00</span>
        <span>12:00</span>
        <span>18:00</span>
      </div>
    </div>
  );
}
