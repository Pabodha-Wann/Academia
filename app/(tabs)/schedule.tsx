import WeekCalendar from '@/components/WeekCalendar';
import { calculateDuration } from '@/database/queries/schedule';
import { useScheduleStore } from '@/store/scheduleStore';
import { useSubjectStore } from '@/store/subjectStore';
import { useThemeStore } from '@/store/themestore';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Linking,
  Text,
  TouchableOpacity,
  View,
  ScrollView
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



  useEffect(() => {
    loadSchedule(selectedDate);
  }, []);


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
      className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-[#FAFAFA]'}`}
    >
      {/* Calendar sits at the back, fixed */}
      <View
        className={`${isDark ? 'bg-[#121212]' : 'bg-[#FAFAFA]'}`}
        style={{ zIndex: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 4 }}>
        <WeekCalendar
          selectedDate={selectedDate}
          onDateSelect={(date) => setSelectedDate(date)}
        />
      </View>


      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 16 }}
      >
        <View
          className='px-6'
        >
          <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
            {isToday ? "Today's Schedule" : format(selectedDateObj, 'EEEE')}
          </Text>
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
            <View className="pb-10">
              {entries.map((entry) => {

                const isOnline = entry.type === 'Online';
                const meetingLink = entry.location?.startsWith('http') ? entry.location : null;
                const displayLocation = meetingLink && entry.location === meetingLink ? 'Online Meeting' : entry.location;

                return (
                  <View key={entry.id} className="flex-row mb-5">
                    {/* Time Column */}
                    <View className="w-[76px] pt-4 items-end pr-4">
                      <Text className={`text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {formatTime(entry.start_time)}
                      </Text>
                      <Text className={`text-[10px] mt-0.5 font-medium ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        {calculateDuration(entry.start_time, entry.end_time)}
                      </Text>
                    </View>

                    {/* Card Column */}
                    <View className="flex-1">
                      <TouchableOpacity
                        onLongPress={() => handleDelete(entry.id, entry.subject_name)}
                        onPress={() => router.push({
                          pathname: '/modals/add-schedule',
                          params: { entryId: entry.id }
                        })}
                        activeOpacity={0.9}
                        className="rounded-[24px] overflow-hidden"
                      >
                        {isDark ? (
                          <BlurView
                            intensity={30}
                            tint="dark"
                            className="p-4"
                            style={{
                              borderLeftWidth: 5,
                              borderLeftColor: entry.subject_color || '#FCE454',
                            }}
                          >
                            <View
                              className="absolute inset-0 border bg-white/5 border-white/10"
                              style={{ borderRadius: 24 }}
                              pointerEvents="none"
                            />
                            {/* Card Content */}
                            <View className="flex-row items-center justify-between mb-2">
                              <View className={`px-2.5 py-0.5 rounded-full ${isOnline ? 'bg-emerald-500/20' : 'bg-[#FCE454]/20'}`}>
                                <Text className={`text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'text-emerald-400' : 'text-[#FCE454]'}`}>
                                  {entry.type}
                                </Text>
                              </View>
                              <Ionicons name="ellipsis-vertical" size={14} color="#71717a" />
                            </View>

                            <Text className="font-bold text-base text-white mb-0.5">
                              {entry.subject_name}
                            </Text>
                            {entry.subject_code ? (
                              <Text className="text-[11px] font-semibold text-zinc-500 mb-2">
                                {entry.subject_code}
                              </Text>
                            ) : null}

                            <View className="flex-row items-center justify-between mt-2 flex-wrap gap-2">
                              <View className="flex-row items-center gap-1.5">
                                <Ionicons name="time-outline" size={13} color="#a1a1aa" />
                                <Text className="text-[11px] font-bold text-zinc-300">
                                  {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                                </Text>
                              </View>

                              <View className="flex-row items-center gap-3">
                                {entry.lecturer ? (
                                  <View className="flex-row items-center gap-1">
                                    <Ionicons name="person-outline" size={11} color="#71717a" />
                                    <Text className="text-[10px] font-semibold text-zinc-400">
                                      {entry.lecturer}
                                    </Text>
                                  </View>
                                ) : null}

                                {displayLocation && !meetingLink ? (
                                  <View className="flex-row items-center gap-1">
                                    <Ionicons name="location-outline" size={11} color="#71717a" />
                                    <Text className="text-[10px] font-semibold text-zinc-400">
                                      {displayLocation}
                                    </Text>
                                  </View>
                                ) : null}
                              </View>
                            </View>

                            {meetingLink && (
                              <TouchableOpacity
                                onPress={(e) => {
                                  e.stopPropagation();
                                  Linking.openURL(meetingLink).catch(() => Alert.alert("Error", "Could not open the link."));
                                }}
                                activeOpacity={0.8}
                                className="mt-3 bg-zinc-800 py-1.5 px-3 rounded-lg flex-row items-center justify-center gap-1.5 self-start"
                              >
                                <Ionicons name="videocam" size={12} color="#FCE454" />
                                <Text className="text-[#FCE454] font-bold text-[10px]">
                                  Join Class
                                </Text>
                              </TouchableOpacity>
                            )}
                          </BlurView>
                        ) : (
                          <View
                            className="bg-white p-4 border border-zinc-100"
                            style={{
                              borderLeftWidth: 5,
                              borderLeftColor: entry.subject_color || '#FCE454',
                              borderRadius: 24,
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.02,
                              shadowRadius: 4,
                              elevation: 1,
                            }}
                          >
                            <View className="flex-row items-center justify-between mb-2">
                              <View className={`px-2.5 py-0.5 rounded-full ${isOnline ? 'bg-emerald-50' : 'bg-[#FCE454]/15'}`}>
                                <Text className={`text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'text-emerald-700' : 'text-[#A18D14]'}`}>
                                  {entry.type}
                                </Text>
                              </View>
                              <Ionicons name="ellipsis-vertical" size={14} color="#a1a1aa" />
                            </View>

                            <Text className="font-bold text-base text-[#2A2A2A] mb-0.5">
                              {entry.subject_name}
                            </Text>
                            {entry.subject_code ? (
                              <Text className="text-[11px] font-semibold text-zinc-400 mb-2">
                                {entry.subject_code}
                              </Text>
                            ) : null}

                            <View className="flex-row items-center justify-between mt-2 flex-wrap gap-2">
                              <View className="flex-row items-center gap-1.5">
                                <Ionicons name="time-outline" size={13} color="#71717a" />
                                <Text className="text-[11px] font-bold text-zinc-600">
                                  {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                                </Text>
                              </View>

                              <View className="flex-row items-center gap-3">
                                {entry.lecturer ? (
                                  <View className="flex-row items-center gap-1">
                                    <Ionicons name="person-outline" size={11} color="#a1a1aa" />
                                    <Text className="text-[10px] font-semibold text-zinc-500">
                                      {entry.lecturer}
                                    </Text>
                                  </View>
                                ) : null}

                                {displayLocation && !meetingLink ? (
                                  <View className="flex-row items-center gap-1">
                                    <Ionicons name="location-outline" size={11} color="#a1a1aa" />
                                    <Text className="text-[10px] font-semibold text-zinc-500">
                                      {displayLocation}
                                    </Text>
                                  </View>
                                ) : null}
                              </View>
                            </View>

                            {meetingLink && (
                              <TouchableOpacity
                                onPress={(e) => {
                                  e.stopPropagation();
                                  Linking.openURL(meetingLink).catch(() => Alert.alert("Error", "Could not open the link."));
                                }}
                                activeOpacity={0.8}
                                className="mt-3 bg-[#2A2A2A] py-1.5 px-3 rounded-lg flex-row items-center justify-center gap-1.5 self-start"
                              >
                                <Ionicons name="videocam" size={12} color="#FCE454" />
                                <Text className="text-[#FCE454] font-bold text-[10px]">
                                  Join Class
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>


      <View className="absolute right-6 gap-4" style={{ bottom: insets.bottom - 40, zIndex: 20 }}>
        <TouchableOpacity
          onPress={() => subjects.length === 0 ? Alert.alert('No Subjects', 'Please add subjects first.') : router.push('/modals/add-schedule')}
          className={`w-14 h-14 rounded-full items-center justify-center ${isDark ? 'bg-zinc-100' : 'bg-[#2A2A2A]'}`}
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}
        >
          <Ionicons name="add" size={28} color={isDark ? '#2A2A2A' : '#FCE454'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/modals/subjects')}
          className="w-14 h-14 rounded-full items-center justify-center bg-[#FCE454]"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 }}
        >
          <Ionicons name="book-outline" size={22} color="#2A2A2A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}