import theme from '@/style';
import React from 'react';
import {View, StyleSheet, ViewStyle, StyleProp} from 'react-native';
import Text from '@/components/basic/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {CardListItemType} from '../withdraw-service';
import LazyImage from '@/components/basic/image';
import EditIcon from '../../svg/edit';
import {formatNumberGroup} from '@/components/utils';
const whiteCheck = require('@/assets/icons/withdraw/white-check.png');
const defaultCard = require('@/assets/icons/withdraw/default-card-icon.webp');
export interface BankListItemType {
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  selectMode?: boolean;
  isSelect?: boolean;
  onItemPress?: (cardId?: string) => void;
  onEditBank?: () => void;
  cardInfo?: CardListItemType;
  rightIcon?: null | React.ReactElement<{}>;
}

const BankListItem = (props: BankListItemType) => {
  const {
    style = {},
    rightIcon,
    backgroundColor = theme.basicColor.transparentP10,
    onItemPress = () => {},
    onEditBank,
    cardInfo = {},
    selectMode = false,
    isSelect = false,
  } = props;

  return (
    <NativeTouchableOpacity
      onPress={() => onItemPress(cardInfo!.id)}
      style={[
        theme.borderRadius.m,
        theme.flex.row,
        theme.flex.centerByCol,
        styles.container,
        theme.border.primary50,
        {backgroundColor: backgroundColor},
        isSelect && styles.selected,
        style,
      ]}>
      <View style={[theme.flex.flex1, theme.flex.row]}>
        <LazyImage
          occupancy="transparent"
          width={40}
          height={40}
          imageUrl={cardInfo.img || defaultCard}
        />
        <View style={[theme.margin.leftxxl]}>
          <Text white size="medium">
            {cardInfo!.accountName}
          </Text>
          <Text color={theme.fontColor.white} style={[theme.margin.topxxs]}>
            {formatNumberGroup(cardInfo!.accountNumber)}
          </Text>
        </View>
      </View>
      {rightIcon}
      {selectMode && <Edit onEditBank={onEditBank} />}
      {selectMode && isSelect && <SelectedItem />}
    </NativeTouchableOpacity>
  );
};

const Edit = (props: {onEditBank?: () => void}) => {
  const {onEditBank = () => {}} = props;
  return (
    <NativeTouchableOpacity
      onPress={() => onEditBank()}
      style={[
        theme.background.primary,
        theme.borderRadius.xs,
        styles.editButton,
      ]}>
      <EditIcon />
      <Text color={theme.fontColor.white} style={[theme.margin.leftxxs]}>
        Edit
      </Text>
    </NativeTouchableOpacity>
  );
};

const SelectedItem = () => {
  return (
    <View style={styles.circle}>
      <View style={styles.check}>
        <LazyImage
          occupancy="transparent"
          imageUrl={whiteCheck}
          width={12}
          height={12}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 72,
    paddingHorizontal: 12,
  },
  selected: {
    borderColor: theme.basicColor.primary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    position: 'absolute',
    top: 8,
    right: 12,
    paddingHorizontal: 4,
  },
  circle: {
    position: 'absolute',
    width: 48,
    height: 48,
    right: -24,
    bottom: -24,
    borderRadius: 24,
    backgroundColor: theme.basicColor.primary,
  },
  check: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
});

export default BankListItem;
