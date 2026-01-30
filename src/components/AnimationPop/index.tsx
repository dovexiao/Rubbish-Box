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
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    style,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const isVertical = direction === 'top' || direction === 'bottom';

  const setOpen = (open: boolean) => {
    if (open) {
      setIsOpen(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
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
          ? [-SCREEN_HEIGHT, 0]
          : direction === 'bottom'
          ? [SCREEN_HEIGHT, 0]
          : direction === 'left'
          ? [-SCREEN_WIDTH, 0]
          : [SCREEN_WIDTH, 0],
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
      // maxHeight: 586,
    };

    if (direction === 'top') {
      baseStyle.width = '100%';
      baseStyle.paddingTop = coverSafeArea ? insets.top : 0;
      baseStyle.borderBottomLeftRadius = 12;
      baseStyle.borderBottomRightRadius = 12;
    } else if (direction === 'bottom') {
      baseStyle.width = '100%';
      baseStyle.paddingBottom = coverSafeArea ? insets.bottom : 0;
      baseStyle.borderTopLeftRadius = 12;
      baseStyle.borderTopRightRadius = 12;
      baseStyle.position = 'absolute';
      baseStyle.bottom = 0;
    } else if (direction === 'left') {
      baseStyle.height = '100%';
      baseStyle.width = '80%';
      baseStyle.paddingTop = coverSafeArea ? insets.top : 0;
      baseStyle.paddingBottom = coverSafeArea ? insets.bottom : 0;
    } else if (direction === 'right') {
      baseStyle.height = '100%';
      baseStyle.width = '80%';
      baseStyle.paddingTop = coverSafeArea ? insets.top : 0;
      baseStyle.paddingBottom = coverSafeArea ? insets.bottom : 0;
      baseStyle.position = 'absolute';
      baseStyle.right = 0;
    }

    return [baseStyle, style];
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
            <View onStartShouldSetResponder={() => true}>{children}</View>
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
    paddingVertical: 12,
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
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
