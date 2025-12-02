import React, {useState, useCallback} from 'react';
import {View, StyleSheet, Image, TouchableOpacity, Text, ImageSourcePropType, ViewStyle} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import {Images} from '../../../constants/Assets';
import {createStyles, rpx} from '../../../utils/rpxStyleSheet';

export interface BookOperationPanelProps {
  /** 目录按钮点击回调 */
  onCatalogPress?: () => void;
  /** 主题设置按钮点击回调 */
  onThemePress?: () => void;
  /** 操作按钮图标源，默认为 operate-icon.png */
  operateIconSource?: ImageSourcePropType;
  /** 容器样式，用于覆盖 operationPanelContainer 的默认样式 */
  containerStyle?: ViewStyle;
}

const BookOperationPanel: React.FC<BookOperationPanelProps> = ({
  onCatalogPress,
  onThemePress,
  operateIconSource = Images.operateIcon,
  containerStyle,
}) => {
  // 操作项显示状态
  const [showOperationItems, setShowOperationItems] = useState(false);
  
  // 目录按钮动画值（延迟更少，先出现）
  const catalogOpacity = useSharedValue(0);
  const catalogScale = useSharedValue(0.8);
  const catalogTranslateY = useSharedValue(20);
  
  // 主题设置按钮动画值（延迟更多，后出现）
  const themeOpacity = useSharedValue(0);
  const themeScale = useSharedValue(0.8);
  const themeTranslateY = useSharedValue(20);

  // 切换操作项显示/隐藏
  const toggleOperationItems = useCallback(() => {
    const isShowing = showOperationItems;
    setShowOperationItems(!isShowing);
    
    if (!isShowing) {
      // 进场动画：醒目 - 从下往上、放大、淡入
      // 目录按钮先出现
      catalogOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      catalogScale.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.back(1.2)),
      });
      catalogTranslateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      
      // 主题设置按钮后出现（延迟80ms）
      themeOpacity.value = withDelay(80, withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      }));
      themeScale.value = withDelay(80, withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.back(1.2)),
      }));
      themeTranslateY.value = withDelay(80, withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      }));
    } else {
      // 退场动画：低调 - 淡出、轻微缩小
      // 两个按钮同时淡出
      catalogOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
      catalogScale.value = withTiming(0.95, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
      catalogTranslateY.value = withTiming(10, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
      
      themeOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
      themeScale.value = withTiming(0.95, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
      themeTranslateY.value = withTiming(10, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [showOperationItems, catalogOpacity, catalogScale, catalogTranslateY, themeOpacity, themeScale, themeTranslateY]);

  // 目录按钮动画样式
  const catalogAnimatedStyle = useAnimatedStyle(() => ({
    opacity: catalogOpacity.value,
    transform: [
      { scale: catalogScale.value },
      { translateY: catalogTranslateY.value },
    ],
  }));
  
  // 主题设置按钮动画样式
  const themeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: themeOpacity.value,
    transform: [
      { scale: themeScale.value },
      { translateY: themeTranslateY.value },
    ],
  }));

  // 处理目录按钮点击
  const handleCatalogPress = useCallback(() => {
    if (onCatalogPress) {
      onCatalogPress();
    }
  }, [onCatalogPress]);

  // 处理主题设置按钮点击
  const handleThemePress = useCallback(() => {
    if (onThemePress) {
      onThemePress();
    }
  }, [onThemePress]);

  return (
    <View style={[styles.operationPanelContainer, containerStyle]}>
      {/* 操作开关按钮 */}
      <TouchableOpacity 
        activeOpacity={0.8} 
        style={styles.operateButton}
        onPress={toggleOperationItems}
      >
        <Image
          source={operateIconSource}
          style={styles.operateIcon}
        />
      </TouchableOpacity>
      
      {/* 目录操作项 */}
      <Animated.View 
        style={[
          styles.operationItem, 
          styles.operationItemTop144,
          catalogAnimatedStyle,
          { pointerEvents: showOperationItems ? 'auto' : 'none' },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.operationItemTouchable}
          onPress={handleCatalogPress}
        >
          <Text style={styles.operationItemText}>目录</Text>
          <Image
            source={Images.catalogIcon}
            style={styles.operationItemIcon}
          />
        </TouchableOpacity>
      </Animated.View>
      
      {/* 主题设置操作项 */}
      <Animated.View 
        style={[
          styles.operationItem, 
          styles.operationItemTop72,
          themeAnimatedStyle,
          { pointerEvents: showOperationItems ? 'auto' : 'none' },
        ]}
      >
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.operationItemTouchable}
          onPress={handleThemePress}
        >
          <Text style={styles.operationItemText}>主题与设置</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = createStyles({
  operationPanelContainer: {
    position: 'absolute' as const,
    left: 0,
    bottom: 0,
  },
  operateButton: {
    width: 23.4375,
    height: 23.4375,
    backgroundColor: '#e5e5e4' as const,
    borderRadius: 7.8125,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 4,
    // },
    // shadowOpacity: 0.2,
    // shadowRadius: 8,
    // elevation: 8, // Android 阴影
  },
  operateIcon: {
    width: 14.0625,
    height: 14.0625,
  },
  operationItem: {
    position: 'absolute' as const,
    flexDirection: 'row' as const,
    width: 117.1875,
    height: 28.125,
    paddingHorizontal: 7.8125,
    backgroundColor: '#FFFFFF',
    borderRadius: 3.125,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2.34375,
    elevation: 1.953125, // Android 阴影
  },
  operationItemTouchable: {
    flexDirection: 'row' as const,
    width: '100%' as any,
    height: '100%' as any,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  operationItemTop144: {
    top: -64.0625,
  },
  operationItemTop72: {
    top: -32.03125,
  },
  operationItemText: {
    fontSize: 10.15625,
    color: '#323232',
  },
  operationItemIcon: {
    width: 12.5,
    height: 12.5,
  },
});

export default BookOperationPanel;
