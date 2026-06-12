import { useProfileStore } from "@/store/profileStore";
import { useThemeStore } from "@/store/themestore";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function AvatarPicker() {
    const isDark = useThemeStore((state) => state.isDark);

    const { profile, saveProfile } = useProfileStore();

    async function handlePickImage() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && profile) {
            const uri = result.assets[0].uri;
            saveProfile(
                profile.name,
                profile.reg_number,
                profile.gpa,
                profile.credits,
                uri
            );
            router.back();
        }
    }

    async function handleTakePhoto() {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && profile) {
            const uri = result.assets[0].uri;
            saveProfile(
                profile.name,
                profile.reg_number,
                profile.gpa,
                profile.credits,
                uri
            );
            router.back();
        }
    }

    function handleRemove() {
        if (!profile) return;
        saveProfile(
            profile.name,
            profile.reg_number,
            profile.gpa,
            profile.credits,
            null
        );
        router.back();
    }

    const options = [
        {
            icon: 'images-outline',
            label: 'Choose from Library',
            onPress: handlePickImage,
            color: isDark ? '#fff' : '#000',
        },
        {
            icon: 'camera-outline',
            label: 'Take a Photo',
            onPress: handleTakePhoto,
            color: isDark ? '#fff' : '#000',
        },
        ...(profile?.avatar_uri
            ? [{
                icon: 'trash-outline',
                label: 'Remove Photo',
                onPress: handleRemove,
                color: '#ef4444',
            }]
            : []),
    ];

    return (
        <View className={`flex-1 justify-end ${isDark ? 'bg-black/50' : 'bg-black/30'}`}>
            <View className={`rounded-t-3xl px-6 pt-6 pb-10 ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
                <View className="items-center mb-6">
                    <View className={`w-10 h-1 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`} />
                </View>
                <Text className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    Pick a profile photo
                </Text>

                <View className="gap-3">
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.label}
                            onPress={option.onPress}
                            activeOpacity={0.8}
                            className={`flex-row items-center gap-4 px-5 py-4 rounded-2xl ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'
                                }`}>

                            <Ionicons
                                name={option.icon as any}
                                size={22}
                                color={option.color}
                            />

                            <Text
                                className="text-base font-medium"
                                style={{ color: option.color }}
                            >
                                {option.label}
                            </Text>

                        </TouchableOpacity>
                    ))}
                </View>


                {/* Cancel */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    className={`mt-3 px-5 py-4 rounded-2xl items-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                >
                    <Text className={`text-base font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Cancel
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}