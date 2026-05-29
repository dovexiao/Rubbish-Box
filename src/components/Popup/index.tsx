import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '@ant-design/react-native';
import type { ViewStyle } from 'react-native';
import {
  Text,
  TouchableOpacity,
  View,
  Animated,
  Platform,
  Keyboard,
} from 'react-native';
import AppIcon from '@/components/AppIcon';
import styles from './styles';
import { px } from '@/utils/ui';

export type PopupProps = {
  visible: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;

  /** 底部按钮区域（可选） */
  footer?: React.ReactNode;

  /** 内容最小高度 */
  minHeight?: number;

  /** 点击遮罩是否关闭 */
  maskClosable?: boolean;

  /** 是否展示右上角关闭按钮 */
  showClose?: boolean;

  /** 外层样式 */
  contentStyle?: ViewStyle;

  /** body 样式 */
  bodyStyle?: ViewStyle;

  /** 原生弹窗模式(用于盖住全屏的某些情况) */
  modalType?: 'modal' | 'portal';

  /** 是否启用键盘避让 */
  keyboardAvoidingEnabled?: boolean;

  /** Android 键盘高度抵扣值（默认 120） */
  androidKeyboardOffset?: number;

  /** Android 键盘最大避让值（默认 220） */
  androidKeyboardMaxOffset?: number;
};

export default function Popup({
  visible,
  onClose,
  title,
  children,
  footer,
  minHeight,
  maskClosable = true,
  showClose = true,
  contentStyle,
  bodyStyle,
  modalType = 'portal',
  keyboardAvoidingEnabled = true,
  androidKeyboardOffset = px(120),
  androidKeyboardMaxOffset = px(220),
}: PopupProps) {
  const basePaddingBottom = px(20);
  const [paddingBottomValue, setPaddingBottomValue] =
    useState(basePaddingBottom);
  // 每次 visible 变化时重新创建 Animated.Value，避免 native driver 冲突
  const paddingBottomRef = useRef<Animated.Value | null>(null);

  if (!paddingBottomRef.current) {
    paddingBottomRef.current = new Animated.Value(basePaddingBottom);
  }

  const paddingBottom = paddingBottomRef.current;

  useEffect(() => {
    // 监听 Animated.Value 的变化，同步更新 state
    const listenerId = paddingBottom.addListener(({ value }) => {
      setPaddingBottomValue(value);
    });

    return () => {
      paddingBottom.removeListener(listenerId);
    };
  }, [paddingBottom]);

  useEffect(() => {
    if (!keyboardAvoidingEnabled) {
      if (paddingBottomRef.current) {
        paddingBottomRef.current.stopAnimation();
        paddingBottomRef.current.setValue(basePaddingBottom);
      }
      setPaddingBottomValue(basePaddingBottom);
      return;
    }

    if (!visible) {
      // 关闭时重置 paddingBottom（先停止所有动画，再设置值）
      if (paddingBottomRef.current) {
        paddingBottomRef.current.stopAnimation();
        paddingBottomRef.current.setValue(basePaddingBottom);
      }
      setPaddingBottomValue(basePaddingBottom);
      return;
    }

    // 确保使用最新的 ref
    const currentPaddingBottom = paddingBottomRef.current;
    if (!currentPaddingBottom) return;

    // iOS 使用 keyboardWillShow/keyboardWillHide，Android 使用 keyboardDidShow/keyboardDidHide
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (e: any) => {
      const height = e.endCoordinates?.height || 0;
      const keyboardOffset =
        Platform.OS === 'android'
          ? Math.max(
              0,
              Math.min(
                androidKeyboardMaxOffset,
                height - androidKeyboardOffset,
              ),
            )
          : height;
      // 先停止之前的动画
      currentPaddingBottom.stopAnimation();
      // 键盘弹起时，增加 paddingBottom，把 Modal 内容推上去
      Animated.timing(currentPaddingBottom, {
        toValue: basePaddingBottom + keyboardOffset,
        duration: Platform.OS === 'ios' ? e.duration || 250 : 200,
        useNativeDriver: false,
      }).start();
    });

    const hideSubscription = Keyboard.addListener(hideEvent, (e: any) => {
      // 先停止之前的动画
      currentPaddingBottom.stopAnimation();
      // 键盘收起时，恢复 paddingBottom
      Animated.timing(currentPaddingBottom, {
        toValue: basePaddingBottom,
        duration: Platform.OS === 'ios' ? e.duration || 250 : 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      // 清理时停止动画
      if (currentPaddingBottom) {
        currentPaddingBottom.stopAnimation();
      }
    };
  }, [
    androidKeyboardMaxOffset,
    androidKeyboardOffset,
    keyboardAvoidingEnabled,
    visible,
  ]);

  return (
    <Modal
      visible={visible}
      popup
      animationType="slide-up"
      maskClosable={maskClosable}
      onClose={onClose}
      modalType={modalType}
      closable={false}
      style={{
        borderTopLeftRadius: px(24),
        borderTopRightRadius: px(24),
        paddingBottom: paddingBottomValue,
        overflow: 'hidden',
      }}
    >
      <View
        style={[styles.sheet, minHeight ? { minHeight } : null, contentStyle]}
      >
        {(title !== undefined || showClose) && (
          <View style={styles.header}>
            {/* 左侧占位，保证标题居中 */}

            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {typeof title === 'string' ? (
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
              ) : (
                title ?? null
              )}
            </View>
            {showClose && (
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <AppIcon name="close" size={px(20)} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={[styles.body, bodyStyle]}>{children}</View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </Modal>
  );
}
