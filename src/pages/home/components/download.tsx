import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import theme from '@/style';
import {downloadApk} from '@/utils'; //goTo
// import globalStore from '@services/global.state';
import React from 'react';
import i18n from '@i18n';
import {View, Image} from 'react-native';
import Text from '@basicComponents/text';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useSettingWindowDimensions} from '@/store/useSettingStore';

const Download: React.FC = () => {
  // const {i18n} = useTranslation();
  const {calculateItemWidth} = useSettingWindowDimensions();
  const bannerHeight = calculateItemWidth(40);
  const downloadSizeH = calculateItemWidth(30);
  const downloadSizeW = calculateItemWidth(80);
  const iconSize = calculateItemWidth(24);

  const isShow = useSharedValue(true);
  const height = useSharedValue(bannerHeight);

  const derivedHeight = useDerivedValue(
    () =>
      withTiming(isShow.value ? height.value : 0, {
        duration: 500,
      }),
    [isShow],
  );

  const bodyStyle = useAnimatedStyle(
    () => ({
      height: derivedHeight.value,
      marginBottom: derivedHeight.value ? 12 : 0,
    }),
    [derivedHeight],
  );

  const toDownload = () => {
    // if (!globalStore.token) {
    //   globalStore.globalWaringTotal(i18n.t('home.tip.beforDownload'));
    //   goTo('Login');
    //   return;
    // }
    downloadApk();
  };

  return (
    <Animated.View
      key={'accordionItem_download-view'}
      style={[
        theme.flex.row,
        theme.flex.centerByCol,
        theme.margin.lrl,
        theme.flex.between,
        theme.borderRadius.s,
        theme.background.primary50,
        theme.padding.lrl,
        theme.overflow.hidden,
        bodyStyle,
      ]}>
      <View style={[theme.flex.flex, theme.flex.col, theme.flex.centerByRow]}>
        <Text white blod style={[theme.font.m]}>
          {i18n.t('other.downloadApp')}
        </Text>
        {/*<Text color={'#ffffff60'} style={[theme.font.s]}>*/}
        {/*  Start using exclusive services*/}
        {/*</Text>*/}
      </View>
      <View style={[theme.flex.flex, theme.flex.row, theme.flex.centerByCol]}>
        <NativeTouchableOpacity
          onPress={toDownload}
          style={[
            theme.flex.center,
            theme.borderRadius.xxl,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              height: downloadSizeH,
              width: downloadSizeW,
              backgroundColor: '#0BD064',
            },
          ]}>
          <Text white blod>
            {i18n.t('other.download')}
          </Text>
        </NativeTouchableOpacity>
        <NativeTouchableOpacity
          style={[theme.flex.center, {height: iconSize, width: iconSize}]}
          onPress={() => {
            isShow.value = false;
          }}>
          <Image
            style={[
              {
                height: iconSize,
                width: iconSize,
                // marginRight: margin,
              },
            ]}
            source={require('@assets/icons/close-white.webp')}
          />
        </NativeTouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default Download;
