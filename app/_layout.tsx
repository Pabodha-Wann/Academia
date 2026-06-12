import { initializeDatabase } from "@/database/schema";
import { useThemeStore } from "@/store/themestore";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Appearance } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import '../global.css';

export default function RootLayout() {
  const syncWithSystem = useThemeStore((state) => state.syncWithSystem)

  useEffect(() => {
    initializeDatabase();

    const subscription = Appearance.addChangeListener(() => {
      syncWithSystem();
    })

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
