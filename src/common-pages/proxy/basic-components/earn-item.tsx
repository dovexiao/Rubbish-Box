import React, {useMemo} from 'react';
import theme from '@style';
import i18n from '@i18n';
import {View, StyleSheet} from 'react-native';
import Text from '@basicComponents/text';
import {defaultHeaderImg} from '../proxy.variable';
import LazyImage, {ImageUrlType} from '@/components/basic/image';
import EarnTop from './earn-top';
import {toPriceStr} from '@/utils';

type EarnType = 'top' | 'me';

interface EarnChartProps {
  type?: EarnType;
  rank?: number | string;
  headImg?: ImageUrlType;
  commissionAmount?: string;
  phone?: string;
  exceed?: string;
  height?: number;
}

const listItem = (rank: number, headImg: ImageUrlType, phone: string) => {
  return (
    <View style={[theme.flex.flex, theme.flex.row, theme.flex.centerByCol]}>
      <EarnTop top={rank} />
      <View style={[theme.margin.rightxxs, theme.margin.leftl]}>
        <LazyImage
          imageUrl={headImg}
          occupancy="#0000"
          radius={theme.iconSize.xl / 2}
          width={theme.iconSize.l}
          height={theme.iconSize.l}
        />
      </View>
      <Text
        blod
        style={[
          {
            color: theme.fontColor.white,
            fontSize: theme.fontSize.s,
          },
        ]}>
        {phone || '-'}
      </Text>
    </View>
  );
};

const meItem = (
  rank: string,
  headImg: ImageUrlType,
  // commissionAmount: string,
  exceed?: string,
  amount?: string,
) => {
  const textWrap = [
    {
      width: 140,
    },
  ];
  const exceedText = {
    color: '#ff7e28',
    fontSize: theme.fontSize.xs,
  };
  return (
    <View style={[theme.flex.row, theme.flex.centerByCol, theme.margin.topl]}>
      <View style={[theme.flex.flex, theme.flex.col, theme.flex.centerByCol]}>
        <EarnTop top={+rank} />
        <Text blod fontSize={theme.fontSize.xs} fontFamily="fontDin" white>
          {i18n.t('proxy.home.me')}
        </Text>
      </View>
      <View style={[theme.margin.leftl, theme.margin.rightxxs]}>
        <LazyImage
          imageUrl={headImg}
          occupancy="#0000"
          radius={theme.iconSize.xl / 2}
          width={theme.iconSize.xl}
          height={theme.iconSize.xl}
        />
      </View>

      <View style={textWrap}>
        <Text white fontSize={theme.fontSize.xs}>
          {i18n.t('proxy.home.agents-whose-commissions-exceed')}
          <Text blod color={theme.fontColor.white} style={exceedText}>
            {amount != null && +amount <= 0 ? '0%' : exceed || '-'}
          </Text>
        </Text>
      </View>
    </View>
  );
};

const EarnItem: React.FC<EarnChartProps> = props => {
  const {
    rank,
    headImg,
    commissionAmount,
    phone,
    exceed,
    type = 'top',
    height,
  } = props;
  const styles = StyleSheet.create({
    wrap: {
      height: height ? height : type === 'top' ? 40 : 70,
    },
  });
  const renderItem = useMemo(() => {
    return phone
      ? listItem(rank as number, headImg || defaultHeaderImg, phone)
      : meItem(
          rank as string,
          headImg || defaultHeaderImg,
          exceed,
          commissionAmount,
        );
  }, [exceed, headImg, phone, rank, commissionAmount]);
  return (
    <View
      style={[
        theme.flex.row,
        theme.flex.between,
        theme.flex.centerByCol,
        styles.wrap,
      ]}>
      {renderItem}
      <Text white fontFamily="fontInter" blod fontSize={theme.fontSize.l}>
        {commissionAmount
          ? toPriceStr(+commissionAmount, {fixed: 0, round: 'floor'})
          : '-'}
      </Text>
    </View>
  );
};

export default EarnItem;
