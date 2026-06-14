import { useThemeStore } from "@/store/themestore";
import { format } from 'date-fns';
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from 'react-native-calendars';

interface WeekCalendarProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
}

export default function WeekCalendar({ selectedDate, onDateSelect }: WeekCalendarProps) {
    const isDark = useThemeStore((state) => state.isDark);

    const todayString = format(new Date(), 'yyyy-MM-dd');

    const markedDates = {
        [selectedDate]: {
            selected: true,
            selectedColor: '#FCE454',
            selectedTextColor: '#2A2A2A',
        },
        ...(selectedDate !== todayString && {
            [todayString]: {
                marked: true,
                dotColor: '#2A2A2A',
            },
        }),
    };

    // Display label for selected date
    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setMinutes(
        selectedDateObj.getMinutes() + selectedDateObj.getTimezoneOffset()
    );
    const selectedLabel = format(selectedDateObj, 'EEEE, MMM d');  // "Monday, Jun 16"
    const isToday = selectedDate === todayString;

    const calendarTheme = {
        backgroundColor: 'transparent',
        calendarBackground: 'transparent',
        monthTextColor: isDark ? '#ffffff' : '#2A2A2A',
        textMonthFontFamily: 'Poppins_700Bold',
        textMonthFontSize: 22,
        arrowColor: isDark ? '#ffffff' : '#2A2A2A',
        textSectionTitleColor: isDark ? '#52525b' : '#a0a0b0',
        textDayHeaderFontFamily: 'Poppins_600SemiBold',
        textDayHeaderFontSize: 12,
        dayTextColor: isDark ? '#52525b' : '#52525b',
        textDayFontFamily: 'Poppins_600SemiBold',
        textDayFontSize: 11,
        textDisabledColor: isDark ? '#3f3f46' : '#d4d4d8',
        selectedDayBackgroundColor: '#FCE454',
        selectedDayTextColor: '#2A2A2A',
        todayTextColor: '#2A2A2A',
        todayBackgroundColor: 'transparent',
        dotColor: '#2A2A2A',
        selectedDotColor: '#2A2A2A',
    };

    return (
        <View className={`${isDark ? 'bg-zinc-950' : 'bg-white'}`}>

            {/* Static Calendar */}
            <View>
                <Calendar
                    key={isDark ? 'dark' : 'light'}
                    current={selectedDate}
                    onDayPress={(day: any) => onDateSelect(day.dateString)}
                    markedDates={markedDates}
                    theme={calendarTheme}
                    hideExtraDays={true}
                    enableSwipeMonths
                    renderHeader={(date: any) => {
                        const monthStr = format(new Date(date), 'MMM');
                        const yearStr = format(new Date(date), 'yyyy');
                        return (
                            <View className="flex-row items-center gap-2 py-1">
                                <Text className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                    {monthStr}
                                </Text>
                                <Text className={`text-2xl font-light tracking-tight ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                    {yearStr}
                                </Text>
                            </View>
                        );
                    }}
                    style={{ backgroundColor: 'transparent' }}
                />
            </View>

            {/* Always visible bar */}
            <View className={`flex-row items-center justify-between px-5 py-3 ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
                <View className="flex-row items-center gap-2">
                    <View className="w-2 h-2 rounded-full bg-indigo-700" />
                    <Text className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {selectedLabel}
                    </Text>


                    {isToday && (
                        <View className="bg-indigo-600/10 px-2 py-0.5 rounded-full">
                            <Text className="text-indigo-600 text-xs font-semibold">Today</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    onPress={() => onDateSelect(todayString)}
                    activeOpacity={0.7}
                    className={`px-4 py-1.5 rounded-full border ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}
                >
                    <Text className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        Today
                    </Text>
                </TouchableOpacity>
            </View>

            <View className={`h-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`} />
        </View>
    );
}