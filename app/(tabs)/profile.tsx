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

    if (!profile && !isSetup) {
        return (
            <View className={`flex-1 items-center justify-center px-8 ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
                <View className="w-40 h-40 rounded-full bg-pink-100 items-center justify-center mb-8">
                    <Ionicons name="person" size={isSmall ? 64 : 80} color="#ff4d8d" />
                    <View className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-pink-500 items-center justify-center border-2 ${isDark ? 'border-zinc-950' : 'border-white'}`}>
                        <Ionicons name="sparkles" size={14} color="#fff" />
                    </View>
                </View>
                <Text className={`font-bold text-center mb-3 ${isSmall ? 'text-2xl' : 'text-3xl'} ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    Welcome!
                </Text>
                <Text className={`text-sm text-center leading-6 mb-10 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Let's set up your profile to get started.
                </Text>
                <TouchableOpacity
                    className="bg-pink-500 w-full py-4 rounded-full items-center"
                    onPress={() => setIsSetup(true)}
                    activeOpacity={0.85}
                >
                    <Text className="text-white font-bold text-base">Set Up Profile</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (isSetup && !profile) {
        return (
            <ScrollView
                className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}
                contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 48, paddingHorizontal: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-row items-center mb-10">
                    <TouchableOpacity
                        onPress={() => setIsSetup(false)}
                        className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}
                    >
                        <Ionicons name="arrow-back" size={20} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text className={`font-bold ${isSmall ? 'text-xl' : 'text-2xl'} ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Setup Profile
                    </Text>
                </View>

                <View className={`rounded-3xl p-6 mb-6 ${isDark ? 'bg-zinc-900' : 'bg-zinc-50'}`}>
                    {fields.map((field, i) => (
                        <View key={field.label} className={i < fields.length - 1 ? 'mb-5' : ''}>
                            <Text className={`text-xs font-semibold mb-2 ml-1 tracking-widest uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                {field.label}
                            </Text>
                            <TextInput
                                value={field.value}
                                onChangeText={field.setter}
                                placeholder={field.placeholder}
                                placeholderTextColor={isDark ? '#3f3f46' : '#d4d4d8'}
                                keyboardType={field.keyboard as any}
                                className={`rounded-2xl px-5 py-4 text-base font-medium ${isDark ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900'}`}
                            />
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    className="bg-pink-500 py-4 rounded-full items-center"
                    onPress={handleSave}
                    activeOpacity={0.85}
                >
                    <Text className="text-white font-bold text-base">Save Profile</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-white'}`}
                contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 140 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-row items-center justify-between px-6 mb-6">
                    <View className="w-10" />
                    <Text className={`font-semibold text-base tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Profile
                    </Text>
                    <View className="relative">
                        <View className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                            <Ionicons name="notifications-outline" size={20} color={isDark ? '#fff' : '#000'} />
                        </View>
                        <View className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500 border ${isDark ? 'border-zinc-950' : 'border-white'}`} />
                    </View>
                </View>

                <View className="px-6 mb-7">
                    <View
                        className="relative mb-5"
                        style={{ width: isSmall ? 100 : 120 }}
                    >
                        <TouchableOpacity
                            className="rounded-full bg-pink-100 items-center justify-center overflow-hidden"
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
                                <Ionicons name="person" size={isSmall ? 52 : 64} color="#ff4d8d" />
                            )}
                        </TouchableOpacity>
                        <View className={`absolute -left-2 top-1 w-8 h-8 rounded-full bg-pink-500 items-center justify-center border-2 ${isDark ? 'border-zinc-950' : 'border-white'}`}>
                            <Ionicons name="checkmark" size={16} color="#fff" />
                        </View>
                    </View>

                    <View className="w-full">
                        {editingField === 'name' ? (
                            <View className="flex-row items-center border-b-2 border-pink-500 py-1 mb-1 w-full">
                                <TextInput
                                    autoFocus
                                    value={name}
                                    onChangeText={setName}
                                    onSubmitEditing={() => setEditingField(null)}
                                    className={`flex-1 font-bold tracking-tight ${isSmall ? 'text-2xl' : 'text-3xl'} ${isDark ? 'text-white' : 'text-zinc-900'} p-0 m-0`}
                                    placeholder="Enter your name"
                                    placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                                />
                                <TouchableOpacity onPress={() => setEditingField(null)} className="ml-3 bg-pink-500 rounded-full w-7 h-7 items-center justify-center shadow-sm">
                                    <Ionicons name="checkmark" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => setEditingField('name')} activeOpacity={0.7} className="mb-1 flex-row items-center">
                                <Text
                                    className={`font-bold tracking-tight mr-2 ${isSmall ? 'text-2xl' : 'text-3xl'} ${isDark ? 'text-white' : 'text-zinc-900'}`}
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
                            <View className="flex-row items-center border-b border-pink-500 py-1 w-2/3">
                                <TextInput
                                    autoFocus
                                    value={regNumber}
                                    onChangeText={setRegNumber}
                                    onSubmitEditing={() => setEditingField(null)}
                                    className={`flex-1 text-sm ${isDark ? 'text-white' : 'text-zinc-900'} p-0 m-0`}
                                    placeholder="e.g. SE/2022/001"
                                    placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                                />
                                <TouchableOpacity onPress={() => setEditingField(null)} className="ml-3 bg-pink-500 rounded-full w-6 h-6 items-center justify-center shadow-sm">
                                    <Ionicons name="checkmark" size={14} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => setEditingField('regNumber')} activeOpacity={0.7} className="flex-row items-center">
                                <Text className={`text-sm mr-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                    {regNumber || "Enter Reg Number"}
                                </Text>
                                <View className={`w-6 h-6 rounded-full items-center justify-center border ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-zinc-50'}`}>
                                    <Ionicons name="pencil-outline" size={10} color={isDark ? '#a1a1aa' : '#71717a'} />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="w-full mt-6">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`}>
                                Academic Standing
                            </Text>
                            <Text className={`font-bold tracking-tight ${isSmall ? 'text-lg' : 'text-xl'} ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                {gpaPercent.toFixed(0)}%
                            </Text>
                        </View>
                        <View className={`w-full rounded-full h-1.5 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                            <View
                                className={`rounded-full h-full ${isDark ? 'bg-white' : 'bg-zinc-900'}`}
                                style={{ width: `${gpaPercent}%` }}
                            />
                        </View>
                    </View>
                </View>

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
                                className={`absolute inset-0 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white'}`}
                                style={{ borderRadius: 24 }}
                            />
                            <View className="flex-row justify-between items-center">
                                <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                                    <Text className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-500'}`}>GPA</Text>
                                </View>
                            </View>

                            {editingField === 'gpa' ? (
                                <View className="flex-row items-center border-b-2 border-pink-500 pb-1 mt-2">
                                    <TextInput
                                        autoFocus
                                        value={gpa}
                                        onChangeText={setGpa}
                                        onSubmitEditing={() => setEditingField(null)}
                                        keyboardType="decimal-pad"
                                        className={`flex-1 font-bold tracking-tighter ${isSmall ? 'text-3xl' : 'text-4xl'} ${isDark ? 'text-white' : 'text-zinc-900'} p-0 m-0`}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setEditingField(null)}
                                        className="ml-2 bg-pink-500 rounded-full w-6 h-6 items-center justify-center shadow-sm">
                                        <Ionicons name="checkmark" size={14} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => setEditingField('gpa')}
                                    activeOpacity={0.7}
                                    className="mt-2 flex-row items-center justify-between">

                                    <Text className={`font-bold tracking-tighter ${isSmall ? 'text-3xl' : 'text-4xl'} ${isDark ? 'text-white' : 'text-zinc-900'}`}>
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
                                className={`absolute inset-0 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white'}`}
                                style={{ borderRadius: 24 }}
                            />
                            <View className="flex-row justify-between items-center">
                                <View className={`px-3 py-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                                    <Text className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-500'}`}>Credits</Text>
                                </View>
                            </View>

                            {editingField === 'credits' ? (
                                <View className="flex-row items-center border-b-2 border-pink-500 pb-1 mt-2">
                                    <TextInput
                                        autoFocus
                                        value={credits}
                                        onChangeText={setCredits}
                                        onSubmitEditing={() => setEditingField(null)}
                                        keyboardType="number-pad"
                                        className={`flex-1 font-bold tracking-tighter ${isSmall ? 'text-3xl' : 'text-4xl'} ${isDark ? 'text-white' : 'text-zinc-900'} p-0 m-0`}
                                    />
                                    <TouchableOpacity onPress={() => setEditingField(null)} className="ml-2 bg-pink-500 rounded-full w-6 h-6 items-center justify-center shadow-sm">
                                        <Ionicons name="checkmark" size={14} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity onPress={() => setEditingField('credits')} activeOpacity={0.7} className="mt-2 flex-row items-center justify-between">
                                    <Text className={`font-bold tracking-tighter ${isSmall ? 'text-3xl' : 'text-4xl'} ${isDark ? 'text-white' : 'text-zinc-900'}`}>
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

                <View className="px-6 mt-2">
                    <Text className={`text-xs font-semibold tracking-widest uppercase mb-4 ml-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        Settings
                    </Text>

                    <View className={`flex-row items-center justify-between rounded-full px-5 py-3.5 mb-3 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                        <View className="flex-row items-center" style={{ gap: 14 }}>
                            <View className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                                <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={16} color={isDark ? '#fff' : '#000'} />
                            </View>
                            <Text className={`text-sm font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                Dark Mode
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={toggleTheme}
                            activeOpacity={0.8}
                            className={`rounded-full justify-center ${isDark ? 'bg-pink-500' : 'bg-zinc-300'}`}
                            style={{ width: 50, height: 28, paddingHorizontal: 3 }}
                        >
                            <View
                                className="w-6 h-6 rounded-full bg-white items-center justify-center"
                                style={{ alignSelf: isDark ? 'flex-end' : 'flex-start' }}
                            >
                                <Ionicons
                                    name={isDark ? 'moon' : 'sunny'}
                                    size={11}
                                    color={isDark ? '#ff4d8d' : '#f59e0b'}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className={`flex-row items-center justify-between rounded-full px-5 py-3.5 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}
                        activeOpacity={0.7}
                    >
                        <View className="flex-row items-center" style={{ gap: 14 }}>
                            <View className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                                <Ionicons name="information-circle-outline" size={16} color={isDark ? '#fff' : '#000'} />
                            </View>
                            <Text className={`text-sm font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                About
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={isDark ? '#52525b' : '#a1a1aa'} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

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
                        className="bg-zinc-900 py-4 px-6 rounded-full flex-row items-center justify-between"
                        onPress={handleSave}
                        activeOpacity={0.9}
                    >
                        <Text className="text-white font-semibold text-base">Unsaved changes</Text>
                        <View className="bg-pink-500 px-4 py-1.5 rounded-full">
                            <Text className="text-white font-bold text-sm">Save</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}