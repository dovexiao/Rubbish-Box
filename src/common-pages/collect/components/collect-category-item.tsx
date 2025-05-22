import theme from '@/style';
import React, {useCallback, useState} from 'react';

import LazyImage, {LazyImageBackground} from '@basicComponents/image';
import {View, Image} from 'react-native';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import Text from '@/components/basic/text';
import {useSharedValue} from 'react-native-reanimated';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {
  CollectCategoryItem,
  CollectGoodsItem,
  postReceiveAward,
} from '../collect.service';
import AccordionItem from './AccordionItem';
import LinearGradient from '@/components/basic/linear-gradient';
import {useConfirm, useToast} from '@/components/basic/modal';

interface CollectCategoryItemProps {
  collectCategoryItem: CollectCategoryItem;
  refreshHomeData: () => void;
}

const CollectItem = (props: CollectCategoryItemProps) => {
  const {collectCategoryItem, refreshHomeData} = props;
  const {screenWidth, calculateItemWidth} = useSettingWindowDimensions();
  const {renderModal, show} = useConfirm();
  const {renderModal: renderToastModal, show: showToast} = useToast();

  const headerWidth = screenWidth - theme.paddingSize.l * 2;
  const headerHeight = (headerWidth * 192) / 351;

  const goodsWidth = (screenWidth - 10 - 48) / 2;
  const goodsHeight = (goodsWidth / 166) * 227;
  const [v, setVersion] = useState(0);

  const isOpen = useSharedValue(false);

  const onPressStatus = () => {
    isOpen.value = !isOpen.value;
    setVersion(v + 1);
  };

  const onPressItem = useCallback(
    (item: CollectGoodsItem) => {
      if (item?.collectStatus !== 1) {
        return;
      }
      show('Receive a reward', 'Whether to receive rewards?', async () => {
        try {
          const {} = await postReceiveAward(item?.id);
          showToast({type: 'success', message: 'success'});
          refreshHomeData();
        } catch (e) {}
      });
    },
    [refreshHomeData, show, showToast],
  );

  const LGBackGround = (status: number): string[] => {
    switch (status) {
      case 1:
        return theme.linearGradientColor.toDrawnLinearGradient;
      case 2:
        return theme.linearGradientColor.wonLinearGradient;
      default:
        return theme.linearGradientColor.chestLinearGradient;
    }
  };

  const renderItem = (item: CollectGoodsItem) => (
    <LinearGradient
      key={item?.id}
      colors={[theme.basicColor.primary10, theme.basicColor.primary50]}
      style={[
        theme.flex.centerByCol,
        theme.border.primary50,
        theme.borderRadius.s,
        theme.flex.between,
        {
          width: goodsWidth,
          height: goodsHeight,
        },
      ]}>
      <LazyImageBackground
        imageUrl={require('@assets/icons/welfare/goods-header-bg.webp')}
        height={calculateItemWidth(16)}
        width={calculateItemWidth(87)}
        style={[theme.flex.center]}>
        <Text fontSize={9} white>
          {item?.goodsNote}
        </Text>
      </LazyImageBackground>
      <View>
        <LazyImage
          imageUrl={item?.collectImage}
          width={calculateItemWidth(132)}
          height={calculateItemWidth(132)}
        />
        <Text
          numberOfLines={1}
          fontSize={12}
          color={theme.fontColor.white}
          style={[theme.font.center]}>
          {item?.goodsName}
        </Text>
      </View>
      <NativeTouchableOpacity
        disabled={item?.collectStatus !== 1}
        onPress={() => {
          onPressItem(item);
        }}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          colors={LGBackGround(item?.collectStatus)}
          style={[
            theme.borderRadius.xl,
            theme.padding.lrl,
            theme.margin.btmm,
            theme.flex.center,
            theme.padding.tbxs,
          ]}>
          <Text white fontSize={12}>
            {item?.buttonText}
          </Text>
        </LinearGradient>
      </NativeTouchableOpacity>
    </LinearGradient>
  );

  return (
    <View
      style={[theme.fill.fillW, theme.border.primary50, theme.borderRadius.s]}>
      <NativeTouchableOpacity onPress={onPressStatus}>
        <LazyImageBackground
          imageUrl={collectCategoryItem?.imageUrl}
          width={headerWidth}
          height={headerHeight}
          style={[
            theme.padding.leftxxl,
            theme.borderRadius.s,
            theme.flex.centerByRow,
            theme.overflow.hidden,
          ]}>
          <Text white fontSize={24}>
            {collectCategoryItem?.categoryName}
          </Text>
          <Text white fontSize={12}>
            {collectCategoryItem?.categoryDesc}
          </Text>
          <Text white color={theme.fontColor.green} fontSize={24}>
            {collectCategoryItem?.rewardDesc}
          </Text>
        </LazyImageBackground>
      </NativeTouchableOpacity>
      <AccordionItem
        style={[theme.margin.lrl]}
        isExpanded={isOpen}
        viewKey={`${collectCategoryItem?.categoryName}`}>
        {collectCategoryItem?.collectGoodsList.map(item => {
          return renderItem(item);
        })}
      </AccordionItem>
      <NativeTouchableOpacity
        style={[
          theme.background.mainDark,
          theme.flex.center,
          theme.flex.row,
          theme.flex.centerByCol,
          {height: 40},
        ]}
        onPress={onPressStatus}>
        <Text white>{isOpen.value ? 'Hide' : 'Show'}</Text>
        <Image
          source={
            isOpen.value
              ? require('@assets/icons/common/arrow-up.webp')
              : require('@assets/icons/common/arrow-down.webp')
          }
          style={[theme.icon.l]}
        />
      </NativeTouchableOpacity>
      {renderModal}
      {renderToastModal}
    </View>
  );
};

export default CollectItem;
