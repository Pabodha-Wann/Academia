import WeekCalendar from '@/components/WeekCalendar';
import { calculateDuration } from '@/database/queries/schedule';
import { useScheduleStore } from '@/store/scheduleStore';
import { useSubjectStore } from '@/store/subjectStore';
import { useThemeStore } from '@/store/themestore';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export default function Schedule() {
  const isDark = useThemeStore((state) => state.isDark);
  const { entries, selectedDate, loadSchedule, setSelectedDate, removeEntry } = useScheduleStore();
  const { subjects } = useSubjectStore();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const { height: screenHeight } = useWindowDimensions();
  const CALENDAR_HEIGHT = screenHeight * 0.42;

  useEffect(() => {
    loadSchedule(selectedDate);
  }, []);



  // Schedule sheet slides up over calendar
  const sheetTranslateY = scrollY.interpolate({
    inputRange: [0, CALENDAR_HEIGHT],
    outputRange: [0, -CALENDAR_HEIGHT],
    extrapolate: 'clamp',
  });

  // Selected date display
  const selectedDateObj = new Date(selectedDate);
  selectedDateObj.setMinutes(
    selectedDateObj.getMinutes() + selectedDateObj.getTimezoneOffset()
  );
  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');

  function handleDelete(id: number, name: string) {
    Alert.alert('Delete Class', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeEntry(id, selectedDate),
      },
    ]);
  }

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-white'}`}
      style={{ paddingTop: insets.top }}
    >
      {/* Calendar sits at the back, fixed */}
      <View style={{ position: 'absolute', top: insets.top, left: 0, right: 0 }}>
        <WeekCalendar
          selectedDate={selectedDate}
          onDateSelect={(date) => setSelectedDate(date)}
          scrollY={scrollY}
        />
      </View>

      {/* Schedule sheet slides over calendar on scroll */}
      <Animated.View
        style={{
          flex: 1,
          marginTop: CALENDAR_HEIGHT,
          transform: [{ translateY: sheetTranslateY }],
          zIndex: 10,
        }}
      >
        <Animated.ScrollView
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {/* Sheet handle + date label */}
          <View
            className={`rounded-t-3xl pt-3 pb-4 px-6 ${isDark ? 'bg-zinc-950' : 'bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: isDark ? 0.4 : 0.06,
              shadowRadius: 12,
              elevation: 12,
            }}
          >
            {/* Drag handle */}
            <View className="items-center mb-4">
              <View
                className={`w-10 h-1 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}
              />
            </View>

            {/* Date row */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                {/* Date pill like screenshot */}
                <View className="bg-indigo-600 w-10 h-10 rounded-2xl items-center justify-center">
                  <Text className="text-white font-bold text-base">
                    {format(selectedDateObj, 'd')}
                  </Text>
                </View>
                <View>
                  <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {isToday ? "Today's Schedule" : format(selectedDateObj, 'EEEE')}
                  </Text>
                  <Text className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {format(selectedDateObj, 'MMMM yyyy')}
                  </Text>
                </View>
              </View>

              <Text className={`text-xs font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {entries.length} {entries.length === 1 ? 'class' : 'classes'}
              </Text>
            </View>
          </View>

          {/* Schedule entries */}
          <View
            className={`flex-1 px-6 pt-4 ${isDark ? 'bg-zinc-950' : 'bg-white'}`}
          >
            {entries.length === 0 ? (
              <View className="items-center py-16">
                <View className={`w-16 h-16 rounded-full items-center justify-center mb-3 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                  <Ionicons
                    name="calendar-outline"
                    size={28}
                    color={isDark ? '#52525b' : '#a1a1aa'}
                  />
                </View>
                <Text className={`text-sm font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  No classes scheduled
                </Text>
                <Text className={`text-xs mt-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  Tap + to add a class
                </Text>
              </View>
            ) : (
              <View>
                {entries.map((entry, index) => (
                  <View key={entry.id} className="flex-row">
                    {/* Time */}
                    <View className="w-16 pt-1 items-end pr-3">
                      <Text className={`text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {formatTime(entry.start_time)}
                      </Text>
                      <Text className={`text-xs mt-0.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        {calculateDuration(entry.start_time, entry.end_time)}
                      </Text>
                    </View>

                    {/* Timeline */}
                    <View className="items-center mr-3">
                      <View
                        className="w-2.5 h-2.5 rounded-full mt-1.5"
                        style={{ backgroundColor: entry.subject_color }}
                      />
                      {index < entries.length - 1 && (
                        <View
                          className="w-px flex-1 mt-1"
                          style={{ backgroundColor: entry.subject_color + '30' }}
                        />
                      )}
                    </View>

                    {/* Card */}
                    <View className="flex-1 pb-4">
                      <TouchableOpacity
                        onLongPress={() => handleDelete(entry.id, entry.subject_name)}
                        activeOpacity={0.8}
                        className={`rounded-2xl p-4 ${isDark ? 'bg-zinc-900' : 'bg-zinc-50'}`}
                        style={{
                          borderLeftWidth: 3,
                          borderLeftColor: entry.subject_color,
                        }}
                      >
                        <Text className={`font-bold text-sm mb-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                          {entry.subject_name}
                        </Text>
                        {entry.subject_code ? (
                          <Text className={`text-xs mb-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {entry.subject_code}
                          </Text>
                        ) : null}

                        <View className="flex-row items-center gap-1.5 mb-1">
                          <Ionicons name="person-circle-outline" size={13} color={isDark ? '#71717a' : '#a1a1aa'} />
                          <Text className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {entry.lecturer}
                          </Text>
                        </View>

                        {entry.location ? (
                          <View className="flex-row items-center gap-1.5 mb-2">
                            <Ionicons name="location-outline" size={13} color={isDark ? '#71717a' : '#a1a1aa'} />
                            <Text className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                              {entry.location}
                            </Text>
                          </View>
                        ) : null}

                        <View
                          className={`self-start px-2 py-0.5 rounded-full mt-1 ${entry.type === 'Online' ? 'bg-emerald-500/15' : 'bg-indigo-500/15'}`}
                        >
                          <Text className={`text-xs font-semibold ${entry.type === 'Online' ? 'text-emerald-500' : 'text-indigo-500'}`}>
                            {entry.type}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.ScrollView>
      </Animated.View>

      {/* FAB */}
      <TouchableOpacity
        onPress={() =>
          subjects.length === 0
            ? Alert.alert('No Subjects', 'Please add subjects first.')
            : router.push('/modals/add-schedule')
        }
        className="absolute bottom-28 right-6 w-14 h-14 bg-indigo-500 rounded-full items-center justify-center"
        style={{
          shadowColor: '#6366f1',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
          zIndex: 20,
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Subjects Button */}
      <TouchableOpacity
        onPress={() => router.push('/modals/subjects')}
        className="absolute bottom-28 left-6 w-14 h-14 bg-zinc-800 rounded-full items-center justify-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
          zIndex: 20,
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="book-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}