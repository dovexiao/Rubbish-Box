import theme from '@/style';
import React from 'react';
import {View} from 'react-native';
import tableStyle from '../style';
import Text from '@/components/basic/text';
import {BasicObject} from '@/types';
import TableListItem from './table-list-item';
import {useTranslation} from 'react-i18next';

const ColorTable = ({list = []}: {list: BasicObject[]}) => {
  const {i18n} = useTranslation();
  return (
    <>
      <View style={[tableStyle.th]}>
        <View style={[theme.flex.flex1]}>
          <Text white>{i18n.t('bets-detail.label.number').toUpperCase()}</Text>
        </View>
        <View style={[tableStyle.tbPayment]}>
          <Text white style={[theme.font.center]}>
            {i18n.t('bets-detail.label.payment').toUpperCase()}
          </Text>
        </View>
        <View style={[theme.flex.flex1]}>
          <Text white style={[tableStyle.textRight]}>
            {i18n.t('bets-detail.label.result').toUpperCase()}
          </Text>
        </View>
      </View>
      <View>
        {list.map((item, index) => (
          <TableListItem item={item} index={index} key={index} />
        ))}
      </View>
    </>
  );
};

export default ColorTable;
