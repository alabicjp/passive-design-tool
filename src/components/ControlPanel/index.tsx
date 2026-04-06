'use client';

import AddressSearch from './AddressSearch';
import AzimuthSlider from './AzimuthSlider';
import SeasonSelector from './SeasonSelector';
import TimeSlider from './TimeSlider';
import PerformanceToggle from './PerformanceToggle';
import ManualBlockPanel from './ManualBlockPanel';

function StepHeader({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
        {number}
      </span>
      <div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export default function ControlPanel({ isMobile }: { isMobile?: boolean }) {
  return (
    <aside className={`control-panel ${isMobile ? 'w-full' : 'w-[300px] shrink-0 border-r border-gray-200'} overflow-y-auto bg-white p-4 space-y-5`}>
      {/* Step 1 */}
      <div className="space-y-3">
        <StepHeader
          number={1}
          title="敷地を探す"
          description="建設予定地の住所を入力して、地図上で敷地を特定します"
        />
        <AddressSearch />
      </div>

      <hr className="border-gray-100" />

      {/* Step 2 */}
      <div className="space-y-3">
        <StepHeader
          number={2}
          title="建物を設定する"
          description="建物正面の向きを設定し、本物件と周囲の建物を地図に配置します"
        />
        <AzimuthSlider />
        <ManualBlockPanel />
      </div>

      <hr className="border-gray-100" />

      {/* Step 3 */}
      <div className="space-y-3">
        <StepHeader
          number={3}
          title="日照・通風を確認する"
          description="季節と時刻を変えて、日影の動きや通風を確認します"
        />
        <SeasonSelector />
        <TimeSlider />
        <PerformanceToggle />
      </div>
    </aside>
  );
}
