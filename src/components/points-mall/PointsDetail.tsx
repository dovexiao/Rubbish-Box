import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, ViewStyle } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { createStyles, rpx } from '../../utils/rpxStyleSheet';
import { getPoints, type PointsItem } from '../../services/pointsMall';

interface PointsDetailProps {
    style?: ViewStyle;
}

const perPage = 20;

const PointsDetail: React.FC<PointsDetailProps> = ({ style }) => {
    const [records, setRecords] = useState<PointsItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const loadingRef = useRef<boolean>(false);

    const loadRecords = useCallback(
        async (append: boolean = false) => {
            if (loadingRef.current) return;
            loadingRef.current = true;
            setLoading(true);
            try {
                const page = append ? currentPage + 1 : 1;
                const res = await getPoints({ page, per_page: perPage });
                if (res && res.points_list) {
                    setRecords((prev) => (append ? [...prev, ...res.points_list] : res.points_list));
                    setCurrentPage(res.current_page);
                    setHasNext(res.has_next);
                }
            } catch (error) {
                console.error('获取积分明细失败:', error);
            } finally {
                setLoading(false);
                setRefreshing(false);
                loadingRef.current = false;
            }
        },
        [currentPage, loading],
    );

    useFocusEffect(
        useCallback(() => {
            loadRecords(false);
        }, []),
    );

    // 上拉加载更多
    const onEndReached = useCallback(() => {
        if (hasNext && !loading) {
            loadRecords(true);
        }
    }, [hasNext, loading]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadRecords(false);
    }, []);

    const keyExtractor = useCallback((item: PointsItem) => String(item.id), []);

    const renderItem = useCallback(
        ({ item }: { item: PointsItem }) => (
            <View style={styles.recordItem}>
                <View style={styles.recordLeft}>
                    <Text style={styles.recordTitle}>{item.type_display}</Text>
                    <Text style={styles.recordTime}>{item.created_at}</Text>
                </View>
                <Text style={styles.recordAmount}>
                    {item.points > 0 ? `+${item.points}` : `${item.points}`}
                </Text>
            </View>
        ),
        [],
    );

    const listFooter = useCallback(() => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#FF9000" />
                    <Text style={styles.loadingText}>加载中...</Text>
                </View>
            );
        }
        if (!hasNext && records.length > 0) {
            return (
                <View style={styles.noMoreContainer}>
                    <Text style={styles.noMoreText}>没有更多数据了</Text>
                </View>
            );
        }
        if (!hasNext && records.length === 0) {
            return (
                <View style={styles.noMoreContainer}>
                    <Text style={styles.noMoreText}>没有数据</Text>
                </View>
            );
        }
        return null;
    }, [hasNext, loading, records.length]);

    return (
        <View style={[styles.listContainer, style]}>
            <FlatList
                data={records}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.2}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListFooterComponent={listFooter}
            />
        </View>
    );
};

const styles = createStyles({
    listContainer: {
        width: '100%' as const,
        flex: 1,
    },
    listContent: {
        width: '100%' as const,
    },
    recordItem: {
        width: '100%' as const,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
        paddingTop: 9.375, // 24
        paddingBottom: 9.375, // 24
        paddingLeft: 15.625, // 40
        paddingRight: 15.625, // 40
        borderBottomWidth: 0.390625, // 1px
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    recordLeft: {
        flexDirection: 'column' as const,
        gap: 3.125, // 8
    },
    recordTitle: {
        fontFamily: 'PingFang SC',
        fontWeight: '500' as const,
        fontSize: 10.9375, // 28
        color: '#000000',
    },
    recordTime: {
        fontFamily: 'PingFang SC',
        fontWeight: '400' as const,
        fontSize: 10.15625, // 26
        color: '#00000069',
    },
    recordAmount: {
        fontFamily: 'PingFang SC',
        fontWeight: '600' as const,
        fontSize: 10.9375, // 28
        color: '#000000',
    },
    loadingContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingVertical: 7.8125, // 20
        gap: 3.125, // 8
    },
    loadingText: {
        fontSize: 9.375, // 24
        color: '#666',
    },
    noMoreContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingVertical: 7.8125, // 20
    },
    noMoreText: {
        fontSize: 9.375, // 24
        color: '#999',
    },
});

export default PointsDetail;

