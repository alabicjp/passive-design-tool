'use client';

import { useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { useEavesProposal } from '@/hooks/useEavesCalculation';
import { getWindowRecommendations, directionLabel, getFaceDirections } from '@/utils/passiveDesign';
import { getNearestWindData } from '@/constants/windData';
import { calcSunlightHours } from '@/utils/sunlightHours';
import { H_BASE } from '@/constants/defaults';

function captureMapImage(): string | null {
  const canvases = Array.from(document.querySelectorAll('.map-view canvas'));
  for (const c of canvases) {
    const canvas = c as HTMLCanvasElement;
    if (canvas.width > 100 && canvas.height > 100) {
      try {
        return canvas.toDataURL('image/png');
      } catch { /* ignore tainted canvas */ }
    }
  }
  return null;
}

function captureChartImage(): string | null {
  const canvas = document.querySelector('.proposal-panel canvas') as HTMLCanvasElement;
  if (canvas) {
    try {
      return canvas.toDataURL('image/png');
    } catch { /* ignore */ }
  }
  return null;
}

export default function ReportButton() {
  const store = useStore();
  const eaves = useEavesProposal(store.latitude, store.longitude, store.buildingAzimuth);

  const handleExport = useCallback(() => {
    const { address, latitude, longitude, buildingAzimuth } = store;
    const today = new Date().toLocaleDateString('ja-JP');
    const mapImage = captureMapImage();
    const chartImage = captureChartImage();

    const windows = getWindowRecommendations(buildingAzimuth);
    const windData = getNearestWindData(latitude, longitude);
    const faces = getFaceDirections(buildingAzimuth);

    const faceList = [
      { label: '正面', dir: faces.front },
      { label: '右側面', dir: faces.right },
      { label: '左側面', dir: faces.left },
      { label: '背面', dir: faces.back },
    ];
    const summerHours = faceList.map(f => calcSunlightHours(latitude, longitude, 6, 21, f.dir));
    const winterHours = faceList.map(f => calcSunlightHours(latitude, longitude, 12, 21, f.dir));

    // 敷地・建蔽率セクションのHTML
    let siteHtml = '';
    const site = store.siteArea;
    const subjects = store.manualBlocks.filter(b => b.blockType === 'subject');
    if (site && subjects.length > 0) {
      const siteM2 = site.width * site.depth;
      const buildM2 = subjects.reduce((s, b) => s + b.width * b.depth, 0);
      const totalFloor = subjects.reduce((s, b) => s + b.width * b.depth * Math.max(1, Math.round(b.height / 3)), 0);
      const coverage = Math.round((buildM2 / siteM2) * 1000) / 10;
      const far = Math.round((totalFloor / siteM2) * 1000) / 10;
      const siteTsubo = Math.round(siteM2 / 3.30578 * 10) / 10;
      const buildTsubo = Math.round(buildM2 / 3.30578 * 10) / 10;
      const floorTsubo = Math.round(totalFloor / 3.30578 * 10) / 10;
      const covClass = coverage <= 60 ? 'badge-green' : 'badge-red';
      const farClass = far <= 200 ? 'badge-green' : 'badge-red';
      siteHtml = `
      <div class="section">
        <div class="section-title">敷地・建物概要</div>
        <div class="card">
          <table class="sun-table">
            <thead><tr><th>項目</th><th>面積</th><th>坪数</th></tr></thead>
            <tbody>
              <tr><td style="font-weight:600">敷地面積</td><td>${siteM2}m2</td><td>${siteTsubo}坪</td></tr>
              <tr><td style="font-weight:600">建築面積</td><td>${buildM2}m2</td><td>${buildTsubo}坪</td></tr>
              <tr><td style="font-weight:600">延床面積</td><td>${totalFloor}m2</td><td>${floorTsubo}坪</td></tr>
            </tbody>
          </table>
          <div style="margin-top:8px;">
            <span class="badge ${covClass}">建蔽率: ${coverage}%</span>
            <span class="badge ${farClass}">容積率: ${far}%</span>
          </div>
        </div>
      </div>`;
    }

    const sizeColorMap: Record<string, string> = {
      '大開口': '#ea580c',
      '中程度': '#ca8a04',
      '小窓＋外付け遮蔽': '#7c3aed',
      '小窓': '#6b7280',
    };

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>パッシブデザイン提案レポート</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4 portrait; margin: 12mm; }
  body { font-family: 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif; color: #1e293b; font-size: 10px; line-height: 1.5; }

  .page { page-break-after: always; padding: 8mm; }
  .page:last-child { page-break-after: auto; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #1e40af; padding-bottom: 8px; margin-bottom: 16px; }
  .header h1 { font-size: 20px; color: #1e40af; letter-spacing: 2px; }
  .header-right { text-align: right; font-size: 9px; color: #64748b; }

  /* Section */
  .section { margin-bottom: 14px; }
  .section-title { font-size: 13px; font-weight: bold; color: #1e40af; border-left: 4px solid #1e40af; padding-left: 8px; margin-bottom: 8px; }

  /* Info table */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .info-item { display: flex; gap: 6px; font-size: 10px; }
  .info-label { color: #64748b; min-width: 80px; }
  .info-value { font-weight: bold; }

  /* Map */
  .map-container { width: 100%; height: 240px; background: #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 8px; }
  .map-container img { width: 100%; height: 100%; object-fit: cover; }

  /* Cards */
  .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
  .card-header { font-size: 11px; font-weight: bold; margin-bottom: 6px; color: #334155; }

  /* Sunlight table */
  .sun-table { width: 100%; border-collapse: collapse; font-size: 10px; }
  .sun-table th, .sun-table td { padding: 6px 8px; text-align: center; border: 1px solid #e2e8f0; }
  .sun-table th { background: #f1f5f9; color: #475569; font-weight: 600; }
  .sun-table .summer { color: #ea580c; font-weight: bold; }
  .sun-table .winter { color: #2563eb; font-weight: bold; }

  /* Eaves */
  .eaves-flex { display: flex; gap: 12px; align-items: center; }
  .eaves-box { flex: 1; text-align: center; padding: 10px; border-radius: 8px; }
  .eaves-box.theory { background: #fff7ed; border: 1px solid #fed7aa; }
  .eaves-box.recommend { background: #f0fdf4; border: 1px solid #bbf7d0; }
  .eaves-value { font-size: 24px; font-weight: bold; }
  .eaves-box.theory .eaves-value { color: #ea580c; }
  .eaves-box.recommend .eaves-value { color: #16a34a; }
  .eaves-label { font-size: 9px; color: #64748b; }

  /* Badge */
  .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: 600; margin-right: 4px; }
  .badge-green { background: #dcfce7; color: #16a34a; }
  .badge-blue { background: #dbeafe; color: #2563eb; }
  .badge-red { background: #fee2e2; color: #dc2626; }

  /* Window cards */
  .window-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .window-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
  .window-face { font-size: 11px; font-weight: bold; }
  .window-dir { font-size: 9px; color: #94a3b8; }
  .window-size { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: 600; margin-top: 4px; }
  .window-note { font-size: 9px; color: #64748b; margin-top: 4px; }

  /* Wind */
  .wind-flex { display: flex; gap: 16px; align-items: center; }
  .wind-info { flex: 1; }

  /* Chart image */
  .chart-img { width: 100%; max-height: 180px; object-fit: contain; }

  /* Footer */
  .footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 8px; color: #94a3b8; display: flex; justify-content: space-between; }

  /* Two column */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
</style>
</head>
<body>

<!-- ページ1: 概要 + 日照分析 -->
<div class="page">
  <div class="header">
    <h1>パッシブデザイン提案レポート</h1>
    <div class="header-right">
      <div>作成日: ${today}</div>
      <div>Passive Design Tool</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">物件概要</div>
    <div class="info-grid">
      <div class="info-item"><span class="info-label">所在地:</span><span class="info-value">${address || '未設定'}</span></div>
      <div class="info-item"><span class="info-label">座標:</span><span class="info-value">${latitude.toFixed(5)}, ${longitude.toFixed(5)}</span></div>
      <div class="info-item"><span class="info-label">建物方位角:</span><span class="info-value">${buildingAzimuth}°（${buildingAzimuth === 0 ? '真南' : buildingAzimuth > 0 ? '西寄り' + buildingAzimuth + '°' : '東寄り' + Math.abs(buildingAzimuth) + '°'}）</span></div>
      <div class="info-item"><span class="info-label">正面方位:</span><span class="info-value">${directionLabel(faces.front)}向き</span></div>
    </div>
  </div>

  ${mapImage ? `
  <div class="section">
    <div class="section-title">敷地状況（航空写真 + 日影シミュレーション）</div>
    <div class="map-container"><img src="${mapImage}" /></div>
  </div>` : ''}

  <div class="section">
    <div class="section-title">日照分析（各面の日照時間）</div>
    <div class="two-col">
      <div>
        <table class="sun-table">
          <thead>
            <tr><th>面</th><th>方位</th><th>夏至</th><th>冬至</th></tr>
          </thead>
          <tbody>
            ${faceList.map((f, i) => `
            <tr>
              <td style="font-weight:600">${f.label}</td>
              <td>${directionLabel(f.dir)}</td>
              <td class="summer">${summerHours[i]}h</td>
              <td class="winter">${winterHours[i]}h</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div>
        ${chartImage ? `<img src="${chartImage}" class="chart-img" />` : ''}
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">軒の出提案</div>
    <div class="card">
      <p style="font-size:9px; color:#64748b; margin-bottom:8px;">夏至南中時の太陽高度に基づき、窓上部(H=${H_BASE}m)の日射遮蔽に必要な軒の出を算出</p>
      ${eaves.summerEaves.isBehind ? '<p>正面が北向きのため軒による遮蔽は不要です</p>' : `
      <div class="eaves-flex">
        <div class="eaves-box theory">
          <div class="eaves-label">理論値</div>
          <div class="eaves-value">${eaves.summerEaves.D}m</div>
        </div>
        <div class="eaves-box recommend">
          <div class="eaves-label">推奨値</div>
          <div class="eaves-value">${eaves.summerEaves.D_recommended}m</div>
        </div>
        <div style="flex:1;">
          <div style="margin-bottom:4px;">
            <span class="badge badge-green">夏至: 遮蔽OK</span>
            <span class="badge ${eaves.winterCanTakeIn ? 'badge-blue' : 'badge-red'}">冬至: ${eaves.winterCanTakeIn ? '日射取得OK' : '日射不足の恐れ'}</span>
          </div>
          <div style="font-size:9px; color:#64748b;">
            夏至太陽高度: ${eaves.summerEaves.theta}°<br>
            実効高度: ${eaves.summerEaves.theta_eff}°<br>
            ${!eaves.winterEaves.isBehind ? `冬至太陽高度: ${eaves.winterEaves.theta}°` : ''}
          </div>
        </div>
      </div>`}
    </div>
  </div>

  <div class="footer">
    <span>本レポートはシミュレーションに基づく参考資料です。詳細は設計担当者にご確認ください。</span>
    <span>1 / 2</span>
  </div>
</div>

<!-- ページ2: 窓配置 + 通風 -->
<div class="page">
  <div class="header">
    <h1>パッシブデザイン提案レポート</h1>
    <div class="header-right">
      <div>${address || '未設定'}</div>
      <div>${today}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">窓配置提案</div>
    <div class="window-grid">
      ${windows.map(w => `
      <div class="window-card">
        <div class="window-face">${w.face} <span class="window-dir">${w.direction}</span></div>
        <div class="window-size" style="background:${sizeColorMap[w.size] || '#6b7280'}20; color:${sizeColorMap[w.size] || '#6b7280'}">${w.size}</div>
        <div class="window-note">${w.note}</div>
      </div>`).join('')}
    </div>
  </div>

  <div class="section">
    <div class="section-title">通風計画</div>
    <div class="card">
      <div class="info-grid" style="margin-bottom:8px;">
        <div class="info-item"><span class="info-label">最寄り観測点:</span><span class="info-value">${windData.city}</span></div>
        <div class="info-item"><span class="info-label">夏季卓越風向:</span><span class="info-value">${directionLabel(windData.summer)} (${windData.summer}°)</span></div>
        <div class="info-item"><span class="info-label">冬季卓越風向:</span><span class="info-value">${directionLabel(windData.winter)} (${windData.winter}°)</span></div>
      </div>
      <table class="sun-table">
        <thead><tr><th>項目</th><th>夏季</th><th>冬季</th></tr></thead>
        <tbody>
          <tr>
            <td style="font-weight:600">給気面（風上）</td>
            <td>${(() => {
              const entries = [{ name: '正面', dir: faces.front }, { name: '右側面', dir: faces.right }, { name: '背面', dir: faces.back }, { name: '左側面', dir: faces.left }];
              const best = entries.reduce<{name:string;dir:number;diff:number}>((b, f) => { const d = Math.abs(((f.dir - windData.summer + 540) % 360) - 180); return d < b.diff ? { ...f, diff: d } : b; }, { name: '', dir: 0, diff: 360 });
              return best.name;
            })()}</td>
            <td>${(() => {
              const entries = [{ name: '正面', dir: faces.front }, { name: '右側面', dir: faces.right }, { name: '背面', dir: faces.back }, { name: '左側面', dir: faces.left }];
              const best = entries.reduce<{name:string;dir:number;diff:number}>((b, f) => { const d = Math.abs(((f.dir - windData.winter + 540) % 360) - 180); return d < b.diff ? { ...f, diff: d } : b; }, { name: '', dir: 0, diff: 360 });
              return best.name;
            })()}</td>
          </tr>
          <tr>
            <td style="font-weight:600">排気面（風下）</td>
            <td>${(() => {
              const entries = [{ name: '正面', dir: faces.front }, { name: '右側面', dir: faces.right }, { name: '背面', dir: faces.back }, { name: '左側面', dir: faces.left }];
              const opp = (windData.summer + 180) % 360;
              const best = entries.reduce<{name:string;dir:number;diff:number}>((b, f) => { const d = Math.abs(((f.dir - opp + 540) % 360) - 180); return d < b.diff ? { ...f, diff: d } : b; }, { name: '', dir: 0, diff: 360 });
              return best.name;
            })()}</td>
            <td>${(() => {
              const entries = [{ name: '正面', dir: faces.front }, { name: '右側面', dir: faces.right }, { name: '背面', dir: faces.back }, { name: '左側面', dir: faces.left }];
              const opp = (windData.winter + 180) % 360;
              const best = entries.reduce<{name:string;dir:number;diff:number}>((b, f) => { const d = Math.abs(((f.dir - opp + 540) % 360) - 180); return d < b.diff ? { ...f, diff: d } : b; }, { name: '', dir: 0, diff: 360 });
              return best.name;
            })()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="section">
    <div class="section-title">設計上の推奨事項</div>
    <div class="card" style="line-height: 1.8; font-size: 10px;">
      <ul style="padding-left: 16px;">
        <li><strong>軒・庇:</strong> 正面(${directionLabel(faces.front)})に推奨値 ${eaves.summerEaves.isBehind ? '不要' : eaves.summerEaves.D_recommended + 'm'} の軒を設置し、夏季日射を遮蔽</li>
        <li><strong>開口部:</strong> 正面に大開口を設け冬季日射を最大限取得。西面は小窓＋外付け遮蔽で夏季西日を防止</li>
        <li><strong>通風:</strong> 夏季卓越風向(${directionLabel(windData.summer)})に対し、風上面に給気開口・風下面に排気開口を配置</li>
        <li><strong>断熱:</strong> 日射の少ない北面は高断熱仕様を推奨</li>
        <li><strong>植栽:</strong> 西面に落葉樹を配置し、夏は日陰・冬は日射透過を実現</li>
      </ul>
    </div>
  </div>

  <div class="footer">
    <span>本レポートはシミュレーションに基づく参考資料です。実際の気象条件・周辺環境により結果は異なります。</span>
    <span>2 / 3</span>
  </div>
</div>

<!-- ページ3: 敷地・断熱性能・光熱費 -->
<div class="page">
  <div class="header">
    <h1>パッシブデザイン提案レポート</h1>
    <div class="header-right">
      <div>${address || '未設定'}</div>
      <div>${today}</div>
    </div>
  </div>

  ${siteHtml}

  <div class="section">
    <div class="section-title">断熱性能・省エネ評価</div>
    <div class="card" style="line-height: 1.8; font-size: 10px;">
      <p style="color:#64748b; margin-bottom:8px;">断熱性能の詳細はツール上で壁・屋根・床・窓の仕様を選択して確認してください。</p>
      <ul style="padding-left: 16px;">
        <li><strong>UA値（外皮平均熱貫流率）:</strong> 壁・屋根・床・窓の断熱仕様から自動計算</li>
        <li><strong>断熱等性能等級:</strong> 等級4（省エネ基準）〜 等級7（HEAT20 G3相当）の判定</li>
        <li><strong>ZEH基準:</strong> UA値が地域別基準を満たすか判定</li>
        <li><strong>年間光熱費:</strong> 断熱仕様別の冷暖房費概算と30年間の差額比較</li>
      </ul>
    </div>
  </div>

  <div class="section">
    <div class="section-title">総合まとめ</div>
    <div class="card" style="line-height: 1.8; font-size: 10px;">
      <ul style="padding-left: 16px;">
        <li><strong>パッシブデザイン:</strong> 日照・通風を最大限活用した設計で、冷暖房エネルギーを削減</li>
        <li><strong>軒の出:</strong> 夏季の日射遮蔽と冬季の日射取得を両立する軒の出を推奨</li>
        <li><strong>窓配置:</strong> 方位に応じた開口サイズで日射と遮蔽のバランスを最適化</li>
        <li><strong>断熱性能:</strong> 高断熱仕様（等級5以上）で年間光熱費を大幅に削減可能</li>
        <li><strong>ZEH:</strong> 断熱性能の向上＋太陽光発電でZEH（ネット・ゼロ・エネルギー・ハウス）を実現</li>
      </ul>
    </div>
  </div>

  <div class="footer">
    <span>本レポートはシミュレーションに基づく参考資料です。詳細は設計担当者にご確認ください。</span>
    <span>3 / 3</span>
  </div>
</div>

</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }, [store, eaves]);

  return (
    <button
      onClick={handleExport}
      className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors print:hidden"
    >
      PDFレポート出力
    </button>
  );
}
