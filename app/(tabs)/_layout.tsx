import { useNotficationStore } from "@/store/notificationStore";
import { useThemeStore } from "@/store/themestore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs, router } from "expo-router";
import { useEffect } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomHeader() {
  const isDark = useThemeStore((state) => state.isDark);
  const insets = useSafeAreaInsets();
  const { unreadCount, loadNotifications } = useNotficationStore();

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <View
      style={{ paddingTop: insets.top + 8 }}
      className={`flex-row items-center justify-between px-6 pb-4 ${isDark ? 'bg-[#121212] border-zinc-900' : 'bg-[#FAFAFA] border-zinc-150'
        }`}
    >
      {/* Left side: Logo */}
      <View className="flex-row items-center gap-2">
        <Image source={require("@/assets/images/logo.png")} className="w-8 h-8" />
        <Text className={`text-lg font-black tracking-widest ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
          ACADEMIA
        </Text>
      </View>

      {/* Right side: Notification Button */}
      <View className="relative">
        <TouchableOpacity
          onPress={() => router.push('/modals/notifications')}
          activeOpacity={0.7}
          className={`w-10 h-10 rounded-full items-center justify-center border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
            }`}
        >
          <Ionicons name="notifications-outline" size={20} color={isDark ? '#fff' : '#2A2A2A'} />
        </TouchableOpacity>
        {unreadCount > 0 && (
          <View className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FCE454] border ${isDark ? 'border-[#121212]' : 'border-white'}`} />
        )}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <CustomHeader />,
        tabBarActiveTintColor: isDark ? "#ffffff" : "#111111",
        tabBarInactiveTintColor: isDark ? "#6b7280" : "#9ca3af",
        tabBarStyle: {
          backgroundColor: isDark ? "#1c1c1e" : "#ffffff",
          borderTopWidth: 0.5,
          borderTopColor: isDark ? "#2c2c2e" : "#e5e7eb",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}