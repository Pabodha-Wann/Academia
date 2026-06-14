import { useThemeStore } from '@/store/themestore';
import { addDays, format, startOfWeek } from 'date-fns';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface WeekStripProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
}

export default function WeekStrip({ selectedDate, onDateSelect }: WeekStripProps) {
    const isDark = useThemeStore((state) => state.isDark);

    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });

    const dates = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i));

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
            className="py-4"
        >
            {dates.map((date) => {
                const dateString = format(date, 'yyyy-MM-dd');
                const isSelected = dateString === selectedDate;

                return (
                    <TouchableOpacity
                        key={dateString}
                        onPress={() => onDateSelect(dateString)}
                        activeOpacity={0.7}
                        className={`items-center justify-center py-3 px-3 rounded-full ${isSelected
                                ? 'bg-[#FCE454]'
                                : 'bg-transparent'
                            }`}
                        style={{ width: 50, height: 76 }}
                    >
                        {/* Number on top */}
                        <Text
                            className={`text-lg font-bold mb-1 ${isSelected
                                    ? 'text-[#2A2A2A]'
                                    : isDark ? 'text-white' : 'text-[#2A2A2A]'
                                }`}
                        >
                            {format(date, 'd')}
                        </Text>

                        {/* Day on bottom */}
                        <Text
                            className={`text-xs font-semibold ${isSelected
                                    ? 'text-[#2A2A2A]'
                                    : isDark ? 'text-zinc-500' : 'text-zinc-400'
                                }`}
                        >
                            {format(date, 'EEE')}
                        </Text>

                        {/* Dot indicator for active */}
                        {isSelected && (
                            <View className="w-1.5 h-1.5 rounded-full bg-[#2A2A2A] mt-1.5 absolute bottom-2" />
                        )}
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}