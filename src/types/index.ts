export interface ManualBlock {
  id: string;
  latitude: number;
  longitude: number;
  width: number;
  depth: number;
  height: number;
  rotation: number;
}

export type Season = 'summer_solstice' | 'winter_solstice' | 'equinox';
export type PerformanceMode = 'high' | 'light';
