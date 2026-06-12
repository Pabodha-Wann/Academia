import { useProfileStore } from '@/store/profileStore';
import { useThemeStore } from '@/store/themestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Profile() {
    const isDark = useThemeStore((state) => state.isDark)
    const toggleTheme = useThemeStore((state) => state.toggleTheme)
    const { profile, loadProfile, saveProfile, initProfile } = useProfileStore();
    const insets = useSafeAreaInsets();

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const [regNumber, setRegNumber] = useState("");
    const [gpa, setGpa] = useState("");
    const [credits, setCredits] = useState("");


    useEffect(() => {
        loadProfile();
    }, [])

    useEffect(() => {
        if (profile) {
            setName(profile.name);
            setRegNumber(profile.reg_number);
            setGpa(profile.gpa.toString());
            setCredits(profile.credits.toString());
        }
    }, [profile])


    function handleSave() {
        if (!name.trim() || !regNumber.trim()) {
            Alert.alert("Error", "Name and registration number are required.");
            return;
        }

        const gpaNum = parseFloat(gpa)
        const creditsNum = parseInt(credits)

        if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4) {
            Alert.alert("Error", "GPA must be between 0 and 4.");
            return;
        }

        if (isNaN(creditsNum) || creditsNum < 0) {
            Alert.alert("Error", "Credits must be a positive number.");
            return;
        }

        if (profile) {
            saveProfile(name.trim(), regNumber.trim(), gpaNum, creditsNum)
        } else {
            initProfile(name.trim(), regNumber.trim())
        }

        setEditing(false)
    }

    if (!profile && !editing) {
        return (
            <View className={`flex-1 items-center justify-center px-6 ${isDark ? "bg-zinc-950" : "bg-gray-50"}`}>
                <View className={`w-32 h-32 rounded-full items-center justify-center mb-8 ${isDark ? "bg-zinc-900" : "bg-white shadow-sm"}`}>
                    <Ionicons name="person" size={64} color="#ff4d8d" />
                    <View className="absolute top-0 right-0 w-8 h-8 bg-pink-500 rounded-full items-center justify-center border-2 border-white">
                        <Ionicons name="sparkles" size={16} color="white" />
                    </View>
                </View>
                <Text className={`text-3xl font-bold text-center mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                    Welcome!
                </Text>
                <Text className={`text-base text-center mb-10 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Let's set up your profile to personalize your experience.
                </Text>
                <TouchableOpacity
                    className="bg-pink-500 w-full py-4 rounded-full items-center shadow-sm"
                    onPress={() => setEditing(true)}
                >
                    <Text className="text-white font-bold text-lg">
                        Set Up Profile
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (editing) {
        return (
            <ScrollView
                className={`flex-1 ${isDark ? "bg-zinc-950" : "bg-gray-50"}`}
                contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 40, paddingHorizontal: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="flex-row items-center mb-10">
                    <TouchableOpacity 
                        onPress={() => profile ? setEditing(false) : null}
                        className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isDark ? 'bg-zinc-900' : 'bg-white shadow-sm'}`}
                    >
                        <Ionicons name={profile ? "arrow-back" : "person-outline"} size={20} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {profile ? "Edit Profile" : "Setup Profile"}
                    </Text>
                </View>

                <View className={`rounded-[32px] p-6 mb-8 ${isDark ? 'bg-zinc-900' : 'bg-white shadow-sm'}`}>
                    {/* Full Name */}
                    <Text className={`text-sm font-medium mb-2 ml-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Full Name
                    </Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder='e.g. Maria Barry'
                        placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                        className={`rounded-2xl px-5 py-4 mb-5 text-base font-medium ${isDark ? "bg-zinc-950 text-white" : "bg-gray-50 text-gray-900"}`}
                    />

                    {/* Reg Number */}
                    <Text className={`text-sm font-medium mb-2 ml-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Registration Number
                    </Text>
                    <TextInput
                        value={regNumber}
                        onChangeText={setRegNumber}
                        placeholder="e.g. SE/2022/001"
                        placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                        className={`rounded-2xl px-5 py-4 mb-5 text-base font-medium ${isDark ? "bg-zinc-950 text-white" : "bg-gray-50 text-gray-900"}`}
                    />

                    {/* GPA */}
                    <Text className={`text-sm font-medium mb-2 ml-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Current GPA
                    </Text>
                    <TextInput
                        value={gpa}
                        onChangeText={setGpa}
                        placeholder="e.g. 3.8"
                        keyboardType="decimal-pad"
                        placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                        className={`rounded-2xl px-5 py-4 mb-5 text-base font-medium ${isDark ? "bg-zinc-950 text-white" : "bg-gray-50 text-gray-900"}`}
                    />

                    {/* Credits */}
                    <Text className={`text-sm font-medium mb-2 ml-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Credits Completed
                    </Text>
                    <TextInput
                        value={credits}
                        onChangeText={setCredits}
                        placeholder="e.g. 90"
                        keyboardType="number-pad"
                        placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                        className={`rounded-2xl px-5 py-4 mb-2 text-base font-medium ${isDark ? "bg-zinc-950 text-white" : "bg-gray-50 text-gray-900"}`}
                    />
                </View>

                {/* Buttons */}
                <TouchableOpacity
                    className="bg-pink-500 py-4 rounded-full items-center mb-4 shadow-sm"
                    onPress={handleSave}
                >
                    <Text className="text-white font-bold text-lg">
                        Save Profile
                    </Text>
                </TouchableOpacity>

                {profile && (
                    <TouchableOpacity
                        className={`py-4 rounded-full items-center ${isDark ? "bg-zinc-900" : "bg-white shadow-sm"}`}
                        onPress={() => setEditing(false)}
                    >
                        <Text className={`font-bold text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        )
    }
    return (
        <ScrollView
            className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-gray-50'}`}
            contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
        >
            <View className="px-6">
                {/* Header */}
                <View className="flex-row items-center justify-between mb-8">
                    <View className="w-10" />
                    <Text className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Profile
                    </Text>
                    <View className={`w-10 h-10 rounded-full items-center justify-center relative ${isDark ? 'bg-zinc-800' : 'bg-white shadow-sm'}`}>
                        <Ionicons name="notifications-outline" size={20} color={isDark ? '#fff' : '#000'} />
                        <View className="absolute top-2 right-2.5 w-2 h-2 bg-pink-500 rounded-full" />
                    </View>
                </View>

                {/* Main Profile Card */}
                <View className={`rounded-[32px] p-6 mb-6 overflow-hidden ${isDark ? 'bg-zinc-900' : 'bg-white shadow-sm'}`}>
                    <View className="items-center mb-6 relative">
                        {/* Checkmark Badge */}
                        <View className="absolute top-2 left-10 w-8 h-8 bg-pink-500 rounded-full items-center justify-center border-2 border-white z-10">
                            <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                        
                        <View className="w-28 h-28 rounded-full bg-pink-100 items-center justify-center mb-4 relative overflow-hidden">
                            <Ionicons name='person' size={60} color="#ff4d8d" />
                            {/* Glassmorphism Effect */}
                            <BlurView 
                                intensity={60} 
                                tint={isDark ? "dark" : "light"} 
                                className="absolute bottom-0 w-full h-1/3 items-center justify-center"
                            />
                        </View>
                        
                        <View className="flex-row items-center justify-between w-full">
                            <View>
                                <Text className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {profile?.name}
                                </Text>
                                <Text className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    {profile?.reg_number}
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => setEditing(true)}
                                className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-gray-50 border border-gray-100'}`}
                            >
                                <Ionicons name="pencil-outline" size={18} color={isDark ? '#fff' : '#000'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Stats / Cards side-by-side */}
                <View className="flex-row gap-4 mb-8">
                    <View className={`flex-1 rounded-[32px] p-5 justify-between h-36 ${isDark ? "bg-zinc-900" : "bg-white shadow-sm"}`}>
                        <View className="flex-row justify-between items-start">
                            <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                                <Text className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>GPA</Text>
                            </View>
                            <Ionicons name="arrow-up-outline" size={16} color={isDark ? '#fff' : '#000'} />
                        </View>
                        <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {profile?.gpa.toFixed(2)}
                        </Text>
                    </View>

                    <View className={`flex-1 rounded-[32px] p-5 justify-between h-36 ${isDark ? "bg-zinc-900" : "bg-white shadow-sm"}`}>
                        <View className="flex-row justify-between items-start">
                            <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                                <Text className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Credits</Text>
                            </View>
                            <View className={`w-6 h-6 rounded-full items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                                <Ionicons name="star" size={12} color={isDark ? '#fff' : '#000'} />
                            </View>
                        </View>
                        <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {profile?.credits}
                        </Text>
                    </View>
                </View>

                {/* Setting Section */}
                <Text className={`text-lg font-medium mb-4 ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Setting
                </Text>

                {/* Dark Mode Toggle */}
                <View
                    className={`flex-row items-center justify-between rounded-full px-6 py-4 mb-4 ${isDark ? "bg-zinc-900" : "bg-white shadow-sm"
                        }`}
                >
                    <View className="flex-row items-center gap-4">
                        <View className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                            <Ionicons
                                name={isDark ? "moon-outline" : "sunny-outline"}
                                size={18}
                                color={isDark ? "#fff" : "#000"}
                            />
                        </View>
                        <Text
                            className={`font-medium ${isDark ? "text-white" : "text-gray-900"
                                }`}
                        >
                            Dark Mode
                        </Text>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: "#e5e7eb", true: "#ff4d8d" }}
                        thumbColor="#ffffff"
                    />
                </View>

            </View>
        </ScrollView>
    );
}

export default Profile;