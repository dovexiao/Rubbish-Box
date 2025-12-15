import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { createStyles, rpx } from '../../utils/rpxStyleSheet';
import { Images } from '../../constants/Assets';
import { CategoryItem, getMallList, MallListParams, type ProductItem } from '../../services/pointsMall';
import { useUserStore } from '../../stores/userStore';
import { showError } from '../../utils/toast';
import { Ionicons } from '@expo/vector-icons';

interface MultiCategoryProductListProps {
    pageSize?: number;
    style?: StyleProp<ViewStyle>;
    onProductClick: (id: number) => void;
}

const DEFAULT_CATEGORIES = ['热点推荐', '积分可兑', '学习文具', '亲子娱乐'];

const TAB_WIDTH = 120;
const TAB_GAP = 60;
const TAB_STEP = TAB_WIDTH + TAB_GAP;

const MultiCategoryProductList: React.FC<MultiCategoryProductListProps> = ({
    pageSize = 18,
    style,
    onProductClick,
}) => {
    const [activeCategory, setActiveCategory] = useState(0);
    const [categories, setCategories] = useState<number[]>([]); // 商品有分类的分类ID列表
    const indicatorTranslateX = useSharedValue(0);

    const [products, setProducts] = useState<ProductItem[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const isLoadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const currentPageRef = useRef(1);

    useEffect(() => {
        indicatorTranslateX.value = withTiming(activeCategory * rpx(TAB_STEP * 750 / 1920), { duration: 200 });
    }, [activeCategory, indicatorTranslateX]);

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: indicatorTranslateX.value }],
    }));

    const fetchProducts = useCallback(async () => {
        if (isLoadingRef.current || !hasMoreRef.current) return;

        const token = useUserStore.getState().token;
        if (!token) return;

        isLoadingRef.current = true;
        setLoadingMore(true);
        const currentPage = currentPageRef.current;

        try {
            const params = {
                page: currentPage.toString(),
                per_page: pageSize.toString(),
                category: 0,
                redeemable_only: false,
            } as MallListParams;

            if (categories && categories.length > 0 && (activeCategory === 2 || activeCategory === 3)) {
                params.category = categories[activeCategory - 2] ?? 0;
            }

            if (activeCategory === 1) {
                params.category = 0;
                params.redeemable_only = true;
            }

            // 以上，如果activeCategory为1，则获取积分可兑的商品列表，否则获取其他分类的商品列表，默认获取所有分类的商品列表

            const res = await getMallList(params);

            const items = res.items ?? [];
            if (currentPage === 1) {
                setProducts(items);
            } else {
                setProducts((prev) => [...prev, ...items]);
            }

            const hasNext = res.pagination?.has_next ?? false;
            hasMoreRef.current = hasNext;
            setHasMore(hasNext);

            if (res.categories && res.categories.length > 0) {
                setCategories(res.categories.map((category: CategoryItem) => category.id));
            }

            if (hasNext) {
                currentPageRef.current = currentPage + 1;
            }
        } catch (error) {
            console.error('获取商品列表失败:', error);
            showError('获取商品列表失败，请重试');
        } finally {
            isLoadingRef.current = false;
            setLoadingMore(false);
        }
    }, [pageSize]);

    const switchCategory = useCallback(
        (index: number) => {
            setActiveCategory(index);
            setProducts([]);
            setHasMore(true);
            hasMoreRef.current = true;
            isLoadingRef.current = false;
            currentPageRef.current = 1;
        },
        [],
    );

    const loadMore = useCallback(() => {
        if (hasMoreRef.current && !isLoadingRef.current) {
            fetchProducts();
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [activeCategory]);

    const renderItem = useCallback(
        ({ item }: { item: ProductItem }) => {
            // const hasImage = !!item.image;
            return (
                <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => {
                    onProductClick(item.id)
                }}>
                    {/* {hasImage ? (
                        <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.placeholder}>
                            <Ionicons name="image-outline" size={rpx(40)} color="#B0B0B0" />
                        </View>
                    )} */}
                    {/* TODO  */}
                    <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
                    <Text style={styles.productName} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <View style={styles.bottomRow}>
                        <View style={styles.priceRow}>
                            <Image source={Images.pointsMallPointsIcon} style={styles.priceIcon} resizeMode="contain" />
                            <Text style={styles.priceText} numberOfLines={1}>{item.price}</Text>
                        </View>
                        <View style={styles.wantContainer}>
                            {/* <Text style={styles.wantText} numberOfLines={1}>{item.heat || ''}</Text>
                            {item.heat && item.heat > 0 && <Text style={styles.wantText}>人想要</Text>} */}
                        </View>
                    </View>
                </TouchableOpacity>
            );
        },
        [],
    );

    const keyExtractor = useCallback((item: ProductItem, index: number) => `product-${item.id}-${index}`, []);

    return (
        <View style={[styles.container, style]}>
            <View style={styles.tabsWrapper}>
                <View style={styles.tabsRow}>
                    {DEFAULT_CATEGORIES.map((category, index) => {
                        const isActive = activeCategory === index;
                        return (
                            <TouchableOpacity
                                key={category}
                                style={styles.tabItem}
                                activeOpacity={0.8}
                                onPress={() => switchCategory(index)}
                            >
                                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{category}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <Animated.View style={[styles.tabIndicator, indicatorStyle]} />
            </View>

            <FlatList
                data={products}
                keyExtractor={keyExtractor}
                numColumns={6}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMore}
                onEndReachedThreshold={0.4}
                ListFooterComponent={
                    loadingMore ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#FF8C00" />
                            <Text style={styles.loadingText}>正在加载...</Text>
                        </View>
                    ) : !hasMore && products.length > 0 ? (
                        <View style={styles.noMoreContainer}>
                            <Text style={styles.noMoreText}>没有更多商品了</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

const styles = createStyles({
    container: {
        width: 687.5, // 1760
        height: 346.875, // 888
        borderRadius: 15.625, // 40
        paddingTop: 12.109375, // 31
        paddingRight: 12.5, // 32
        paddingBottom: 12.109375, // 31
        paddingLeft: 12.5, // 32
        backgroundColor: '#FFFFFFCC',
        shadowColor: '#FFC55940',
        shadowOffset: { width: 0, height: -11 },
        shadowRadius: 7,
        shadowOpacity: 1,
        elevation: 8,
    },
    tabsWrapper: {
        width: '100%' as const,
        height: 32.03125, // 82
        paddingTop: 3.90625, // 10
        paddingRight: 6.640625, // 17
        paddingBottom: 3.90625, // 10
        paddingLeft: 6.640625, // 17
        position: 'relative' as const,
    },
    tabsRow: {
        width: '100%' as const,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 23.4375, // 60
    },
    tabItem: {
        width: 46.875, // 120
        height: 16.40625, // 42
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    tabText: {
        fontFamily: 'PingFang SC',
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
        left: 6.640625, // 17
        height: 4.6875, // 12
        width: 46.875, // 与 tabItem 同宽
        backgroundColor: '#FF8C00',
        borderRadius: 3.90625, // 10
        marginTop: 3.125, // 8
        marginBottom: 3.125, // 8
    },
    listContent: {
        flexGrow: 1,
        paddingTop: 3.515625, // 9
        paddingBottom: 3.515625, // 9
        rowGap: 14.0625, // 36
    },
    columnWrapper: {
        justifyContent: 'space-between' as const,
        // backgroundColor: 'green' as const,
        // columnGap: 14.0625, // 36
    },
    card: {
        width: 84.375, // 216
        height: 116.796875, // 299
        borderRadius: 11.71875, // 30
        padding: 3.125, // 8
        backgroundColor: '#FFF9EC',
        // backgroundColor: '#FFF9EC66',
        shadowColor: '#E9A99240',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10.45,
        shadowOpacity: 1,
        elevation: 10,
        alignItems: 'center' as const,
    },
    productImage: {
        width: 78.125, // 200
        height: 78.125, // 200
        borderRadius: 7.8125, // 20
        // borderWidth: 1,
        // borderColor: 'red',
    },
    placeholder: {
        width: 78.125, // 200
        height: 78.125, // 200
        borderRadius: 7.8125, // 20
        backgroundColor: '#EBEBEB',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    productName: {
        marginTop: 3.125, // 8
        fontFamily: 'PingFang SC',
        fontWeight: '400' as const,
        fontSize: 8.984375, // 23
        color: '#000000',
        width: '100%' as const,
        textAlign: 'left' as const,
    },
    bottomRow: {
        // marginTop: 1.5625, // 4
        width: '100%' as const,
        flexDirection: 'row' as const,
        // justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
    },
    priceRow: {
        flex: 1,
        flexDirection: 'row' as const,
        justifyContent: 'flex-start' as const,
        gap: 1.5625, // 4
    },
    priceIcon: {
        width: 14.0625, // 36
        height: 14.0625, // 36
    },
    priceText: {
        fontFamily: 'PingFang SC',
        fontWeight: '500' as const,
        fontSize: 10.9375, // 28
        color: '#000000',
    },
    wantContainer: {
        flex: 1,
        flexDirection: 'row' as const,
        justifyContent: 'flex-end' as const,
        alignItems: 'center' as const,
    },
    wantText: {
        fontFamily: 'PingFang SC',
        fontWeight: '400' as const,
        fontSize: 7.03125, // 18
        color: '#00000080',
    },
    loadingContainer: {
        // width: '100%' as const,
        // height: '100%' as const,
        // flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingVertical: 7.8125, // 20
        gap: 3.125, // 8
    },
    loadingText: {
        fontSize: 8.984375, // 23
        color: '#666',
    },
    noMoreContainer: {
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingVertical: 7.8125, // 20
    },
    noMoreText: {
        fontSize: 8.984375, // 23
        color: '#999',
    },
});

export default MultiCategoryProductList;

