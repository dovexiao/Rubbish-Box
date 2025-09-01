import {View, StyleSheet} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import React, {useMemo} from 'react';
import Text from '@/components/basic/text';
import theme from '@/style';
import {debounce} from '@/utils';

const FILTER_MENU = [
  {
    name: 'Kerala',
    hideIds: [5, 101],
  },
  {
    name: 'Quick 3D',
    hideIds: [5, 101],
  },
  {
    name: 'Color',
  },
  // {
  //   name: 'Quick Race',
  // },
  {
    name: 'Dice',
  },
  // {
  //   name: 'Satta Matka',
  //   hideIds: [5, 101],
  // },
  // {
  //   name: 'Scratch off',
  // },
  {
    name: 'Casino',
  },
  // {
  //   name: 'Live',
  // },
  // {
  //   name: 'Sports',
  //   hideIds: [101],
  // },
];

const BetsFilter = (props: {
  value?: string;
  onChange?: (v: string) => void;
}) => {
  const {value = 'Kerala', onChange = () => {}} = props;

  const filterList = useMemo(() => {
    return FILTER_MENU.filter(v => {
      if (v.hideIds) {
        return 3;
      }
      return true;
    });
  }, []);

  const changeName = debounce((name: string) => {
    onChange(name);
  });

  return (
    <View style={[theme.padding.tbs]}>
      <View style={styles.container}>
        {filterList.map((item, index) => (
          <NativeTouchableOpacity
            style={[styles.item, value === item.name && styles.itemSelected]}
            key={index}
            onPress={() => changeName(item.name)}>
            <Text
              blod={value === item.name}
              color={
                value === item.name
                  ? theme.fontColor.white
                  : theme.fontColor.primaryMain
              }>
              {item.name}
            </Text>
          </NativeTouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    marginTop: 8,
    marginRight: 8,
    borderWidth: 1,
    backgroundColor: theme.basicColor.newBgInTwo,
    borderColor: 'transparent',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  itemSelected: {
    backgroundColor: theme.basicColor.newBgInOne,
  },
});

export default BetsFilter;
