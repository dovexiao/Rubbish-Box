import theme from '@/style';
import React from 'react';
import {View, Image} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import Text from '@/components/basic/text';
import {useSettingWindowDimensions} from '@/store/useSettingStore';

interface SubTagTabsProps<T> {
  activeTab: number;
  tabOptions: T[];
  onPressItem: (id: number, item?: T) => void;
}

const SubTagTabs = <T extends {[key: string]: any}>(
  props: SubTagTabsProps<T>,
) => {
  const {activeTab, tabOptions, onPressItem} = props;
  const {screenWidth} = useSettingWindowDimensions();
  return (
    <View
      style={[
        theme.background.background,
        theme.margin.lrl,
        theme.flex.row,
        theme.flex.wrap,
        theme.gap.xs,
        {width: screenWidth - theme.paddingSize.l * 2},
      ]}>
      {tabOptions?.map((item, index) => (
        <NativeTouchableOpacity
          onPress={() => onPressItem(item?.id, item)}
          key={`${item?.id}${index}`}
          style={[
            theme.flex.row,
            theme.flex.center,
            theme.padding.lrxs,
            theme.borderRadius.s,
            theme.border.white20,
            activeTab === item?.id
              ? // eslint-disable-next-line react-native/no-inline-styles
                {
                  ...theme.background.tabCheck,
                  height: 30,
                }
              : // eslint-disable-next-line react-native/no-inline-styles
                {
                  height: 30,
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
    </View>
  );
};

export default SubTagTabs;
