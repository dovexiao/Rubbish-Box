import React, {useMemo} from 'react';
import {KeralaListItem} from '../../home.type';
import Text from '@basicComponents/text';
import {View, ImageBackground} from 'react-native';
import theme from '@/style';
import LazyImage, {LazyImageBackground} from '@basicComponents/image';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {goTo, toPriceStr} from '@/utils';
import dayjs from 'dayjs';
import globalStore from '@/services/global.state';
import {useTranslation} from 'react-i18next';

const HomeKeralaCard = ({
  item,
  marginRight,
  cardWidth,
  marginTop,
  imageHeight,
}: {
  item: KeralaListItem;
  marginRight?: boolean;
  cardWidth: number;
  marginTop?: boolean;
  imageHeight: number;
}) => {
  const {i18n} = useTranslation();
  // const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const remain = useMemo(() => {
    const seconds = dayjs(item.drawDate).diff(dayjs(), 'second');
    if (seconds < 0) {
      return {hours: 0, minutes: 0, closed: true};
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds / 60) % 60;
    return {hours, minutes, closed: false};
  }, [item]);
  const lotteryName = useMemo(
    () =>
      (item.lotteryType?.indexOf('BUMPER') > -1 ? 'festival' : 'weekly') +
      ' lottery',
    [item.lotteryType],
  );
  return (
    <NativeTouchableOpacity
      style={[
        {
          width: cardWidth,
        },
        marginRight ? theme.margin.rights : null,
        marginTop ? theme.margin.tops : null,
        theme.flex.col,
        theme.borderRadius.s,
        theme.overflow.hidden,
      ]}
      onPress={() => {
        if (remain.closed) {
          globalStore.globalWaringTotal(
            i18n.t('home.tip.closed', {name: `${lotteryName} ${item.issueNo}`}),
          );
          return;
        }
        goTo('GameWebView', {
          type: 'kerala',
          params: `data=${JSON.stringify(item)}`,
        });
      }}>
      <LazyImageBackground
        height={imageHeight}
        width={cardWidth}
        imageUrl={item.backImg}
        style={[
          theme.flex.alignStart,
          theme.flex.between,
          theme.padding.lrs,
          theme.padding.tops,
          theme.padding.btmxxs,
        ]}>
        {/* <View style={[theme.flex.row, theme.fill.fillW, theme.flex.between]}>
          <View style={[theme.margin.lefts]}>
            <Text
              fontSize={8}
              blod
              style={[
                theme.font.white,
                theme.padding.tbxxxs,
                theme.padding.lrxs,
                theme.borderRadius.s,
                {backgroundColor: 'rgba(0, 0, 0, 0.30)'},
              ]}>
              {lotteryName}
            </Text>
          </View>

          <View style={[theme.flex.col, theme.flex.alignEnd]}>
            <Text fontSize={9} blod style={[theme.font.white]}>
              {i18n.t('home.kerala.no')}
            </Text>
            <Text
              fontSize={9}
              blod
              style={[
                theme.font.white,
                globalStore.isWeb ? theme.margin.topxxs : {},
              ]}>
              {item.issueNo}
            </Text>
          </View>
        </View> */}

        {/* <View
          style={[
            theme.padding.lrs,
            theme.fill.fillW,
            theme.flex.row,
            theme.flex.centerByCol,
            theme.flex.between,
          ]}>
          <View style={[theme.flex.col]}>
            <Text white fontFamily="fontInterBold">
              {toPriceStr(item.lotteryPrice, {currency: globalStore.currency})}
            </Text>
          </View>
          <View style={[theme.flex.col, theme.flex.alignEnd]}>
            <Text fontSize={9} white>
              {weekDays[new Date(item.drawDate).getDay()]} {item.drawTime}
            </Text>
            <View style={[theme.flex.row, theme.flex.centerByCol]}>
              <LazyImage
                occupancy={'transparent'}
                imageUrl={require('@assets/icons/home/hourglass.webp')}
                width={9}
                height={9}
              />
              <Text fontSize={9} white style={[theme.margin.leftxxs]}>
                {remain.hours} hrs {remain.minutes} mins
              </Text>
            </View>
          </View>
        </View> */}
        <ImageBackground
          style={[
            theme.flex.flex,
            theme.flex.center,
            {
              width: 80,
              height: 14,
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: [{translateX: -40}],
            },
          ]}
          source={require('@assets/icons/home/game-header.webp')}>
          <Text fontSize={8} blod style={[theme.font.white]}>
            {item.issueNo}
          </Text>
        </ImageBackground>
        <View
          style={[
            theme.flex.row,
            theme.flex.centerByCol,
            theme.flex.between,
            theme.padding.lrs,
            {
              width: cardWidth,
              height: cardWidth / 7,
              backgroundColor: 'rgba(3,3,3,0.40)',
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              position: 'absolute',
              bottom: 0,
              left: 0,
            },
          ]}>
          <Text white fontFamily="fontInterBold">
            {toPriceStr(item.sellMoney, {currency: globalStore.currency})}
          </Text>
          <Text fontSize={9} white style={[theme.margin.leftxxs]}>
            {remain.hours} hrs {remain.minutes} mins
          </Text>
        </View>
      </LazyImageBackground>

      {remain.closed && (
        <View
          style={[
            theme.background.white,
            theme.fill.fill,
            theme.position.abs,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              opacity: 0.5,
              left: 0,
              bottom: 0,
            },
          ]}>
          <View
            style={[
              theme.position.abs,
              {right: theme.paddingSize.xxs / 2, top: theme.paddingSize.s},
            ]}>
            <LazyImage
              imageUrl={require('@assets/icons/home/closed.webp')}
              width={theme.imageSize.m}
              height={theme.imageSize.m}
              occupancy="#0000"
            />
          </View>
        </View>
      )}
    </NativeTouchableOpacity>
  );
};

export default HomeKeralaCard;
