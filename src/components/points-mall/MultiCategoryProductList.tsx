import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { createStyles, rpx } from '../../utils/rpxStyleSheet';
import { Images } from '../../constants/Assets';
import { CategoryItem, getMallList, MallListParams, type ProductItem } from '../../services/pointsMall';
import { useUserStore } from '../../stores/userStore';
import { showError } from '../../utils/toast';
import ImageWithPlaceholder from '../common/ImageWithPlaceholder';

interface MultiCategoryProductListProps {
    pageSize?: number;
    style?: StyleProp<ViewStyle>;
    onProductClick: (id: number) => void;
    scrollEnabled?: boolean;
    onScroll?: (event: any) => void;
}

const DEFAULT_CATEGORIES = ['热点推荐', '货币可兑', '学习文具', '亲子娱乐'];

const TAB_WIDTH = 140;
const TAB_GAP = 60;
const TAB_STEP = TAB_WIDTH + TAB_GAP;
const NUM_COLUMNS = 6;

// 补齐数组到指定倍数的辅助函数
const padToMultiple = <T,>(array: T[], multiple: number): (T | null)[] => {
    const remainder = array.length % multiple;
    if (remainder === 0) {
        return array;
    }
    const paddingCount = multiple - remainder;
    return [...array, ...Array(paddingCount).fill(null)];
};

const MultiCategoryProductList: React.FC<MultiCategoryProductListProps> = ({
    pageSize = 18,
    style,
    onProductClick,
    scrollEnabled = true,
    onScroll,
}) => {
    const [activeCategory, setActiveCategory] = useState(0);
    const [categories, setCategories] = useState<CategoryItem[]>([]); // 商品有分类的分类ID列表
    const indicatorTranslateX = useSharedValue(0);

    const [products, setProducts] = useState<(ProductItem | null)[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const isLoadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const currentPageRef = useRef(1);

    useEffect(() => {
        indicatorTranslateX.value = withTiming(activeCategory * rpx(TAB_STEP * 750 / 1920), { duration: 200 });
    }, [activeCategory]);

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
                const categoryName = DEFAULT_CATEGORIES[activeCategory];
                const matchedCategory = categories.find(category => category.name === categoryName);
                if (matchedCategory) {
                    params.category = matchedCategory.id;
                } else {
                    params.category = 0;
                    console.error('未找到分类:', categoryName);
                }
            }

            if (activeCategory === 1) {
                params.category = 0;
                params.redeemable_only = true;
            }

            // 以上，如果activeCategory为1，则获取积分可兑的商品列表，否则获取其他分类的商品列表，默认获取所有分类的商品列表

            // console.log('多类商品列表请求参数:', params);

            const res = await getMallList(params);

            console.log('多类商品列表响应数据:', res.items, res.categories);

            const items = res.items ?? [];
            
            if (currentPage === 1) {
                // 补齐到 6 的倍数
                const paddedItems = padToMultiple(items, NUM_COLUMNS);
                setProducts(paddedItems);
            } else {
                // 加载更多时，先移除之前的占位符，再添加新数据并补齐
                setProducts((prev) => {
                    const prevWithoutPlaceholders = prev.filter(item => item !== null) as ProductItem[];
                    const newItems = [...prevWithoutPlaceholders, ...items];
                    return padToMultiple(newItems, NUM_COLUMNS);
                });
            }

            const hasNext = res.pagination?.has_next ?? false;
            hasMoreRef.current = hasNext;
            setHasMore(hasNext);

            if (res.categories && res.categories.length > 0) {
                setCategories(res.categories);
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
    }, [pageSize, activeCategory, categories]);

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
    }, [fetchProducts]);

    useEffect(() => {
        fetchProducts();
    }, [activeCategory]);

    const keyExtractor = useCallback((item: ProductItem | null, index: number) => {
        if (item === null) {
            return `placeholder-${index}`;
        }
        return `product-${item.id}-${index}`;
    }, []);

    const renderItem = useCallback(
        ({ item }: { item: ProductItem | null }) => {
            // 空项占位符
            if (item === null) {
                return <View style={styles.placeholderCard} />;
            }
            
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
                    <ImageWithPlaceholder
                        source={{ uri: item.image }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                    {/* <Image source={{ uri: item.image, cache: 'reload' }} style={styles.productImage} resizeMode="cover" /> */}
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
        [onProductClick],
    );

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
                numColumns={NUM_COLUMNS}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                scrollEnabled={scrollEnabled}
                onScroll={onScroll}
                scrollEventThrottle={16}
                nestedScrollEnabled={true}
                onEndReached={loadMore}
                onEndReachedThreshold={0.4}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>暂无商品</Text>
                    </View>
                }
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
        width: 54.6875, // 140
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
        width: 54.6875, // 与 tabItem 同宽
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
    placeholderCard: {
        width: 84.375, // 216
        height: 116.796875, // 299
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
    emptyContainer: {
        // flex: 1,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingVertical: 15.625, // 20
        // borderWidth: 1,
        // borderColor: 'red',
    },
    emptyText: {
        fontSize: 11.71875, // 30
        color: '#999',
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
        // paddingVertical: 19.5313,
        // paddingTop: 3.90625, // 10
        paddingBottom: 27.34375, // 70
    },
    noMoreText: {
        fontSize: 8.984375, // 23
        color: '#999',
    },
});

export default MultiCategoryProductList;

