import theme from '@/style';
import React, {useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import Text from '@/components/basic/text';
import {getActivityTagList, ActivityTagListItem} from './promotion.service';
import LazyImage from '@/components/basic/image/lazy-image';
import {useSettingWindowDimensions} from '@/store/useSettingStore';

const PromotionTab = ({
  tagIndex,
  setTagIndex,
}: {
  tagIndex: number;
  setTagIndex: (index: number) => void;
}) => {
  const {screenWidth} = useSettingWindowDimensions();
  const [tagList, setTagList] = useState<ActivityTagListItem[]>([]);
  const fetchData = async () => {
    try {
      const res = await getActivityTagList();
      setTagList(res);
    } catch (error) {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onPressTag = (index: number) => {
    setTagIndex(index);
  };

  return (
    <View
      // eslint-disable-next-line react-native/no-inline-styles
      style={[theme.background.background, {height: 69}]}>
      <ScrollView
        style={[
          theme.flex.flex1,
          // eslint-disable-next-line react-native/no-inline-styles
          {height: 69, gap: 10, width: screenWidth - theme.paddingSize.l * 2},
        ]}
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={{gap: 10}}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {tagList?.map((item, index) => (
          <NativeTouchableOpacity
            onPress={() => onPressTag(index)}
            key={index}
            style={[
              theme.flex.center,
              tagIndex === index
                ? // eslint-disable-next-line react-native/no-inline-styles
                  {
                    ...theme.background.primary10,
                    ...theme.borderRadius.s,
                    ...theme.border.primary50,
                    width: 64,
                    height: 69,
                  }
                : // eslint-disable-next-line react-native/no-inline-styles
                  {
                    ...theme.border.white10,
                    ...theme.borderRadius.s,
                    backgroundColor: '#0B0A23',
                    width: 64,
                    height: 69,
                  },
            ]}>
            <LazyImage
              imageUrl={item?.icon}
              width={theme.imageSize.s}
              height={theme.imageSize.s}
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

export default PromotionTab;
