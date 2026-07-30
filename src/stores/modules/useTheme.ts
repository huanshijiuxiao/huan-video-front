import { computed, ref } from "vue";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "huan-video-theme";
const isDark = ref(false);

function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getSavedTheme(): ThemeMode | null {
  if (typeof window === "undefined") {
    return null;
  }

  const theme = window.localStorage.getItem(STORAGE_KEY);
  return theme === "light" || theme === "dark" ? theme : null;
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  isDark.value = theme === "dark";
  document.documentElement.classList.toggle("dark", isDark.value);
  document.documentElement.style.colorScheme = theme;
}

export function useTheme() {
  const themeLabel = computed(() => (isDark.value ? "夜间模式" : "日间模式"));

  function initTheme() {
    applyTheme(getSavedTheme() ?? getSystemTheme());
  }

  function toggleTheme() {
    const nextTheme: ThemeMode = isDark.value ? "light" : "dark";
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  return {
    isDark,
    themeLabel,
    initTheme,
    toggleTheme,
  };
}
