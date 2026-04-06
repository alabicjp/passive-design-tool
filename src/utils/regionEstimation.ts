// 緯度から省エネ基準の地域区分（1〜8地域）を簡易推定
// 正式には市区町村単位で告示に定められているが、簡易版として緯度で推定
export function estimateRegion(lat: number): number {
  if (lat >= 43.5) return 1;  // 北海道北部
  if (lat >= 42.0) return 2;  // 北海道南部
  if (lat >= 39.5) return 3;  // 東北北部
  if (lat >= 37.0) return 4;  // 東北南部〜北関東
  if (lat >= 35.5) return 5;  // 関東〜中部
  if (lat >= 33.0) return 6;  // 近畿〜中国〜四国（三重県含む）
  if (lat >= 27.0) return 7;  // 九州
  return 8;                    // 沖縄
}
