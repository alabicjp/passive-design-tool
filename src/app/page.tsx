'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import ControlPanel from '@/components/ControlPanel';
import MapView from '@/components/MapView';
import ProposalPanel from '@/components/ProposalPanel';

export default function Home() {
  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* ヘッダー */}
      <header className="flex h-12 shrink-0 items-center border-b border-gray-200 bg-white px-4">
        <h1 className="text-base font-bold text-gray-800">パッシブデザイン提案ツール</h1>
      </header>

      {/* 3カラムレイアウト */}
      <main className="main-layout flex flex-1 overflow-hidden">
        <ControlPanel />
        <MapView />
        <ProposalPanel />
      </main>
    </div>
  );
}
