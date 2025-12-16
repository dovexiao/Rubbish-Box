import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleProp, ViewStyle, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createStyles, rpx } from '../../utils/rpxStyleSheet';
import { Images } from '../../constants/Assets';
import { getDiscountProductList, type DiscountProduct } from '../../services/pointsMall';
import { useUserStore } from '../../stores/userStore';
import { showError } from '../../utils/toast';
import ImageWithPlaceholder from '../common/ImageWithPlaceholder';

interface DiscountedProductWindowProps {
    style?: StyleProp<ViewStyle>;
    onProductClick: (id: number) => void;
}

const DiscountedProductWindow: React.FC<DiscountedProductWindowProps> = ({ style, onProductClick }) => {
    const [products, setProducts] = useState<DiscountProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const loadingRef = useRef(false);

    const fetchProducts = useCallback(async () => {
        // 使用 loadingRef 保证幂等
        if (loadingRef.current) {
            return;
        }

        const token = useUserStore.getState().token;
        if (!token) {
            console.log('未找到token，跳过折扣商品获取');
            return;
        }

        loadingRef.current = true;
        setLoading(true);

        try {
            const res = await getDiscountProductList();
            const items = res.discount_products ?? [];
            // 只取前5个
            setProducts(items.slice(0, 5));
            console.log('获取折扣商品成功:', items.slice(0, 5));    
        } catch (error) {
            console.error('获取折扣商品失败:', error);
            showError('获取折扣商品失败，请重试');
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <LinearGradient
            colors={['#FF8138', '#FF7575']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.container, style]}
        >
            {/* 标题 */}
            <Image
                source={Images.pointsMallDiscountedGoodsTitle}
                style={styles.titleImage}
                resizeMode="contain"
            />

            {/* 内容容器 */}
            <View style={styles.contentContainer}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FF8C00" />
                        <Text style={styles.loadingText}>加载中...</Text>
                    </View>
                ) : (
                    /* 商品容器 */
                    <View style={styles.productsContainer}>
                        {products.map((item, index) => (
                            <TouchableOpacity key={index} style={styles.productItem} onPress={() => onProductClick(item.id)}>
                                {/* 商品图片 */}
                                <ImageWithPlaceholder
                                    source={{ uri: item.image || '' }}
                                    style={styles.productImage}
                                    resizeMode="cover"
                                />
                                {/* <Image
                                    source={{ uri: item.image || '' }}
                                    style={styles.productImage}
                                    resizeMode="cover"
                                /> */}
                                {/* 商品名称 */}
                                <Text style={styles.productName} numberOfLines={1}>
                                    {item.name}
                                </Text>
                                {/* 底部：金额视图 + 兑换标识 */}
                                <View style={styles.bottomRow}>
                                    {/* 金额视图 */}
                                    <View style={styles.priceContainer}>
                                        <Image
                                            source={Images.pointsMallPointsIcon}
                                            style={styles.priceIcon}
                                            resizeMode="contain"
                                        />
                                        <Text style={styles.priceText} numberOfLines={1}>{item.price}</Text>
                                    </View>
                                    {/* 兑换标识 */}
                                    <Image
                                        source={Images.pointsMallDiscountedGoodsExchange}
                                        style={styles.exchangeIcon}
                                        resizeMode="contain"
                                    />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* 装饰素材 - 彩带 */}
            <Image
                source={Images.pointsMallDiscountedGoodsRibbons}
                style={styles.ribbonsDecoration}
                resizeMode="contain"
            />

            {/* 装饰素材 - 背景角 */}
            <Image
                source={Images.pointsMallDiscountProductBackgroundPaper}
                style={styles.backgroundPaperDecoration}
                resizeMode="contain"
            />
        </LinearGradient>
    );
};

const styles = createStyles({
    container: {
        width: 400, // 1024
        height: 143.75, // 368
        borderRadius: 11.71875, // 30
        paddingTop: 4.6875, // 12
        paddingRight: 7.8125, // 20
        paddingBottom: 5.46875, // 14
        paddingLeft: 7.8125, // 20
        shadowColor: '#E1620040',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 3.28125, // 8.4
        shadowOpacity: 1,
        elevation: 8,
        position: 'relative' as const,
    },
    titleImage: {
        width: 93.75, // 240
        height: 18.75, // 48
        marginBottom: 4.6875, // 12
    },
    contentContainer: {
        width: 385.546875, // 987
        height: 108.59375, // 278
        borderRadius: 11.71875, // 30
        padding: 6.25, // 16
        backgroundColor: '#FFFFFF',
    },
    productsContainer: {
        width: '100%' as const,
        height: '100%' as const,
        gap: 10.9375, // 28
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
    },
    loadingContainer: {
        width: '100%' as const,
        height: '100%' as const,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        gap: 3.125, // 8
    },
    loadingText: {
        fontSize: 9.375, // 24
        color: '#666666',
    },
    productItem: {
        width: 65.625, // 168
        height: 96.09375, // 246
        flexDirection: 'column' as const,
        alignItems: 'center' as const,
    },
    productImage: {
        width: 65.625, // 168
        height: 65.625, // 168
        borderRadius: 6.25, // 16
    },
    productName: {
        fontFamily: 'PingFang SC',
        fontWeight: '400' as const,
        fontSize: 9.375, // 24
        color: '#000000CC',
        textAlign: 'center' as const,
    },
    bottomRow: {
        flex: 1,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        // justifyContent: 'space-between' as const,
        width: '100%' as const,
        backgroundColor: '#FFFFFF7A',
    },
    priceContainer: {
        flex: 1,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
    },
    priceIcon: {
        width: 14.0625, // 36
        height: 14.0625, // 36
        marginRight: 1.5625, // 4
    },
    priceText: {
        fontFamily: 'PingFang SC',
        fontWeight: '600' as const,
        fontSize: 10.15625, // 26
        color: '#FF0000',
    },
    exchangeIcon: {
        width: 20.3125, // 52
        height: 17.1875, // 44
    },
    ribbonsDecoration: {
        position: 'absolute' as const,
        top: -15.234375, // -39
        left: 291.796875, // 747
        width: 112.890625, // 289
        height: 38.671875, // 99
        zIndex: 3,
    },
    backgroundPaperDecoration: {
        position: 'absolute' as const,
        left: 332.421875, // 851
        top: 0,
        width: 67.578125, // 173
        height: 31.640625, // 81
        zIndex: 2,
    },
});

export default DiscountedProductWindow;

