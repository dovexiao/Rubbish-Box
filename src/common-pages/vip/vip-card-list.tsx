import theme from '@/style';
import React, {useEffect, useRef} from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from 'react-native';
import {useInnerStyle} from './vip.hooks';
import {
  VipProgressInfo,
  VipRenderType,
  maxVipLevel,
  vipOptionsMap,
  VipProgress,
  vipBgColors,
} from '@/components/business/vip';
import Text from '@basicComponents/text';
import {toPriceStr} from '@/utils';

import {IVipItem} from '@/services/global.service';
import {useTranslation} from 'react-i18next';
import LinearGradient from '@/components/basic/linear-gradient';

export interface VipCardListProps {
  rechargeAmount: number;
  vipInfoList: VipProgressInfo[];
  cards: VipRenderType[];
  vipList: IVipItem[];
  onRecharge?: () => void;
  onCheck?: (index: number) => void;
  onRefresh?: () => void;
  checkIndex?: number;
  currentLevel: number;
}

const VipCardList: React.FC<VipCardListProps> = ({
  vipList,
  rechargeAmount,
  onCheck,
  checkIndex,
}) => {
  const {i18n} = useTranslation();
  const {
    vipStyle,
    cardStyle,
    size: {vipCardWidth},
  } = useInnerStyle();
  const ref = useRef<FlatList>(null);
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const width = vipCardWidth;
    const x = e.nativeEvent.contentOffset.x;
    const nowIndex = Math.round(x / width);
    onCheck?.(nowIndex);
  };

  useEffect(() => {
    if (vipList.length <= 0) {
      return;
    }
    ref.current?.scrollToIndex({
      index: checkIndex || 0,
    });
  }, [checkIndex, vipList.length]);

  const renderVipCardItem = ({item, index}: ListRenderItemInfo<IVipItem>) => {
    return (
      <LinearGradient
        colors={vipBgColors[index]}
        style={[
          cardStyle.cardContainerStyle,
          theme.flex.row,
          theme.flex.between,
          theme.padding.lrl,
          theme.flex.centerByCol,
          theme.borderRadius.s,
          theme.border.white30,
        ]}
        key={index}>
        <View
          style={[
            theme.flex.flex1,
            theme.flex.col,
            theme.margin.rightl,
            theme.flex.around,
            {height: 120},
          ]}>
          <View style={[theme.flex.row, theme.flex.alignEnd]}>
            <Text
              fontSize={28}
              fontFamily="fontDin"
              blod
              // color={vipColors[index]}
              color={theme.fontColor.white}>
              V{index}
            </Text>
            {index !== 0 && (
              <View style={[cardStyle.topTag]}>
                <Text fontSize={theme.fontSize.s} color={theme.fontColor.white}>
                  (
                  {vipList[index - 1].statusReached === 1
                    ? vipList[index - 1].rewardReceivingStatus === 0
                      ? i18n.t('vip.received')
                      : i18n.t('vip.collected')
                    : i18n.t('vip.finished')}
                  )
                </Text>
              </View>
            )}
          </View>
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            <Text color={theme.fontColor.white60} fontSize={theme.fontSize.s}>
              Level prograss{' '}
              <Text color={theme.fontColor.white} blod>
                {Math.max(
                  0,
                  Math.min((rechargeAmount / item?.amount) * 100, 100),
                )}
                %
              </Text>
            </Text>
          </View>
          <View style={[]}>
            <VipProgress
              currentLevel={item?.level}
              nextCurrentLevel={item?.level + 1}
              current={rechargeAmount}
              total={item?.amount}
              hasCurrentText={true}
            />
          </View>

          <View style={[theme.position.rel, theme.flex.row]}>
            <Text white fontSize={theme.fontSize.s} blod>
              {toPriceStr(rechargeAmount, {fixed: 0, thousands: true})}
            </Text>
            <Text
              white
              fontSize={theme.fontSize.s}
              blod
              style={[theme.margin.leftxxs]}>
              / {toPriceStr(item.amount, {fixed: 0, thousands: true})}(V
              {Math.min(index + 1, maxVipLevel)})
            </Text>
          </View>
          <View
            style={[theme.flex.row, theme.flex.centerByCol, theme.fill.fillW]}>
            <Text
              color={theme.fontColor.white60}
              style={[cardStyle.text]}
              fontSize={theme.fontSize.xs}>
              {i18n.t('vip.recharge')}{' '}
              <Text color={theme.fontColor.white} blod>
                {toPriceStr(item.diff, {fixed: 0, thousands: true})}
              </Text>{' '}
              {i18n.t('vip.move')}
              <Text white blod>
                VIP
                {Math.min(item.level + 1, maxVipLevel)}
              </Text>
            </Text>
          </View>
        </View>
        <View style={[theme.flex.centerByCol]}>
          <Image
            source={vipOptionsMap[item?.level].small as ImageSourcePropType}
            style={[
              {
                height: 98,
                width: 98,
              },
            ]}
          />
          <Text white fontSize={18}>
            VIP{item?.level}
          </Text>
        </View>
      </LinearGradient>
    );
  };
  return (
    <FlatList
      ref={ref}
      style={[vipStyle.cardList]}
      showsHorizontalScrollIndicator={false}
      onScroll={handleScroll}
      contentContainerStyle={[vipStyle.cardListContent]}
      data={vipList}
      pagingEnabled
      snapToAlignment="center"
      renderItem={renderVipCardItem}
      getItemLayout={(data, index) => ({
        length: vipCardWidth + theme.paddingSize.l,
        offset: (vipCardWidth + theme.paddingSize.l) * index,
        index,
      })}
      horizontal
    />
  );
};

export default VipCardList;
