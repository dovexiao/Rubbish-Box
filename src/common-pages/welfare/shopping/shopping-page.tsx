import React, {useEffect} from 'react';
import {ScrollView, View} from 'react-native';

import {LazyImageLGBackground} from '@/components/basic/image';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {goBack} from '@/utils';
import theme from '@/style';
import Text from '@/components/basic/text';
import ShopTagTabs from './components/shop-tag-tabs';
import useWelfareStore, {useWelfareStoreActions} from '@/store/useWelfareStore';
import ShopHomeGoodsList from './components/shop-home-goods-list';
import ShopGoodsList from './components/shop-goods-list';
import TotalAmountButton from '@/components/business/total-amount-button';
import {useShallow} from 'zustand/react/shallow';

const ShoppingPage = () => {
  const {shopAmountData, shopCategoryIndex} = useWelfareStore(
    useShallow(state => ({
      shopCategoryIndex: state.shopCategoryIndex,
      shopAmountData: state.shopAmountData,
    })),
  );
  const {
    getShopCategoryTabList,
    getShopHomeGoodsList,
    getShopGoodsList,
    getShopAmountData,
  } = useWelfareStoreActions();

  useEffect(() => {
    getShopAmountData();
    getShopCategoryTabList();
  }, [getShopAmountData, getShopCategoryTabList]);

  useEffect(() => {
    if (shopCategoryIndex === 0) {
      getShopHomeGoodsList();
    } else {
      getShopGoodsList();
    }
  }, [getShopGoodsList, getShopHomeGoodsList, shopCategoryIndex]);

  return (
    <LazyImageLGBackground>
      <DetailNavTitle onBack={goBack} hideAmount serverRight title={'Shop'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[theme.flex.flex1NoHidden]}>
        <View
          style={[
            theme.background.black60,
            theme.margin.lrl,
            theme.padding.lrl,
            theme.padding.tbs,
            theme.borderRadius.s,
          ]}>
          <Text white fontSize={12} blod>
            {shopAmountData?.tip}
          </Text>
        </View>
        <TotalAmountButton
          containerStyle={[theme.margin.lrl, theme.margin.topxs]}
          optionList={[
            {
              title: 'Coin',
              colors: ['#095770', '#013747'],
              source: require('@assets/icons/common/common.webp'),
              amount: shopAmountData?.coinCount,
            },
            {
              title: 'Gem',
              colors: ['#46563B', '#193931'],
              source: require('@assets/icons/common/common.webp'),
              amount: shopAmountData?.gemCount,
            },
          ]}
        />
        <ShopTagTabs />
        {shopCategoryIndex === 0 ? <ShopHomeGoodsList /> : <ShopGoodsList />}
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default ShoppingPage;
