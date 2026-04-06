'use client';

import dynamic from 'next/dynamic';
import EavesProposal from './EavesProposal';
import WindowProposal from './WindowProposal';
import VentilationProposal from './VentilationProposal';
import ReportButton from './ReportButton';
import { useStore } from '@/store/useStore';

const SunlightChart = dynamic(() => import('./SunlightChart'), { ssr: false });

export default function ProposalPanel({ isMobile }: { isMobile?: boolean }) {
  const { address } = useStore();
  const today = new Date().toLocaleDateString('ja-JP');

  return (
    <aside className={`proposal-panel ${isMobile ? 'w-full' : 'w-[350px] shrink-0 border-l border-gray-200'} overflow-y-auto bg-slate-50 p-4 space-y-4`}>
      {/* 印刷用ヘッダー */}
      <div className="hidden print:block mb-4">
        <h2 className="text-xl font-bold">パッシブデザイン提案レポート</h2>
        <p className="text-sm text-gray-600">{address || '住所未設定'} / {today}</p>
      </div>

      <h2 className="text-lg font-bold text-gray-800 print:hidden">パッシブデザイン提案</h2>
      <p className="text-[11px] text-gray-400 print:hidden">左の設定に基づいて、パッシブデザインの提案を自動計算しています。</p>

      <SunlightChart />
      <EavesProposal />
      <WindowProposal />
      <VentilationProposal />
      <ReportButton />

      {/* 印刷用フッター */}
      <div className="hidden print:block mt-4 border-t pt-2">
        <p className="text-xs text-gray-500">
          本レポートは参考資料です。詳細は設計担当者にご確認ください。
        </p>
      </div>
    </aside>
  );
}
