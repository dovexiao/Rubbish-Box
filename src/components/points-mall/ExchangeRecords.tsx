import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { createStyles, rpx } from '../../utils/rpxStyleSheet';
import { getExchangeRecords, type ExchangeRecordItem, type ExchangeRecordsResponse } from '../../services/pointsMall';
import { Images } from '../../constants/Assets';
import { showError } from '../../utils/toast';
import ImageWithPlaceholder from '../common/ImageWithPlaceholder';

interface ExchangeRecordsProps {
    style?: ViewStyle;
}

const perPage = 20;

// 格式化日期
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}月${day}日${hours}:${minutes}`;
};

const ExchangeRecords: React.FC<ExchangeRecordsProps> = ({ style }) => {
    const [records, setRecords] = useState<ExchangeRecordItem[]>([]);
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
                const res: ExchangeRecordsResponse = await getExchangeRecords({
                    page: page.toString(),
                    per_page: perPage.toString(),
                });
                if (res && res.records) {
                    const newRecords = res.records.filter((item: ExchangeRecordItem) => item.logistics_status_display !== '已取消');
                    setRecords((prev) => (append ? [...prev, ...newRecords] : newRecords));
                    setCurrentPage(res.current_page);
                    setHasNext(res.has_next);
                }
            } catch (error) {
                console.error('获取兑换记录失败:', error);
                showError('获取数据失败，请重试');
            } finally {
                setLoading(false);
                setRefreshing(false);
                loadingRef.current = false;
            }
        },
        [currentPage],
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

    const keyExtractor = useCallback((item: ExchangeRecordItem) => String(item.id), []);

    // 查看物流
    const handleTrackOrder = useCallback((item: ExchangeRecordItem) => {
        showError('查看物流功能开发中');
    }, []);

    const renderItem = useCallback(
        ({ item }: { item: ExchangeRecordItem }) => (
            <View style={styles.recordItem}>
                {/* 商品图 */}
                <ImageWithPlaceholder
                    source={{ uri: item.image }}
                    style={styles.productImage}
                    resizeMode="cover"
                />
                {/* <Image
                    source={{ uri: item.image }}
                    style={styles.productImage}
                    resizeMode="cover"
                /> */}
                {/* 内容容器 */}
                <View style={styles.contentContainer}>
                    {/* 第一行：商品名称和订单状态 */}
                    <View style={styles.firstRow}>
                        <Text style={styles.productName} numberOfLines={1}>
                            {item.product_name}
                        </Text>
                        <Text style={styles.orderStatus}>{item.status_display}</Text>
                    </View>
                    {/* 第二行：金额和物流状态 */}
                    <View style={styles.secondRow}>
                        <View style={styles.amountContainer}>
                            <Image
                                source={Images.pointsMallPointsIcon}
                                style={styles.pointIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.amountText}>{Math.abs(item.change_amount)}</Text>
                        </View>
                        <View style={styles.logisticsPlaceholder} />
                    </View>
                    {/* 第三行：创建时间和操作按钮/物流状态 */}
                    <View style={styles.thirdRow}>
                        <Text style={styles.createTime}>{formatDate(item.created_at)}</Text>
                        {item.logistics_status_display === '待发货' && (
                            <View style={styles.actionButtonPending}>
                                <Text style={styles.actionButtonTextPending}>待发货</Text>
                            </View>
                        )}
                        {item.logistics_status_display === '运输中' && (
                            // <TouchableOpacity
                            //     style={styles.actionButtonShipping}
                            //     activeOpacity={0.7}
                            //     onPress={() => handleTrackOrder(item)}
                            // >
                            //     <Text style={styles.actionButtonTextShipping}>查看物流</Text>
                            // </TouchableOpacity>
                            <View style={styles.actionButtonShipping}>
                                <Text style={styles.actionButtonTextShipping}>{item.order_number}</Text>
                            </View>
                        )}
                    </View>
                </View>
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
        flex: 1,
        width: '100%' as const,
        height: '100%' as const,
    },
    listContent: {
        width: '100%' as const,
        gap: 4.6875, // 12
    },
    recordItem: {
        width: '100%' as const,
        height: 86.328125, // 221
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'flex-start' as const,
        padding: 7.8125, // 20
        borderRadius: 7.8125, //
        backgroundColor: '#FFFFFF',
    },
    productImage: {
        width: 70.3125, // 180
        height: 70.3125, // 180
        borderRadius: 7.8125, // 20
        marginRight: 67.578125, // 173
    },
    contentContainer: {
        flex: 1,
        // width: 533.984375, // 1367
        height: 70.703125, // 181
        flexDirection: 'column' as const,
        justifyContent: 'space-between' as const,
    },
    firstRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
    },
    productName: {
        fontFamily: 'PingFang SC',
        fontWeight: '400' as const,
        fontSize: 10.9375, // 28
        color: '#000000',
        flex: 1,
    },
    orderStatus: {
        fontFamily: 'PingFang SC',
        fontWeight: '400' as const,
        fontSize: 10.15625, // 26
        color: '#D59747',
    },
    secondRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
        paddingBottom: 4.6875, // 12
        borderBottomWidth: 1.171875,
        borderBottomColor: '#00000008',
    },
    amountContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 0.78125, // 2
    },
    pointIcon: {
        width: 18.75, // 48
        height: 18.75, // 48
    },
    amountText: {
        fontFamily: 'PingFang SC',
        fontWeight: '500' as const,
        fontSize: 12.5, // 32
        color: '#FF9000',
    },
    logisticsPlaceholder: {
        // 物流状态占位，暂不展示
    },
    thirdRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
    },
    createTime: {
        fontFamily: 'PingFang SC',
        fontWeight: '400' as const,
        fontSize: 10.9375, // 28
        color: '#00000080',
    },
    actionButtonPending: {
        borderRadius: 15.625, // 40
        height: 21.484375, // 55
        paddingTop: 3.125, // 8
        paddingBottom: 3.125, // 8
        paddingLeft: 9.375, // 24
        paddingRight: 9.375, // 24
        backgroundColor: '#F7F5ED',
    },
    actionButtonTextPending: {
        fontFamily: 'PingFang SC',
        fontWeight: '400' as const,
        fontSize: 10.9375, // 28
        color: '#00000099',
    },
    actionButtonShipping: {
        borderRadius: 15.625, // 40
        height: 21.484375, // 55
        paddingTop: 3.125, // 8
        paddingBottom: 3.125, // 8
        paddingLeft: 9.375, // 24
        paddingRight: 9.375, // 24
        backgroundColor: '#FFF0D8',
    },
    actionButtonTextShipping: {
        fontFamily: 'PingFang SC',
        fontWeight: '500' as const,
        fontSize: 10.9375, // 28
        color: '#FF8605',
    },
    loadingContainer: {
        width: '100%' as const,
        height: '100%' as const,
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
        flex: 1,
        width: '100%' as const,
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

export default ExchangeRecords;

