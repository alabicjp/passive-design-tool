import { Season } from '@/types';

export const SEASON_CONFIG: Record<Season, { month: number; day: number; label: string }> = {
  summer_solstice: { month: 6, day: 21, label: '夏至' },
  winter_solstice: { month: 12, day: 21, label: '冬至' },
  equinox: { month: 3, day: 21, label: '春分・秋分' },
};
