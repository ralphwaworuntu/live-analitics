// @ts-ignore
import { create } from 'zustand';

interface MobileState {
  isSOSActive: boolean;
  me: { id: string; name: string; nrp: string } | null;
  toggleSOS: () => void;
  setMe: (user: { id: string; name: string; nrp: string }) => void;
}

export const useAppStore = create<MobileState>((set: any) => ({
  isSOSActive: false,
  me: { id: 'm-01', name: 'Bripda Andi', nrp: '88050912' }, // Mock current user
  toggleSOS: () => set((state: MobileState) => ({ isSOSActive: !state.isSOSActive })),
  setMe: (user: { id: string; name: string; nrp: string }) => set({ me: user }),
}));
