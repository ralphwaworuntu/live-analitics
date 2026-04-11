// @ts-ignore
import { create } from 'zustand';

interface MobileState {
  isSOSActive: boolean;
  me: { id: string; name: string; nrp: string } | null;
  assetId: string | null;
  currentHash: string;
  toggleSOS: () => void;
  setMe: (user: { id: string; name: string; nrp: string }) => void;
  setAssetId: (id: string) => void;
  setCurrentHash: (hash: string) => void;
}

export const useAppStore = create<MobileState>((set: any) => ({
  isSOSActive: false,
  me: { id: 'm-01', name: 'Bripda Andi', nrp: '88050912' }, 
  assetId: null,
  currentHash: 'SEC-0000-0000',
  toggleSOS: () => set((state: MobileState) => ({ isSOSActive: !state.isSOSActive })),
  setMe: (user: { id: string; name: string; nrp: string }) => set({ me: user }),
  setAssetId: (id: string) => set({ assetId: id }),
  setCurrentHash: (hash: string) => set({ currentHash: hash }),
}));
