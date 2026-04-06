'use client';

interface OnboardingModalProps {
  onClose: () => void;
}

const steps = [
  {
    number: 1,
    title: '敷地を探す',
    description: '住所や地番を入力して、建設予定地を地図上で特定します。',
    color: 'bg-blue-100 text-blue-600',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: '敷地と建物を配置',
    description: '地図上のボタンで敷地範囲→本物件→隣地建物の順に配置します。',
    color: 'bg-green-100 text-green-600',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21" />
      </svg>
    ),
  },
  {
    number: 3,
    title: '日照シミュレーション',
    description: '季節と時刻を変えると、地図上の日影がリアルタイムに変化します。',
    color: 'bg-amber-100 text-amber-600',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
  {
    number: 4,
    title: '提案を確認・レポート出力',
    description: '右側パネルに軒・窓・通風・断熱・光熱費の提案が自動表示。PDFレポートも出力できます。',
    color: 'bg-purple-100 text-purple-600',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
];

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        {/* タイトル */}
        <div className="mb-5 text-center">
          <h2 className="text-xl font-bold text-gray-800">パッシブデザイン提案ツール</h2>
          <p className="mt-2 text-sm text-gray-500">
            敷地の日照・通風をシミュレーションし、<br />
            窓や軒の最適な設計を提案するツールです。
          </p>
        </div>

        {/* 4ステップ */}
        <div className="space-y-3 mb-5">
          {steps.map((step) => (
            <div key={step.number} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${step.color}`}>
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                    step.number === 1 ? 'bg-blue-600' :
                    step.number === 2 ? 'bg-green-600' :
                    step.number === 3 ? 'bg-amber-500' :
                    'bg-purple-600'
                  }`}>
                    {step.number}
                  </span>
                  <h3 className="text-sm font-bold text-gray-700">{step.title}</h3>
                </div>
                <p className="mt-0.5 text-[11px] text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 画面構成の説明 */}
        <div className="mb-5 rounded-xl bg-blue-50 p-3">
          <p className="text-xs text-blue-700 font-medium mb-1">画面の見方</p>
          <div className="flex gap-4 text-[11px] text-blue-600">
            <span>左: 設定パネル</span>
            <span>中央: 3D地図</span>
            <span>右: 提案・分析結果</span>
          </div>
        </div>

        {/* ボタン */}
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
        >
          始める
        </button>
        <p className="mt-2 text-center text-[11px] text-gray-400">
          ヘッダーの「使い方」ボタンからいつでも再表示できます
        </p>
      </div>
    </div>
  );
}
