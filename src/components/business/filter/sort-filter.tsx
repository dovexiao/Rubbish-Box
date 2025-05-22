import {StyleProp, View, ViewStyle, StyleSheet} from 'react-native';
import React, {useMemo} from 'react';
import theme from '@/style';
import Text, {TextProps} from '@/components/basic/text';
import LazyImage from '@/components/basic/image';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {up, down, filterColor} from './filter.variable';
export type SortType = 'none' | 'asc' | 'desc';

interface SortItemOption {
  up: string;
  down: string;
  next: SortType;
}

export interface SortFilterProps {
  title: string;
  style?: StyleProp<ViewStyle>;
  // 标题Text的属性
  textProps?: TextProps;
  // 当前排序
  sort: SortType;
  // 是否必须排序
  required?: boolean;
  // 排序改变情况
  onSortChange: (sort: SortType) => void;
}
const SortFilter: React.FC<SortFilterProps> = ({
  title,
  style,
  textProps,
  sort,
  required = false,
  onSortChange,
}) => {
  const sortOptions: Record<SortType, SortItemOption> = useMemo(() => {
    return {
      none: {
        up: filterColor.sortGrey,
        down: filterColor.sortGrey,
        next: 'asc',
      },
      asc: {
        up: filterColor.sortRed,
        down: filterColor.sortGrey,
        next: 'desc',
      },
      desc: {
        up: filterColor.sortGrey,
        down: filterColor.sortRed,
        next: required ? 'asc' : 'none',
      },
    };
  }, [required]);
  const filterStyle = StyleSheet.create({
    sort: {
      height: 28,
    },
  });
  const option = sortOptions[sort];
  return (
    <NativeTouchableOpacity onPress={() => onSortChange(option.next)}>
      <View
        style={[
          theme.flex.row,
          theme.flex.center,
          filterStyle.sort,
          theme.padding.lrs,
          theme.border.primary50,
          style,
        ]}>
        <Text white {...textProps}>
          {title}
        </Text>
        <View style={[theme.flex.col, theme.margin.leftxxs]}>
          <LazyImage
            tintColor={option.up}
            imageUrl={up}
            occupancy="#0000"
            width={8}
            height={6}
          />
          <LazyImage
            tintColor={option.down}
            imageUrl={down}
            occupancy="#0000"
            width={8}
            height={6}
          />
        </View>
      </View>
    </NativeTouchableOpacity>
  );
};

export default SortFilter;
