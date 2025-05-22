import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Modal,
  LayoutChangeEvent,
} from 'react-native';
import theme from '@style';

interface DrawerProps {
  children: React.ReactNode;
  /** 百分比字符串或者数值,默认70%屏幕宽度,仅在mode为left时生效 */
  drawerWidth?: `${number}%` | number;
  /** 百分比字符串或者数值,默认自动撑搞,仅在mode为bottom时生效,最大值90%高度 */
  drawerHeight?: `${number}%` | number;
  /** 内容背景色,默认白色 */
  contentBackgroundColor?: string;
  mode?: 'left' | 'top' | 'right' | 'bottom';
  /** 打开前回调,如果返回false,则不会打开 */
  beforeOpen?: () => boolean | void;
  afterOpen?: () => void;
  /** 关闭前回调,如果返回false,则不会打开 */
  beforeClose?: () => boolean | void;
  afterClose?: () => void;
  fast?: boolean;
}

const checkWidthOrHeight = (value: string | number, refer: number): number => {
  let result: number | string = 0;
  if (typeof value === 'number') {
    result = value;
  } else if (value.endsWith('%')) {
    result = (refer * parseInt(value.replace('%', ''), 10)) / 100;
  }
  return result;
};

export type DrawerRef = {
  open: () => void;
  close: () => void;
};

const Drawer = React.forwardRef<DrawerRef, DrawerProps>((props, ref) => {
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const {
    children,
    drawerWidth = '90%',
    drawerHeight,
    contentBackgroundColor = theme.basicColor.white,
    mode = 'left',
    beforeOpen,
    afterOpen,
    beforeClose,
    afterClose,
    fast,
  } = props;
  /** 是否横向 */
  const translateX = mode === 'left' || mode === 'right';
  /** 是否左侧 */
  const isLeft = mode === 'left';
  /** 是否顶部 */
  const isTop = mode === 'top';
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  let width: number = checkWidthOrHeight(drawerWidth, screenWidth);
  let height: number = drawerHeight
    ? checkWidthOrHeight(drawerHeight, screenHeight)
    : 0;
  const styles = StyleSheet.create({
    drawerContainer: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      width: screenWidth,
      height: screenHeight,
      position: 'relative',
    },
    drawerOverlay: {
      backgroundColor: '#0000',
      position: 'absolute',
      top: 0,
      left: 0,
    },
  });
  /** 容器水平距离 */
  const drawerTranslateX = React.useRef(
    new Animated.Value(isLeft ? -width : screenWidth),
  ).current;
  /** 容器垂直距离 */
  const drawerTranslateY = React.useRef(
    new Animated.Value(isTop ? -height : screenHeight),
  ).current;
  const disabled = React.useRef(true);
  const openAnimation = () => {
    if (!translateX && !finallyHeight) {
      return;
    }
    disabled.current = true;
    Animated.timing(translateX ? drawerTranslateX : drawerTranslateY, {
      toValue: translateX
        ? isLeft
          ? 0
          : screenWidth - width
        : isTop
        ? 0
        : screenHeight - finallyHeight,
      duration: fast ? 0 : 200,
      useNativeDriver: true,
    }).start(() => {
      disabled.current = false;
    });
  };
  const closeAnimation = () => {
    if (beforeClose?.() === false) {
      return;
    }
    disabled.current = true;
    Animated.timing(translateX ? drawerTranslateX : drawerTranslateY, {
      toValue: translateX
        ? isLeft
          ? -width
          : screenWidth
        : isTop
        ? -screenHeight
        : screenHeight,
      duration: fast ? 0 : 100,
      useNativeDriver: true,
    }).start(() => {
      disabled.current = false;
      setOpenDrawer(false);
      afterClose?.();
    });
  };

  React.useEffect(() => {
    if (openDrawer && drawerTranslateY) {
      openAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDrawer, drawerTranslateY]);

  const [finallyHeight, setFinallyHeight] = React.useState(0);
  const laytouAnimatedView = (e: LayoutChangeEvent) => {
    if (translateX) {
      return;
    }
    if (isTop && !finallyHeight) {
      // 处理首次打开top时的定位问题
      Animated.timing(drawerTranslateY, {
        toValue: -e.nativeEvent.layout.height,
        duration: 0,
        useNativeDriver: false,
      }).start(() => {
        setFinallyHeight(e.nativeEvent.layout.height);
      });
    } else {
      setFinallyHeight(e.nativeEvent.layout.height);
    }
  };

  React.useEffect(() => {
    if (!translateX && finallyHeight) {
      openAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finallyHeight]);

  const open = () => {
    if (beforeOpen?.() !== false) {
      setOpenDrawer(true);
      afterOpen?.();
    }
  };

  const close = () => {
    if (beforeClose?.() !== false) {
      closeAnimation();
    }
  };

  React.useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  return (
    <Modal animationType="fade" transparent={true} visible={openDrawer}>
      <View style={[styles.drawerContainer]}>
        <Pressable
          style={[styles.drawerOverlay, theme.fill.fill]}
          onPress={() => {
            if (!disabled.current) {
              closeAnimation();
            }
          }}
        />
        <Animated.View
          onLayout={laytouAnimatedView}
          style={[
            {
              backgroundColor: contentBackgroundColor,
            },
            translateX
              ? {
                  transform: [{translateX: drawerTranslateX || 0}],
                  width: width,
                  height: screenHeight,
                }
              : // eslint-disable-next-line react-native/no-inline-styles
                {
                  transform: [{translateY: drawerTranslateY || 0}],
                  width: screenWidth,
                  height: height || 'auto',
                  maxHeight: '90%',
                },
          ]}>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
});

export default Drawer;
