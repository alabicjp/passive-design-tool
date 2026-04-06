'use client';

import dynamic from 'next/dynamic';
import EavesProposal from './EavesProposal';
import WindowProposal from './WindowProposal';
import VentilationProposal from './VentilationProposal';
import CoverageCheck from './CoverageCheck';
import ThermalPerformance from './ThermalPerformance';
import SolarHeatGain from './SolarHeatGain';
import EnergyCostComparison from './EnergyCostComparison';
import WeatherData from './WeatherData';
import ReportButton from './ReportButton';
import { useStore } from '@/store/useStore';

const SunlightChart = dynamic(() => import('./SunlightChart'), { ssr: false });

function SectionDivider({ title, description }: { title: string; description: string }) {
  return (
    <div className="pt-2 print:hidden">
      <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wide">{title}</h3>
      <p className="text-[10px] text-gray-400">{description}</p>
    </div>
  );
}

export default function ProposalPanel({ isMobile }: { isMobile?: boolean }) {
  const { address, manualBlocks, siteArea } = useStore();
  const today = new Date().toLocaleDateString('ja-JP');
  const hasSubject = manualBlocks.some((b) => b.blockType === 'subject');
  const hasAnySetup = hasSubject || siteArea;

  return (
    <aside className={`proposal-panel ${isMobile ? 'w-full' : 'w-[350px] shrink-0 border-l border-gray-200'} overflow-y-auto bg-slate-50 p-4 space-y-4`}>
      {/* 印刷用ヘッダー */}
      <div className="hidden print:block mb-4">
        <h2 className="text-xl font-bold">パッシブデザイン提案レポート</h2>
        <p className="text-sm text-gray-600">{address || '住所未設定'} / {today}</p>
      </div>

      <div className="print:hidden">
        <h2 className="text-lg font-bold text-gray-800">提案・分析結果</h2>
        <p className="text-[11px] text-gray-400">左の設定と地図配置に基づいて、自動計算された結果です。</p>
      </div>

      {/* 未配置時の案内 */}
      {!hasAnySetup && (
        <div className="rounded-xl bg-blue-50 p-4 text-center print:hidden">
          <div className="flex justify-center mb-2">
            <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
          </div>
          <p className="text-sm font-medium text-blue-700 mb-1">敷地と建物を配置してください</p>
          <p className="text-xs text-blue-500">左パネルで住所検索 → 地図上で敷地・建物を配置すると、ここに分析結果が表示されます。ヘッダー右の「使い方」で手順を確認できます。</p>
        </div>
      )}

      {/* セクション1: 敷地（敷地or建物があれば表示） */}
      {hasAnySetup && (
        <>
          <SectionDivider title="敷地・建物" description="面積と法規チェック" />
          <CoverageCheck />
        </>
      )}

      {/* セクション2: 日照・パッシブ（常に表示 — 住所だけでも計算可能） */}
      <SectionDivider title="日照・パッシブ設計" description="太陽と風を活かす設計提案" />
      <SunlightChart />
      <EavesProposal />
      <WindowProposal />
      <VentilationProposal />

      {/* セクション3: 断熱・省エネ（建物配置後のみ表示） */}
      {hasSubject && (
        <>
          <SectionDivider title="断熱・省エネ" description="断熱性能と光熱費の比較" />
          <ThermalPerformance />
          <SolarHeatGain />
          <EnergyCostComparison />
        </>
      )}

      {/* セクション4: 気象・レポート */}
      <SectionDivider title="気象データ・レポート" description="実測データの確認とPDF出力" />
      <WeatherData />
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
