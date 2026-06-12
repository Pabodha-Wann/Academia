import { Appearance } from "react-native";
import { create } from 'zustand';


interface ThemeStore {
    isDark: boolean;
    toggleTheme: () => void;
    syncWithSystem: () => void;
}

export const useThemeStore = create<ThemeStore>((set: any) => ({
    isDark: Appearance.getColorScheme() === "dark",

    toggleTheme: () => set((state: any) => ({
        isDark: !state.isDark
    })),

    syncWithSystem: () => set(() => ({ isDark: Appearance.getColorScheme() === "dark" }))
}))