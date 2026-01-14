import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { createStyles, rpx } from '../../utils/rpxStyleSheet';
import { StatusBar } from '../../components/StatusBar';
import PointsDetail from '../../components/points-mall/PointsDetail';
import ExchangeRecords from '../../components/points-mall/ExchangeRecords';

const RATIO = 2;

export default function CurrencyRecordScreen() {
    const router = useRouter();
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const pagerTranslateX = useSharedValue(0);
    const currentIndex = useSharedValue(0);
    const [pagerWidth, setPagerWidth] = useState(0);

    const tabs = useMemo(
        () => [
            { key: 'currency' as const, label: '货币收支明细' },
            { key: 'order' as const, label: '订单记录' },
        ],
        [],
    );

    const TAB_STEP = rpx(85.9375); // 220 * 750 / 1920

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: -pagerTranslateX.value / (pagerWidth || 1) * TAB_STEP }],
    }));

    const pagerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: pagerTranslateX.value }],
    }));

    const clamp = (value: number, min: number, max: number) => {
        'worklet';
        return Math.min(Math.max(value, min), max);
    };

    const onLayoutPager = useCallback((e: LayoutChangeEvent) => {
        const width = e.nativeEvent.layout.width;
        setPagerWidth(width);
        pagerTranslateX.value = -activeTabIndex * width;
    }, [activeTabIndex, pagerTranslateX]);

    const animateToIndexJS = useCallback(
        (index: number, width: number) => {
            setActiveTabIndex(index);
            currentIndex.value = index;
            pagerTranslateX.value = withTiming(-index * width, { duration: 350 });
        },
        [pagerTranslateX, currentIndex],
    );

    const onTabPress = useCallback(
        (index: number) => {
            if (!pagerWidth) return;
            animateToIndexJS(index, pagerWidth);
        },
        [pagerWidth],
    );

    const panGesture = Gesture.Pan()
        .minDistance(5)
        .onEnd((event) => {
            const dx = event.translationX;
            const dy = event.translationY;
            const isHorizontal = Math.abs(dx) >= RATIO * Math.abs(dy);
            if (!isHorizontal) return;
            if (!pagerWidth) return;
            const threshold = 10;
            let target = currentIndex.value;
            if (dx < -threshold && currentIndex.value < 1) {
                target = 1;
            } else if (dx > threshold && currentIndex.value > 0) {
                target = 0;
            }
            currentIndex.value = target;
            pagerTranslateX.value = withTiming(-target * pagerWidth, { duration: 350 });
            runOnJS(setActiveTabIndex)(target);
        })
        .activateAfterLongPress(0)
        .shouldCancelWhenOutside(true)
        .failOffsetY([-10, 10]);

    const handleChevronBack = useCallback(() => {
        if (router.canGoBack?.()) {
            router.back()
        } else {
            // 如果不能返回，导航到时间商城
            router.replace("/(tabs)/points-mall")
        }
    }, [router])

    return (
        <LinearGradient
            colors={['#FFE7CD', '#F7F7F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.container}
        >
            <StatusBar theme="light" backgroundColor="transparent" translucent={true} />

            {/* 顶部导航 */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleChevronBack} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={rpx(17.1875)} color="#FF9000" />
                </TouchableOpacity>
                <Text style={styles.title}>货币记录</Text>
            </View>

            {/* 货币收支明细内容 */}
            <View style={styles.contentCard}>
                {/* 顶部tab标签 */}
                <View style={styles.tabsWrapper}>
                    <View style={styles.tabsRow}>
                        {tabs.map((tab, index) => {
                            const isActive = activeTabIndex === index;
                            return (
                                <TouchableOpacity
                                    key={tab.key}
                                    style={styles.tabItem}
                                    activeOpacity={0.8}
                                    onPress={() => onTabPress(index)}
                                >
                                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <Animated.View style={[styles.tabIndicator, indicatorStyle]} />
                </View>

                {/* 内容分页 */}
                <View style={styles.pagerOuter} onLayout={onLayoutPager}>
                    {/* <GestureDetector gesture={panGesture}> */}
                    <Animated.View style={[styles.pagerTrack, pagerStyle]}>
                        <View style={styles.page}>
                            <PointsDetail />
                        </View>
                        <View style={styles.page}>
                            <ExchangeRecords />
                        </View>
                    </Animated.View>
                    {/* </GestureDetector> */}
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = createStyles({
    container: {
        flex: 1,
        width: '100%' as const,
        height: '100%' as const,
        alignItems: 'center' as const,
    },
    header: {
        width: '100%' as const,
        height: 26.953125, // 69
        flexDirection: 'row' as const,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        position: 'relative' as const,
        marginTop: 37.5, // 96
    },
    backButton: {
        position: 'absolute' as const,
        width: 21.484375, // 55
        height: 21.484375, // 55
        left: 17.1875, // 44
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    title: {
        textAlign: 'center' as const,
        fontFamily: 'kingnam_bobo',
        fontWeight: '400' as const,
        fontSize: 12.5, // 32
        color: '#FF9000',
    },
    contentCard: {
        marginTop: 3.125, // 8
        width: 687.5, // 1760
        height: 408.75, // 1044
        backgroundColor: '#FFFFFF99',
        borderRadius: 7.8125, // 20
        padding: 7.8125, // 20
        justifyContent: 'flex-start' as const,
        alignItems: 'center' as const,
    },
    tabsWrapper: {
        width: '100%' as const,
        position: 'relative' as const,
        paddingHorizontal: 3.90625, // 10
        paddingVertical: 3.90625, // 10
        marginBottom: 7.8125, // 20
    },
    tabsRow: {
        width: '100%' as const,
        flexDirection: 'row' as const,
        justifyContent: 'flex-start' as const,
        alignItems: 'center' as const,
        gap: 7.8125, // 20
    },
    tabItem: {
        width: 78.125, // 200
        height: 19.53125, // 50
        alignItems: 'center' as const,
    },
    tabText: {
        fontWeight: '400' as const,
        fontSize: 11.71875, // 30
        color: '#777777',
    },
    tabTextActive: {
        color: '#000000',
    },
    tabIndicator: {
        position: 'absolute' as const,
        bottom: 0,
        left: 3.90625, // 10
        width: 78.125, // 200
        height: 1.953125, // 5
        backgroundColor: '#FF9000',
        borderRadius: 0.5859375, // 1.5
    },
    pagerOuter: {
        flex: 1,
        width: '100%' as const,
        overflow: 'hidden' as const,
        position: 'relative' as const,
    },
    pagerTrack: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '200%' as const,
        flexDirection: 'row' as const,
    },
    page: {
        width: '50%' as const,
        height: '100%' as const,
    },
});
