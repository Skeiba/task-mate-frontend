import { defineStore } from "pinia";
import { ref, watch } from "vue";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const useThemeStore = defineStore("theme", () => {
    const storageKey = "theme-preference";
    const attribute = "data-theme";

    const theme = ref<Theme>("light");
    const resolvedTheme = ref<ResolvedTheme>("light");

    const getSystemTheme = (): ResolvedTheme => {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    };

    const resolveTheme = (currentTheme: Theme): ResolvedTheme => {
        if (currentTheme === "system") {
            return getSystemTheme();
        }
        return currentTheme as ResolvedTheme;
    };

    const applyTheme = (newResolved: ResolvedTheme) => {
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(newResolved);
        root.setAttribute(attribute, newResolved);
    };

    const initTheme = () => {
        const stored = localStorage.getItem(storageKey) as Theme | null;
        theme.value = stored && ["light", "dark", "system"].includes(stored)
            ? stored
            : "light";
        resolvedTheme.value = resolveTheme(theme.value);
        applyTheme(resolvedTheme.value);
    };

    watch(theme, (newTheme) => {
        localStorage.setItem(storageKey, newTheme);
        const newResolved = resolveTheme(newTheme);
        resolvedTheme.value = newResolved;
        applyTheme(newResolved);
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => {
        if (theme.value === "system") {
            resolvedTheme.value = getSystemTheme();
            applyTheme(resolvedTheme.value);
        }
    });

    const toggleTheme = () => {
        theme.value = resolvedTheme.value === "light" ? "dark" : "light";
    };

    return {
        theme,
        resolvedTheme,
        initTheme,
        setTheme: (newTheme: Theme) => (theme.value = newTheme),
        toggleTheme,
    };
});
