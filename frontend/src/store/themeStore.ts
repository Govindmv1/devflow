import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  initialize: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: true,

  initialize: () => {
    const stored = localStorage.getItem('df-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored !== null ? stored === 'dark' : prefersDark !== false;

    applyTheme(isDark);
    set({ isDark });
  },

  toggle: () => {
    set((state) => {
      const newDark = !state.isDark;
      applyTheme(newDark);
      localStorage.setItem('df-theme', newDark ? 'dark' : 'light');
      return { isDark: newDark };
    });
  },
}));

function applyTheme(isDark: boolean) {
  const html = document.documentElement;
  if (isDark) {
    html.classList.remove('light');
    // no dark class needed — dark is the default :root
  } else {
    html.classList.add('light');
  }
}
