import React from 'react';
import {View, Image} from 'react-native';
import Text from '@basicComponents/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import theme from '@/style';
import {downloadApk} from '@/utils';
import i18n from '@i18n';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useSettingWindowDimensions} from '@/store/useSettingStore';

const Download: React.FC = () => {
  const {calculateItemWidth} = useSettingWindowDimensions();

  // 动态尺寸
  const bannerHeight = calculateItemWidth(40);
  const downloadSizeH = calculateItemWidth(27);
  const downloadSizeW = calculateItemWidth(90);
  const iconSize = calculateItemWidth(24);

  // 显示控制
  const isVisible = useSharedValue(true);

  // 动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(isVisible.value ? bannerHeight : 0, {duration: 400}),
      marginBottom: withTiming(isVisible.value ? 6 : 0, {duration: 400}),
      overflow: 'hidden',
    };
  }, [isVisible]);

  // 下载方法
  const toDownload = () => {
    downloadApk();
  };

  return (
    <Animated.View
      key="accordionItem_download-view"
      style={[
        theme.flex.row,
        theme.flex.between,
        theme.borderRadius.s,
        theme.background.transparentMedium,
        theme.padding.lrl,
        animatedStyle,
      ]}>
      {/* 文案区域 */}
      <View
        style={[
          theme.flex.flex,
          theme.flex.row,
          {maxWidth: '60%', alignItems: 'center'},
        ]}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          blod
          style={[
            theme.font.l,
            theme.font.primary,
            {textAlignVertical: 'center'},
          ]}>
          {i18n.t('other.downloadApp')}
        </Text>
      </View>

      {/* 按钮 + 关闭区域 */}
      <View
        style={[
          theme.flex.row,
          theme.flex.centerByCol,
          {gap: 8, flexShrink: 0},
        ]}>
        <NativeTouchableOpacity
          onPress={toDownload}
          style={[
            theme.flex.center,
            theme.borderRadius.s,
            {
              height: downloadSizeH,
              width: downloadSizeW,
              ...theme.background.primary,
            },
          ]}>
          <Text black size="medium" numberOfLines={1}>
            {i18n.t('other.download')}
          </Text>
        </NativeTouchableOpacity>

        <NativeTouchableOpacity
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={() => {
            isVisible.value = false;
          }}
          style={[theme.flex.center, {height: iconSize, width: iconSize}]}>
          <Image
            style={{
              height: iconSize,
              width: iconSize,
            }}
            source={require('@assets/icons/close-white.webp')}
          />
        </NativeTouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default Download;
