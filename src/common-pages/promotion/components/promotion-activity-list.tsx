import React from 'react';
import {View} from 'react-native';
import Card from '@basicComponents/card';
import theme from '@style';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {ListRenderItemInfo} from 'react-native';
import {PromotionListItem} from '../promotion.service';

export interface PromotionActivityListItemProps {
  itemImgWidth: number;
  signImgHeight: number;
  onPressItemTo: (item: PromotionListItem) => void;
}

export const renderPromotionListItem = (
  {item}: ListRenderItemInfo<PromotionListItem>,
  props: PromotionActivityListItemProps,
) => {
  const {itemImgWidth, signImgHeight, onPressItemTo} = props;
  return (
    <View style={[theme.borderRadius.m, theme.margin.bottomMd]}>
      <Card>
        <NativeTouchableOpacity onPress={() => onPressItemTo(item)}>
          <Card.Image
            style={[
              theme.flex.centerByCol,
              theme.borderRadius.m,
              theme.position.rel,
            ]}
            width={itemImgWidth}
            height={item.activityType === 'signin' ? signImgHeight : 122}
            imageUrl={item.activityIcon}
          />
        </NativeTouchableOpacity>
      </Card>
    </View>
  );
};
