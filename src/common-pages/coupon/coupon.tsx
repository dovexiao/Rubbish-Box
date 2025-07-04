import React, {useEffect, useState} from 'react';
import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';

import {
  LazyImageBackground,
  LazyImageLGBackground,
} from '@/components/basic/image';
import {goBack, goTo} from '@/utils';
import {useTranslation} from 'react-i18next';
import useCouponStore, {useCouponActions} from '@/store/useCouponStore';
import {ScrollView, View} from 'react-native';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import Text from '@/components/basic/text';
import Button from '@/components/basic/button';
import {useRoute} from '@react-navigation/native';
import {BasicObject} from '@/types';
import {CouponItem} from './coupon.service';
import dayjs from 'dayjs';
import {TabsRound, TabsRoundOptionItem} from '@/components/basic/tab';

const Coupon = () => {
  const {i18n} = useTranslation();
  const {couponList} = useCouponStore();
  const {selectCoupon} = (useRoute()?.params as BasicObject) || {};
  const {getCouponList} = useCouponActions();
  const [type, setType] = useState<string | number>(2);
  const {screenWidth, calculateItemWidth} = useSettingWindowDimensions();

  const onPressToRecharge = (item: CouponItem) => {
    if (selectCoupon && item?.status === 2) {
      useCouponStore.setState({selectedCoupon: item});
    } else {
      useCouponStore.setState({selectedCoupon: {}});
    }
    goTo('Recharge', {couponInit: false});
  };

  const renderItem = (item: CouponItem) => {
    return (
      <LazyImageBackground
        imageUrl={require('@/assets/icons/common/common.webp')}
        width={screenWidth - theme.paddingSize.l * 2}
        height={calculateItemWidth(80)}
        key={item?.id}
        style={[
          theme.flex.row,
          theme.flex.centerByCol,
          theme.flex.between,
          theme.padding.lrl,
        ]}>
        <View style={[theme.flex.flex1, theme.gap.xxs]}>
          <Text fontSize={16} blod color={theme.fontColor.white}>
            {i18n.t('other.rechargeWithBonus', {
              rechargeAmount: item?.rechargeAmount,
              couponAmount: item?.couponAmount,
            })}
          </Text>
          <Text fontSize={12} color={theme.fontColor.white60}>
            {i18n.t('other.expiredTime')}:{' '}
            {dayjs(item?.expireTime).format('YYYY-MM-DD hh:mm:ss')}
          </Text>
        </View>
        <View
          style={[
            theme.gap.xxs,
            theme.flex.centerByCol,
            {
              minWidth: 80,
            },
          ]}>
          <Text fontSize={16} blod color={theme.fontColor.yellow}>
            RS.{item?.couponAmount}
          </Text>
          <Button
            size="xsmall"
            style={[
              {
                backgroundColor: theme.basicColor.primary50,
              },
            ]}
            buttonStyle={{
              backgroundColor: theme.basicColor.primary50,
              borderWidth: 0,
            }}
            title={
              // selectCoupon && item?.status === 2 ? i18n.t('other.select') : i18n.t('other.goRecharge')
              selectCoupon && item?.status === 2 ? 'Select' : 'Go Recharge'
            }
            radius={20}
            onPress={() => {
              onPressToRecharge(item);
            }}
          />
        </View>
      </LazyImageBackground>
    );
  };

  const tabOptions: TabsRoundOptionItem[] = [
    {
      label: i18n.t('other.validCoupon'),
      value: 2,
    },
    {
      label: i18n.t('other.usedCoupon'),
      value: 1,
    },
    {
      label: i18n.t('other.invalidCoupon'),
      value: 3,
    },
  ];

  useEffect(() => {
    getCouponList(type as number);
  }, [getCouponList, type]);

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        onBack={goBack}
        hideServer
        hideAmount
        title={i18n.t('other.coupon')}
      />
      <TabsRound
        tabOptions={tabOptions}
        value={type}
        onChange={setType}
        style={[theme.margin.lrl]}
      />
      <ScrollView
        contentContainerStyle={[theme.gap.m, theme.padding.lrl]}
        style={[theme.flex.flex1, theme.margin.topl]}>
        {couponList?.map(item => {
          return renderItem(item);
        })}
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default Coupon;
