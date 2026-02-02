import { useTheme } from '@/context/ThemeContext';
import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  StatusBar,
  View,
  ScrollView,
  TouchableWithoutFeedback,
  useWindowDimensions,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface AnimationPopRef {
  open: () => void;
  close: () => void;
}

interface Props {
  children: React.ReactNode;
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
  const insets = useSafeAreaInsets();
  const isVertical = direction === 'top' || direction === 'bottom';
  const maskTopInset = Math.max(insets.top, StatusBar.currentHeight ?? 0);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const setOpen = (open: boolean) => {
    if (open) {
      setIsOpen(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      StatusBar.setBarStyle('dark-content');
      StatusBar.setBackgroundColor('#ffffff');
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
      StatusBar.setBarStyle(
        themeType === 'dark' ? 'light-content' : 'dark-content',
      );
      StatusBar.setBackgroundColor('transparent');
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
      case 'bottom':
        return [{ translateY: translate }];
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

    if (typeof maxHeight === 'number') {
      baseStyle.maxHeight = maxHeight;
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
      baseStyle.paddingBottom = coverSafeArea ? insets.bottom : 0;
      baseStyle.borderTopLeftRadius = 12;
      baseStyle.borderTopRightRadius = 12;
      baseStyle.position = 'absolute';
      baseStyle.bottom = coverSafeArea ? 0 : insets.bottom;
    }

    return [baseStyle, style];
  };

  const renderChildren = () => {
    if (isVertical && typeof maxHeight === 'number') {
      return (
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
        {direction === 'top' && (
          <>
            {/* <StatusBar barStyle="light-content" /> */}
            {/* <View
              pointerEvents="none"
              style={[styles.topSafeAreaBg, { height: insets.top }]}
            /> */}
          </>
        )}
        {/* Mask */}
        {/* <TouchableWithoutFeedback */}
        <TouchableWithoutFeedback
          onPress={() => maskClosable && setOpen(false)}
        >
          <Animated.View
            style={[
              styles.mask,
              {
                opacity: slideAnim,
                backgroundColor: mask ? 'rgba(0,0,0,0.5)' : 'transparent',
                top: maskTopInset,
                // backgroundColor: 'transparent',
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
