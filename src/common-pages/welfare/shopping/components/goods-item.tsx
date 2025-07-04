import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import theme from '@/style';

import Text from '@/components/basic/text';
import LazyImage from '@/components/basic/image/lazy-image';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import {ShopGoodsListItem} from '../../welfare.service';
import LinearGradient from '@/components/basic/linear-gradient';
import Button from '@/components/basic/button';
import {LazyImageBackground} from '@/components/basic/image';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';

const GoodsItemEasy = (props: {
  item: ShopGoodsListItem;
  width: number;
  height: number;
  onPress: (item: ShopGoodsListItem) => void;
}) => {
  const {calculateItemWidth} = useSettingWindowDimensions();
  return (
    <LinearGradient
      key={props?.item?.id}
      colors={[theme.basicColor.primary10, theme.basicColor.primary50]}
      style={[
        theme.flex.centerByCol,
        theme.border.primary50,
        theme.borderRadius.s,
        theme.flex.between,
        theme.padding.tbl,
        {
          width: props?.width,
          height: props?.height,
        },
      ]}>
      <View>
        <LazyImage
          imageUrl={props?.item?.goodsImage}
          width={calculateItemWidth(132)}
          height={calculateItemWidth(132)}
        />
        <Text
          numberOfLines={1}
          fontSize={12}
          color={theme.fontColor.white}
          style={[theme.font.center, theme.margin.topxxs]}>
          {props?.item?.goodsName}
        </Text>
      </View>

      <View style={[theme.fill.fillW, theme.padding.lrl]}>
        <Button
          title={props?.item?.buttonText}
          type={'linear-primary'}
          radius={30}
          size="xsmall"
          onPress={() => {
            props?.onPress?.(props?.item);
          }}>
          <LazyImage
            imageUrl={require('@assets/icons/common/common.webp')}
            width={18}
            height={18}
          />
        </Button>
      </View>
    </LinearGradient>
  );
};

const GoodsItemFullWidth = (props: {
  item: ShopGoodsListItem;
  onPress: (item: ShopGoodsListItem) => void;
}) => {
  const {screenWidth, calculateItemWidth} = useSettingWindowDimensions();
  const itemWH = screenWidth - theme.paddingSize.l * 2;
  return (
    <LinearGradient
      key={props?.item?.id}
      colors={[theme.basicColor.primary10, theme.basicColor.primary50]}
      style={[
        theme.flex.centerByCol,
        theme.border.primary50,
        theme.borderRadius.s,
        theme.flex.between,
        theme.padding.tbl,
        {
          width: itemWH,
          height: itemWH,
        },
      ]}>
      <View>
        <LazyImage
          imageUrl={props?.item?.goodsImage}
          width={calculateItemWidth(200)}
          height={calculateItemWidth(200)}
        />
        <Text
          numberOfLines={1}
          fontSize={18}
          color={theme.fontColor.yellow}
          style={[theme.font.center]}>
          {props?.item?.goodsName}
        </Text>
      </View>
      <Text
        fontSize={14}
        color={theme.fontColor.white}
        style={[theme.font.center, theme.margin.lrl]}>
        {props?.item?.goodsNote}
      </Text>
      <View style={[theme.fill.fillW, theme.padding.lrl]}>
        <Button
          title={props?.item?.buttonText}
          type={'linear-primary'}
          radius={30}
          onPress={() => {
            props?.onPress?.(props?.item);
          }}>
          <LazyImage
            imageUrl={require('@assets/icons/common/common.webp')}
            width={18}
            height={18}
          />
        </Button>
      </View>
    </LinearGradient>
  );
};

const GoodsItemComplexity = (props: {
  item: ShopGoodsListItem;
  width: number;
  height: number;
  onPress: (item: ShopGoodsListItem, checkNum?: number) => void;
}) => {
  const [checkCount, setCheckCount] = useState(10);
  const {calculateItemWidth} = useSettingWindowDimensions();

  const checkCountAmount = useMemo(() => {
    return props?.item.coinCount * checkCount;
  }, [props?.item.coinCount, checkCount]);

  return (
    <LinearGradient
      key={props?.item?.id}
      colors={[theme.basicColor.primary10, theme.basicColor.primary50]}
      style={[
        theme.flex.centerByCol,
        theme.border.primary50,
        theme.borderRadius.s,
        theme.flex.between,
        {
          width: props?.width,
          height: props?.height,
        },
      ]}>
      <LazyImageBackground
        imageUrl={require('@assets/icons/common/common.webp')}
        height={calculateItemWidth(16)}
        width={calculateItemWidth(87)}
        style={[theme.flex.center]}>
        <Text fontSize={9} white>
          {props?.item?.goodsNote}
        </Text>
      </LazyImageBackground>
      <LazyImageBackground
        imageUrl={props.item?.goodsImage}
        height={calculateItemWidth(103)}
        width={calculateItemWidth(142)}
        // eslint-disable-next-line react-native/no-inline-styles
        style={[theme.borderRadius.s, {overflow: 'hidden'}]}>
        <View
          style={[
            theme.position.abs,
            theme.background.black60,
            theme.flex.center,
            // eslint-disable-next-line react-native/no-inline-styles
            {bottom: 0, width: '100%', height: 20},
          ]}>
          <Text fontSize={9} white>
            {props?.item?.goodsName}
          </Text>
        </View>
      </LazyImageBackground>
      <Text fontSize={9} white>
        {checkCount} Free Bet
      </Text>
      <View
        style={[
          theme.flex.row,
          theme.flex.between,
          theme.padding.lrl,
          theme.fill.fillW,
          theme.flex.flex,
          theme.gap.s,
        ]}>
        {[10, 20, 30, 50, 100].map(count => {
          return (
            <NativeTouchableOpacity
              key={count}
              onPress={() => {
                setCheckCount(count);
              }}
              style={[
                theme.flex.center,
                theme.border.white20,
                theme.borderRadius.s,
                theme.flex.flex1,
                theme.padding.tbxxs,

                count === checkCount
                  ? {
                      ...theme.background.primary,
                    }
                  : {},
              ]}>
              <Text fontSize={10} white>
                {count}
              </Text>
            </NativeTouchableOpacity>
          );
        })}
      </View>
      <View style={[theme.fill.fillW, theme.padding.lrl, theme.margin.btml]}>
        <Button
          title={`${props?.item?.buttonText} ${checkCountAmount}`}
          type={'linear-primary'}
          onPress={() => {
            props?.onPress?.(props?.item, checkCount);
          }}
          size="xsmall"
          radius={30}>
          <LazyImage
            imageUrl={require('@assets/icons/common/common.webp')}
            width={18}
            height={18}
          />
        </Button>
      </View>
    </LinearGradient>
  );
};

export {GoodsItemEasy, GoodsItemFullWidth, GoodsItemComplexity};
