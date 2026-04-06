'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import ControlPanel from '@/components/ControlPanel';
import MapView from '@/components/MapView';
import ProposalPanel from '@/components/ProposalPanel';
import OnboardingModal from '@/components/OnboardingModal';

const ONBOARDING_KEY = 'passive-design-onboarding-seen';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* ヘッダー */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <h1 className="text-base font-bold text-gray-800">パッシブデザイン提案ツール</h1>
        <button
          onClick={() => setShowOnboarding(true)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-slate-200 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01" />
          </svg>
          使い方
        </button>
      </header>

      {/* 3カラムレイアウト */}
      <main className="main-layout flex flex-1 overflow-hidden">
        <ControlPanel />
        <MapView />
        <ProposalPanel />
      </main>

      {/* オンボーディングモーダル */}
      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
    </div>
  );
}
