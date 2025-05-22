import theme from '@/style';
import React from 'react';
import {View, Image, ScrollView} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import Text from '@/components/basic/text';
import {useShallow} from 'zustand/react/shallow';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import useWelfareStore from '@/store/useWelfareStore';

const ShopTagTabs = () => {
  const {screenWidth} = useSettingWindowDimensions();
  const {shopCategoryTabsList, shopCategoryIndex} = useWelfareStore(
    useShallow(state => ({
      shopCategoryTabsList: state.shopCategoryTabsList,
      shopCategoryIndex: state.shopCategoryIndex,
    })),
  );

  const onPressTag = (item: any) => {
    useWelfareStore.setState({
      shopCategoryIndex: item?.id,
    });
  };

  return (
    <View
      // eslint-disable-next-line react-native/no-inline-styles
      style={[theme.padding.topxs, theme.margin.leftl, {height: 50}]}>
      <ScrollView
        style={[
          theme.flex.flex1,
          // eslint-disable-next-line react-native/no-inline-styles
          {height: 34, width: screenWidth - theme.paddingSize.l * 2},
        ]}
        horizontal
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={{
          gap: 10,
        }}
        showsHorizontalScrollIndicator={false}>
        {shopCategoryTabsList?.map(item => (
          <NativeTouchableOpacity
            onPress={() => onPressTag(item)}
            key={item?.id}
            style={[
              theme.flex.row,
              theme.flex.center,
              theme.padding.s,
              theme.borderRadius.l,
              shopCategoryIndex === item?.id
                ? {
                    ...theme.background.primary,
                    ...theme.border.white20,
                  }
                : {
                    ...theme.border.white10,
                    backgroundColor: theme.basicColor.primary30,
                  },
            ]}>
            <Image
              source={{uri: item?.imageUrl}}
              style={[theme.icon.m, theme.margin.rightxxs]}
            />
            <Text size="medium" numberOfLines={1} white>
              {item?.name}
            </Text>
          </NativeTouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default ShopTagTabs;
