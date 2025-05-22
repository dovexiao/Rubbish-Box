import React from 'react';
import {View, StyleSheet, ScrollView, Dimensions} from 'react-native';
import Text from '@/components/basic/text';
import theme from '@/style';
import {useTranslation} from 'react-i18next';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import LazyImage from '@/components/basic/image';
import Add from '../svg/add';
import BankListItem from './component/bank-list-item';
import {CardListItemType} from './withdraw-service';
const closeIcon = require('@/assets/icons/close-white.webp');

const {height} = Dimensions.get('window');

export interface SelectCardsType {
  list: CardListItemType[];
  value?: string;
  onChange: (v?: string) => void;
  onClose?: () => void;
  onAddBank?: (card?: CardListItemType) => void;
}

const SelectCards = (props: SelectCardsType) => {
  const {i18n} = useTranslation();
  const {
    list = [],
    onClose = () => {},
    value = '',
    onChange = () => {},
    onAddBank = () => {},
  } = props;

  return (
    <View style={[styles.container, theme.background.mainDark]}>
      <View
        style={[
          theme.flex.row,
          theme.flex.centerByCol,
          theme.flex.between,
          styles.header,
        ]}>
        <Text blod white size="medium">
          {i18n.t('withdraw-page.label.chooseCard')}
        </Text>
        <NativeTouchableOpacity onPress={onClose}>
          <LazyImage
            imageUrl={closeIcon}
            width={theme.iconSize.l}
            height={theme.iconSize.l}
            occupancy={'transparent'}
          />
        </NativeTouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={[theme.padding.lrl]}>
        {list.map((item, index) => {
          const isSelected = value === item.id;
          return (
            <BankListItem
              onEditBank={() => onAddBank(item)}
              cardInfo={item}
              backgroundColor={theme.backgroundColor.mainDark}
              key={index}
              selectMode
              isSelect={item.id === value}
              rightIcon={isSelected ? null : null}
              onItemPress={() => onChange(item!.id)}
              style={[theme.margin.btms, styles.itemContainer]}
            />
          );
        })}
      </ScrollView>
      <View style={[theme.padding.l]}>
        <NativeTouchableOpacity
          onPress={() => onAddBank()}
          style={[styles.add, theme.background.primary30]}>
          <Add />
          <Text color={theme.fontColor.white} style={[theme.margin.tops]}>
            {i18n.t('withdraw-page.label.addBank')}
          </Text>
        </NativeTouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    paddingHorizontal: 20,
  },
  container: {
    maxHeight: height * 0.6,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  add: {
    height: 72,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    overflow: 'hidden',
  },
});

export default SelectCards;
