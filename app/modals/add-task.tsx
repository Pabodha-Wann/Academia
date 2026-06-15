import {
    scheduleTaskNotifications
} from '@/services/notificationService';
import { useSubjectStore } from '@/store/subjectStore';
import { useTaskStore } from '@/store/taskStore';
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
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIORITIES = ['low', 'medium', 'high'] as const;

export default function AddTask() {
    const isDark = useThemeStore((state) => state.isDark);
    const { selectedDate, tasks, addTask, updateTask } = useTaskStore();
    const { subjects, loadSubjects } = useSubjectStore();
    const insets = useSafeAreaInsets();

    const { taskId } = useLocalSearchParams<{ taskId?: string }>();
    const isEditing = !!taskId;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
        null
    );
    const [priority, setPriority] = useState('medium');
    const [dueDate, setDueDate] = useState(selectedDate ?? format(new Date(), 'yyyy-MM-dd'));

    // Controls the visibility of the calendar modal
    const [showDatePicker, setShowDatePicker] = useState(false);

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

    useEffect(() => {
        if (isEditing && tasks.length > 0) {
            const existingTask = tasks.find(
                (t) => t.id === parseInt(taskId!)
            );
            if (existingTask) {
                setTitle(existingTask.title);
                setDescription(existingTask.description ?? '');
                setSelectedSubjectId(existingTask.subject_id);
                setPriority(existingTask.priority);
                setDueDate(existingTask.due_date);
            }
        }
    }, [tasks]);

    async function handleSave() {
        if (!title.trim()) {
            Alert.alert('Error', 'Task title is required.');
            return;
        }
        if (isEditing) {
            updateTask(parseInt(taskId!), selectedSubjectId, title.trim(), description.trim(), dueDate, priority);
            await scheduleTaskNotifications(parseInt(taskId!), title.trim(), dueDate);
        } else {
            addTask(selectedSubjectId, title.trim(), description.trim(), dueDate, priority);
            const allTasks = useTaskStore.getState().tasks;
            const latest = allTasks[allTasks.length - 1];
            if (latest) {
                await scheduleTaskNotifications(latest.id, title.trim(), dueDate);
            }
        }

        router.back();
    }

    // Format the date securely for display
    const dateObj = new Date(dueDate);
    dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
    const formattedDueDate = format(dateObj, 'MMMM d, yyyy');

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
            <Animated.View
                style={{ flex: 1, opacity: opacityAnim }}
                className={`${isDark ? 'bg-black/60' : 'bg-black/20'}`}
            />

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
                                {isEditing ? 'Edit Task' : 'New Task'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className={`w-10 h-10 rounded-full items-center justify-center border ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}
                            >
                                <Ionicons name="close" size={20} color={isDark ? '#fff' : '#2A2A2A'} />
                            </TouchableOpacity>
                        </View>

                        {/* Title Input */}
                        <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-zinc-400' : 'text-[#2A2A2A]'}`}>
                            Task Title
                        </Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Finish Mobile Computing assignment"
                            placeholderTextColor={isDark ? '#52525b' : '#A0A0A0'}
                            className={`rounded-2xl px-5 py-4 mb-6 text-base font-medium border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100 text-[#2A2A2A]'}`}
                            style={!isDark && { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 }}
                        />

                        {/* Description Input */}
                        <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-zinc-400' : 'text-[#2A2A2A]'}`}>
                            Description
                        </Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Add extra notes or requirements..."
                            placeholderTextColor={isDark ? '#52525b' : '#A0A0A0'}
                            multiline
                            numberOfLines={4}
                            className={`rounded-2xl px-5 py-4 mb-6 text-base font-medium border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100 text-[#2A2A2A]'}`}
                            style={[
                                !isDark && { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 },
                                { minHeight: 100, textAlignVertical: 'top' } // Forces text to top on Android
                            ]}
                        />

                        {/* Category / Subject Pills */}
                        <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-zinc-400' : 'text-[#2A2A2A]'}`}>
                            Category
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setSelectedSubjectId(null)}
                                    className={`px-5 py-2.5 rounded-xl border ${selectedSubjectId === null
                                        ? 'bg-blue-100 border-blue-200'
                                        : isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                                        }`}
                                >
                                    <Text className={`text-sm font-semibold ${selectedSubjectId === null ? 'text-blue-600' : isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                        All
                                    </Text>
                                </TouchableOpacity>

                                {subjects.map((subject) => (
                                    <TouchableOpacity
                                        key={subject.id}
                                        onPress={() => setSelectedSubjectId(subject.id)}
                                        className={`px-5 py-2.5 rounded-xl border ${selectedSubjectId === subject.id ? '' : isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                                            }`}
                                        style={selectedSubjectId === subject.id ? { backgroundColor: subject.color + '20', borderColor: subject.color + '40' } : {}}
                                    >
                                        <Text className={`text-sm font-semibold ${selectedSubjectId === subject.id ? '' : isDark ? 'text-zinc-500' : 'text-zinc-500'}`} style={selectedSubjectId === subject.id ? { color: subject.color } : {}}>
                                            {subject.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        {/* Priority Pills */}
                        <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-zinc-400' : 'text-[#2A2A2A]'}`}>
                            Priority
                        </Text>
                        <View className="flex-row gap-3 mb-6">
                            {PRIORITIES.map((p) => {
                                const isActive = priority === p;
                                // Style colors based on priority level
                                const activeColor = p === 'high' ? '#ef4444' : p === 'medium' ? '#FCE454' : '#3b82f6';
                                const activeText = p === 'medium' ? '#2A2A2A' : '#ffffff';

                                return (
                                    <TouchableOpacity
                                        key={p}
                                        onPress={() => setPriority(p)}
                                        className={`flex-1 py-3 rounded-xl items-center border ${isActive ? '' : isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                                            }`}
                                        style={isActive ? { backgroundColor: activeColor, borderColor: activeColor } : {}}
                                    >
                                        <Text
                                            className={`text-sm font-bold capitalize ${isActive ? '' : isDark ? 'text-zinc-500' : 'text-zinc-500'}`}
                                            style={isActive ? { color: activeText } : {}}
                                        >
                                            {p}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Due Date Calendar Trigger */}
                        <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-zinc-400' : 'text-[#2A2A2A]'}`}>
                            Due Date
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            className={`flex-row items-center justify-between rounded-2xl px-5 py-4 mb-6 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-[#FCE454]'
                                }`}
                        >
                            <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                                {formattedDueDate}
                            </Text>
                            <Ionicons name="calendar" size={20} color={isDark ? '#fff' : '#2A2A2A'} />
                        </TouchableOpacity>

                        {/* Submit Button */}
                        <TouchableOpacity
                            className={`py-5 rounded-2xl items-center mt-2 ${isDark ? 'bg-zinc-100' : 'bg-[#2A2A2A]'}`}
                            onPress={handleSave}
                            activeOpacity={0.9}
                        >
                            <Text className={`font-bold text-base ${isDark ? 'text-[#2A2A2A]' : 'text-white'}`}>
                                {isEditing ? 'Save Changes' : 'Create Task'}
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
                            current={dueDate}
                            onDayPress={(day: any) => {
                                setDueDate(day.dateString);
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
                                [dueDate]: {
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
        </KeyboardAvoidingView>
    );
}