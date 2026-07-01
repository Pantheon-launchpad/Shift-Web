import { create } from 'zustand';

interface StoreState {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useStore = create<StoreState>((set) => ({
  isMenuOpen: false,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));