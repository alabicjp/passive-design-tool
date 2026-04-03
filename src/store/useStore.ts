import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ManualBlock, Season, PerformanceMode } from '@/types';
import { DEFAULT_LAT, DEFAULT_LNG } from '@/constants/defaults';

interface StoreState {
  address: string;
  latitude: number;
  longitude: number;
  buildingAzimuth: number;
  season: Season;
  timeHour: number;
  performanceMode: PerformanceMode;
  manualBlocks: ManualBlock[];
  setAddress: (v: string) => void;
  setLatitude: (v: number) => void;
  setLongitude: (v: number) => void;
  setPosition: (lat: number, lng: number) => void;
  setBuildingAzimuth: (v: number) => void;
  setSeason: (v: Season) => void;
  setTimeHour: (v: number) => void;
  setPerformanceMode: (v: PerformanceMode) => void;
  addBlock: (block: ManualBlock) => void;
  updateBlock: (id: string, updates: Partial<ManualBlock>) => void;
  removeBlock: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      address: '',
      latitude: DEFAULT_LAT,
      longitude: DEFAULT_LNG,
      buildingAzimuth: 0,
      season: 'summer_solstice',
      timeHour: 12,
      performanceMode: 'high',
      manualBlocks: [],
      setAddress: (v) => set({ address: v }),
      setLatitude: (v) => set({ latitude: v }),
      setLongitude: (v) => set({ longitude: v }),
      setPosition: (lat, lng) => set({ latitude: lat, longitude: lng }),
      setBuildingAzimuth: (v) => set({ buildingAzimuth: v }),
      setSeason: (v) => set({ season: v }),
      setTimeHour: (v) => set({ timeHour: v }),
      setPerformanceMode: (v) => set({ performanceMode: v }),
      addBlock: (block) => set((s) => ({ manualBlocks: [...s.manualBlocks, block] })),
      updateBlock: (id, updates) =>
        set((s) => ({
          manualBlocks: s.manualBlocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),
      removeBlock: (id) =>
        set((s) => ({ manualBlocks: s.manualBlocks.filter((b) => b.id !== id) })),
    }),
    {
      name: 'passive-design-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
