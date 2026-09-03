// src/store/useUIStore.ts
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  aiPanelOpen: boolean;
  toggleSidebar: () => void;
  toggleAiPanel: () => void;
  setAiPanelOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  aiPanelOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleAiPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
  setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
}));
