import { create } from "zustand";

interface NavigationState {
  isQuickAddOpen: boolean;
  isMoreOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  setMoreOpen: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isQuickAddOpen: false,
  isMoreOpen: false,
  setQuickAddOpen: (open) => set({ isQuickAddOpen: open }),
  setMoreOpen: (open) => set({ isMoreOpen: open }),
}));
