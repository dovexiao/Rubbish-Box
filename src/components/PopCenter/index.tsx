import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { ViewStyle } from 'react-native';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Modal } from '@ant-design/react-native';
import styles from './styles';

export interface PopCenterRef {
  open: () => void;
  close: () => void;
}

export type PopCenterProps = {
  showHeader?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode | boolean;
  maskClosable?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  contentStyle?: ViewStyle;
  bodyStyle?: ViewStyle;
  width?: number;
  height?: number;
  btnWidth?: number;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
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
      visible,
      onVisibleChange,
    },
    ref,
  ) => {
    const [innerVisible, setInnerVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const opacity = useRef(new Animated.Value(0)).current;

    const isControlled = typeof visible === 'boolean';
    const mergedVisible = isControlled ? visible : innerVisible;

    const setVisible = useCallback(
      (next: boolean) => {
        if (!isControlled) {
          setInnerVisible(next);
        }
        onVisibleChange?.(next);
      },
      [isControlled, onVisibleChange],
    );

    const animateIn = useCallback(() => {
      setIsClosing(false);
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
      setIsClosing(true);
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        setVisible(false);
        setIsClosing(false);
      });
    }, [opacity, setVisible]);

    useEffect(() => {
      if (mergedVisible) {
        animateIn();
      } else {
        opacity.stopAnimation();
        opacity.setValue(0);
        setIsClosing(false);
      }
    }, [animateIn, mergedVisible, opacity]);

    useImperativeHandle(ref, () => ({
      open: () => {
        setIsClosing(false);
        setVisible(true);
      },
      close,
    }));

    const handleCancel = async () => {
      close();
      await onCancel?.();
    };

    const handleConfirm = async () => {
      close();
      await onConfirm?.();
    };

    return (
      <Modal
        visible={mergedVisible}
        transparent
        maskClosable={maskClosable && !isClosing}
        onClose={close}
        animationType="fade"
        footer={[]}
        style={[styles.container, { width }]}
      >
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
          pointerEvents={mergedVisible && !isClosing ? 'auto' : 'none'}
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
                  onPress={handleCancel}
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
                onPress={handleConfirm}
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
      </Modal>
    );
  },
);

export default PopCenter;
