import { create } from 'zustand';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem('shift-theme');
  return saved === 'light' ? 'light' : 'dark';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('light', theme === 'light');
  window.localStorage.setItem('shift-theme', theme);
}

interface StoreState {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  isMenuOpen: false,
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),
  theme: getInitialTheme(),
  toggleTheme: () => {
    const next: Theme = get().theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    set({ theme: next });
  },
}));

// Ensure DOM matches store state on load (in case inline script and store disagree)
if (typeof window !== 'undefined') {
  applyTheme(getInitialTheme());
}
