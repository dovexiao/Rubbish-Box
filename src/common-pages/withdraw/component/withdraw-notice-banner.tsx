import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet, LayoutChangeEvent, ScrollView} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import LazyImage from '@/components/basic/image';
import Text from '@/components/basic/text';
import theme from '@/style';
import {useScreenSize} from '@/common-pages/hooks/size.hooks';

interface WithdrawNoticeBannerProps {
  /** 是否启用滚动，默认开启 */
  enableScroll?: boolean;
}

const WithdrawNoticeBanner: React.FC<WithdrawNoticeBannerProps> = ({
  enableScroll = true,
}) => {
  const {calcActualSize} = useScreenSize();
  const iconSize = calcActualSize(15);
  const textContent =
    '⚠️ Withdrawals made after 10:00 PM may take longer to process. Please be informed.';

  const [textWidth, setTextWidth] = useState(0);
  const translateX = useSharedValue(0);
  const hasMeasured = useRef(false);

  // 测量文字实际宽度
  // 使用 View 包裹 Text，让 Text 自然布局完整文字内容，然后通过 View 的 onLayout 测量宽度
  const handleTextLayout = (event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    if (width > 0 && !hasMeasured.current) {
      setTextWidth(width);
      hasMeasured.current = true;
    }
  };

  // 启动滚动动画
  useEffect(() => {
    if (enableScroll && textWidth > 0) {
      // 计算滚动距离：文字宽度 + 间隔（用于无缝循环）
      const spacing = calcActualSize(25);
      const scrollDistance = textWidth + spacing;
      // 根据文字长度计算动画时长，保持滚动速度一致（约每秒30px）
      const scrollSpeed = 30; // 每秒30px
      const duration = (scrollDistance / scrollSpeed) * 1000;

      // 使用 withRepeat 实现无限循环滚动
      // 当滚动到 -scrollDistance 时，会自动重置到 0，实现无缝循环
      translateX.value = withRepeat(
        withTiming(-scrollDistance, {
          duration,
          easing: Easing.linear,
        }),
        -1, // 无限循环
        false, // 不反向
      );
    } else if (!enableScroll) {
      // 如果滚动被禁用，重置位置
      translateX.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [enableScroll, textWidth, translateX, calcActualSize]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value}],
    };
  }, [translateX]);

  return (
    <View style={[styles.container]}>
      <View style={styles.iconContainer}>
        <LazyImage
          imageUrl={require('@assets/imgs/withdraw/notify.webp')}
          width={iconSize}
          height={iconSize}
        />
      </View>
      <Animated.ScrollView style={styles.textContainer} horizontal={true}>
        <Animated.View style={[styles.scrollWrapper, animatedStyle]}>
          {/* 第一个 Text：用于测量宽度和显示 */}
          {/* 使用 View 包裹 Text，让 Text 自然布局完整文字内容，不设置任何限制属性 */}
          <View onLayout={handleTextLayout}>
            <Text style={styles.text}>{textContent}</Text>
          </View>
          {/* 第二个 Text：用于无缝循环，添加间距 */}
          <View style={[styles.textSpacer, {marginLeft: calcActualSize(25)}]}>
            <Text style={styles.text}>{textContent}</Text>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.paddingSize.l,
    paddingBottom: theme.paddingSize.l,
    overflow: 'hidden',
  },
  iconContainer: {
    marginRight: theme.paddingSize.s,
  },
  textContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollWrapper: {
    flexDirection: 'row',
    // 不设置 width，让内容自然展开，Text 可以完整布局
  },
  textSpacer: {
    // 用于第二个 Text 的容器，保持与第一个 Text 相同的布局方式
  },
  text: {
    fontSize: theme.fontSize.s,
    color: theme.fontColor.white,
    // 不设置 numberOfLines、ellipsizeMode 等属性，让 Text 自然布局完整文字内容
  },
});

export default WithdrawNoticeBanner;

