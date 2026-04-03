'use client';

import AddressSearch from './AddressSearch';
import AzimuthSlider from './AzimuthSlider';
import SeasonSelector from './SeasonSelector';
import TimeSlider from './TimeSlider';
import PerformanceToggle from './PerformanceToggle';
import ManualBlockPanel from './ManualBlockPanel';

export default function ControlPanel() {
  return (
    <aside className="control-panel w-[300px] shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4 space-y-6">
      <h2 className="text-lg font-bold text-gray-800">設定</h2>
      <AddressSearch />
      <AzimuthSlider />
      <SeasonSelector />
      <TimeSlider />
      <PerformanceToggle />
      <hr className="border-gray-200" />
      <ManualBlockPanel />
    </aside>
  );
}
