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
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const COLORS = [
    '#6366f1',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#f97316',
    '#8b5cf6',
    '#14b8a6',
];

export default function Subjects() {
    const isDark = useThemeStore((state) => state.isDark);
    const { subjects, loadSubjects, addSubject, removeSubject } = useSubjectStore();

    const [showPopup, setShowPopup] = useState(false);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    // Animation
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadSubjects();
    }, []);

    function openPopup() {
        setShowPopup(true);
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
    }

    function closePopup() {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.85,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowPopup(false);
            setName('');
            setCode('');
            setSelectedColor(COLORS[0]);
        });
    }

    function handleAdd() {
        if (!name.trim()) {
            Alert.alert('Error', 'Subject name is required.');
            return;
        }
        addSubject(name.trim(), code.trim(), selectedColor);
        closePopup();
    }

    function handleDelete(id: number, subjectName: string) {
        Alert.alert(
            'Delete Subject',
            `Delete "${subjectName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => removeSubject(id) },
            ]
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>

            {/* Header */}
            <View className="flex-row items-center px-6 pt-14 pb-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}
                >
                    <Ionicons name="close" size={20} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
                <Text className={`text-xl font-bold flex-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    Subjects
                </Text>
                {/* Add button */}
                <TouchableOpacity
                    onPress={openPopup}
                    className="bg-indigo-500 flex-row items-center gap-1.5 px-4 py-2.5 rounded-full"
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text className="text-white font-semibold text-sm">Add</Text>
                </TouchableOpacity>
            </View>

            {/* Subjects List */}
            <ScrollView
                className="flex-1"
                contentContainerClassName="px-6 pb-32"
                showsVerticalScrollIndicator={false}
            >
                {subjects.length === 0 ? (
                    <View className="items-center py-20">
                        <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                            <Ionicons name="book-outline" size={36} color={isDark ? '#52525b' : '#a1a1aa'} />
                        </View>
                        <Text className={`text-base font-semibold mb-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            No subjects yet
                        </Text>
                        <Text className={`text-sm text-center ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            Tap the Add button to get started
                        </Text>
                    </View>
                ) : (
                    <View className="gap-3">
                        {subjects.map((subject) => (
                            <View
                                key={subject.id}
                                className={`flex-row items-center rounded-2xl px-4 py-4 ${isDark ? 'bg-zinc-900' : 'bg-zinc-50'}`}
                            >
                                {/* Color bar */}
                                <View
                                    className="w-1 h-10 rounded-full mr-4"
                                    style={{ backgroundColor: subject.color }}
                                />
                                <View className="flex-1">
                                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        {subject.name}
                                    </Text>
                                    {subject.code ? (
                                        <Text className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                            {subject.code}
                                        </Text>
                                    ) : null}
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleDelete(subject.id, subject.name)}
                                    className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                                >
                                    <Ionicons name="trash-outline" size={15} color={isDark ? '#71717a' : '#a1a1aa'} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Popup Modal */}
            <Modal
                visible={showPopup}
                transparent
                animationType="none"
                onRequestClose={closePopup}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    {/* Backdrop */}
                    <Pressable className="absolute inset-0" onPress={closePopup}>
                        <BlurView
                            intensity={20}
                            tint={isDark ? 'dark' : 'light'}
                            className="flex-1"
                        />
                    </Pressable>

                    {/* Popup Card */}
                    <View className="flex-1 items-center justify-center px-6">
                        <Animated.View
                            style={{
                                transform: [{ scale: scaleAnim }],
                                opacity: opacityAnim,
                                width: '100%',
                            }}
                        >
                            <View className={`rounded-3xl p-6 ${isDark ? 'bg-zinc-900' : 'bg-white'}`}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 20 },
                                    shadowOpacity: isDark ? 0.6 : 0.15,
                                    shadowRadius: 40,
                                    elevation: 20,
                                }}
                            >
                                {/* Popup Header */}
                                <View className="flex-row items-center justify-between mb-6">
                                    <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        New Subject
                                    </Text>
                                    <TouchableOpacity
                                        onPress={closePopup}
                                        className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                                    >
                                        <Ionicons name="close" size={16} color={isDark ? '#a1a1aa' : '#71717a'} />
                                    </TouchableOpacity>
                                </View>

                                {/* Name Input */}
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Subject name"
                                    placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                                    autoFocus
                                    className={`rounded-2xl px-4 py-3.5 mb-3 text-base font-medium ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'}`}
                                />

                                {/* Code Input */}
                                <TextInput
                                    value={code}
                                    onChangeText={setCode}
                                    placeholder="Subject code (optional)"
                                    placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                                    className={`rounded-2xl px-4 py-3.5 mb-5 text-base font-medium ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'}`}
                                />

                                {/* Color Picker */}
                                <Text className={`text-xs font-semibold tracking-widest uppercase mb-3 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                    Color Tag
                                </Text>
                                <View className="flex-row gap-3 mb-6 flex-wrap">
                                    {COLORS.map((color) => (
                                        <TouchableOpacity
                                            key={color}
                                            onPress={() => setSelectedColor(color)}
                                            style={{ backgroundColor: color }}
                                            className="w-9 h-9 rounded-full items-center justify-center"
                                            activeOpacity={0.8}
                                        >
                                            {selectedColor === color && (
                                                <Ionicons name="checkmark" size={16} color="#fff" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Preview */}
                                <View
                                    className={`flex-row items-center rounded-2xl px-4 py-3 mb-5 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                                >
                                    <View
                                        className="w-1 h-8 rounded-full mr-3"
                                        style={{ backgroundColor: selectedColor }}
                                    />
                                    <View>
                                        <Text className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                            {name || 'Subject Name'}
                                        </Text>
                                        <Text className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                            {code || 'Subject Code'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Add Button */}
                                <TouchableOpacity
                                    className="bg-pink-500 py-4 rounded-2xl items-center"
                                    onPress={handleAdd}
                                    activeOpacity={0.8}
                                >
                                    <Text className="text-white font-bold text-base">
                                        Add Subject
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}