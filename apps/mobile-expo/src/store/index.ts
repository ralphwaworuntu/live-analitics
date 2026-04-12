// @ts-ignore
import { create } from 'zustand';

interface MobileState {
  isSOSActive: boolean;
  me: { id: string; name: string; nrp: string } | null;
  assetId: string | null;
  nrp: string;
  userName: string;
  currentHash: string;
  riskScore: number; // 0-100
  activeAlerts: any[];
  briefing: string | null;
  peers: Record<string, any>;
  toggleSOS: () => void;
  setMe: (user: { id: string; name: string; nrp: string }) => void;
  setAssetId: (id: string) => void;
  setCurrentHash: (hash: string) => void;
  setRiskScore: (score: number) => void;
  addAlert: (alert: any) => void;
  removeAlert: (id: string) => void;
  setBriefing: (text: string) => void;
  updatePeer: (id: string, data: any) => void;
  missionStatus: 'IDLE' | 'ACTIVE' | 'FINISHED';
  setMissionStatus: (status: 'IDLE' | 'ACTIVE' | 'FINISHED') => void;
  resetMission: () => void;
}

export const useAppStore = create<MobileState>((set: any) => ({
  isSOSActive: false,
  me: { id: 'm-01', name: 'Bripda Andi', nrp: '88050912' }, 
  assetId: 'UNIT-001',
  nrp: '88050912',
  userName: 'Bripda Andi',
  currentHash: 'SEC-0000-0000',
  riskScore: 0,
  activeAlerts: [],
  briefing: "Silahkan lakukan patroli di area Pasar Oeba. Monitor kerumunan massa.",
  peers: {},
  missionStatus: 'IDLE',
  toggleSOS: () => set((state: MobileState) => ({ isSOSActive: !state.isSOSActive })),
  setMe: (user: { id: string; name: string; nrp: string }) => set({ 
    me: user, 
    nrp: user.nrp, 
    userName: user.name,
    assetId: `UNIT-${user.nrp.slice(-3)}`
  }),
  setAssetId: (id: string) => set({ assetId: id }),
  setCurrentHash: (hash: string) => set({ currentHash: hash }),
  setRiskScore: (score: number) => set({ riskScore: score }),
  addAlert: (alert: any) => set((state: any) => ({ activeAlerts: [alert, ...state.activeAlerts].slice(0, 3) })),
  removeAlert: (id: string) => set((state: any) => ({ activeAlerts: state.activeAlerts.filter((a: any) => a.id !== id) })),
  setBriefing: (text: string) => set({ briefing: text }),
  updatePeer: (id: string, data: any) => set((state: any) => ({
    peers: {
      ...state.peers,
      [id]: { ...state.peers[id], ...data, lastSeen: Date.now() }
    }
  })),
  setMissionStatus: (status: 'IDLE' | 'ACTIVE' | 'FINISHED') => set({ missionStatus: status }),
  resetMission: () => set({
    missionStatus: 'IDLE',
    assetId: null,
    nrp: '',
    userName: '',
    riskScore: 0,
    activeAlerts: [],
    peers: {},
    isSOSActive: false,
    currentHash: 'SEC-0000-0000',
    briefing: null
  }),
}));
