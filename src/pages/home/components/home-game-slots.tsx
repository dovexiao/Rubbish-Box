import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import React from 'react';
import {View, Image, ImageRequireSource, ImageBackground} from 'react-native';
import Text from '@basicComponents/text';
import theme from '@style';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import useHomeStore from '@/store/useHomeStore';
import i18n from '@i18n';

type BtnState = {
  title: string;
  subTitle: string;
  bgSource: ImageRequireSource;
  source: ImageRequireSource;
  onPressBtn: () => void;
};

const HomeGameSlots = () => {
  const {screenWidth} = useSettingWindowDimensions();
  const itemWidth = (screenWidth - 12 * 2 - 10) / 2;
  const itemHeight = (itemWidth / 165) * 207;
  const headerImageWH = (itemWidth / 165) * 140;

  const renderItem = (item: BtnState) => {
    return (
      <NativeTouchableOpacity
        style={[
          theme.flex.centerByCol,
          theme.borderRadius.s,

          {height: itemHeight, width: itemWidth},
        ]}
        activeOpacity={0.8}
        key={`${item?.bgSource}`}
        onPress={item.onPressBtn}>
        <ImageBackground
          source={item?.bgSource}
          resizeMode="stretch"
          style={[
            theme.flex.flex1,
            theme.flex.row,
            theme.borderRadius.s,
            theme.position.rel,

            {height: itemHeight, width: itemWidth},
          ]}>
          <Image
            style={[
              theme.position.abs,
              // eslint-disable-next-line react-native/no-inline-styles
              {top: 0, right: 0, height: headerImageWH, width: headerImageWH},
            ]}
            source={item?.source}
          />
          <View
            style={[
              theme.position.abs,
              theme.margin.topxxxs,
              theme.padding.lrl,
              {
                marginTop: itemHeight - 60,
                width: itemWidth,
              },
            ]}>
            <Text fontFamily="fontInter" blod fontSize={15} white style={[]}>
              {item?.title}
            </Text>
            <Text
              fontFamily="fontInter"
              fontSize={12}
              color={theme.fontColor.white60}
              style={[]}>
              {item?.subTitle}
            </Text>
          </View>
        </ImageBackground>
      </NativeTouchableOpacity>
    );
  };

  return (
    <View style={[theme.flex.centerByCol]}>
      <Image
        style={[
          // eslint-disable-next-line react-native/no-inline-styles
          {height: 64, width: 64, marginTop: 20},
        ]}
        source={require('@assets/imgs/home/home-title-nimi-game.webp')}
      />
      <View style={[theme.flex.center]}>
        <Text fontSize={24} blod color={'#04CC9B'} style={[theme.font.center]}>
          {i18n.t('other.homeDetail43')}
        </Text>
      </View>
      <View
        style={[
          theme.flex.row,
          theme.padding.lrl,
          theme.flex.wrap,
          {gap: 10},
          {marginTop: 20},
        ]}>
        {[
          {
            bgSource: require('@assets/imgs/home/lottery-bg-image.webp'),
            source: require('@assets/imgs/home/lottery-header-image.webp'),
            title: i18n.t('headers.color'),
            subTitle: i18n.t('other.homeDetail37'),
            onPressBtn: () => {
              useHomeStore.setState({oneCategoryPageIndex: 1});
            },
          },
          {
            bgSource: require('@assets/imgs/home/live-bg-image.webp'),
            source: require('@assets/imgs/home/live-header-image.webp'),
            title: i18n.t('headers.dice'),
            subTitle: i18n.t('other.homeDetail38'),
            onPressBtn: () => {
              useHomeStore.setState({
                oneCategoryPageIndex: 2,
                pageTagIndex: -1,
              });
            },
          },
          {
            bgSource: require('@assets/imgs/home/casino-bg-image.webp'),
            source: require('@assets/imgs/home/casino-header-image.webp'),
            title: i18n.t('headers.digits'),
            subTitle: i18n.t('other.homeDetail39'),
            onPressBtn: () => {
              useHomeStore.setState({
                oneCategoryPageIndex: 3,
                pageTagIndex: -1,
              });
            },
          },
          {
            bgSource: require('@assets/imgs/home/sport-bg-image.webp'),
            source: require('@assets/imgs/home/sport-header-image.webp'),
            title: i18n.t('headers.kerala'),
            subTitle: i18n.t('other.homeDetail40'),
            onPressBtn: () => {},
          },
        ].map(item => {
          return renderItem(item);
        })}
      </View>
    </View>
  );
};

export default HomeGameSlots;
