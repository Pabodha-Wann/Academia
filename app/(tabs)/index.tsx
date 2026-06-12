import { useThemeStore } from '@/store/themestore';
import { Text, View } from 'react-native';

export default function Dashboard() {
  const isDark = useThemeStore((state) => state.isDark);
  return (
    <View className={`flex-1 items-center justify-center ${isDark ? 'bg-black' : 'bg-white'}`}>
      <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Dashboard 🏠
      </Text>
    </View>
  );
}