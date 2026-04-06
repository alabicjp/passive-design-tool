'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import ControlPanel from '@/components/ControlPanel';
import MapView from '@/components/MapView';
import ProposalPanel from '@/components/ProposalPanel';
import OnboardingModal from '@/components/OnboardingModal';

const ONBOARDING_KEY = 'passive-design-onboarding-seen';

type MobileTab = 'settings' | 'map' | 'proposal';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('map');
  const { address, manualBlocks, siteArea, clearAllBlocks, setAddress, setPosition } = useStore();

  const hasData = !!address || manualBlocks.length > 0 || !!siteArea;

  useEffect(() => {
    useStore.persist.rehydrate();
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  const handleNewProject = () => {
    clearAllBlocks();
    setAddress('');
    setPosition(34.7688, 136.1313); // デフォルト位置（伊賀市）
    setShowOnboarding(true);
  };

  const tabs: { key: MobileTab; label: string }[] = [
    { key: 'settings', label: '設定' },
    { key: 'map', label: '地図' },
    { key: 'proposal', label: '提案' },
  ];

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* ヘッダー */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <h1 className="text-sm md:text-base font-bold text-gray-800">パッシブデザイン提案ツール</h1>
        <div className="flex items-center gap-2">
          {hasData && (
            <button
              onClick={handleNewProject}
              className="flex items-center gap-1 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              新規作成
            </button>
          )}
          <button
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01" />
            </svg>
            使い方
          </button>
        </div>
      </header>

      {/* PC: 3カラムレイアウト */}
      <main className="main-layout hidden md:flex flex-1 overflow-hidden">
        <ControlPanel />
        <MapView />
        <ProposalPanel />
      </main>

      {/* モバイル: タブ切替 */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <div className={mobileTab === 'settings' ? 'h-full overflow-y-auto' : 'hidden'}>
            <ControlPanel isMobile />
          </div>
          <div className={mobileTab === 'map' ? 'h-full' : 'hidden'}>
            <MapView />
          </div>
          <div className={mobileTab === 'proposal' ? 'h-full overflow-y-auto' : 'hidden'}>
            <ProposalPanel isMobile />
          </div>
        </div>
        {/* タブバー */}
        <nav className="flex shrink-0 border-t border-gray-200 bg-white" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={mobileTab === tab.key}
              onClick={() => setMobileTab(tab.key)}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${
                mobileTab === tab.key
                  ? 'text-blue-600 border-t-2 border-blue-600 -mt-px'
                  : 'text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* オンボーディングモーダル */}
      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
    </div>
  );
}
