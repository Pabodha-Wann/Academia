import { useThemeStore } from '@/store/themestore';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Academia',
        titleHighlight: 'TRACKER',
        subtitle: 'YOUR ULTIMATE COMPANION FOR ACING THE SEMESTER.',
        image: require('@/assets/images/onboarding-1.png'),
    },
    {
        id: '2',
        title: 'Smart',
        titleHighlight: 'SCHEDULE',
        subtitle: 'NEVER MISS A CLASS WITH INTERACTIVE TIMELINES AND ALERTS.',
        image: require('@/assets/images/onboarding-2.png'),
    },
    {
        id: '3',
        title: 'Boost',
        titleHighlight: 'YOUR GPA',
        subtitle: 'LOG YOUR GRADES, TRACK CREDITS, AND WATCH YOUR PROGRESS GROW.',
        image: require('@/assets/images/onboarding-3.png'),
    }
];

export default function Onboarding() {
    const isDark = useThemeStore((state) => state.isDark);
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems[0]) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    async function handleComplete() {
        await AsyncStorage.setItem('@has_seen_onboarding', 'true');
        router.replace('/(tabs)/profile');
    }

    function scrollToNext() {
        if (currentIndex < SLIDES.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleComplete();
        }
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-[#F9FBE7]'}`}>

            {/* Top Image Area */}
            <View className="flex-1" style={{ paddingTop: insets.top, zIndex: 1 }}>
                <FlatList
                    data={SLIDES}
                    ref={slidesRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    renderItem={({ item }) => (

                        <View style={{ width }} className="flex-1 items-center justify-end pb-12">
                            <Image
                                source={item.image}
                                style={{
                                    width: width * 0.9,
                                    height: '100%',
                                    resizeMode: 'cover',
                                }}
                            />
                        </View>
                    )}
                />
            </View>

            {/* Bottom Content Area */}
            <View
                className={`px-8 pt-10 ${isDark ? 'bg-black' : 'bg-white'}`}
                style={{
                    borderTopLeftRadius: 48,
                    borderTopRightRadius: 48,
                    paddingBottom: insets.bottom + 20,
                    marginTop: -40,
                    zIndex: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -10 },
                    shadowOpacity: isDark ? 0 : 0.04,
                    shadowRadius: 20,
                    elevation: 10
                }}
            >
                {/* Dot Indicators */}
                <View className="flex-row justify-center mb-8 gap-2">
                    {SLIDES.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 24, 8],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={i}
                                className={`h-2 rounded-full ${isDark ? 'bg-[#FCE454]' : 'bg-[#2A2A2A]'}`}
                                style={{ width: dotWidth, opacity }}
                            />
                        );
                    })}
                </View>

                {/* Dynamic Text */}
                <Text className={`text-4xl font-black text-center tracking-tighter uppercase ${isDark ? 'text-white' : 'text-[#2A2A2A]'}`}>
                    {SLIDES[currentIndex].title}{' '}
                    <Text className="text-[#A18D14] dark:text-[#FCE454]">
                        {SLIDES[currentIndex].titleHighlight}
                    </Text>
                </Text>

                <Text className={`text-sm font-bold text-center mt-4 mb-10 tracking-widest leading-5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {SLIDES[currentIndex].subtitle}
                </Text>

                {/* Button */}
                <TouchableOpacity
                    onPress={scrollToNext}
                    activeOpacity={0.8}
                    className={`w-full py-5 rounded-2xl items-center flex-row justify-center gap-2 mt-auto ${isDark ? 'bg-[#FCE454]' : 'bg-[#2A2A2A]'}`}
                >
                    <Text className={`font-bold text-base tracking-wide ${isDark ? 'text-[#2A2A2A]' : 'text-[#FCE454]'}`}>
                        {currentIndex === SLIDES.length - 1 ? "LET'S START" : "NEXT"}
                    </Text>
                    {currentIndex < SLIDES.length - 1 && (
                        <Ionicons name="arrow-forward" size={18} color={isDark ? '#2A2A2A' : '#FCE454'} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}