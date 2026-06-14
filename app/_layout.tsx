import { initializeDatabase } from "@/database/schema";
import { useThemeStore } from "@/store/themestore";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";
import { Appearance } from "react-native";
import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const syncWithSystem = useThemeStore((state) => state.syncWithSystem);

  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
  });

  useEffect(() => {
    initializeDatabase();

    const subscription = Appearance.addChangeListener(() => {
      syncWithSystem();
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />

      <Stack.Screen
        name="modals/avatar-picker"
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
        }}
      />

      <Stack.Screen
        name="modals/subjects"
        options={{
          presentation: 'modal',
          animation: 'simple_push'
        }} />

      <Stack.Screen
        name="modals/add-schedule"
        options={{
          presentation: 'transparentModal',
          animation: 'simple_push',
        }}
      />

      <Stack.Screen
        name="modals/add-task"
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
