import { useGpaStore } from '@/store/gpaStore';
import { useProfileStore } from '@/store/profileStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useTaskStore } from '@/store/taskStore';
import { useThemeStore } from '@/store/themestore';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

function getGpaBarColor(gpa: number): string {
  if (gpa >= 3.5) return 'bg-green-500';
  if (gpa >= 3.0) return 'bg-[#FCE454]';
  if (gpa >= 2.0) return 'bg-orange-500';
  return 'bg-red-500';
}

function getGpaTextColor(gpa: number): string {
  if (gpa >= 3.5) return 'text-green-500';
  if (gpa >= 3.0) return 'text-[#FCE454]';
  if (gpa >= 2.0) return 'text-orange-500';
  return 'text-red-500';
}

function getGpaLabel(gpa: number): string {
  if (gpa >= 3.7) return 'Excellent';
  if (gpa >= 3.3) return 'Great';
  if (gpa >= 3.0) return 'Good';
  if (gpa >= 2.0) return 'Average';
  return 'Needs Work';
}

export default function Dashboard() {
  const isDark = useThemeStore((state) => state.isDark);
  const { profile, loadProfile } = useProfileStore();
  const { entries, calculatedGpa, loadEntries } = useGpaStore();
  const { entries: scheduleEntries, selectedDate: scheduleDate, loadSchedule } = useScheduleStore();
  const { tasks, selectedDate: taskDate, loadTasks } = useTaskStore();
  const insets = useSafeAreaInsets();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayObj = new Date();

  useEffect(() => {
    loadProfile();
    loadEntries();
    loadSchedule(today);
    loadTasks(today);
  }, []);

  const firstName = profile?.name?.split(' ')[0] ?? 'there';
  const gpaPercent = Math.min((calculatedGpa / 4.0) * 100, 100);

  // Today's pending tasks
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  // Next upcoming class
  const now = format(new Date(), 'HH:mm');
  const upcomingClasses = scheduleEntries.filter(
    (e) => e.start_time >= now
  );

  // Semester progress (mock — based on credits)
  const totalCreditsNeeded = 120;
  const creditsPercent = Math.min(
    ((profile?.credits ?? 0) / totalCreditsNeeded) * 100,
    100
  );

  return (
    <View
      className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-[#FAFAFA]'}`}
      style={{ paddingTop: insets.top }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-36"
      >
        {/* ── HEADER ── */}
        <View className="px-6 pt-5 pb-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text
                className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}
              >
                {getGreeting()},{'\n'}{firstName}
              </Text>
              <Text
                className={`text-sm mt-1.5 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
              >
                {format(todayObj, "EEEE, d MMMM yyyy")}
              </Text>
            </View>

            {/* Avatar */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.8}
            >
              {profile?.avatar_uri ? (
                <Image
                  source={{ uri: profile.avatar_uri }}
                  className="w-14 h-14 rounded-full"
                />
              ) : (
                <View
                  className={`w-14 h-14 rounded-full items-center justify-center border-2 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-200 border-zinc-300'}`}
                >
                  <Text className="text-2xl">🎓</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* BENTO STATS GRID */}
        <View className="px-6 mt-5">
          <View className="flex-row gap-3">

            {/* Ongoing — large dark card */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/tasks')}
              activeOpacity={0.85}
              className={`flex-1 rounded-3xl p-5 justify-between ${isDark ? 'bg-zinc-100' : 'bg-[#2A2A2A]'}`}
              style={{ minHeight: 160 }}
            >
              {/* Icon */}
              <View
                className={`w-11 h-11 rounded-2xl items-center justify-center ${isDark ? 'bg-zinc-300' : 'bg-zinc-700'}`}
              >
                <Ionicons
                  name="reload-circle-outline"
                  size={24}
                  color={isDark ? '#2A2A2A' : '#ffffff'}
                />
              </View>

              {/* Text + arrow */}
              <View>
                <Text
                  className={`text-lg font-black mb-0.5 ${isDark ? 'text-[#2A2A2A]' : 'text-white'}`}
                >
                  Ongoing
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-sm font-medium ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}
                  >
                    {pendingTasks.length} Tasks
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={isDark ? '#2A2A2A' : '#ffffff'}
                  />
                </View>
              </View>
            </TouchableOpacity>

            {/* Right column — two smaller cards */}
            <View className="flex-1 gap-3">

              {/* Pending — light green */}
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/tasks')}
                activeOpacity={0.85}
                className={`rounded-3xl p-4 justify-between ${isDark ? 'bg-emerald-950' : 'bg-emerald-50'}`}
                style={{ minHeight: 76 }}
              >
                <View className="flex-row items-start justify-between">
                  <Text
                    className={`text-sm font-black ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}
                  >
                    Pending
                  </Text>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={isDark ? '#6ee7b7' : '#059669'}
                  />
                </View>
                <View className="flex-row items-center justify-between mt-1">
                  <Text
                    className={`text-xs font-medium ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}
                  >
                    {pendingTasks.length} Tasks
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={13}
                    color={isDark ? '#6ee7b7' : '#059669'}
                  />
                </View>
              </TouchableOpacity>

              {/* Classes today — light blue */}
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/schedule')}
                activeOpacity={0.85}
                className={`rounded-3xl p-4 justify-between ${isDark ? 'bg-blue-950' : 'bg-blue-50'}`}
                style={{ minHeight: 76 }}
              >
                <View className="flex-row items-start justify-between">
                  <Text
                    className={`text-sm font-black ${isDark ? 'text-blue-300' : 'text-blue-800'}`}
                  >
                    Classes
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={isDark ? '#93c5fd' : '#2563eb'}
                  />
                </View>
                <View className="flex-row items-center justify-between mt-1">
                  <Text
                    className={`text-xs font-medium ${isDark ? 'text-blue-500' : 'text-blue-600'}`}
                  >
                    {scheduleEntries.length} Today
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={13}
                    color={isDark ? '#93c5fd' : '#2563eb'}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Completed + GPA teaser */}
          <View className="flex-row gap-3 mt-3">

            {/* Completed light */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/tasks')}
              activeOpacity={0.85}
              className={`flex-1 rounded-3xl p-4 ${isDark ? 'bg-[#FCE454]/10' : 'bg-[#FCE454]/30'}`}
              style={{ minHeight: 76 }}
            >
              <View className="flex-row items-start justify-between mb-2">
                <Text
                  className={`text-sm font-black ${isDark ? 'text-[#FCE454]' : 'text-[#2A2A2A]'}`}
                >
                  Completed
                </Text>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={isDark ? '#FCE454' : '#2A2A2A'}
                />
              </View>
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-xs font-medium ${isDark ? 'text-yellow-600' : 'text-[#2A2A2A]/60'}`}
                >
                  {doneTasks.length} Tasks
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={13}
                  color={isDark ? '#FCE454' : '#2A2A2A'}
                />
              </View>
            </TouchableOpacity>

            {/* GPA teaser */}
            <TouchableOpacity
              onPress={() => router.push('/modals/gpa-calculator')}
              activeOpacity={0.85}
              className={`flex-1 rounded-3xl p-4 ${isDark ? 'bg-purple-950' : 'bg-purple-50'}`}
              style={{ minHeight: 76 }}
            >
              <View className="flex-row items-start justify-between mb-2">
                <Text
                  className={`text-sm font-black ${isDark ? 'text-purple-300' : 'text-purple-800'}`}
                >
                  GPA
                </Text>
                <Ionicons
                  name="school-outline"
                  size={18}
                  color={isDark ? '#d8b4fe' : '#7c3aed'}
                />
              </View>
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-xs font-medium ${isDark ? 'text-purple-500' : 'text-purple-600'}`}
                >
                  {calculatedGpa.toFixed(2)} / 4.00
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={13}
                  color={isDark ? '#d8b4fe' : '#7c3aed'}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>


        {/* ── GPA CARD ── */}
        <View className="px-6 mt-5">
          <View
            className={`rounded-3xl p-5 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}
          >
            {/* Card header */}
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text
                  className={`text-xs font-semibold tracking-widest uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
                >
                  Academic GPA
                </Text>
                <Text
                  className={`text-base font-bold mt-0.5 ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}
                >
                  {getGpaLabel(calculatedGpa)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/modals/gpa-calculator')}
                className={`px-4 py-2 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                activeOpacity={0.8}
              >
                <Text className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                  Calculate
                </Text>
              </TouchableOpacity>
            </View>

            {/* GPA number + bar */}
            <View className="flex-row items-end gap-3 mb-3">
              <Text
                className={`text-5xl font-black ${getGpaTextColor(calculatedGpa)}`}
              >
                {calculatedGpa.toFixed(2)}
              </Text>
              <Text
                className={`text-sm mb-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
              >
                / 4.00
              </Text>
            </View>

            {/* Progress bar */}
            <View
              className={`h-3 rounded-full overflow-hidden mb-2 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
            >
              <View
                className={`h-full rounded-full ${getGpaBarColor(calculatedGpa)}`}
                style={{ width: `${gpaPercent}%` }}
              />
            </View>

            {/* Scale */}
            <View className="flex-row justify-between">
              {['0.0', '1.0', '2.0', '3.0', '4.0'].map((l) => (
                <Text
                  key={l}
                  className={`text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`}
                >
                  {l}
                </Text>
              ))}
            </View>

            {/* Per semester breakdown */}
            {entries.length > 0 && (
              <View
                className={`mt-4 pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}
              >
                <Text
                  className={`text-xs font-semibold tracking-widest uppercase mb-3 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
                >
                  Recent Subjects
                </Text>
                <View className="gap-2">
                  {entries.slice(0, 4).map((entry) => (
                    <View
                      key={entry.id}
                      className="flex-row items-center"
                    >
                      {/* Grade pill */}
                      <View className="w-9 h-9 rounded-xl bg-[#FCE454] items-center justify-center mr-3">
                        <Text className="text-[#2A2A2A] font-black text-xs">
                          {entry.grade}
                        </Text>
                      </View>

                      {/* Subject name */}
                      <Text
                        className={`flex-1 text-sm font-medium ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}
                        numberOfLines={1}
                      >
                        {entry.subject}
                      </Text>

                      {/* Credits */}
                      <Text
                        className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
                      >
                        {entry.credits} cr
                      </Text>
                    </View>
                  ))}
                </View>

                {entries.length > 4 && (
                  <TouchableOpacity
                    onPress={() => router.push('/modals/gpa-calculator')}
                    className="mt-3 items-center"
                    activeOpacity={0.7}
                  >
                    <Text className="text-xs font-semibold text-[#FCE454]">
                      See all {entries.length} subjects →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Empty state */}
            {entries.length === 0 && (
              <TouchableOpacity
                onPress={() => router.push('/modals/gpa-calculator')}
                className={`mt-4 py-4 rounded-2xl items-center border border-dashed ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}
                activeOpacity={0.7}
              >

                <Text
                  className={`text-sm font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
                >
                  Add subjects to track GPA
                </Text>
                <Text className="text-sm font-semibold mt-1">
                  OPEN CALCULATOR
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/*CREDITS PROGRESS  */}
        <View className="px-6 mt-4">
          <View
            className={`rounded-3xl p-5 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text
                  className={`text-xs font-semibold tracking-widest uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
                >
                  Semester Progress
                </Text>
                <Text
                  className={`text-base font-bold mt-0.5 ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}
                >
                  {profile?.credits ?? 0} / 120 Credits
                </Text>
              </View>
              <Text className="text-2xl font-black text-[#FCE454]">
                {creditsPercent.toFixed(0)}%
              </Text>
            </View>

            <View
              className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
            >
              <View
                className="h-full rounded-full bg-[#FCE454]"
                style={{ width: `${creditsPercent}%` }}
              />
            </View>
          </View>
        </View>

        {/* ── TODAY'S SCHEDULE ── */}
        <View className="px-6 mt-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text
              className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}
            >
              Today's Classes
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/schedule')}
              activeOpacity={0.7}
            >
              <Text className="text-xs font-semibold text-[#FCE454]">
                See all →
              </Text>
            </TouchableOpacity>
          </View>

          {scheduleEntries.length === 0 ? (
            <View
              className={`rounded-2xl p-6 items-center border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}
            >
              <Text className="text-3xl mb-2">📭</Text>
              <Text
                className={`text-sm font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
              >
                No classes today
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {scheduleEntries.slice(0, 3).map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  onPress={() => router.push('/(tabs)/schedule')}
                  activeOpacity={0.8}
                  className={`rounded-2xl p-4 border flex-row items-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}
                  style={{ borderLeftWidth: 3, borderLeftColor: entry.subject_color }}
                >
                  {/* Time */}
                  <View className="mr-4">
                    <Text
                      className={`text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
                    >
                      {formatTime(entry.start_time)}
                    </Text>
                    <Text
                      className={`text-xs mt-0.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}
                    >
                      {formatTime(entry.end_time)}
                    </Text>
                  </View>

                  {/* Info */}
                  <View className="flex-1">
                    <Text
                      className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}
                      numberOfLines={1}
                    >
                      {entry.subject_name}
                    </Text>
                    <Text
                      className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
                      numberOfLines={1}
                    >
                      {entry.lecturer}
                      {entry.location ? ` · ${entry.location}` : ''}
                    </Text>
                  </View>

                  {/* Type badge */}
                  <View
                    className={`px-2.5 py-1 rounded-full ${entry.type === 'Online' ? 'bg-green-500/15' : 'bg-[#FCE454]/20'}`}
                  >
                    <Text
                      className={`text-xs font-bold ${entry.type === 'Online' ? 'text-green-500' : 'text-[#2A2A2A]'}`}
                    >
                      {entry.type}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── TODAY'S TASKS ── */}
        <View className="px-6 mt-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text
              className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}
            >
              Today's Tasks
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/tasks')}
              activeOpacity={0.7}
            >
              <Text className="text-xs font-semibold text-[#FCE454]">
                See all →
              </Text>
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <View
              className={`rounded-2xl p-6 items-center border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}
            >
              <Text className="text-3xl mb-2">✅</Text>
              <Text
                className={`text-sm font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
              >
                No tasks for today
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {tasks.slice(0, 3).map((task) => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => router.push('/(tabs)/tasks')}
                  activeOpacity={0.8}
                  className={`rounded-2xl p-4 border flex-row items-center gap-3 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}
                  style={{ opacity: task.status === 'done' ? 0.5 : 1 }}
                >
                  {/* Status dot */}
                  <View
                    className={`w-6 h-6 rounded-md border-2 items-center justify-center ${task.status === 'done'
                      ? 'bg-[#2A2A2A] border-[#2A2A2A]'
                      : isDark ? 'border-zinc-600' : 'border-zinc-300'
                      }`}
                  >
                    {task.status === 'done' && (
                      <Ionicons name="checkmark" size={13} color="#FCE454" />
                    )}
                  </View>

                  {/* Title */}
                  <View className="flex-1">
                    <Text
                      className={`font-semibold text-sm ${task.status === 'done'
                        ? 'line-through text-zinc-400'
                        : isDark ? 'text-white' : 'text-[#2A2A2A]'
                        }`}
                      numberOfLines={1}
                    >
                      {task.title}
                    </Text>
                    {task.subject_name && (
                      <View className="flex-row items-center gap-1.5 mt-0.5">
                        <View
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: task.subject_color ?? '#FCE454' }}
                        />
                        <Text
                          className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
                        >
                          {task.subject_name}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Priority */}
                  {task.priority === 'high' && (
                    <View className="bg-red-500/10 px-2 py-0.5 rounded-md">
                      <Text className="text-red-500 text-xs font-bold">
                        High
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}