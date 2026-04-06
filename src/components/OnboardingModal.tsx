'use client';

interface OnboardingModalProps {
  onClose: () => void;
}

const steps = [
  {
    number: 1,
    title: '敷地を探す',
    description: '住所を入力して、建設予定地の位置を地図上で特定します。',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: '建物を配置する',
    description: '建物の向きを設定し、本物件と周囲の建物を地図上に配置します。',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21" />
      </svg>
    ),
  },
  {
    number: 3,
    title: '日照・通風を確認する',
    description: '季節と時刻を変えて日影の動きを確認。右側に軒・窓・通風の提案が表示されます。',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
];

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        {/* タイトル */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-gray-800">パッシブデザイン提案ツール</h2>
          <p className="mt-2 text-sm text-gray-500">
            敷地の日照・通風をシミュレーションし、<br />
            窓や軒の最適な設計を提案するツールです。
          </p>
        </div>

        {/* 3ステップ */}
        <div className="space-y-4 mb-6">
          {steps.map((step) => (
            <div key={step.number} className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                {step.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    {step.number}
                  </span>
                  <h3 className="text-sm font-bold text-gray-700">{step.title}</h3>
                </div>
                <p className="mt-1 text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ボタン */}
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
        >
          始める
        </button>
        <p className="mt-3 text-center text-[11px] text-gray-400">
          ヘッダーの「使い方」ボタンからいつでも再表示できます
        </p>
      </div>
    </div>
  );
}
