import {View, StyleSheet} from 'react-native';
import Text from '@/components/basic/text';
import React from 'react';
import theme from '@/style';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import LazyImage from '@/components/basic/image';
import BankListItem from './component/bank-list-item';
import {useTranslation} from 'react-i18next';
import {CardListItemType} from './withdraw.service';
import CustomTitle from '@/components/business/custom-title';
const rightIcon = require('@components/assets/icons/me-list-item/right-icon.webp');
const addIcon = require('@assets/icons/withdraw/add.webp');

export interface WithdrawBankProps {
  onAddBank?: () => void;
  onSelectBank?: () => void;
  bankInfo?: CardListItemType;
}

const WithdrawBank = (props: WithdrawBankProps) => {
  const {i18n} = useTranslation();
  const {bankInfo = {}, onAddBank = () => {}, onSelectBank = () => {}} = props;
  return (
    <View style={[theme.margin.tops, theme.padding.l, theme.margin.lrl]}>
      <CustomTitle name={i18n.t('withdraw-page.label.transferTo')} />
      {bankInfo!.id ? (
        <BankListItem
          cardInfo={bankInfo}
          onItemPress={onSelectBank}
          backgroundColor={theme.basicColor.primary}
          style={{borderColor: 'transparent'}}
          rightIcon={
            <LazyImage
              occupancy={'transparent'}
              imageUrl={rightIcon}
              width={14}
              height={14}
            />
          }
        />
      ) : (
        <NoBank onAddBank={onAddBank} />
      )}
    </View>
  );
};

const NoBank = ({onAddBank}: {onAddBank: () => void}) => {
  const {i18n} = useTranslation();
  return (
    <NativeTouchableOpacity
      onPress={onAddBank}
      style={[
        theme.borderRadius.m,
        theme.flex.center,
        theme.padding.l,
        theme.background.transparentP10,
        theme.border.primary50,
        styles.noBankContainer,
      ]}>
      <View
        style={[
          theme.fill.fill,
          theme.borderRadius.m,
          theme.flex.center,
          theme.padding.l,
          styles.noBankContainer,
        ]}>
        <LazyImage
          occupancy={'transparent'}
          imageUrl={addIcon}
          width={24}
          height={24}
        />
        <Text white fontFamily={'fontDinBold'} style={[theme.margin.tops]}>
          {i18n.t('withdraw-page.label.addBank')}
        </Text>
      </View>
    </NativeTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  noBankContainer: {
    maxHeight: 120,
  },
});

export default WithdrawBank;
