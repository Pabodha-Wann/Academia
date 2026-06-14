import { useProfileStore } from '@/store/profileStore';
import { useThemeStore } from '@/store/themestore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type EditableField = 'name' | 'regNumber' | 'gpa' | 'credits' | null;

export default function Profile() {
    const isDark = useThemeStore((state) => state.isDark);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);
    const { profile, loadProfile, saveProfile, initProfile } = useProfileStore();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isSmall = width < 380;

    const [isSetup, setIsSetup] = useState(false);
    const [editingField, setEditingField] = useState<EditableField>(null);

    const [name, setName] = useState("");
    const [regNumber, setRegNumber] = useState("");
    const [gpa, setGpa] = useState("");
    const [credits, setCredits] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        if (profile) {
            setName(profile.name);
            setRegNumber(profile.reg_number);
            setGpa(profile.gpa.toString());
            setCredits(profile.credits.toString());
        }
    }, [profile]);

    function handleSave() {
        if (!name.trim() || !regNumber.trim()) {
            Alert.alert("Error", "Name and registration number are required.");
            return;
        }
        const gpaNum = parseFloat(gpa);
        const creditsNum = parseInt(credits);

        if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4) {
            Alert.alert("Error", "GPA must be between 0 and 4.");
            return;
        }
        if (isNaN(creditsNum) || creditsNum < 0) {
            Alert.alert("Error", "Credits must be a positive number.");
            return;
        }

        if (profile) {
            saveProfile(name.trim(), regNumber.trim(), gpaNum, creditsNum, profile.avatar_uri);
        } else {
            initProfile(name.trim(), regNumber.trim());
        }

        setIsSetup(false);
        setEditingField(null);
    }

    const gpaPercent = profile ? Math.min((profile.gpa / 4) * 100, 100) : 0;

    const hasUnsavedChanges = profile && (
        name.trim() !== profile.name ||
        regNumber.trim() !== profile.reg_number ||
        parseFloat(gpa) !== profile.gpa ||
        parseInt(credits) !== profile.credits
    );

    const fields = [
        { label: 'Full Name', value: name, setter: setName, placeholder: 'e.g. Pabodha', keyboard: 'default' },
        { label: 'Registration Number', value: regNumber, setter: setRegNumber, placeholder: 'e.g. SE/2022/001', keyboard: 'default' },
        { label: 'Current GPA (0 – 4)', value: gpa, setter: setGpa, placeholder: 'e.g. 3.94', keyboard: 'decimal-pad' },
        { label: 'Credits Completed', value: credits, setter: setCredits, placeholder: 'e.g. 90', keyboard: 'number-pad' },
    ];

    if (!profile) {
        return (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-[#FAFAFA]'}`}>
                {/* Hero Section */}
                <View className="flex-[1.2] bg-[#2A2A2A] rounded-b-[48px] items-center justify-center px-8 relative overflow-hidden" style={{ paddingTop: insets.top }}>
                    {/* Decorative Elements */}
                    <View className="absolute -top-10 -right-10 w-40 h-40 bg-[#FCE454]/10 rounded-full" />
                    <View className="absolute bottom-10 -left-10 w-24 h-24 bg-[#FCE454]/20 rounded-full" />

                    <View className="w-28 h-28 bg-[#FCE454] rounded-[32px] items-center justify-center rotate-12 shadow-lg mb-8">
                        <Ionicons name="rocket" size={56} color="#2A2A2A" style={{ transform: [{ rotate: '-12deg' }] }} />
                    </View>
                    <Text className="text-white text-4xl font-black text-center tracking-tight">
                        Own Your{'\n'}Semester.
                    </Text>
                    <Text className="text-zinc-400 text-center mt-4 font-medium text-base px-2">
                        The ultimate companion to track tasks, ace your schedule, and boost your GPA.
                    </Text>
                </View>

                {/* Input Section */}
                <View className="flex-1 px-8 pt-10 pb-10 justify-between">
                    <View>
                        <Text className={`text-xs font-bold uppercase tracking-widest mb-3 ml-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            What should we call you?
                        </Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your first name..."
                            placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                            className={`w-full px-6 py-5 rounded-2xl text-lg font-bold border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-[#2A2A2A]'}`}
                            style={!isDark && { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8 }}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            if (!name.trim()) { Alert.alert('Oops', 'Please enter your name.'); return; }
                            initProfile(name.trim(), ""); // Initializes with name only
                        }}
                        activeOpacity={0.8}
                        className={`w-full py-5 rounded-2xl items-center flex-row justify-center gap-2 ${name.trim() ? 'bg-[#FCE454]' : isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                    >
                        <Text className={`font-bold text-lg ${name.trim() ? 'text-[#2A2A2A]' : isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Let's Go
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color={name.trim() ? '#2A2A2A' : isDark ? '#71717a' : '#a1a1aa'} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-[#FAFAFA]'}`}
                contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between px-6 mb-6">
                    <View className="w-10" />
                    <Text className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                        Profile
                    </Text>
                    <View className="relative">
                        <View className={`w-10 h-10 rounded-full items-center justify-center border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                            <Ionicons name="notifications-outline" size={20} color={isDark ? '#fff' : '#2A2A2A'} />
                        </View>
                        <View className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FCE454] border ${isDark ? 'border-[#121212]' : 'border-white'}`} />
                    </View>
                </View>

                {/* Profile Avatar (Centered) */}
                <View className="px-6 mb-7 items-center">
                    <View
                        className="relative mb-5"
                        style={{ width: isSmall ? 100 : 120 }}
                    >
                        <TouchableOpacity
                            className={`rounded-full items-center justify-center overflow-hidden border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
                            style={{
                                width: isSmall ? 100 : 120,
                                height: isSmall ? 100 : 120,
                                borderRadius: isSmall ? 50 : 60,
                            }}
                            onPress={() => router.push('/modals/avatar-picker')}
                        >
                            {profile?.avatar_uri ? (
                                <Image source={{ uri: profile.avatar_uri }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <Ionicons name="person" size={isSmall ? 52 : 64} color={isDark ? '#fff' : '#2A2A2A'} />
                            )}
                        </TouchableOpacity>
                        <View className={`absolute -right-2 top-1 w-8 h-8 rounded-full bg-[#FCE454] items-center justify-center border-2 ${isDark ? 'border-[#121212]' : 'border-white'}`}>
                            <Ionicons name="checkmark" size={16} color="#2A2A2A" />
                        </View>
                    </View>

                    {/* Centered Name and Registration */}
                    <View className="w-full items-center">
                        {editingField === 'name' ? (
                            <View className="flex-row items-center border-b-2 border-[#FCE454] py-1 mb-1 w-2/3 justify-center">
                                <TextInput
                                    autoFocus
                                    value={name}
                                    onChangeText={setName}
                                    onSubmitEditing={() => setEditingField(null)}
                                    className={`flex-1 font-bold tracking-tight text-center ${isSmall ? 'text-2xl' : 'text-3xl'} ${isDark ? 'text-white' : 'text-[#2A2A2A]'} p-0 m-0`}
                                    placeholder="Enter your name"
                                    placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                                />
                                <TouchableOpacity onPress={() => setEditingField(null)} className="ml-3 bg-[#2A2A2A] dark:bg-zinc-100 rounded-full w-7 h-7 items-center justify-center shadow-sm">
                                    <Ionicons name="checkmark" size={16} color={isDark ? '#2A2A2A' : '#FCE454'} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => setEditingField('name')} activeOpacity={0.7} className="mb-1 flex-row items-center justify-center">
                                <Text
                                    className={`font-bold tracking-tight mr-2 ${isSmall ? 'text-2xl' : 'text-3xl'} ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}
                                    numberOfLines={1}
                                >
                                    {name || "Enter Name"}
                                </Text>
                                <View className={`w-7 h-7 rounded-full items-center justify-center border ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-zinc-50'}`}>
                                    <Ionicons name="pencil-outline" size={12} color={isDark ? '#a1a1aa' : '#71717a'} />
                                </View>
                            </TouchableOpacity>
                        )}

                        {editingField === 'regNumber' ? (
                            <View className="flex-row items-center border-b border-[#FCE454] py-1 w-2/3 justify-center">
                                <TextInput
                                    autoFocus
                                    value={regNumber}
                                    onChangeText={setRegNumber}
                                    onSubmitEditing={() => setEditingField(null)}
                                    className={`flex-1 text-sm text-center ${isDark ? 'text-white' : 'text-[#2A2A2A]'} p-0 m-0`}
                                    placeholder="e.g. SE/2022/001"
                                    placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                                />
                                <TouchableOpacity onPress={() => setEditingField(null)} className="ml-3 bg-[#2A2A2A] dark:bg-zinc-100 rounded-full w-6 h-6 items-center justify-center shadow-sm">
                                    <Ionicons name="checkmark" size={14} color={isDark ? '#2A2A2A' : '#FCE454'} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => setEditingField('regNumber')} activeOpacity={0.7} className="flex-row items-center justify-center">
                                <Text className={`text-sm mr-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                    {regNumber || "Enter Reg Number"}
                                </Text>
                                <View className={`w-6 h-6 rounded-full items-center justify-center border ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-zinc-50'}`}>
                                    <Ionicons name="pencil-outline" size={10} color={isDark ? '#a1a1aa' : '#71717a'} />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Academic Standing */}
                    <View className="w-full mt-6 px-4">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`}>
                                Academic Standing
                            </Text>
                            <Text className={`font-bold tracking-tight ${isSmall ? 'text-lg' : 'text-xl'} ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                                {gpaPercent.toFixed(0)}%
                            </Text>
                        </View>
                        <View className={`w-full rounded-full h-1.5 ${isDark ? 'bg-zinc-850' : 'bg-zinc-200/50'}`}>
                            <View
                                className="rounded-full h-full bg-[#FCE454]"
                                style={{ width: `${gpaPercent}%` }}
                            />
                        </View>
                    </View>
                </View>

                {/* GPA and Credits Completion Row */}
                <View className="flex-row px-6 mb-6" style={{ gap: 12 }}>
                    <View
                        className="flex-1 rounded-3xl overflow-hidden"
                        style={{ height: isSmall ? 120 : 140 }}
                    >
                        <BlurView
                            intensity={isDark ? 30 : 70}
                            tint={isDark ? 'dark' : 'light'}
                            className="flex-1 p-5 justify-between"
                        >
                            <View
                                className={`absolute inset-0 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/60'}`}
                                style={{ borderRadius: 24 }}
                            />
                            <View className="flex-row justify-between items-center">
                                <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                                    <Text className={`text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-650'}`}>GPA</Text>
                                </View>
                            </View>

                            {editingField === 'gpa' ? (
                                <View className="flex-row items-center border-b-2 border-[#FCE454] pb-1 mt-2">
                                    <TextInput
                                        autoFocus
                                        value={gpa}
                                        onChangeText={setGpa}
                                        onSubmitEditing={() => setEditingField(null)}
                                        keyboardType="decimal-pad"
                                        className={`flex-1 font-bold tracking-tighter ${isSmall ? 'text-3xl' : 'text-4xl'} ${isDark ? 'text-white' : 'text-[#2A2A2A]'} p-0 m-0`}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setEditingField(null)}
                                        className="ml-2 bg-[#2A2A2A] dark:bg-zinc-100 rounded-full w-6 h-6 items-center justify-center shadow-sm">
                                        <Ionicons name="checkmark" size={14} color={isDark ? '#2A2A2A' : '#FCE454'} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => setEditingField('gpa')}
                                    activeOpacity={0.7}
                                    className="mt-2 flex-row items-center justify-between">

                                    <Text className={`font-bold tracking-tighter ${isSmall ? 'text-3xl' : 'text-4xl'} ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                                        {gpa || "0.0"}
                                    </Text>
                                    <View className={`w-8 h-8 rounded-full items-center justify-center border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'}`}>
                                        <Ionicons name="pencil" size={12} color={isDark ? '#a1a1aa' : '#71717a'} />
                                    </View>

                                </TouchableOpacity>
                            )}
                        </BlurView>
                    </View>

                    <View
                        className="flex-1 rounded-3xl overflow-hidden"
                        style={{ height: isSmall ? 120 : 140 }}
                    >
                        <BlurView
                            intensity={isDark ? 30 : 70}
                            tint={isDark ? 'dark' : 'extraLight'}
                            className="flex-1 p-5 justify-between"
                        >
                            <View
                                className={`absolute inset-0 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/60'}`}
                                style={{ borderRadius: 24 }}
                            />
                            <View className="flex-row justify-between items-center">
                                <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                                    <Text className={`text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-650'}`}>Credits</Text>
                                </View>
                            </View>

                            {editingField === 'credits' ? (
                                <View className="flex-row items-center border-b-2 border-[#FCE454] pb-1 mt-2">
                                    <TextInput
                                        autoFocus
                                        value={credits}
                                        onChangeText={setCredits}
                                        onSubmitEditing={() => setEditingField(null)}
                                        keyboardType="number-pad"
                                        className={`flex-1 font-bold tracking-tighter ${isSmall ? 'text-3xl' : 'text-4xl'} ${isDark ? 'text-white' : 'text-[#2A2A2A]'} p-0 m-0`}
                                    />
                                    <TouchableOpacity onPress={() => setEditingField(null)} className="ml-2 bg-[#2A2A2A] dark:bg-zinc-100 rounded-full w-6 h-6 items-center justify-center shadow-sm">
                                        <Ionicons name="checkmark" size={14} color={isDark ? '#2A2A2A' : '#FCE454'} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity onPress={() => setEditingField('credits')} activeOpacity={0.7} className="mt-2 flex-row items-center justify-between">
                                    <Text className={`font-bold tracking-tighter ${isSmall ? 'text-3xl' : 'text-4xl'} ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                                        {credits || "0"}
                                    </Text>
                                    <View className={`w-8 h-8 rounded-full items-center justify-center border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/5'}`}>
                                        <Ionicons name="pencil-outline" size={12} color={isDark ? '#a1a1aa' : '#71717a'} />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </BlurView>
                    </View>
                </View>

                {/* Settings Section */}
                <View className="px-6 mt-2">
                    <Text className={`text-[10px] font-bold tracking-widest uppercase mb-4 ml-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        Settings
                    </Text>

                    <View className={`flex-row items-center justify-between rounded-full px-5 py-3.5 mb-3 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-150'}`} style={!isDark && { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8 }}>
                        <View className="flex-row items-center" style={{ gap: 14 }}>
                            <View className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                                <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={16} color={isDark ? '#fff' : '#2A2A2A'} />
                            </View>
                            <Text className={`text-sm font-medium ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                                Dark Mode
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={toggleTheme}
                            activeOpacity={0.8}
                            className={`rounded-full justify-center ${isDark ? 'bg-[#FCE454]' : 'bg-zinc-200'}`}
                            style={{ width: 50, height: 28, paddingHorizontal: 3 }}
                        >
                            <View
                                className="w-6 h-6 rounded-full bg-white items-center justify-center"
                                style={{ alignSelf: isDark ? 'flex-end' : 'flex-start' }}
                            >
                                <Ionicons
                                    name={isDark ? 'moon' : 'sunny'}
                                    size={11}
                                    color={isDark ? '#2A2A2A' : '#f59e0b'}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className={`flex-row items-center justify-between rounded-full px-5 py-3.5 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-150'}`}
                        style={!isDark && { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8 }}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center" style={{ gap: 14 }}>
                            <View className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                                <Ionicons name="information-circle-outline" size={16} color={isDark ? '#fff' : '#2A2A2A'} />
                            </View>
                            <Text className={`text-sm font-medium ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                                About
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={isDark ? '#52525b' : '#a1a1aa'} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Unsaved Changes Banner */}
            {hasUnsavedChanges && (
                <View
                    className="absolute bottom-6 left-6 right-6"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 10
                    }}
                >
                    <TouchableOpacity
                        className="bg-zinc-900 dark:bg-zinc-800 py-4 px-6 rounded-full flex-row items-center justify-between border border-zinc-800"
                        onPress={handleSave}
                        activeOpacity={0.9}
                    >
                        <Text className="text-white font-semibold text-base">Unsaved changes</Text>
                        <View className="bg-[#FCE454] px-4 py-1.5 rounded-full">
                            <Text className="text-[#2A2A2A] font-bold text-sm">Save</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}