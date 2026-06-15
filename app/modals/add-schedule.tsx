import { scheduleClassNotifications } from '@/services/notificationService';
import { useScheduleStore } from '@/store/scheduleStore';
import { useSubjectStore } from '@/store/subjectStore';
import { useThemeStore } from '@/store/themestore';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TYPES = ['Physical', 'Online'];

export default function AddSchedule() {
    const insets = useSafeAreaInsets();
    const { entryId } = useLocalSearchParams<{ entryId?: string }>();
    const isEditing = !!entryId;

    const isDark = useThemeStore((state) => state.isDark);
    const { selectedDate, addEntry, updateEntry, entries } = useScheduleStore();
    const { subjects, loadSubjects } = useSubjectStore();

    const existingEntry = isEditing ? entries.find((e) => e.id === parseInt(entryId!)) : null;

    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(existingEntry?.subject_id ?? null);
    const [lecturer, setLecturer] = useState(existingEntry?.lecturer ?? '');
    const [type, setType] = useState(existingEntry?.type ?? 'Physical');
    const [location, setLocation] = useState(existingEntry?.location ?? '');
    const [startTime, setStartTime] = useState(existingEntry?.start_time ?? '08:00');
    const [endTime, setEndTime] = useState(existingEntry?.end_time ?? '10:00');

    // Date state
    const [date, setDate] = useState(existingEntry?.date ?? selectedDate ?? format(new Date(), 'yyyy-MM-dd'));
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Time picker states
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [pickingType, setPickingType] = useState<'start' | 'end'>('start');
    const [tempHour, setTempHour] = useState(8);
    const [tempMinute, setTempMinute] = useState(0);

    // Slide up animation
    const slideAnim = useRef(new Animated.Value(300)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadSubjects();
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
                stiffness: 200,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    async function handleAdd() {
        if (!selectedSubjectId) {
            Alert.alert('Error', 'Please select a subject.');
            return;
        }
        if (!lecturer.trim()) {
            Alert.alert('Error', 'Lecturer name is required.');
            return;
        }
        if (!startTime || !endTime) {
            Alert.alert('Error', 'Please select start and end time.');
            return;
        }

        if (isEditing) {
            updateEntry(
                parseInt(entryId!),
                selectedSubjectId!,
                lecturer.trim(),
                type,
                date,
                startTime,
                endTime,
                location.trim()
            );

            const subject = subjects.find((s) => s.id === selectedSubjectId)
            if (subject) {
                await scheduleClassNotifications(
                    parseInt(entryId!),
                    subject.name,
                    date,
                    startTime,
                    location.trim() || null,
                )
            }
            router.back();
        } else {
            addEntry(
                selectedSubjectId,
                lecturer.trim(),
                type,
                date,
                startTime,
                endTime,
                location.trim()
            );

            const subject = subjects.find((s) => s.id === selectedSubjectId);
            const latest = useScheduleStore.getState().entries.slice(-1)[0];
            if (subject && latest) {
                await scheduleClassNotifications(
                    latest.id,
                    subject.name,
                    date,
                    startTime,
                    location.trim() || null,
                );
            }
            router.back();
        }
    }

    // Format the date securely for display
    const dateObj = new Date(date);
    dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
    const formattedDate = format(dateObj, 'MMMM d, yyyy');

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
        >
            {/* Semi transparent backdrop */}
            <Pressable className="absolute inset-0" onPress={() => router.back()}>
                <Animated.View
                    style={{ flex: 1, opacity: opacityAnim }}
                    className={`${isDark ? 'bg-black/60' : 'bg-black/20'}`}
                />
            </Pressable>

            {/* Sheet */}
            <Animated.View
                style={{
                    transform: [{ translateY: slideAnim }],
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    maxHeight: '94%',
                }}
            >
                <View
                    className={`rounded-t-[36px] ${isDark ? 'bg-[#18181B]' : 'bg-[#FDFDFD]'}`}
                    style={{ paddingBottom: insets.bottom + 20 }}
                >
                    <View className="items-center pt-4 mb-2">
                        <View className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12 }}
                    >
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-8">
                            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                                {isEditing ? 'Edit Class' : 'New Class'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className={`w-10 h-10 rounded-full items-center justify-center border ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}
                            >
                                <Ionicons name="close" size={20} color={isDark ? '#fff' : '#2A2A2A'} />
                            </TouchableOpacity>
                        </View>

                        {/* Subject Selector */}
                        <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-zinc-400' : 'text-[#2A2A2A]'}`}>
                            Subject
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-6"
                        >
                            <View className="flex-row gap-3">
                                {subjects.map((subject) => (
                                    <TouchableOpacity
                                        key={subject.id}
                                        onPress={() => setSelectedSubjectId(subject.id)}
                                        className={`px-5 py-2.5 rounded-xl border ${selectedSubjectId === subject.id ? '' : isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}
                                        style={selectedSubjectId === subject.id ? { backgroundColor: subject.color + '20', borderColor: subject.color + '40' } : {}}
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            className={`text-sm font-semibold ${selectedSubjectId === subject.id ? '' : isDark ? 'text-zinc-500' : 'text-zinc-500'}`}
                                            style={selectedSubjectId === subject.id ? { color: subject.color } : {}}
                                        >
                                            {subject.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        {/* Lecturer */}
                        <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-zinc-400' : 'text-[#2A2A2A]'}`}>
                            Lecturer
                        </Text>
                        <TextInput
                            value={lecturer}
                            onChangeText={setLecturer}
                            placeholder="e.g. Dr. John Doe"
                            placeholderTextColor={isDark ? '#52525b' : '#A0A0A0'}
                            className={`rounded-2xl px-5 py-4 mb-6 text-base font-medium border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100 text-[#2A2A2A]'}`}
                            style={!isDark ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 } : {}}
                        />

                        {/* Date Picker Trigger */}
                        <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-zinc-400' : 'text-[#2A2A2A]'}`}>
                            Date
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            className={`flex-row items-center justify-between rounded-2xl px-5 py-4 mb-6 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-[#FCE454]'
                                }`}
                        >
                            <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                                {formattedDate}
                            </Text>
                            <Ionicons name="calendar" size={20} color={isDark ? '#fff' : '#2A2A2A'} />
                        </TouchableOpacity>

                        {/* Time Slots Selector */}
                        <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-zinc-400' : 'text-[#2A2A2A]'}`}>
                            Time
                        </Text>
                        <View className="flex-row gap-3 mb-6 items-center">
                            <TouchableOpacity
                                onPress={() => {
                                    setPickingType('start');
                                    const [h, m] = startTime.split(':');
                                    setTempHour(parseInt(h) || 8);
                                    setTempMinute(parseInt(m) || 0);
                                    setShowTimePicker(true);
                                }}
                                className={`flex-1 rounded-2xl px-5 py-4 border items-center justify-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'
                                    }`}
                                style={!isDark ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 } : {}}
                            >
                                <Text className="text-xs text-zinc-400 mb-1">Start Time</Text>
                                <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                                    {startTime}
                                </Text>
                            </TouchableOpacity>

                            <Text className={`text-base font-bold ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`}>→</Text>

                            <TouchableOpacity
                                onPress={() => {
                                    setPickingType('end');
                                    const [h, m] = endTime.split(':');
                                    setTempHour(parseInt(h) || 10);
                                    setTempMinute(parseInt(m) || 0);
                                    setShowTimePicker(true);
                                }}
                                className={`flex-1 rounded-2xl px-5 py-4 border items-center justify-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'
                                    }`}
                                style={!isDark ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 } : {}}
                            >
                                <Text className="text-xs text-zinc-400 mb-1">End Time</Text>
                                <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                                    {endTime}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Location */}
                        <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-zinc-400' : 'text-[#2A2A2A]'}`}>
                            Location
                        </Text>
                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            placeholder="e.g. Room 402 / Zoom link"
                            placeholderTextColor={isDark ? '#52525b' : '#A0A0A0'}
                            className={`rounded-2xl px-5 py-4 mb-6 text-base font-medium border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100 text-[#2A2A2A]'}`}
                            style={!isDark ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 } : {}}
                        />

                        {/* Class Type */}
                        <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-zinc-400' : 'text-[#2A2A2A]'}`}>
                            Type
                        </Text>
                        <View className="flex-row gap-3 mb-8">
                            {TYPES.map((t) => {
                                const isActive = type === t;
                                return (
                                    <TouchableOpacity
                                        key={t}
                                        onPress={() => setType(t)}
                                        className={`flex-1 py-3.5 rounded-xl border items-center ${isActive
                                            ? t === 'Online' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-[#FCE454]/20 border-[#FCE454]/30'
                                            : isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                                            }`}
                                        style={isActive ? { backgroundColor: t === 'Online' ? '#10b98120' : '#FCE45420', borderColor: t === 'Online' ? '#10b98140' : '#FCE45440' } : {}}
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            className={`text-sm font-bold ${isActive ? t === 'Online' ? 'text-emerald-500' : 'text-[#A18D14] dark:text-[#FCE454]' : isDark ? 'text-zinc-500' : 'text-zinc-500'}`}
                                        >
                                            {t}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            className={`py-5 rounded-2xl items-center mt-2 ${isDark ? 'bg-zinc-100' : 'bg-[#2A2A2A]'}`}
                            onPress={handleAdd}
                            activeOpacity={0.9}
                        >
                            <Text className={`font-bold text-base ${isDark ? 'text-[#2A2A2A]' : 'text-white'}`}>
                                {isEditing ? 'Save Changes' : 'Create Class'}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Animated.View>

            {/* Hidden Calendar Modal */}
            <Modal
                visible={showDatePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <View className="flex-1 justify-center bg-black/60 px-6">
                    <View className={`rounded-3xl overflow-hidden py-4 ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
                        <Calendar
                            current={date}
                            onDayPress={(day: any) => {
                                setDate(day.dateString);
                                setShowDatePicker(false);
                            }}
                            theme={{
                                backgroundColor: 'transparent',
                                calendarBackground: 'transparent',
                                monthTextColor: isDark ? '#ffffff' : '#2A2A2A',
                                textMonthFontFamily: 'Poppins_700Bold',
                                textDayFontFamily: 'Poppins_600SemiBold',
                                textDayHeaderFontFamily: 'Poppins_600SemiBold',
                                dayTextColor: isDark ? '#e4e4e7' : '#2A2A2A',
                                todayTextColor: '#FCE454',
                                selectedDayBackgroundColor: '#FCE454',
                                selectedDayTextColor: '#2A2A2A',
                                arrowColor: isDark ? '#ffffff' : '#2A2A2A',
                            }}
                            markedDates={{
                                [date]: {
                                    selected: true,
                                    selectedColor: '#FCE454',
                                    selectedTextColor: '#2A2A2A'
                                }
                            }}
                        />
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                            className="mt-2 py-4 mx-6 rounded-xl items-center bg-zinc-100 dark:bg-zinc-800"
                        >
                            <Text className={`font-bold text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Hidden Custom Time Picker Modal */}
            <Modal
                visible={showTimePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowTimePicker(false)}
            >
                <View className="flex-1 justify-center bg-black/60 px-6">
                    <View className={`rounded-3xl overflow-hidden py-6 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'}`}>
                        <Text className={`text-lg font-bold text-center mb-6 ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                            {pickingType === 'start' ? 'Select Start Time' : 'Select End Time'}
                        </Text>

                        {/* Pickers Container */}
                        <View className="flex-row justify-center h-48 px-6 mb-6">
                            {/* Hours column */}
                            <View className="flex-1 px-2">
                                <Text className="text-center font-semibold text-xs text-zinc-400 mb-2 uppercase tracking-wider">Hour</Text>
                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12 }}>
                                    {Array.from({ length: 24 }).map((_, h) => {
                                        const formattedH = h.toString().padStart(2, '0');
                                        const isSelected = tempHour === h;
                                        return (
                                            <TouchableOpacity
                                                key={h}
                                                onPress={() => setTempHour(h)}
                                                className={`py-2 px-3 rounded-xl items-center ${isSelected ? (isDark ? 'bg-zinc-800' : 'bg-[#FCE454]') : ''}`}
                                            >
                                                <Text className={`text-base font-semibold ${isSelected ? (isDark ? 'text-white' : 'text-[#2A2A2A]') : 'text-zinc-400'}`}>
                                                    {formattedH}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>

                            {/* Divider */}
                            <View className="justify-center items-center px-2">
                                <Text className={`text-2xl font-bold ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`}>:</Text>
                            </View>

                            {/* Minutes column */}
                            <View className="flex-1 px-2">
                                <Text className="text-center font-semibold text-xs text-zinc-400 mb-2 uppercase tracking-wider">Minute</Text>
                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12 }}>
                                    {Array.from({ length: 12 }).map((_, i) => {
                                        const m = i * 5;
                                        const formattedM = m.toString().padStart(2, '0');
                                        const isSelected = tempMinute === m;
                                        return (
                                            <TouchableOpacity
                                                key={m}
                                                onPress={() => setTempMinute(m)}
                                                className={`py-2 px-3 rounded-xl items-center ${isSelected ? (isDark ? 'bg-zinc-800' : 'bg-[#FCE454]') : ''}`}
                                            >
                                                <Text className={`text-base font-semibold ${isSelected ? (isDark ? 'text-white' : 'text-[#2A2A2A]') : 'text-zinc-400'}`}>
                                                    {formattedM}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </View>

                        {/* Actions */}
                        <View className="flex-row gap-3 px-6">
                            <TouchableOpacity
                                onPress={() => setShowTimePicker(false)}
                                className={`flex-1 py-4 rounded-xl items-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                            >
                                <Text className={`font-bold text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    const formattedTime = `${tempHour.toString().padStart(2, '0')}:${tempMinute.toString().padStart(2, '0')}`;
                                    if (pickingType === 'start') {
                                        setStartTime(formattedTime);
                                    } else {
                                        setEndTime(formattedTime);
                                    }
                                    setShowTimePicker(false);
                                }}
                                className={`flex-1 py-4 rounded-xl items-center ${isDark ? 'bg-zinc-100' : 'bg-[#2A2A2A]'}`}
                            >
                                <Text className={`font-bold text-sm ${isDark ? 'text-[#2A2A2A]' : 'text-white'}`}>
                                    Confirm
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}