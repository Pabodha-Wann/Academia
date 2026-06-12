import { initializeDatabase } from "@/database/schema";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
