import theme from '@/style';
import React, {useCallback, memo, useMemo} from 'react';
import {View, Image} from 'react-native';
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
        pageTagList?.find(findV => findV?.id === item?.id)?.subTagList || [];
      setTagIndex({
        pageTagIndex: item.name === 'Featured' ? -1 : item?.id,
        pageSubTagId: [...subTagList]?.shift()?.id || 0,
      });
    },
    [pageTagList, setTagIndex],
  );

  // 平均每个tab宽度
  const tabWidth = useMemo(() => {
    const count = pageTagList?.length || 1;
    return screenWidth / count;
  }, [pageTagList, screenWidth]);

  return (
    <View style={[theme.padding.tbl, theme.padding.tbxs, {height: 81}]}>
      <View
        style={{
          flexDirection: 'row',
          width: screenWidth,
        }}>
        {pageTagList?.map(item => (
          <View key={item?.id} style={{width: tabWidth}}>
            <NativeTouchableOpacity
              onPress={() => onPressTag(item)}
              style={[
                theme.flex.center,
                theme.padding.lrxs,
                theme.border.white20,
                pageTagIndex === item?.id
                  ? {
                      ...theme.background.tabCheck,
                      ...theme.borderRadius.s,
                      height: 69,
                    }
                  : {
                      ...theme.borderRadius.s,
                      height: 69,
                    },
              ]}>
              <Image source={{uri: item?.imageUrl}} style={[theme.image.s]} />
              <Text size="medium" numberOfLines={1} white>
                {item?.name}
              </Text>
            </NativeTouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

export default memo(HomePageTagTabs);
