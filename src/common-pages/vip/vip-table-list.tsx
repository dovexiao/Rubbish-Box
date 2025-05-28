import React from 'react';
import {
  View,
  FlatList,
  ListRenderItemInfo,
  useWindowDimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import theme from '@/style';
import Text from '@/components/basic/text';
import LazyImage from '@basicComponents/image';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import Ok from '@/common-pages/svg/ok';

import {vipOptionsMap, VipRenderType} from '@/components/business/vip';
import {toPriceStr} from '@/utils';
import {IVipConfigItem, IVipItem} from '@/services/global.service';
import {useInnerStyle} from './vip.hooks';
import {moneyIcon, luckyspinIcon} from './vip.variable';

export interface VipTableListProps {
  cards: VipRenderType[];
  vipList: IVipItem[];
  vipConfigList: IVipConfigItem[];
  onCheck?: (index: number) => void;
  checkIndex?: number;
  currentLevel: number;
}

const VipTableList: React.FC<VipTableListProps> = ({
  vipList,
  onCheck,
  vipConfigList,
  currentLevel,
}) => {
  const {i18n} = useTranslation();
  const {tableStyle} = useInnerStyle();
  const {width: screenWidth} = useWindowDimensions();

  const renderVipTableItem = ({item, index}: ListRenderItemInfo<IVipItem>) => {
    const badgeWidth = (screenWidth * 72) / 375;
    const badgeHeight = (screenWidth * 25) / 375;

    return (
      <NativeTouchableOpacity onPress={() => onCheck?.(index)}>
        <View
          style={[
            tableStyle.item,
            theme.flex.row,
            theme.flex.between,
            theme.flex.centerByCol,
            {
              borderBottomColor: theme.basicColor.border,
              borderBottomWidth: 1,
              paddingVertical: 12,
            },
          ]}>
          {/* 等级徽章 */}
          <View style={[theme.flex.center, tableStyle.level]}>
            <LazyImage
              occupancy="transparent"
              imageUrl={vipOptionsMap[index].sign}
              style={{
                width: badgeWidth,
                height: badgeHeight,
              }}
            />
          </View>

          {/* 奖励金额 */}
          <View
            style={[
              theme.flex.col,
              theme.flex.centerByCol,
              tableStyle.itemRewardItem,
            ]}>
            <View style={[theme.flex.row, theme.flex.centerByCol]}>
              <LazyImage
                imageUrl={moneyIcon}
                occupancy="#0000"
                width={theme.iconSize.s}
                height={theme.iconSize.s}
              />
              <Text
                style={[theme.margin.leftxxs]}
                fontSize={theme.fontSize.s}
                white
                numberOfLines={1}
                adjustsFontSizeToFit>
                {i18n.t('vip.table.bouns')}
              </Text>
            </View>
            <Text
              color={theme.fontColor.green}
              blod
              fontSize={theme.fontSize.l}
              numberOfLines={1}
              adjustsFontSizeToFit>
              {toPriceStr(vipConfigList[index]?.amount || 0, {
                fixed: 0,
                thousands: true,
              })}
            </Text>
          </View>

          {/* 转盘次数 */}
          <View
            style={[
              theme.flex.col,
              theme.flex.centerByCol,
              tableStyle.itemRewardItem,
            ]}>
            <View style={[theme.flex.row, theme.flex.centerByCol]}>
              <LazyImage
                imageUrl={luckyspinIcon}
                occupancy="#0000"
                width={theme.iconSize.s}
                height={theme.iconSize.s}
              />
              <Text
                style={[theme.margin.leftxxs]}
                fontSize={theme.fontSize.s}
                white
                numberOfLines={1}
                adjustsFontSizeToFit>
                {i18n.t('vip.table.spin')}
              </Text>
            </View>
            <Text white blod fontSize={theme.fontSize.l}>
              ×{vipConfigList[index]?.spin}
            </Text>
          </View>

          {/* 完成状态 */}
          <View
            style={[
              theme.flex.centerByRow,
              theme.flex.alignEnd,
              tableStyle.itemCompletedItem,
            ]}>
            {item.level <= currentLevel ? (
              <View
                style={[
                  theme.flex.flex,
                  theme.flex.row,
                  theme.flex.centerByRow,
                ]}>
                <View
                  style={[
                    theme.flex.center,
                    theme.background.primary,
                    theme.borderRadius.xxxl,
                    {padding: 4},
                  ]}>
                  <Ok />
                </View>
                <Text
                  color={theme.basicColor.primary}
                  style={[theme.margin.leftxs]}>
                  {i18n.t('vip.table.completed')}
                </Text>
              </View>
            ) : (
              <Text color={theme.fontColor.grey}>
                {i18n.t('vip.table.incomplete')}
              </Text>
            )}
          </View>
        </View>
      </NativeTouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.background.mainDark}}>
      <ScrollView contentContainerStyle={{flexGrow: 1, padding: 16}}>
        <View style={[tableStyle.header, theme.flex.row, {marginBottom: 10}]}>
          <View style={tableStyle.points} />
          <View style={[theme.flex.centerByRow, tableStyle.level]}>
            <Text white fontSize={theme.fontSize.m}>
              {i18n.t('vip.table.level')}
            </Text>
          </View>
          <View style={[theme.flex.flex1, theme.flex.centerByRow]}>
            <Text white fontSize={theme.fontSize.m}>
              {i18n.t('vip.table.reward')}
            </Text>
          </View>
        </View>
        <FlatList
          data={vipList}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderVipTableItem}
          scrollEnabled={false}
          contentContainerStyle={{
            backgroundColor: theme.background.cardDark,
            borderRadius: 12,
            overflow: 'hidden',
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default VipTableList;
