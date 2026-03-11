import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { ViewStyle } from 'react-native';
import {
  Animated,
  Modal,
  Pressable,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from './styles';

export interface PopCenterRef {
  open: () => void;
  close: () => void;
}

/**
 * 居中弹窗
 * 用于展示居中的弹窗，包含标题、内容、底部按钮等
 *
 * @param showHeader 是否显示标题栏
 * @param title 弹窗标题
 * @param children 弹窗内容
 * @param footer 弹窗底部按钮
 * @param maskClosable 是否点击遮罩关闭弹窗
 * @param onConfirm 确认回调
 * @param onCancel 取消回调
 * @param showCancel 是否显示取消按钮
 * @param confirmText 确认按钮文本
 * @param cancelText 取消按钮文本
 * @param contentStyle 弹窗内容样式
 * @param bodyStyle 弹窗主体样式
 * @param width 弹窗宽度
 * @param height 弹窗高度
 * @param btnWidth 底部按钮宽度
 */

export type PopCenterProps = {
  showHeader?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode | boolean;
  maskClosable?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  contentStyle?: ViewStyle;
  bodyStyle?: ViewStyle;
  width?: number;
  height?: number;
  btnWidth?: number;
  coverSafeArea?: boolean;
};

const PopCenter = forwardRef<PopCenterRef, PopCenterProps>(
  (
    {
      showHeader = true,
      title,
      children,
      footer = true,
      maskClosable = false,
      onConfirm,
      onCancel,
      confirmText = '确定',
      cancelText = '取消',
      showCancel = true,
      contentStyle,
      bodyStyle,
      width = 311,
      height = 268,
      btnWidth = 124,
      coverSafeArea = true,
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const opacity = useRef(new Animated.Value(0)).current;

    const animateIn = useCallback(() => {
      opacity.stopAnimation();
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }, [opacity]);

    const close = useCallback(() => {
      opacity.stopAnimation();
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        setVisible(false);
        setMounted(false);
      });
    }, [opacity]);

    useEffect(() => {
      if (visible) {
        setMounted(true);
        animateIn();
      }
    }, [animateIn, visible]);

    useEffect(() => {
      if (!visible) return;
      return () => {
        opacity.stopAnimation();
      };
    }, [opacity, visible]);

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close,
    }));

    return (
      <Modal
        transparent
        visible={mounted}
        onRequestClose={close}
        statusBarTranslucent={coverSafeArea}
        presentationStyle={coverSafeArea ? 'overFullScreen' : undefined}
      >
        {coverSafeArea && mounted ? (
          <StatusBar
            translucent
            backgroundColor="rgba(0,0,0,0)"
            barStyle="light-content"
          />
        ) : null}
        <Animated.View style={[styles.mask, { opacity }]}>
          <Pressable
            style={styles.maskPressable}
            onPress={() => {
              if (!maskClosable) return;
              close();
            }}
          />
        </Animated.View>

        <View style={styles.centerWrapper} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.panel,
              {
                width,
                height,
                opacity,
                transform: [
                  {
                    scale: opacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.98, 1],
                    }),
                  },
                ],
              },
              contentStyle,
            ]}
          >
            {showHeader ? (
              <View style={styles.header}>
                {typeof title === 'string' ? (
                  <Text style={styles.title} numberOfLines={1}>
                    {title}
                  </Text>
                ) : (
                  title ?? null
                )}
              </View>
            ) : null}

            <View style={[bodyStyle, { flex: 1, display: 'flex' }]}>
              {children}
            </View>

            {footer === false ? null : typeof footer === 'boolean' ? (
              <View style={styles.footer}>
                {showCancel ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.footerBtn,
                      styles.cancalBtn,
                      { width: btnWidth },
                    ]}
                    onPress={onCancel ? onCancel : close}
                  >
                    <Text style={[styles.footerBtnText, styles.cancalBtnText]}>
                      {cancelText}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.footerBtn,
                    styles.confirmBtn,
                    { width: btnWidth },
                  ]}
                  onPress={onConfirm ? onConfirm : close}
                >
                  <Text style={[styles.footerBtnText, styles.confirmBtnText]}>
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : footer ? (
              <View style={styles.footer}>{footer}</View>
            ) : null}
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

export default PopCenter;
