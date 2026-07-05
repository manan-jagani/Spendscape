import { create } from "zustand";

interface ShellState {
  isCommandPaletteOpen: boolean;
  isMobileNavigationOpen: boolean;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  setMobileNavigationOpen: (isOpen: boolean) => void;
}

export const useShellStore = create<ShellState>((set) => ({
  isCommandPaletteOpen: false,
  isMobileNavigationOpen: false,
  setCommandPaletteOpen: (isOpen) =>
    set({ isCommandPaletteOpen: isOpen }),
  setMobileNavigationOpen: (isOpen) =>
    set({ isMobileNavigationOpen: isOpen }),
}));
