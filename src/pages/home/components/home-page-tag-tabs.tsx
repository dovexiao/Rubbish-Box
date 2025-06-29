/* eslint-disable prettier/prettier */
import theme from '@/style';
import React, {useCallback, memo, useMemo, useEffect} from 'react';
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
  useEffect(() => {
    if (pageTagList.length) {
      setTagIndex({
        pageTagIndex: pageTagList[0].id,
        pageSubTagId: pageTagList[0].id || 0,
      });
    }
  }, [pageTagList, setTagIndex]);

  const onPressTag = useCallback(
    (item: any) => {
      const subTagList =
        pageTagList?.find(findV => findV?.id === item?.id)?.subTagList || [];
      setTagIndex({
        pageTagIndex: item.name === 'Featured' ? -1 : item?.id,
        pageSubTagId: [...subTagList]?.shift()?.id || 0,
      });
    },
    [pageTagList, setTagIndex],
  );

  return (
    <View
      // eslint-disable-next-line react-native/no-inline-styles
      style={[theme.padding.tbl, theme.padding.tbxs, {height: 81}]}>
      <ScrollView
        style={[
          theme.flex.flex1,
          theme.margin.leftl,
          // eslint-disable-next-line react-native/no-inline-styles
          {height: 69, width: screenWidth - theme.paddingSize.l * 2},
        ]}
        horizontal
        contentContainerStyle={[theme.gap.m]}
        showsHorizontalScrollIndicator={false}>
        {/* <Image
            style={[theme.icon.l, theme.margin.rights]}
            source={require('@assets/imgs/home/ball.webp')}
          /> */}
        {useMemo(() => {
          return pageTagList?.map(item => (
            <NativeTouchableOpacity
              onPress={() => onPressTag(item)}
              key={item?.id}
              style={[
                theme.flex.center,
                theme.padding.lrxs,
                theme.border.white20,
                pageTagIndex === item?.id
                  ? // eslint-disable-next-line react-native/no-inline-styles
                  {
                    ...theme.background.tabCheck,
                    ...theme.borderRadius.s,
                    // width: 64,
                    height: 69,
                  }
                  : // eslint-disable-next-line react-native/no-inline-styles
                  {
                    ...theme.borderRadius.s,
                    // width: 64,
                    height: 69,
                  },
              ]}>
              <Image source={{uri: item?.imageUrl}} style={[theme.image.s]} />
              <Text size="medium" numberOfLines={1} white>
                {item?.name}
              </Text>
            </NativeTouchableOpacity>
          ));
        }, [pageTagList, pageTagIndex, onPressTag])}
      </ScrollView>
    </View>
  );
};

export default memo(HomePageTagTabs);
