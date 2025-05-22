import theme from '@/style';
import React from 'react';
import {FlatList, ListRenderItemInfo, View} from 'react-native';
import {useInnerStyle} from './vip.hooks';
import Text from '@/components/basic/text';
import {vipOptionsMap, VipRenderType} from '@/components/business/vip';
import LazyImage from '@basicComponents/image';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {luckyspinIcon, moneyIcon} from './vip.variable';
import {toPriceStr} from '@/utils';
import {IVipConfigItem, IVipItem} from '@/services/global.service';
import {useTranslation} from 'react-i18next';
import globalStore from '@services/global.state';
import Ok from '@/common-pages/svg/ok';

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
  const {tableStyle} = useInnerStyle();
  const {i18n} = useTranslation();
  const renderVipTableItem = ({item, index}: ListRenderItemInfo<IVipItem>) => {
    return (
      <NativeTouchableOpacity onPress={() => onCheck?.(index)}>
        <View
          style={[
            tableStyle.item,
            theme.flex.row,
            theme.flex.between,
            theme.flex.centerByCol,
            {borderBottomColor: theme.basicColor.border, borderBottomWidth: 1},
          ]}>
          <View style={[theme.flex.center, tableStyle.level]}>
            <LazyImage
              occupancy={'transparent'}
              imageUrl={vipOptionsMap[index].sign}
              width={(globalStore.screenWidth * 72) / 375}
              height={(globalStore.screenWidth * 25) / 375}
            />
          </View>
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
                white>
                {i18n.t('vip.table.bouns')}
              </Text>
            </View>
            <Text
              color={theme.fontColor.green}
              blod
              fontSize={theme.fontSize.l}>
              {toPriceStr(vipConfigList[index]?.amount || 0, {
                fixed: 0,
                thousands: true,
              })}
            </Text>
          </View>
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
                white>
                {i18n.t('vip.table.spin')}
              </Text>
            </View>
            <Text white blod fontSize={theme.fontSize.l}>
              ×{vipConfigList[index]?.spin}
            </Text>
          </View>
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
              <View style={[theme.flex.row, theme.flex.centerByRow]}>
                <Text color={theme.fontColor.grey} style={[]}>
                  {i18n.t('vip.table.incomplete')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </NativeTouchableOpacity>
    );
  };

  return (
    <View style={[theme.flex.flex1]}>
      <View style={[tableStyle.header, theme.flex.row]}>
        <View style={[tableStyle.points]} />
        <View style={[theme.flex.centerByRow, tableStyle.level]}>
          <Text white fontSize={theme.fontSize.m}>
            {i18n.t('vip.table.level')}
            {'  '}
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
        style={[
          theme.margin.lrl,
          theme.background.mainDark,
          theme.padding.l,
          theme.borderRadius.l,
        ]}
        renderItem={renderVipTableItem}
      />
    </View>
  );
};

export default VipTableList;
