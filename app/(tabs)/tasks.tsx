import WeekStrip from '@/components/WeekStrip';
import { TaskService } from '@/services/taskService';
import { useProfileStore } from '@/store/profileStore';
import { useTaskStore } from '@/store/taskStore';
import { useThemeStore } from '@/store/themestore';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    InteractionManager
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FILTERS = [
    { label: 'All', value: 'all', colorClass: 'bg-blue-100 text-blue-600 border-blue-200' },
    { label: 'Pending', value: 'pending', colorClass: 'bg-[#FCE454]/40 text-yellow-700 border-yellow-300' },
    { label: 'Done', value: 'done', colorClass: 'bg-green-100 text-green-700 border-green-200' },
];

export default function Tasks() {
    const isDark = useThemeStore((state) => state.isDark);
    const profile = useProfileStore((state) => state.profile);
    const loadProfile = useProfileStore((state) => state.loadProfile);
    const tasks = useTaskStore((state) => state.tasks);
    const selectedDate = useTaskStore((state) => state.selectedDate);
    const filterStatus = useTaskStore((state) => state.filterStatus);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const interaction = InteractionManager.runAfterInteractions(() => {
            TaskService.loadTasks(selectedDate);
            loadProfile();
        });
        return () => interaction.cancel();
    }, [selectedDate]);

    const isViewingAll = selectedDate === null;
    const filteredTasks = useMemo(() => {
        return tasks.filter((t) => filterStatus === 'all' ? true : t.status === filterStatus);
    }, [tasks, filterStatus]);
    
    const selectedDateObj = selectedDate ? new Date(selectedDate) : new Date();
    if (selectedDate) {
        selectedDateObj.setMinutes(selectedDateObj.getMinutes() + selectedDateObj.getTimezoneOffset());
    }

    function handleDelete(id: number, title: string) {
        Alert.alert('Delete Task', `Delete "${title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => TaskService.deleteTask(id) },
        ]);
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-[#FAFAFA]'}`}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

                {/* Custom Header matching Mockup */}
                <View className="px-6 pt-6 pb-2 flex-row items-start justify-between">
                    <View className="flex-1">
                        <Text className={`text-2xl font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                            {isViewingAll ? "All Tasks" : format(selectedDateObj, "MMMM d")}
                        </Text>
                        <Text className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {isViewingAll ? `${tasks.length} tasks total` : `${tasks.length} tasks today`}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-3">
                        {/* View All Tasks Button */}
                        <TouchableOpacity
                            onPress={() => TaskService.setSelectedDate(null)}
                            className={`w-12 h-12 rounded-full items-center justify-center border ${
                                isViewingAll
                                    ? 'bg-[#FCE454] border-[#FCE454]'
                                    : isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'
                            }`}
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }}
                        >
                            <Ionicons 
                                name="list" 
                                size={22} 
                                color={isViewingAll ? '#2A2A2A' : isDark ? '#fff' : '#2A2A2A'} 
                            />
                        </TouchableOpacity>

                        {/* Profile/Calendar Link */}
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/profile')}
                            className={`w-12 h-12 rounded-full items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-[#2A2A2A]'}`}
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }}
                        >
                            <Ionicons name="calendar" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Yellow style Week Strip */}
                <WeekStrip selectedDate={selectedDate || ''} onDateSelect={(date) => TaskService.setSelectedDate(date)} />

                {/* Filter section as pastel pills */}
                <View className="px-6 mt-6 mb-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row gap-3">
                            {FILTERS.map((f) => {
                                const isActive = filterStatus === f.value;
                                return (
                                    <TouchableOpacity
                                        key={f.value}
                                        onPress={() => TaskService.setFilterStatus(f.value as any)}
                                        className={`px-5 py-2.5 rounded-xl border ${isActive ? f.colorClass : isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
                                        activeOpacity={0.7}
                                    >
                                        <Text className={`text-sm font-semibold ${isActive ? '' : isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                            {f.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>

                {/* Task List - Flat, clean white cards */}
                <View className="px-6 gap-4">
                    {filteredTasks.length === 0 ? (
                        <View className={`rounded-3xl p-8 items-center mt-4 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
                            <Text className="text-4xl mb-3">☕</Text>
                            <Text className={`text-base font-semibold ${isDark ? 'text-zinc-300' : 'text-[#2A2A2A]'}`}>
                                You're all caught up!
                            </Text>
                        </View>
                    ) : (
                        filteredTasks.map((task) => (
                            <TouchableOpacity
                                key={task.id}
                                onPress={() => router.push({ pathname: '/modals/add-task', params: { taskId: task.id } })}
                                onLongPress={() => handleDelete(task.id, task.title)}
                                activeOpacity={0.8}
                                className={`rounded-2xl p-5 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}
                                style={!isDark && { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8 }}
                            >
                                <View className="flex-row items-center gap-4">
                                    <TouchableOpacity onPress={() => TaskService.toggleTaskStatus(task.id, task.status)}>
                                        <View className={`w-6 h-6 rounded-md border items-center justify-center ${task.status === 'done' ? 'bg-[#2A2A2A] border-[#2A2A2A]' : isDark ? 'border-zinc-600' : 'border-zinc-300'}`}>
                                            {task.status === 'done' && <Ionicons name="checkmark" size={14} color="#FCE454" />}
                                        </View>
                                    </TouchableOpacity>

                                    <View className="flex-1">
                                        <Text className={`font-semibold text-base mb-1.5 ${task.status === 'done' ? 'text-zinc-400 line-through' : isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                                            {task.title}
                                        </Text>
                                        
                                        <View className="flex-row items-center gap-3 flex-wrap">
                                            {task.subject_name && (
                                                <View className="flex-row items-center gap-1.5">
                                                    <View className="w-2 h-2 rounded-full" style={{ backgroundColor: task.subject_color ?? '#FCE454' }} />
                                                    <Text className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{task.subject_name}</Text>
                                                </View>
                                            )}

                                            {/* Due Date Indicator */}
                                            <View className="flex-row items-center gap-1">
                                                <Ionicons name="time-outline" size={13} color={isDark ? '#71717a' : '#a1a1aa'} />
                                                <Text className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                                    {format(
                                                        (() => {
                                                            const d = new Date(task.due_date);
                                                            d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                                                            return d;
                                                        })(),
                                                        'MMM d'
                                                    )}
                                                </Text>
                                            </View>

                                            {/* Priority Tag */}
                                            <View className={`px-2 py-0.5 rounded-md border ${
                                                task.priority === 'high' 
                                                    ? 'bg-red-500/10 border-red-500/20' 
                                                    : task.priority === 'medium' 
                                                        ? 'bg-yellow-500/10 border-yellow-500/20' 
                                                        : 'bg-blue-500/10 border-blue-500/20'
                                            }`}>
                                                <Text className={`text-[10px] font-bold uppercase ${
                                                    task.priority === 'high' 
                                                        ? 'text-red-500' 
                                                        : task.priority === 'medium' 
                                                            ? 'text-yellow-600' 
                                                            : 'text-blue-500'
                                                }`}>
                                                    {task.priority}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Custom dark FAB */}
            <TouchableOpacity
                onPress={() => router.push('/modals/add-task')}
                className={`absolute bottom-28 right-6 w-14 h-14 rounded-full items-center justify-center ${isDark ? 'bg-zinc-100' : 'bg-[#2A2A2A]'}`}
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}
            >
                <Ionicons name="add" size={28} color={isDark ? '#2A2A2A' : '#FCE454'} />
            </TouchableOpacity>
        </View>
    );
}