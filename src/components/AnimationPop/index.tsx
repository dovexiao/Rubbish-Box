import { useTheme } from '@/context/ThemeContext';
import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  StatusBar,
  View,
  ScrollView,
  TouchableWithoutFeedback,
  useWindowDimensions,
  ViewStyle,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from '@/libs/safeAreaContext';
import AppIcon from '@/components/AppIcon';

export interface AnimationPopRef {
  open: () => void;
  close: () => void;
}

/**
 * 动画弹窗
 * 用于展示弹窗，包含标题、内容、底部按钮等
 * 在本项目中用于顶部弹窗、底部弹窗
 *
 * @param children 弹窗内容
 * @param title 弹窗标题
 * @param mask 是否显示遮罩
 * @param maskClosable 是否点击遮罩关闭弹窗
 * @param direction 弹窗方向 top | bottom
 * @param onClose 关闭回调
 * @param btn 底部按钮
 * @param coverSafeArea 是否覆盖安全区域
 * @param maxHeight 弹窗最大高度
 * @param style 弹窗样式
 */
interface Props {
  children: React.ReactNode;
  title?: React.ReactNode | string;
  mask?: boolean;
  maskClosable?: boolean;
  direction?: 'top' | 'left' | 'right' | 'bottom';
  onClose?: () => void;
  btn?: React.ReactNode; // 底部按钮
  coverSafeArea?: boolean;
  maxHeight?: number;
  style?: ViewStyle;
}

