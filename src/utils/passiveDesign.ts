// 建物方位角（南=0°）から各面の実際の方角を計算
// 戻り値は北=0°基準の方位角
export function getFaceDirections(buildingAzimuth: number) {
  // 建物正面の方位（北=0°基準）= 180 + buildingAzimuth
  const front = ((180 + buildingAzimuth) % 360 + 360) % 360;
  const right = (front + 90) % 360;
  const back = (front + 180) % 360;
  const left = (front + 270) % 360;
  return { front, right, back, left };
}

export function directionLabel(deg: number): string {
  const dirs = ['北', '北北東', '北東', '東北東', '東', '東南東', '南東', '南南東', '南', '南南西', '南西', '西南西', '西', '西北西', '北西', '北北西'];
  const index = Math.round(((deg % 360 + 360) % 360) / 22.5) % 16;
  return dirs[index];
}

export interface WindowRecommendation {
  face: string;
  direction: string;
  size: string;
  note: string;
}

export function getWindowRecommendations(buildingAzimuth: number): WindowRecommendation[] {
  const dirs = getFaceDirections(buildingAzimuth);
  return [
    {
      face: '正面',
      direction: directionLabel(dirs.front) + '向き',
      size: '大開口',
      note: '深い軒で夏の日射を遮蔽し、冬の日射を取得',
    },
    {
      face: '右側面',
      direction: directionLabel(dirs.right) + '向き',
      size: '中程度',
      note: '朝日の採光に有効。夏の過熱リスクは西面より低い',
    },
    {
      face: '左側面',
      direction: directionLabel(dirs.left) + '向き',
      size: '小窓＋外付け遮蔽',
      note: '夏の西日は低角度で室内深くまで差し込むため遮蔽が重要',
    },
    {
      face: '背面',
      direction: directionLabel(dirs.back) + '向き',
      size: '小窓',
      note: '安定した間接光と通風用',
    },
  ];
}
