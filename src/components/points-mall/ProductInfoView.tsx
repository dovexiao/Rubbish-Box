import React, { useCallback, useEffect, useState, useRef, useMemo } from "react"
import { View, Text, Image, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from "react-native"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { Images } from "../../constants/Assets"
import { LinearGradient } from "expo-linear-gradient"
import { getProductDetail, ProductDetailData, PointsItem, ProductImage, AddressItem } from "../../services/pointsMall"
import ImageWithPlaceholder from "../common/ImageWithPlaceholder"
import { devError } from "../../services/WebSocketManager"
import { useProductDetailStore } from "../../stores/points-mall/productDetailStore"

interface ProductInfoViewProps {
    productId: number | null
    onNext?: () => void
}

/**
 * 商品信息视图组件
 */
const ProductInfoView: React.FC<ProductInfoViewProps> = ({
    productId,
    onNext,
}) => {
    const [product, setProduct] = useState<ProductDetailData | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [detailImages, setDetailImages] = useState<ProductImage[]>([]);
    const [loading, setLoading] = useState(false);
    const loadingRef = useRef<boolean>(false);

    const productName = useProductDetailStore((state) => state.productName);
    const price = useProductDetailStore((state) => state.price);

    // 请求商品详情
    const loadProductDetail = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        const updateProductInfo = useProductDetailStore.getState().updateProductInfo;

        try {
            const result = await getProductDetail({ product_id: productId?.toString() ?? '' });
            if (result) {
                setProduct(result);
                setDetailImages(result.detail_image ?? []);
                // 更新 store 中的商品信息
                updateProductInfo(
                    result.name,
                    result.price,
                    result.main_image
                );
            } else {
                updateProductInfo(null, null, null);
            }
        } catch (error: unknown) {
            devError("获取商品详情失败:", error);
            setProduct(null);
            updateProductInfo(null, null, null);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [productId]);

    useEffect(() => {
        loadProductDetail();
    }, [loadProductDetail]);

    // 处理可见项变化
    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentImageIndex(viewableItems[0].index || 0)
        }
    }).current

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current

    // 渲染图片项
    const renderImageItem = useCallback(
        ({ item }: { item: ProductImage }) => (
            <View style={styles.imagePageContainer}>
                <ImageWithPlaceholder
                    source={{ uri: item.url }}
                    style={styles.detailImage}
                    resizeMode="cover"
                />
                {/* <Image
                    source={{ uri: item.url }}
                    style={styles.detailImage}
                    resizeMode="cover"
                /> */}
            </View>
        ),
        [],
    )

    const keyExtractor = useCallback((item: ProductImage, index: number) => `detail-image-${item.id || index}`, [])

    // 判断商品 id 是否合法
    const isProductIdValid = useMemo(() => {
        return productId !== null && productId !== undefined;
    }, [productId]);

    // 判断按钮是否可用：商品 id 合法且 loading 为 false
    const isButtonEnabled = useMemo(() => {
        return isProductIdValid && !loading;
    }, [isProductIdValid, loading]);

    return (
        <>
            <View style={styles.headerContainer}>
                <Text style={styles.titleText}>商品详情</Text>
            </View>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* 商品详情图片轮播 */}
                {detailImages.length > 0 && (
                    <View style={styles.imageCarouselContainer}>
                        <FlatList
                            data={detailImages}
                            renderItem={renderImageItem}
                            keyExtractor={keyExtractor}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            nestedScrollEnabled={true}
                            onViewableItemsChanged={onViewableItemsChanged}
                            viewabilityConfig={viewabilityConfig}
                            style={styles.imageFlatList}
                            getItemLayout={(data, index) => {
                                const pageWidth = rpx(378.125) // 968 (容器宽度减去左右 padding)
                                return {
                                    length: pageWidth,
                                    offset: pageWidth * index,
                                    index,
                                }
                            }}
                        />
                        {/* 页码指示器 */}
                        {detailImages.length > 1 && (
                            <View style={styles.pageIndicator}>
                                <Text style={styles.pageIndicatorText}>
                                    {currentImageIndex + 1}/{detailImages.length}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* 子视图1：商品信息 */}
                <View style={styles.productInfoCard}>
                    {loading ? (
                        // Loading 占位
                        <View style={styles.productInfoPlaceholder}>
                            <ActivityIndicator size="large" color="#FF9822" />
                        </View>
                    ) : (
                        <>
                            {/* 第一行：金额视图和会员标识视图 */}
                            <View style={styles.firstRow}>
                                {/* 金额视图 */}
                                <View style={styles.priceContainer}>
                                    <Image
                                        source={Images.pointsMallPointsIcon}
                                        style={styles.priceIcon}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.priceText}>{String(price)}</Text>
                                </View>
                                {/* 会员标识视图 */}
                                {/* {isMember && (
                                    <View style={styles.memberBadge}>
                                        <Image
                                            source={Images.pointsMallMemberBadge}
                                            style={styles.memberIcon}
                                            resizeMode="contain"
                                        />
                                        <Text style={styles.memberText}>会员</Text>
                                    </View>
                                )} */}
                            </View>
                            {/* 第二行：商品名称和想要人数 */}
                            <View style={styles.secondRow}>
                                <Text style={styles.productName} numberOfLines={1}>
                                    {productName}
                                </Text>
                                {product?.heat && product?.heat > 0 ? (
                                    <Text style={styles.heatText}>{String(product?.heat)}人想要</Text>
                                ) : null}
                            </View>
                        </>
                    )}
                </View>

                {/* 子视图2：使用方法 */}
                <View style={styles.usageCard}>
                    <Text style={styles.sectionTitle}>使用方法</Text>
                    <View style={styles.usageSteps}>
                        <View style={styles.stepItem}>
                            <Image
                                source={Images.pointsMallProductSelection}
                                style={styles.stepIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.stepText}>选择商品</Text>
                        </View>
                        <Image
                            source={Images.pointsMallDottedLine}
                            style={styles.dottedLine}
                            resizeMode="contain"
                        />
                        <View style={styles.stepItem}>
                            <Image
                                source={Images.pointsMallFillInShippingAddress}
                                style={styles.stepIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.stepText}>填写收货信息</Text>
                        </View>
                        <Image
                            source={Images.pointsMallDottedLine}
                            style={styles.dottedLine}
                            resizeMode="contain"
                        />
                        <View style={styles.stepItem}>
                            <Image
                                source={Images.pointsMallConfirmInventoryStatus}
                                style={styles.stepIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.stepText}>确认库存状态</Text>
                        </View>
                        <Image
                            source={Images.pointsMallDottedLine}
                            style={styles.dottedLine}
                            resizeMode="contain"
                        />
                        <View style={styles.stepItem}>
                            <Image
                                source={Images.pointsMallPayForGoods}
                                style={styles.stepIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.stepText}>支付收货</Text>
                        </View>
                    </View>
                </View>

                {/* 子视图3：兑换条件 */}
                <View style={styles.conditionsCard}>
                    <Text style={styles.sectionTitle}>兑换条件</Text>
                    <View style={styles.conditionsList}>
                        {/* 第二行 */}
                        <View style={styles.conditionItem}>
                            <Text style={styles.conditionLabel}>兑后须知</Text>
                            <Text style={styles.conditionValue}>
                                兑后48h内发货，不支持七天无理由
                            </Text>
                        </View>
                        {/* 第三行 */}
                        <View style={styles.conditionItem}>
                            <Text style={styles.conditionLabel}>城市</Text>
                            <Text style={styles.conditionValue}>
                                新疆、西藏、内蒙古、青海、海南、宁夏、港澳台及海外地区暂不支持发货、实际发货以下单页面展示为准。
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 高度占位 */}
                <View style={{ height: rpx(97.65625) }} />
            </ScrollView>
            {/* 下一步按钮 */}
            {onNext && (
                <TouchableOpacity
                    style={[styles.nextButton, !isButtonEnabled && styles.nextButtonDisabled]}
                    activeOpacity={isButtonEnabled ? 0.8 : 1}
                    onPress={isButtonEnabled ? onNext : undefined}
                    disabled={!isButtonEnabled}
                >
                    <LinearGradient
                        colors={isButtonEnabled ? ['#FFDCBC', '#FFBB7B'] : ['#CCCCCC', '#999999']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.nextButtonGradient}
                    >
                        <Text style={[styles.nextButtonText, !isButtonEnabled && styles.nextButtonTextDisabled]}>
                            立即兑换
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </>

    )
}

const styles = createStyles({
    container: {
        width: '100%' as const,
        height: '100%' as const,
        padding: 14.0625, // 36
        paddingTop: 39.84375, // 102
        // gap: 7.8125, // 20
        backgroundColor: "#F5F5F5" as const,
    },
    headerContainer: {
        position: "absolute" as const,
        top: 0,
        left: 0,
        width: '100%' as const,
        height: 38.2813, // 98
        flexDirection: "row" as const,
        backgroundColor: "#F5F5F5" as const,
        justifyContent: "center" as const,
        alignItems: "center" as const,
        zIndex: 2,
    },
    titleText: {
        fontFamily: "PingFang SC",
        fontWeight: "400" as const,
        fontSize: 11.7188, // 30
        color: "#000000",
    },
    imageCarouselContainer: {
        width: "100%" as const,
        height: 139.0625, // 356
    },
    imageFlatList: {
        width: "100%" as const,
        height: "100%" as const,
    },
    imagePageContainer: {
        width: 378.125, // 968 (容器宽度减去左右 padding: 406.25 - 14.0625 * 2)
        height: "100%" as const,
        justifyContent: "center" as const,
        alignItems: "center" as const,
    },
    detailImage: {
        width: 123.4375, // 316
        height: 123.4375, // 316
        borderRadius: 3.90625, // 10
    },
    pageIndicator: {
        position: "absolute" as const,
        bottom: 7.8125, // 20
        right: 7.8125, // 20
        width: 31.25, // 80
        height: 14.84375, // 38
        backgroundColor: "#00000026",
        borderRadius: 7.8125, // 20
        justifyContent: "center" as const,
        alignItems: "center" as const,
    },
    pageIndicatorText: {
        fontFamily: "PingFang SC",
        fontWeight: "500" as const,
        fontSize: 9.375, // 24
        color: "#FFFFFF",
    },
    productInfoCard: {
        width: "100%" as const,
        height: 66.40625, // 170
        borderRadius: 7.8125, // 20
        paddingVertical: 10.9375, // 28
        paddingHorizontal: 15.625, // 40
        marginBottom: 7.8125, // 20
        backgroundColor: "#FFFFFF" as const,
    },
    firstRow: {
        flexDirection: "row" as const,
        justifyContent: "space-between" as const,
        alignItems: "center" as const,
        marginBottom: 7.8125, // 20
    },
    priceContainer: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 3.125, // 8
    },
    priceIcon: {
        width: 20.3125, // 52
        height: 20.3125, // 52
    },
    priceText: {
        fontFamily: "PingFang SC",
        fontWeight: "600" as const,
        fontSize: 15.625, // 40
        color: "#FF9822",
    },
    memberBadge: {
        backgroundColor: "#FFEFC391",
        height: 18.75, // 48
        paddingVertical: 1.5625, // 4
        paddingHorizontal: 4.6875, // 12
        borderRadius: 7.8125, // 20
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 3.125, // 8
    },
    memberIcon: {
        width: 15.625, // 40
        height: 15.625, // 40
    },
    memberText: {
        fontFamily: "PingFang SC",
        fontWeight: "600" as const,
        fontSize: 8.59375, // 22
        color: "#FFBF28",
    },
    secondRow: {
        flexDirection: "row" as const,
        justifyContent: "space-between" as const,
        alignItems: "center" as const,
        gap: 10.9375, // 28
    },
    productName: {
        flex: 1,
        fontFamily: "PingFang SC",
        fontWeight: "bold" as const,
        fontSize: 11.71875, // 30
        color: "#000000CC",
    },
    productInfoPlaceholder: {
        width: "100%" as const,
        height: "100%" as const,
        justifyContent: "center" as const,
        alignItems: "center" as const,
    },
    heatText: {
        fontFamily: "PingFang SC",
        fontWeight: "300" as const,
        fontSize: 9.375, // 24
        color: "#000000E5",
    },
    usageCard: {
        width: "100%" as const,
        height: 84.765625, // 217
        borderRadius: 7.8125, // 20
        backgroundColor: "#FFFFFF",
        paddingVertical: 10.9375, // 28
        paddingHorizontal: 15.625, // 40
        marginBottom: 7.8125, // 20
        gap: 6.25, // 16
    },
    sectionTitle: {
        fontFamily: "PingFang SC",
        fontWeight: "bold" as const,
        fontSize: 11.71875, // 30
        color: "#000000CC",
        // marginBottom: 7.8125, // 20
    },
    usageSteps: {
        height: 35.9375, // 92
        width: "100%" as const,
        flexDirection: "row" as const,
        justifyContent: "space-evenly" as const,
        alignItems: "center" as const,
    },
    stepItem: {
        // flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 2.34375, // 6
    },
    stepIcon: {
        width: 20.3125, // 52
        height: 20.3125, // 52
    },
    stepText: {
        fontFamily: "PingFang SC",
        fontWeight: "300" as const,
        fontSize: 9.375, // 24
        color: "#6FABDF",
    },
    dottedLine: {
        width: 44.140625, // 113
        height: 1.171875, // 3
    },
    conditionsCard: {
        width: "100%" as const,
        borderRadius: 7.8125, // 20
        paddingVertical: 10.9375, // 28
        paddingHorizontal: 15.625, // 40
        // marginBottom: 45.3125, // 116
        backgroundColor: "#FFFFFF",
        gap: 12.5, // 32
    },
    conditionsList: {
        width: "100%" as const,
        gap: 12.5, // 32
    },
    conditionItem: {
        width: "100%" as const,
        flexDirection: "row" as const,
        gap: 14.0625, // 36
        // borderWidth: 1,
        // borderColor: "red",
    },
    conditionLabel: {
        width: 46.875, // 120
        fontFamily: "PingFang SC",
        fontWeight: "300" as const,
        fontSize: 10.15625, // 26
        color: "#000000CC",
    },
    conditionValue: {
        width: 301.5625, // 772
        fontFamily: "PingFang SC",
        fontWeight: "300" as const,
        fontSize: 10.15625, // 26
        color: "#000000",
    },
    nextButton: {
        position: "absolute" as const,
        bottom: 10.9375, // 28
        left: 108.0078125, // 276.5
        width: 187.5, // 480
        height: 33.203125, // 85
        backgroundColor: "#FF8C00",
        borderRadius: 15.625, // 40
        overflow: "hidden" as const,
    },
    nextButtonGradient: {
        width: "100%" as const,
        height: "100%" as const,
        alignItems: "center" as const,
        justifyContent: "center" as const,
    },
    nextButtonText: {
        fontFamily: "PingFang SC",
        fontWeight: "bold" as const,
        fontSize: 12.5, // 32
        color: "#743A14",
    },
    nextButtonDisabled: {
        opacity: 0.6,
    },
    nextButtonTextDisabled: {
        color: "#999999",
    },
})

export default ProductInfoView

