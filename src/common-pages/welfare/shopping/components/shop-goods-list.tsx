import React, {useCallback, useMemo} from 'react';
import {View, FlatList} from 'react-native';
import theme from '@/style';
import {useSettingWindowDimensions} from '@/store/useSettingStore';

import {useShallow} from 'zustand/react/shallow';
import {
  ShopCategoryListItem,
  ShopGoodsListItem,
  postExChangeGoods,
} from '../../welfare.service';
import {
  GoodsItemComplexity,
  GoodsItemEasy,
  GoodsItemFullWidth,
} from './goods-item';
import useWelfareStore, {useWelfareStoreActions} from '@/store/useWelfareStore';
import {useConfirm, useToast} from '@/components/basic/modal';
import Text from '@/components/basic/text';

const ShopGoodsList = () => {
  const {screenWidth} = useSettingWindowDimensions();
  const {renderModal, show} = useConfirm();
  const {renderModal: renderToastModal, show: showToast} = useToast();

  const {shopCategoryTabsList, shopCategoryIndex, shopGoodsList} =
    useWelfareStore(
      useShallow(state => ({
        shopCategoryTabsList: state.shopCategoryTabsList,
        shopGoodsList: state.shopGoodsList,
        shopCategoryIndex: state.shopCategoryIndex,
      })),
    );
  const {getShopAmountData} = useWelfareStoreActions();

  const goodsWidth = (screenWidth - 10 - 24) / 2;
  const goodsHeight = (goodsWidth / 166) * 227;

  const checkTabsItem = useMemo(() => {
    return (
      (shopCategoryTabsList?.find(
        item => item?.id === shopCategoryIndex,
      ) as ShopCategoryListItem) || {}
    );
  }, [shopCategoryIndex, shopCategoryTabsList]);

  const keyExtractor = useCallback((item: any) => {
    return item?.id.toString();
  }, []);

  const onPressItem = useCallback(
    (item: ShopGoodsListItem, checkNum = 1) => {
      show(
        'Exchange',
        'Are you sure you want to exchange this product?',
        async () => {
          try {
            await postExChangeGoods(item?.id, checkNum);
            await showToast({type: 'success', message: 'success'});
            await getShopAmountData();
          } catch (e) {}
        },
      );
    },
    [getShopAmountData, show, showToast],
  );

  const renderItem = useCallback(
    ({item}: {item: ShopGoodsListItem}) =>
      checkTabsItem?.goodsShowType === 0 ? (
        <GoodsItemEasy
          item={item}
          width={goodsWidth}
          height={goodsHeight}
          onPress={onPressItem}
        />
      ) : checkTabsItem?.goodsShowType === 1 ? (
        <GoodsItemFullWidth item={item} onPress={onPressItem} />
      ) : (
        <GoodsItemComplexity
          item={item}
          width={goodsWidth}
          height={goodsHeight}
          onPress={onPressItem}
        />
      ),
    [checkTabsItem?.goodsShowType, goodsWidth, goodsHeight, onPressItem],
  );

  const memoFlatListProps = useMemo(() => {
    if (checkTabsItem?.goodsShowType === 1) {
      return {
        key: 'oneColumns',
        numColumns: 1,
      };
    }
    return {
      key: 'twoColumns',
      numColumns: 2,
      columnWrapperStyle: {
        gap: 10,
      },
    };
  }, [checkTabsItem?.goodsShowType]);

  return (
    <View style={[theme.flex.flex1]}>
      <View style={[theme.margin.lrl]}>
        <Text color={theme.fontColor.purple} style={[theme.padding.tbs]}>
          {checkTabsItem?.tip || ''}
        </Text>
      </View>
      <FlatList
        style={[theme.padding.btml]}
        data={shopGoodsList}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={[theme.padding.lrl, {gap: 10}]}
        showsVerticalScrollIndicator={false}
        {...memoFlatListProps}
      />
      {renderModal}
      {renderToastModal}
    </View>
  );
};

export default ShopGoodsList;
