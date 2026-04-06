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
  const { address } = useStore();
  const today = new Date().toLocaleDateString('ja-JP');

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

      {/* セクション1: 敷地 */}
      <SectionDivider title="敷地・建物" description="面積と法規チェック" />
      <CoverageCheck />

      {/* セクション2: 日照・パッシブ */}
      <SectionDivider title="日照・パッシブ設計" description="太陽と風を活かす設計提案" />
      <SunlightChart />
      <EavesProposal />
      <WindowProposal />
      <VentilationProposal />

      {/* セクション3: 断熱・省エネ */}
      <SectionDivider title="断熱・省エネ" description="断熱性能と光熱費の比較" />
      <ThermalPerformance />
      <SolarHeatGain />
      <EnergyCostComparison />

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
