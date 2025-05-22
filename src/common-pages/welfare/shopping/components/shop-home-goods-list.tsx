import React, {useCallback} from 'react';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {View, Image, FlatList, ScrollView} from 'react-native';
import theme from '@/style';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import Text from '@/components/basic/text';
import useWelfareStore, {useWelfareStoreActions} from '@/store/useWelfareStore';
import {
  ShopGoodsListItem,
  ShopHomeGoodsListItem,
  postExChangeGoods,
} from '../../welfare.service';
import LazyImage from '@/components/basic/image/lazy-image';
import {
  GoodsItemComplexity,
  GoodsItemEasy,
  GoodsItemFullWidth,
} from './goods-item';
import {useConfirm, useToast} from '@/components/basic/modal';

const ShopHomeGoodsList = () => {
  const {screenWidth} = useSettingWindowDimensions();
  const {renderModal, show} = useConfirm();
  const {renderModal: renderToastModal, show: showToast} = useToast();

  const {shopHomeGoodsList} = useWelfareStore(state => ({
    shopHomeGoodsList: state.shopHomeGoodsList,
    shopCategoryIndex: state.shopCategoryIndex,
  }));
  const {getShopAmountData} = useWelfareStoreActions();

  const goodsWidth = (screenWidth - 10 - 24) / 2;
  const goodsHeight = (goodsWidth / 166) * 227;
  const goodsFullHeight = screenWidth - theme.paddingSize.l * 2;

  const onPressSectionHeader = useCallback((item: ShopHomeGoodsListItem) => {
    useWelfareStore.setState({shopCategoryIndex: item?.id});
  }, []);

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
            await showToast({type: 'success', message: 'sucess'});
            await getShopAmountData();
          } catch (e) {}
        },
      );
    },
    [getShopAmountData, show, showToast],
  );

  const renderFlatListItem = useCallback(
    ({item}: {item: ShopHomeGoodsListItem}) => {
      return (
        <>
          <View
            style={[
              theme.flex.row,
              theme.flex.centerByCol,
              theme.flex.between,
              // eslint-disable-next-line react-native/no-inline-styles
              {height: 40},
            ]}>
            <View style={[theme.flex.row, theme.flex.centerByCol, {gap: 4}]}>
              <LazyImage imageUrl={item?.imageUrl} width={20} height={20} />
              <Text white blod fontSize={18}>
                {item?.name}
              </Text>
            </View>
            <NativeTouchableOpacity
              style={[theme.flex.row, theme.flex.centerByCol]}
              onPress={() => {
                onPressSectionHeader(item);
              }}>
              <Text fontSize={14} color={theme.fontColor.primaryMain}>
                SEE ALL
              </Text>
              <Image
                source={require('@assets/icons/right-purple.webp')}
                style={[theme.icon.s]}
              />
            </NativeTouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[theme.gap.m]}
            style={[
              theme.fill.fillW,

              {
                height:
                  item?.goodsShowType === 1 ? goodsFullHeight : goodsHeight,
              },
            ]}>
            {item?.goodsList.map((goodsItem: ShopGoodsListItem) => {
              return item?.goodsShowType === 0 ? (
                <GoodsItemEasy
                  item={goodsItem}
                  width={goodsWidth}
                  height={goodsHeight}
                  onPress={onPressItem}
                />
              ) : item?.goodsShowType === 1 ? (
                <GoodsItemFullWidth item={goodsItem} onPress={onPressItem} />
              ) : (
                <GoodsItemComplexity
                  item={goodsItem}
                  width={goodsWidth}
                  height={goodsHeight}
                  onPress={onPressItem}
                />
              );
            })}
          </ScrollView>
        </>
      );
    },
    [
      goodsFullHeight,
      goodsHeight,
      goodsWidth,
      onPressItem,
      onPressSectionHeader,
    ],
  );

  return (
    <View style={[theme.flex.flex1NoHidden, theme.padding.lrl]}>
      <FlatList
        style={[theme.flex.flex1NoHidden, theme.padding.btml]}
        data={shopHomeGoodsList}
        renderItem={renderFlatListItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
      />
      {renderModal}
      {renderToastModal}
    </View>
  );
};

export default ShopHomeGoodsList;
