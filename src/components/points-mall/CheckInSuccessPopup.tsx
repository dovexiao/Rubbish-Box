import React, { useState, useCallback, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';
import { View, Text, Image, Modal, ImageBackground } from 'react-native';
import { createStyles, rpx } from '../../utils/rpxStyleSheet';
import { Images } from '../../constants/Assets';

export type CheckInSuccessPopupRef = {
    show: (points: number) => void;
}

interface CheckInSuccessPopupProps {
    duration?: number; // 自动隐藏持续时间，默认1500ms
}

const CheckInSuccessPopup = forwardRef<CheckInSuccessPopupRef, CheckInSuccessPopupProps>(({ duration = 3000 }, ref) => {
    const [visible, setVisible] = useState(false);
    const [points, setPoints] = useState(0);
    const timeoutRef = useRef<number | null>(null);

    // 显示弹窗
    const show = useCallback((pointsValue: number) => {
        setPoints(pointsValue);
        setVisible(true);

        // 清除之前的定时器
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // 设置自动隐藏
        timeoutRef.current = setTimeout(() => {
              setVisible(false);
        }, duration);
    }, [duration]);

    // 清理定时器
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
        show,
    }), [show]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setVisible(false)}
        >
            <View style={styles.modalContainer}>
                <ImageBackground
                    source={Images.pointsMallCheckInSuccess}
                    style={styles.contentContainer}
                    resizeMode="cover">
                    {/* 内容区域 */}
                    <View style={styles.content}>
                        {/* 标题 */}
                        <View style={styles.titleContainer}>
                            <Text style={styles.titleText}>打卡成功</Text>
                            {/* 装饰性矩形 */}
                            <View style={styles.decorativeRect} />
                        </View>

                        {/* 货币信息 */}
                        <View style={styles.pointsContainer}>
                            <Image
                                source={Images.pointsMallGoldCoin}
                                style={styles.coinIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.pointsText}>+{points}货币</Text>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        </Modal>
    );
});

const styles = createStyles({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    contentContainer: {
        width: 117.1875, // 300
        height: 117.1875, // 300
    },
    content: {
        width: '100%' as const,
        height: '100%' as const,
        justifyContent: 'flex-start' as const,
        alignItems: 'center' as const,
        paddingTop: 67.1875, // 172
        gap: 5.859375, // 15
    },
    titleContainer: {
        position: 'relative' as const,
        alignItems: 'center' as const,
    },
    titleText: {
        fontFamily: 'kingnam_bobo',
        fontWeight: '400' as const,
        fontSize: 10.15625, // 26
        color: '#FF6200',
    },
    decorativeRect: {
        width: 54.6875, // 140
        height: 6.640625, // 17
        position: 'absolute' as const,
        top: 7.03125, // 18
        alignSelf: 'center' as const,
    },
    pointsContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: 1.5625, // 4
    },
    coinIcon: {
        width: 12.5, // 32
        height: 12.5, // 32
    },
    pointsText: {
        fontWeight: '600' as const,
        fontSize: 8.59375, // 22
        color: '#FF7410',
    },
});

CheckInSuccessPopup.displayName = 'CheckInSuccessPopup';

export default CheckInSuccessPopup;

