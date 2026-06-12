import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Schedule() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      <TouchableOpacity onPress={() => router.push('/modals/subjects')}>
        <Text>Open Subjects</Text>
      </TouchableOpacity>
    </View>
  );
}
