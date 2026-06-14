import { useGpaStore } from '@/store/gpaStore';
import { useProfileStore } from '@/store/profileStore';
import { useThemeStore } from '@/store/themestore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GRADES = [
    { label: 'A+', value: 4.0 },
    { label: 'A', value: 4.0 },
    { label: 'A-', value: 3.7 },
    { label: 'B+', value: 3.3 },
    { label: 'B', value: 3.0 },
    { label: 'B-', value: 2.7 },
    { label: 'C+', value: 2.3 },
    { label: 'C', value: 2.0 },
    { label: 'C-', value: 1.7 },
    { label: 'D', value: 1.0 },
    { label: 'F', value: 0.0 },
];

const CREDITS = [1, 2, 3, 4];

function getGpaColor(gpa: number): string {
    if (gpa >= 3.5) return 'text-green-500';
    if (gpa >= 3.0) return 'text-yellow-400';
    if (gpa >= 2.0) return 'text-orange-500';
    return 'text-red-500';
}

function getGpaBarColor(gpa: number): string {
    if (gpa >= 3.5) return 'bg-green-500';
    if (gpa >= 3.0) return 'bg-yellow-400';
    if (gpa >= 2.0) return 'bg-orange-500';
    return 'bg-red-500';
}

export default function GpaCalculator() {
    const isDark = useThemeStore((state) => state.isDark);
    const { entries, calculatedGpa, loadEntries, addEntry, removeEntry } = useGpaStore();

    const { profile, saveProfile } = useProfileStore();
    const insets = useSafeAreaInsets();

    const [subject, setSubject] = useState('');
    const [semester, setSemester] = useState('');
    const [selectedGrade, setSelectedGrade] = useState(GRADES[0]);
    const [selectedCredits, setSelectedCredits] = useState(3);

    useEffect(() => {
        loadEntries();
    }, []);

    const gpaPercent = Math.min((calculatedGpa / 4.0) * 100, 100);

    function handleAdd() {
        if (!subject.trim()) {
            Alert.alert('Error', 'Subject name is required.');
            return;
        }
        addEntry(
            subject.trim(),
            selectedGrade.label,
            selectedGrade.value,
            selectedCredits,
            semester.trim()
        );
        setSubject('');
        setSemester('');
        setSelectedGrade(GRADES[0]);
        setSelectedCredits(3);
    }

    function handleSaveToProfile() {
        if (!profile) {
            Alert.alert('Error', 'Please set up your profile first.');
            return;
        }
        const totalCredits = entries.reduce((sum, e) => sum + e.credits, 0);
        saveProfile(
            profile.name,
            profile.reg_number,
            calculatedGpa,
            totalCredits,
            profile.avatar_uri ?? null
        );
        Alert.alert('Saved!', 'GPA saved to your profile.', [
            { text: 'OK', onPress: () => router.back() },
        ]);
    }

    return (
        <View
            className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-[#FAFAFA]'}`}
            style={{ paddingTop: insets.top }}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="px-6 pb-16"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between pt-4 mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className={`w-10 h-10 rounded-full items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={18}
                            color={isDark ? '#fff' : '#2A2A2A'}
                        />
                    </TouchableOpacity>

                    {entries.length > 0 && (
                        <TouchableOpacity
                            onPress={handleSaveToProfile}
                            className="bg-[#FCE454] px-5 py-2 rounded-full"
                            activeOpacity={0.8}
                        >
                            <Text className="text-[#2A2A2A] font-bold text-sm">
                                Save to Profile
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Title */}
                <Text className={`text-3xl font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                    GPA Calculator
                </Text>
                <Text className={`text-sm mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Add your subjects to calculate GPA
                </Text>

                {/* GPA Card */}
                <View className={`rounded-3xl p-6 mb-6 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>

                    {/* GPA number + info */}
                    <View className="flex-row items-end justify-between mb-4">
                        <View>
                            <Text className={`text-xs font-semibold tracking-widest uppercase mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                Calculated GPA
                            </Text>
                            <Text className={`text-6xl font-black ${getGpaColor(calculatedGpa)}`}>
                                {calculatedGpa.toFixed(2)}
                            </Text>
                        </View>
                        <View className="items-end gap-1 mb-2">
                            <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                out of 4.00
                            </Text>
                            <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                {entries.length} subjects
                            </Text>
                            <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                {entries.reduce((s, e) => s + e.credits, 0)} credits
                            </Text>
                        </View>
                    </View>

                    {/* Progress bar */}
                    <View className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                        <View
                            className={`h-full rounded-full ${getGpaBarColor(calculatedGpa)}`}
                            style={{ width: `${gpaPercent}%` }}
                        />
                    </View>

                    {/* Scale labels */}
                    <View className="flex-row justify-between mt-1.5">
                        {['0.0', '1.0', '2.0', '3.0', '4.0'].map((l) => (
                            <Text
                                key={l}
                                className={`text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`}
                            >
                                {l}
                            </Text>
                        ))}
                    </View>
                </View>

                {/* Add Subject Form */}
                <View className={`rounded-3xl p-5 mb-6 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
                    <Text className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                        Add Subject
                    </Text>

                    {/* Subject name */}
                    <TextInput
                        value={subject}
                        onChangeText={setSubject}
                        placeholder="Subject name"
                        placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                        className={`rounded-2xl px-4 py-3.5 mb-3 text-base font-medium ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-[#2A2A2A]'}`}
                    />

                    {/* Semester */}
                    <TextInput
                        value={semester}
                        onChangeText={setSemester}
                        placeholder="Semester (e.g. Semester 1)"
                        placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                        className={`rounded-2xl px-4 py-3.5 mb-4 text-base font-medium ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-[#2A2A2A]'}`}
                    />

                    {/* Grade label */}
                    <Text className={`text-xs font-semibold tracking-widest uppercase mb-3 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Grade
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-4"
                        contentContainerClassName="gap-2"
                    >
                        {GRADES.map((g) => {
                            const isActive = selectedGrade.label === g.label;
                            return (
                                <TouchableOpacity
                                    key={g.label}
                                    onPress={() => setSelectedGrade(g)}
                                    className={`w-11 h-11 rounded-xl items-center justify-center ${isActive
                                        ? 'bg-[#FCE454]'
                                        : isDark ? 'bg-zinc-800' : 'bg-zinc-100'
                                        }`}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className={`font-bold text-sm ${isActive
                                            ? 'text-[#2A2A2A]'
                                            : isDark ? 'text-zinc-400' : 'text-zinc-500'
                                            }`}
                                    >
                                        {g.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Credits label */}
                    <Text className={`text-xs font-semibold tracking-widest uppercase mb-3 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Credits
                    </Text>
                    <View className="flex-row gap-2 mb-5">
                        {CREDITS.map((c) => {
                            const isActive = selectedCredits === c;
                            return (
                                <TouchableOpacity
                                    key={c}
                                    onPress={() => setSelectedCredits(c)}
                                    className={`flex-1 py-3 rounded-xl items-center ${isActive
                                        ? 'bg-[#2A2A2A]'
                                        : isDark ? 'bg-zinc-800' : 'bg-zinc-100'
                                        }`}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className={`font-bold text-base ${isActive
                                            ? 'text-[#FCE454]'
                                            : isDark ? 'text-zinc-400' : 'text-zinc-500'
                                            }`}
                                    >
                                        {c}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Add button */}
                    <TouchableOpacity
                        onPress={handleAdd}
                        className="bg-[#2A2A2A] py-4 rounded-full items-center"
                        activeOpacity={0.8}
                    >
                        <Text className="text-[#FCE454] font-black text-base">
                            Add Subject
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Entries List */}
                {entries.length > 0 && (
                    <View>
                        <Text className={`text-base font-bold mb-3 ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                            Subjects
                        </Text>
                        <View className="gap-3">
                            {entries.map((entry) => (
                                <View
                                    key={entry.id}
                                    className={`flex-row items-center rounded-2xl p-4 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}
                                >
                                    {/* Grade badge */}
                                    <View className="w-10 h-10 rounded-xl bg-[#FCE454] items-center justify-center mr-3">
                                        <Text className="font-black text-sm text-[#2A2A2A]">
                                            {entry.grade}
                                        </Text>
                                    </View>

                                    {/* Info */}
                                    <View className="flex-1">
                                        <Text className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                                            {entry.subject}
                                        </Text>
                                        <Text className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                            {entry.semester ? `${entry.semester} · ` : ''}{entry.credits} credits
                                        </Text>
                                    </View>

                                    {/* Delete */}
                                    <TouchableOpacity
                                        onPress={() => removeEntry(entry.id)}
                                        className={`w-8 h-8 rounded-lg items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                                    >
                                        <Ionicons
                                            name="trash-outline"
                                            size={15}
                                            color={isDark ? '#71717a' : '#a1a1aa'}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}