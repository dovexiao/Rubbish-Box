import React from 'react';
import Text from '@basicComponents/text';
import {StyleSheet, View} from 'react-native';
import theme from '@/style';
import LazyImage, {LazyImageBackground} from '@basicComponents/image';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {goTo} from '@/utils';
import globalStore from '@/services/global.state';
import {DigitListItem} from '../../home.type';
import CountDown from '../count-down';
import {useTranslation} from 'react-i18next';
// import {BasicObject} from '@components/types';

const HomeDigitCard = ({
  item,
  marginRight,
  cardWidth,
  imageHeight,
}: {
  item: DigitListItem;
  marginRight?: boolean;
  cardWidth: number;
  imageHeight: number;
}) => {
  const {i18n} = useTranslation();

  // const iconShadow = useMemo(() => {
  //   let shadow = {} as BasicObject;
  //   if (globalStore.isWeb) {
  //     shadow = {
  //       ...shadow,
  //       boxShadow: '0px 0px 10px 3px rgba(0,0,0,0.4) inset',
  //     };
  //   } else {
  //     shadow = {
  //       ...shadow,
  //       shadowColor: 'rgba(0, 0, 0, 0.4)',
  //       shadowOffset: {width: 0, height: 4},
  //       shadowOpacity: 1,
  //       shadowRadius: 4,
  //       elevation: 2,
  //     };
  //   }
  //   return shadow;
  // }, []);

  return (
    <NativeTouchableOpacity
      style={[
        {
          width: cardWidth,
        },
        marginRight ? theme.margin.rights : null,
        theme.flex.col,
        theme.borderRadius.s,
        theme.overflow.hidden,
      ]}
      onPress={() => {
        if (item.drawTime <= 0 && item?.id !== 103) {
          globalStore.globalWaringTotal(
            i18n.t('home.tip.closed', {name: `${item.pickName}`}),
          );
          return;
        }
        if (item?.id === 103) {
          return goTo('GameWebView', {
            type: 'quick3d',
            params: 'id=103',
          });
        }
        if (item?.id === 101) {
          return goTo('GameWebView', {
            type: 'quick3d',
            params: 'id=3',
          });
        }
        if (item?.id === 102) {
          return goTo('GameWebView', {
            type: 'quick3d',
            params: 'id=5',
          });
        }
        goTo('GameWebView', {
          type: 'digit',
          params: `id=${item.id}&pickName=${item.pickName}&pickLogo=${item.pickLogo}`,
        });
      }}>
      <LazyImageBackground
        height={imageHeight}
        width={cardWidth}
        imageUrl={item.pickBackImg}
        style={[
          theme.flex.col,
          theme.flex.alignEnd,
          theme.flex.between,
          theme.padding.lrs,
          theme.padding.tbs,
        ]}>
        <Text
          fontSize={8}
          blod
          style={[styles.lotteryType, theme.padding.lrxxs, theme.font.white]}>
          {/*{item.pickName}*/}
        </Text>
        <View
          style={[
            theme.flex.col,
            theme.flex.center,
            theme.borderRadius.l,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              height: 12,
              width: '100%',
              display: [101, 102, 103].includes(item?.id) ? 'none' : 'flex',
            },
          ]}>
          {/*<Text fontSize={8} style={[theme.font.white, theme.margin.btmxxs]}>*/}
          {/*  {i18n.t('home.digit.booking')}*/}
          {/*</Text>*/}
          <CountDown
            remain={item.drawTime ? Math.round(item.drawTime / 1000) : 0}
          />
        </View>
      </LazyImageBackground>
      {item.drawTime === 0 && (
        <View
          style={[
            theme.background.background50,
            theme.fill.fill,
            theme.position.abs,
            theme.flex.center,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              // opacity: 0.5,
              left: 0,
              bottom: 0,
            },
          ]}>
          <View style={[styles.closed]}>
            <LazyImage
              imageUrl={require('@assets/icons/home/closed.webp')}
              width={theme.imageSize.m}
              height={theme.imageSize.m}
              occupancy="#0000"
            />
          </View>
        </View>
      )}

      {/*<View*/}
      {/*  style={[*/}
      {/*    theme.padding.s,*/}
      {/*    theme.fill.fillW,*/}
      {/*    theme.flex.row,*/}
      {/*    theme.flex.centerByCol,*/}
      {/*    theme.flex.start,*/}
      {/*  ]}>*/}
      {/*  <View style={[theme.flex.row, theme.flex.alignEnd]}>*/}
      {/*    <Text main fontSize={theme.fontSize.s} fontFamily="fontInterBold">*/}
      {/*      {toPriceStr(item.sellAmount, {*/}
      {/*        currency: globalStore.currency,*/}
      {/*      })}*/}
      {/*    </Text>*/}
      {/*    <Text accent fontSize={9}>*/}
      {/*      /{i18n.t('home.digit.ticket')}*/}
      {/*    </Text>*/}
      {/*  </View>*/}
      {/*</View>*/}
    </NativeTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  lotteryType: {
    borderRadius: 2,
    paddingVertical: 2,
    backgroundColor: theme.basicColor.primary10,
  },
  closed: {
    zIndex: 5,
    position: 'absolute',
    right: 2,
    top: 8,
  },
});

export default HomeDigitCard;
