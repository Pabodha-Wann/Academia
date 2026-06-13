import { useScheduleStore } from '@/store/scheduleStore';
import { useSubjectStore } from '@/store/subjectStore';
import { useThemeStore } from '@/store/themestore';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const TYPES = ['Physical', 'Online'];

export default function AddSchedule() {
    const isDark = useThemeStore((state) => state.isDark);
    const { selectedDate, addEntry } = useScheduleStore();
    const { subjects, loadSubjects } = useSubjectStore();

    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [lecturer, setLecturer] = useState('');
    const [type, setType] = useState('Physical');
    const [location, setLocation] = useState('');
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('10:00');

    // Popup animation
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadSubjects();
        // Animate in
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                damping: 15,
                stiffness: 200,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    function handleAdd() {
        if (!selectedSubjectId) {
            Alert.alert('Error', 'Please select a subject.');
            return;
        }
        if (!lecturer.trim()) {
            Alert.alert('Error', 'Lecturer name is required.');
            return;
        }
        if (!startTime || !endTime) {
            Alert.alert('Error', 'Please enter start and end time.');
            return;
        }
        addEntry(
            selectedSubjectId,
            lecturer.trim(),
            type,
            selectedDate,
            startTime,
            endTime,
            location.trim()
        );
        router.back();
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
        >
            {/* Blurred backdrop */}
            <Pressable className="absolute inset-0" onPress={() => router.back()}>
                <BlurView
                    intensity={20}
                    tint={isDark ? 'dark' : 'light'}
                    className="flex-1"
                />
            </Pressable>

            {/* Centered popup */}
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    padding: 24,
                }}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View
                    style={{
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                    }}
                >
                    <View
                        className={`rounded-3xl p-6 ${isDark ? 'bg-zinc-900' : 'bg-white'}`}
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 20 },
                            shadowOpacity: isDark ? 0.6 : 0.15,
                            shadowRadius: 40,
                            elevation: 20,
                        }}
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-5">
                            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                Add Class — {selectedDate}
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                            >
                                <Ionicons name="close" size={16} color={isDark ? '#a1a1aa' : '#71717a'} />
                            </TouchableOpacity>
                        </View>

                        {/* Subject Selector */}
                        <Text className={`text-xs font-semibold tracking-widest uppercase mb-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Subject
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-4"
                        >
                            <View className="flex-row gap-2">
                                {subjects.map((subject) => (
                                    <TouchableOpacity
                                        key={subject.id}
                                        onPress={() => setSelectedSubjectId(subject.id)}
                                        className={`px-4 py-2 rounded-full border ${selectedSubjectId === subject.id
                                            ? 'border-transparent'
                                            : isDark ? 'border-zinc-700' : 'border-zinc-200'
                                            }`}
                                        style={
                                            selectedSubjectId === subject.id
                                                ? { backgroundColor: subject.color }
                                                : {}
                                        }
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            className={`text-sm font-semibold ${selectedSubjectId === subject.id
                                                ? 'text-white'
                                                : isDark ? 'text-zinc-400' : 'text-zinc-600'
                                                }`}
                                        >
                                            {subject.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        {/* Lecturer */}
                        <Text className={`text-xs font-semibold tracking-widest uppercase mb-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Lecturer
                        </Text>
                        <TextInput
                            value={lecturer}
                            onChangeText={setLecturer}
                            placeholder="Lecturer name"
                            placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                            className={`rounded-2xl px-4 py-3.5 mb-4 text-base ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'}`}
                        />

                        {/* Time */}
                        <Text className={`text-xs font-semibold tracking-widest uppercase mb-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Time (24h format)
                        </Text>
                        <View className="flex-row gap-3 mb-4">
                            <TextInput
                                value={startTime}
                                onChangeText={setStartTime}
                                placeholder="08:00"
                                placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                                className={`flex-1 rounded-2xl px-4 py-3.5 text-base text-center ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'}`}
                            />
                            <View className="items-center justify-center">
                                <Text className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>→</Text>
                            </View>
                            <TextInput
                                value={endTime}
                                onChangeText={setEndTime}
                                placeholder="10:00"
                                placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                                className={`flex-1 rounded-2xl px-4 py-3.5 text-base text-center ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'}`}
                            />
                        </View>

                        {/* Location */}
                        <Text className={`text-xs font-semibold tracking-widest uppercase mb-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Location
                        </Text>
                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            placeholder="Room / Zoom link"
                            placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                            className={`rounded-2xl px-4 py-3.5 mb-4 text-base ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'}`}
                        />

                        {/* Type */}
                        <Text className={`text-xs font-semibold tracking-widest uppercase mb-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Type
                        </Text>
                        <View className="flex-row gap-3 mb-5">
                            {TYPES.map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setType(t)}
                                    className={`flex-1 py-3 rounded-2xl items-center ${type === t
                                        ? t === 'Online' ? 'bg-emerald-500' : 'bg-indigo-500'
                                        : isDark ? 'bg-zinc-800' : 'bg-zinc-100'
                                        }`}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        className={`font-semibold text-sm ${type === t
                                            ? 'text-white'
                                            : isDark ? 'text-zinc-400' : 'text-zinc-600'
                                            }`}
                                    >
                                        {t}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Add Button */}
                        <TouchableOpacity
                            className="bg-indigo-500 py-4 rounded-2xl items-center"
                            onPress={handleAdd}
                            activeOpacity={0.8}
                        >
                            <Text className="text-white font-bold text-base">
                                Add Class
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}