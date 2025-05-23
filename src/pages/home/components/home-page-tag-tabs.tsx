/* eslint-disable prettier/prettier */
import theme from '@/style';
import React, {useCallback, memo} from 'react';
import {View, Image, ScrollView} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import Text from '@/components/basic/text';
import useHomeStore from '@/store/useHomeStore';
import {useShallow} from 'zustand/react/shallow';
import {useSettingWindowDimensions} from '@/store/useSettingStore';

const HomePageTagTabs = () => {
  const {screenWidth} = useSettingWindowDimensions();
  const {setTagIndex, pageTagList, pageTagIndex} = useHomeStore(
    useShallow(state => ({
      setTagIndex: state.setState,
      pageTagList: state.pageTagList,
      pageTagIndex: state.pageTagIndex,
    })),
  );

  const onPressTag = useCallback(
    (item: any) => {
      const subTagList =
        pageTagList.find(findV => findV?.id === item?.id)?.subTagList || [];
      const defaultSubTagId = subTagList.length > 0 ? subTagList[0].id : 0;

      setTagIndex({
        pageTagIndex: item.name === 'Featured' ? -1 : item.id,
        pageSubTagId: defaultSubTagId,
      });
    },
    [pageTagList, setTagIndex],
  );

  return (
    <View style={[theme.padding.tbl, theme.padding.tbxs, {height: 81}]}>
      <ScrollView
        style={[
          theme.flex.flex1,
          theme.margin.leftl,
          {height: 69, width: screenWidth - theme.paddingSize.l * 2},
        ]}
        horizontal
        contentContainerStyle={[theme.gap.m]}
        showsHorizontalScrollIndicator={false}>
        {pageTagList?.map(item => (
          <NativeTouchableOpacity
            onPress={() => onPressTag(item)}
            key={item?.id}
            style={[
              theme.flex.center,
              theme.padding.lrxs,
              theme.border.white20,
              {
                ...theme.borderRadius.s,
                height: 69,
                ...(pageTagIndex === item?.id
                  ? theme.background.tabCheck
                  : {}),
              },
            ]}>
            <Image source={{uri: item?.imageUrl}} style={[theme.image.s]} />
            <Text size="medium" numberOfLines={1} white>
              {item?.name}
            </Text>
          </NativeTouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default memo(HomePageTagTabs);
