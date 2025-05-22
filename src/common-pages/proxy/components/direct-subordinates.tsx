import React from 'react';
import theme from '@style';
import i18n from '@i18n';
import {View} from 'react-native';
import {ProxyTitle, CardItem} from '../basic-components';
import style from './style';
import {
  depositNumberBlackImage,
  user3Icon,
  user4Icon,
  money3Icon,
  money4Icon,
} from '../proxy.variable';
import {CardContent, CardItemProps} from '../basic-components/card-item';
interface IProps {
  directlySubordinateUserCount: number;
  directlySubordinateBetUserCount: number;
  directlySubordinateBetAmount: string;
  directlySubordinateRechargeUserCount: number;
  directlySubordinateRechargeAmount: number;
}
const DirectSubordinates = (props: IProps) => {
  const {
    directlySubordinateUserCount,
    directlySubordinateBetUserCount,
    directlySubordinateBetAmount,
    directlySubordinateRechargeUserCount,
    directlySubordinateRechargeAmount,
  } = props;
  const subordinates1: CardItemProps<CardContent>[] = [
    {
      content: [
        {
          icon: depositNumberBlackImage,
          text: directlySubordinateUserCount,
        },
        {
          text: i18n.t('proxy.home.number-of-registers'),
        },
      ],
      isRight: 0,
    },
    {
      content: [
        {
          icon: user3Icon,
          text: directlySubordinateBetUserCount,
        },
        {
          text: i18n.t('proxy.home.deposit-number'),
        },
      ],
      isRight: 2,
    },
  ];
  const subordinates2: CardItemProps<CardContent>[] = [
    {
      content: [
        {
          icon: money3Icon,
          text: directlySubordinateBetAmount,
        },
        {
          text: i18n.t('proxy.home.deposit-amount'),
        },
      ],
      isRight: 0,
    },
    {
      content: [
        {
          icon: user4Icon,
          text: directlySubordinateRechargeUserCount,
        },
        {
          text: i18n.t('proxy.home.bet-number'),
        },
      ],
      isRight: 0,
    },
    {
      content: [
        {
          icon: money4Icon,
          text: directlySubordinateRechargeAmount,
        },
        {
          text: i18n.t('proxy.home.bet-amount'),
        },
      ],
      isRight: 2,
    },
  ];
  const upStyle = {
    style: {
      color: theme.fontColor.main,
      fontSize: theme.fontSize.m,
    },
    bold: true,
  };
  const downStyle = {
    style: {
      color: theme.fontColor.accent,
      fontSize: theme.fontSize.s,
    },
    bold: false,
  };
  return (
    <View
      style={[
        theme.background.white,
        theme.margin.lrl,
        style.subHeight,
        {
          padding: theme.paddingSize.l,
          borderRadius: theme.borderRadiusSize.m,
        },
      ]}>
      <ProxyTitle title={i18n.t('proxy.home.direct-subordinates')} />
      <View style={{height: theme.paddingSize.l}} />
      <View style={[theme.flex.flex, theme.flex.row, theme.flex.between]}>
        {subordinates1.map((item, index) => (
          <CardItem
            key={index}
            {...item}
            upStyle={upStyle}
            downStyle={downStyle}
            margin={4}
          />
        ))}
      </View>
      <View style={{height: theme.paddingSize.l}} />
      <View style={[theme.flex.flex, theme.flex.row, theme.flex.between]}>
        {subordinates2.map((item, index) => (
          <CardItem
            key={index}
            {...item}
            upStyle={upStyle}
            downStyle={downStyle}
            margin={4}
          />
        ))}
      </View>
    </View>
  );
};

export default DirectSubordinates;
