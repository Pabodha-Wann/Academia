import { useNotficationStore } from '@/store/notificationStore';
import { useThemeStore } from '@/store/themestore';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationsModal() {
    const isDark = useThemeStore((state) => state.isDark);
    const { notifications, unreadCount, loadNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotficationStore();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadNotifications();
    }, []);

    // Format timestamps securely for display
    const formatNotifTime = (isoString: string) => {
        try {
            const dateObj = new Date(isoString);
            return format(dateObj, 'MMM d, h:mm a');
        } catch {
            return '';
        }
    };

    return (
        <View
            className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-[#FAFAFA]'}`}
            style={{ paddingTop: insets.top }}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-4 mb-6">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className={`w-10 h-10 rounded-full items-center justify-center border ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="arrow-back"
                        size={18}
                        color={isDark ? '#fff' : '#2A2A2A'}
                    />
                </TouchableOpacity>

                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                    Notifications
                </Text>

                {unreadCount > 0 ? (
                    <TouchableOpacity
                        onPress={markAllAsRead}
                        className="bg-[#FCE454] px-4 py-2 rounded-full"
                        activeOpacity={0.8}
                    >
                        <Text className="text-[#2A2A2A] font-bold text-xs">
                            Mark All Read
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View className="w-20" /> // Spacer to balance header layout
                )}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="px-6 pb-16"
            >
                {notifications.length === 0 ? (
                    <View className={`rounded-3xl p-8 items-center mt-8 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>

                        <Text className={`text-base font-semibold mb-1 ${isDark ? 'text-zinc-300' : 'text-[#2A2A2A]'}`}>
                            Your inbox is clear
                        </Text>
                        <Text className={`text-xs text-center ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            When deadline reminders or class alerts trigger, they will show up here.
                        </Text>
                    </View>
                ) : (
                    <View className="gap-3">
                        {notifications.map((item) => {
                            const isTask = item.type === 'task';
                            const isUnread = item.is_read === 0;

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => {
                                        if (isUnread) {
                                            markAsRead(item.id);
                                        }
                                    }}
                                    activeOpacity={0.8}
                                    className={`rounded-2xl p-4 border flex-row items-start gap-3 ${isDark
                                            ? `${isUnread ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-900/20 border-zinc-900/40'}`
                                            : `${isUnread ? 'bg-white border-zinc-200' : 'bg-zinc-50/50 border-zinc-100'}`
                                        }`}
                                >
                                    {/* Icon Container */}
                                    <View className={`w-10 h-10 rounded-xl items-center justify-center ${isTask
                                            ? 'bg-blue-500/10'
                                            : 'bg-yellow-500/10'
                                        }`}>
                                        <Ionicons
                                            name={isTask ? 'book-outline' : 'calendar-outline'}
                                            size={20}
                                            color={isTask ? '#3b82f6' : '#eab308'}
                                        />
                                    </View>

                                    {/* Content Info */}
                                    <View className="flex-1">
                                        <View className="flex-row items-center justify-between mb-1">
                                            <Text className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                                                {item.title}
                                            </Text>

                                            {isUnread && (
                                                <View className="w-2 h-2 rounded-full bg-[#FCE454]" />
                                            )}
                                        </View>

                                        <Text className={`text-xs leading-relaxed mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                            {item.body}
                                        </Text>

                                        <View className="flex-row items-center justify-between">
                                            <Text className={`text-[10px] font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                                {formatNotifTime(item.triggered_at)}
                                            </Text>

                                            <TouchableOpacity
                                                onPress={() => deleteNotification(item.id)}
                                                className={`w-7 h-7 rounded-lg items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                                            >
                                                <Ionicons
                                                    name="trash-outline"
                                                    size={13}
                                                    color={isDark ? '#71717a' : '#a1a1aa'}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
