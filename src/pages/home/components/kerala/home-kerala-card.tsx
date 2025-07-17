import React, {useMemo} from 'react';
import {KeralaListItem} from '../../home.type';
import Text from '@basicComponents/text';
import {View} from 'react-native';
import theme from '@/style';
import LazyImage, {LazyImageBackground} from '@basicComponents/image';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {goTo} from '@/utils';
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
  // const remain = useMemo(() => {
  //   const seconds = dayjs(item.drawDate).diff(dayjs(), 'second');
  //   if (seconds < 0) {
  //     return {hours: 0, minutes: 0, closed: true};
  //   }
  //   const hours = Math.floor(seconds / 3600);
  //   const minutes = Math.floor(seconds / 60) % 60;
  //   return {hours, minutes, closed: false};
  // }, [item]);
  const remain = useMemo(() => {
    const seconds = dayjs(item.drawDate).diff(dayjs(), 'second');
    if (seconds < 0) {
      return {days: 0, hours: 0, minutes: 0, closed: true};
    }

    const days = Math.floor(seconds / 86400); // 一天86400秒
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return {days, hours, minutes, closed: false};
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
          theme.padding.topxs,
          theme.padding.btmxxs,
        ]}>
        <View
          style={[
            theme.flex.row,
            theme.fill.fillW,
            theme.flex.between,
            {marginTop: 33},
          ]}>
          {/* 左边：售价 */}
          <View>
            <Text
              fontSize={16}
              blod
              style={{color: '#FFD700', fontStyle: 'italic'}}>
              ₹{item.sellMoney}
            </Text>
          </View>

          {/* 右边：期号 */}
          <View>
            <Text
              fontSize={16}
              blod
              style={{color: '#FFFFFFAA', fontStyle: 'italic'}}>
              No. {item.issueNo}
            </Text>
          </View>
        </View>

        <View style={[theme.fill.fillW, theme.flex.col, theme.flex.between]}>
          {/* 上方：价格，靠左、向上 */}
          <View
            style={{alignItems: 'flex-start', position: 'relative', top: -3}}>
            <Text white fontSize={14} fontFamily="fontInterBold">
              {item.lotteryPrice}
            </Text>
          </View>

          <View style={[theme.flex.col, {alignItems: 'center'}]}>
            <Text
              fontSize={18}
              fontFamily="fontInterBold" // 加粗
              style={{color: '#FFD700'}} // 高亮金黄（可自定义）
            >
              {remain.days > 0
                ? `${remain.days} days ${remain.hours} hrs`
                : `${remain.hours} hrs ${remain.minutes} mins`}
            </Text>
          </View>
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