const AnimationPop = forwardRef<AnimationPopRef, Props>((props, ref) => {
  const {
    children,
    title,
    mask = true,
    direction = 'top',
    maskClosable = true,
    onClose,
    btn,
    coverSafeArea = true,
    maxHeight,
    style,
  } = props;

  const { themeType } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardOffsetAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const isVertical = direction === 'top' || direction === 'bottom';
  const maskTopInset = Math.max(insets.top, StatusBar.currentHeight ?? 0);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const baseBottom = coverSafeArea ? 0 : insets.bottom;

  const containsVirtualizedList = (node: React.ReactNode): boolean => {
    let found = false;

    const walk = (n: React.ReactNode) => {
      if (found || n === null || n === undefined || typeof n === 'boolean') {
        return;
      }

      if (Array.isArray(n)) {
        for (const item of n) walk(item);
        return;
      }

      if (typeof n === 'string' || typeof n === 'number') return;

      if (React.isValidElement(n)) {
        const typeAny: any = n.type as any;
        const typeName =
          typeof typeAny === 'string'
            ? typeAny
            : typeAny?.displayName || typeAny?.name || '';

        if (
          typeName === 'FlatList' ||
          typeName === 'SectionList' ||
          typeName === 'VirtualizedList'
        ) {
          found = true;
          return;
        }

        walk((n.props as any)?.children);
      }
    };

    walk(node);
    return found;
  };

  useEffect(() => {
    if (!isOpen) return;

    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onKeyboardShow = (e: any) => {
      const end = e?.endCoordinates;
      const heightFromEvent = Number(end?.height ?? 0) || 0;
      const screenY = end?.screenY;
      const heightFromScreenY =
        typeof screenY === 'number' ? Math.max(0, screenHeight - screenY) : 0;
      const nextKeyboardHeight = Math.max(
        heightFromEvent,
        heightFromScreenY,
        0,
      );

      setKeyboardHeight(nextKeyboardHeight);

      const duration =
        Platform.OS === 'ios' ? Number(e?.duration ?? 250) || 250 : 200;

      if (direction === 'bottom') {
        const offset = Math.max(0, nextKeyboardHeight - baseBottom);
        keyboardOffsetAnim.stopAnimation();
        Animated.timing(keyboardOffsetAnim, {
          toValue: -offset,
          duration,
          useNativeDriver: true,
        }).start();
      }
    };

    const onKeyboardHide = (e: any) => {
      setKeyboardHeight(0);

      const duration =
        Platform.OS === 'ios' ? Number(e?.duration ?? 250) || 250 : 200;

      if (direction === 'bottom') {
        keyboardOffsetAnim.stopAnimation();
        Animated.timing(keyboardOffsetAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }).start();
      }
    };

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [baseBottom, direction, isOpen, keyboardOffsetAnim, screenHeight]);

  useEffect(() => {
    if (isOpen) return;
    setKeyboardHeight(0);
    keyboardOffsetAnim.stopAnimation();
    keyboardOffsetAnim.setValue(0);
  }, [isOpen, keyboardOffsetAnim]);

  const resolvedMaxHeight = (() => {
    if (!isVertical) return maxHeight;

    const available =
      direction === 'top'
        ? screenHeight - keyboardHeight - insets.top
        : screenHeight - (keyboardHeight > 0 ? keyboardHeight : baseBottom);

    const safeAvailable = Math.max(0, available);

    if (typeof maxHeight === 'number') {
      return Math.min(maxHeight, safeAvailable);
    }

    if (keyboardHeight > 0) {
      return safeAvailable;
    }

    return undefined;
  })();

  const setOpen = (open: boolean) => {
    if (open) {
      setIsOpen(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      if (direction === 'top') {
        StatusBar.setBarStyle('dark-content');
        StatusBar.setBackgroundColor('#ffffff');
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setIsOpen(false);
        onClose?.();
      });

      if (direction === 'top') {
        StatusBar.setBarStyle(
          themeType === 'dark' ? 'light-content' : 'dark-content',
        );
        StatusBar.setBackgroundColor('transparent');
      }
    }
  };

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }));

  const getTransform = () => {
    const translate = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange:
        direction === 'top'
          ? [-screenHeight, 0]
          : direction === 'bottom'
          ? [screenHeight, 0]
          : direction === 'left'
          ? [-screenWidth, 0]
          : [screenWidth, 0],
    });

    switch (direction) {
      case 'top':
        return [{ translateY: translate }];
      case 'bottom':
        return [
          { translateY: Animated.add(translate as any, keyboardOffsetAnim) },
        ];
      case 'left':
      case 'right':
        return [{ translateX: translate }];
      default:
        return [{ translateY: translate }];
    }
  };

  const getContentStyle = () => {
    const baseStyle: any = {
      backgroundColor: '#fff',
    };

    if (typeof resolvedMaxHeight === 'number') {
      baseStyle.maxHeight = resolvedMaxHeight;
    }

    if (direction === 'top') {
      baseStyle.width = '100%';
      if (coverSafeArea) {
        baseStyle.paddingTop = insets.top;
      } else {
        baseStyle.marginTop = insets.top;
      }
      baseStyle.borderBottomLeftRadius = 12;
      baseStyle.borderBottomRightRadius = 12;
    } else if (direction === 'bottom') {
      baseStyle.width = '100%';
      baseStyle.paddingBottom =
        keyboardHeight > 0 ? 0 : coverSafeArea ? insets.bottom : 0;
      baseStyle.borderTopLeftRadius = 12;
      baseStyle.borderTopRightRadius = 12;
      baseStyle.position = 'absolute';
      baseStyle.bottom = baseBottom;
    }

    return [baseStyle, style];
  };

  const renderChildren = () => {
    if (isVertical) {
      if (containsVirtualizedList(children)) {
        return <View onStartShouldSetResponder={() => true}>{children}</View>;
      }
      return (
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={typeof resolvedMaxHeight === 'number'}
        >
          {children}
        </ScrollView>
      );
    }
    return <View onStartShouldSetResponder={() => true}>{children}</View>;
  };

  if (!isOpen) return null;

  return (
    <Modal
      transparent
      visible={isOpen}
      onRequestClose={() => {
        if (maskClosable) setOpen(false);
      }}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Mask */}
        <TouchableWithoutFeedback
          onPress={() => maskClosable && setOpen(false)}
        >
          <Animated.View
            style={[
              styles.mask,
              {
                opacity: slideAnim,
                backgroundColor: mask ? 'rgba(0,0,0,0.5)' : 'transparent',
                top: direction === 'top' ? maskTopInset : 0,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Content */}
        <Animated.View
          style={[getContentStyle(), { transform: getTransform() }]}
          pointerEvents="box-none"
        >
          <View style={{ flex: isVertical ? 0 : 1, overflow: 'hidden' }}>
            {title && typeof title === 'string' ? (
              <View style={styles.titleContainer}>
                <View style={{ width: 24, height: 24 }}></View>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={() => setOpen(false)}>
                  <AppIcon name="close" size={24} color="#333333" />
                </TouchableOpacity>
              </View>
            ) : (
              title
            )}
            {renderChildren()}
            {btn && <View style={styles.btnContainer}>{btn}</View>}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingVertical: 0,
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    // top: insets.top,
  },
  titleContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  topSafeAreaBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  btnContainer: {
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
  contentWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  contentWrapperVertical: {
    flex: 0,
  },
});

export default AnimationPop;
