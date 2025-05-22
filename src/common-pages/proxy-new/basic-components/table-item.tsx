import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ImageUrlType} from '@/components/basic/image';

type EarnType = 'top' | 'me';

interface TableItemProps {
  type?: EarnType;
  rank?: number | string;
  headImg?: ImageUrlType;
  commission?: number;
  userPhone?: string;
  commissionType?: number;
  stautus?: number | string;
  level?: number | string;
}
const TableItem: React.FC<TableItemProps> = props => {
  const {userPhone, commission, commissionType, level} = props;
  // 1 recharge 2bet 3invite
  const typeList = ['Recharge', 'Bet', 'Invite'];
  return (
    <View style={styles.rowItem}>
      <Text style={styles.itemStyle}>{userPhone}</Text>
      <Text style={styles.itemStyle}>{commission?.toFixed(3)}</Text>
      <Text style={styles.itemStyle}>
        {commissionType ? typeList[commissionType - 1] : '-'}
      </Text>
      <Text style={styles.itemStyle}>{`Tier ${level}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rowItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  itemStyle: {
    fontSize: 13,
    color: '#fff',
    lineHeight: 13 * 3,
    flex: 1,
    textAlign: 'center',
  },
});

export default TableItem;
