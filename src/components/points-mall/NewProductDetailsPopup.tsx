import React, { useState, useCallback, useEffect } from "react"
import { Modal, View, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import ProductInfoView from "./ProductInfoView"
import OrderConfirmView from "./OrderConfirmView"
import ShippingAddressView from "./ShippingAddressView"
import { AddressItem, getAddressList, getProductDetail, ProductDetailData } from "@/services/pointsMall"
import { showError } from "@/utils/toast"

interface NewProductDetailsPopupProps {
    visible: boolean
    productId: number
    onClose: () => void
}

const TOTAL_VIEWS = 3
const ANIMATION_DURATION = 300

/**
 * 新品详情弹窗组件
 */
const NewProductDetailsPopup = ({ visible, productId, onClose }: NewProductDetailsPopupProps) => {
    // 商品详情
    const [productDetail, setProductDetail] = useState<ProductDetailData | null>(null)
    const [selectedAddress, setSelectedAddress] = useState<AddressItem | null>(null)
    const [addressList, setAddressList] = useState<AddressItem[]>([])

    // 请求商品详情
    const loadProductDetail = useCallback(async () => {
        try {
            const result = await getProductDetail({ product_id: productId.toString() })
            if (result) {
                console.log("商品详情数据:", {
                    主图: result.main_image,
                    详情图数量: result.detail_image?.length || 0,
                    详情图: result.detail_image?.map((img) => img.url),
                    宣传图数量: result.host_graph?.length || 0,
                    宣传图: result.host_graph?.map((img) => img.url),
                })
                setProductDetail(result)
            }
        } catch (error) {
            console.error("获取商品详情失败:", error)
            showError("获取商品详情失败，请重试")
            setProductDetail(null)
        }
    }, [productId])

    const loadAddressList = useCallback(async () => {
        try {
            const result = await getAddressList()
            if (result && result.length > 0) {
                setSelectedAddress(result[0])
                setAddressList(result)
            } else {
                setSelectedAddress(null)
                setAddressList([])
            }
        } catch (error) {
            console.error("获取地址列表失败:", error)
            showError("获取收货地址信息失败，请重试")
            setSelectedAddress(null)
            setAddressList([])
        }
    }, [productId])

    // 处理点击选择收货地址
    const handleSelectAddress = (address: AddressItem) => {
        setSelectedAddress(address)
        goBack()
    }

    useEffect(() => {
        loadProductDetail();
        loadAddressList();
    }, [])

    // 堆栈：存储视图索引，最后一个元素是当前显示的视图
    const [viewStack, setViewStack] = useState<number[]>([0])

    // 为每个视图创建独立的 translateX、opacity 和 scale 共享值
    const translateX0 = useSharedValue(0)
    const opacity0 = useSharedValue(1)
    const scale0 = useSharedValue(1)
    const translateX1 = useSharedValue(0)
    const opacity1 = useSharedValue(1)
    const scale1 = useSharedValue(1)
    const translateX2 = useSharedValue(0)
    const opacity2 = useSharedValue(1)
    const scale2 = useSharedValue(1)

    // 获取容器宽度（用于计算动画距离）
    const containerWidth = rpx(406.25) // 1040 * 750 / 1920

    // 获取指定索引的 translateX、opacity 和 scale
    const getTranslateX = (index: number) => {
        switch (index) {
            case 0: return translateX0
            case 1: return translateX1
            case 2: return translateX2
            default: return translateX0
        }
    }

    const getOpacity = (index: number) => {
        switch (index) {
            case 0: return opacity0
            case 1: return opacity1
            case 2: return opacity2
            default: return opacity0
        }
    }

    const getScale = (index: number) => {
        switch (index) {
            case 0: return scale0
            case 1: return scale1
            case 2: return scale2
            default: return scale0
        }
    }

    // 前进到下一个视图
    const goNext = useCallback((currentIndex: number) => {
        if (currentIndex >= TOTAL_VIEWS - 1) return

        const nextIndex = currentIndex + 1
        const currentOpacity = getOpacity(currentIndex)
        const currentScale = getScale(currentIndex)
        const nextTranslateX = getTranslateX(nextIndex)
        const nextOpacity = getOpacity(nextIndex)
        const nextScale = getScale(nextIndex)

        // 当前视图向后淡化退出（降低透明度并缩小）
        currentOpacity.value = withTiming(0.3, { duration: ANIMATION_DURATION })
        currentScale.value = withTiming(0.85, { duration: ANIMATION_DURATION })

        // 下一个视图从右侧进入（先设置到右侧，然后动画到中心）
        nextTranslateX.value = containerWidth
        nextOpacity.value = 1
        nextScale.value = 1
        nextTranslateX.value = withTiming(0, { duration: ANIMATION_DURATION })

        // 更新堆栈
        setViewStack(prev => [...prev, nextIndex])
    }, [containerWidth])

    // 返回到上一个视图
    const goBack = useCallback(() => {
        if (viewStack.length <= 1) {
            // 如果堆栈只有一个视图，关闭弹窗
            onClose()
            return
        }

        const currentIndex = viewStack[viewStack.length - 1]
        const prevIndex = viewStack[viewStack.length - 2]
        const currentTranslateX = getTranslateX(currentIndex)
        const prevOpacity = getOpacity(prevIndex)
        const prevScale = getScale(prevIndex)

        // 当前视图向右滑出
        currentTranslateX.value = withTiming(containerWidth, { duration: ANIMATION_DURATION })

        // 上一个视图从后方淡入浮出（恢复透明度和缩放）
        prevOpacity.value = withTiming(1, { duration: ANIMATION_DURATION })
        prevScale.value = withTiming(1, { duration: ANIMATION_DURATION })

        // 更新堆栈
        setViewStack(prev => prev.slice(0, -1))
    }, [viewStack, containerWidth])

    // 为每个视图创建动画样式
    const view0Style = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX0.value },
            { scale: scale0.value },
        ],
        opacity: opacity0.value,
    }))

    const view1Style = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX1.value },
            { scale: scale1.value },
        ],
        opacity: opacity1.value,
    }))

    const view2Style = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX2.value },
            { scale: scale2.value },
        ],
        opacity: opacity2.value,
    }))

    const getViewStyle = (index: number) => {
        switch (index) {
            case 0: return view0Style
            case 1: return view1Style
            case 2: return view2Style
            default: return view0Style
        }
    }

    // 渲染业务视图内容
    const renderViewContent = (index: number) => {
        switch (index) {
            case 0:
                return <ProductInfoView product={productDetail} onNext={() => goNext(0)} />
            case 1:
                return <OrderConfirmView product={productDetail} selectedAddress={selectedAddress} onNext={() => goNext(1)} />
            case 2:
                return <ShippingAddressView addressList={addressList} onSelectAddress={handleSelectAddress} onRefresh={() => loadAddressList()} />
            default:
                return null
        }
    }

    // 初始化视图位置
    useEffect(() => {
        if (visible) {
            // 重置所有视图位置、透明度和缩放
            translateX0.value = 0
            opacity0.value = 1
            scale0.value = 1

            for (let i = 1; i < TOTAL_VIEWS; i++) {
                // 其他视图初始位置在右侧，透明度为1，缩放为1（但会被前面的视图遮挡）
                getTranslateX(i).value = containerWidth
                getOpacity(i).value = 1
                getScale(i).value = 1
            }

            // 重置堆栈
            setViewStack([0])
        }
    }, [visible, containerWidth])

    if (typeof productId !== 'number' || !visible) {
        return null
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                // onPress={onClose}
                />
                <View style={styles.popupContainer}>
                    {/* 3个业务视图层叠 */}
                    {Array.from({ length: TOTAL_VIEWS }).map((_, index) => {
                        const isCurrent = viewStack[viewStack.length - 1] === index

                        return (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.viewLayer,
                                    getViewStyle(index),
                                    {
                                        zIndex: index + 1, // 层级固定，后面的视图在上层
                                    },
                                ]}
                            >
                                {renderViewContent(index)}
                            </Animated.View>
                        )
                    })}

                    {/* 后退按键 */}
                    <TouchableOpacity
                        style={styles.backButton}
                        activeOpacity={0.8}
                        onPress={goBack}
                    >
                        <Ionicons name="chevron-back" size={rpx(15.625)} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const styles = createStyles({
    container: {
        flex: 1,
        justifyContent: "center" as const,
        alignItems: "center" as const,
        position: "relative" as const,
    },
    overlay: {
        position: "absolute" as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1,
    },
    popupContainer: {
        width: 406.25, // 1040
        height: 375, // 960
        backgroundColor: "#F5F5F5",
        borderRadius: 12,
        overflow: "hidden" as const,
        zIndex: 2,
        position: "relative" as const,
    },
    viewLayer: {
        position: "absolute" as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backButton: {
        position: "absolute" as const,
        top: 10.9375, // 28
        left: 14.0625, // 36
        width: 25, // 64
        height: 25, // 64
        justifyContent: "center" as const,
        alignItems: "center" as const,
        zIndex: 100, // 确保在所有视图之上
    },
})

export default NewProductDetailsPopup
