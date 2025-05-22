import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import TableHeader from '@/common-pages/proxy-new/basic-components/table-header';
import {formatDate} from '@utils';
import i18n from '@i18n';

interface UserInfo {
  userPhone: string;
  commission: number;
  createTime: number;
  type: number;
}
interface UserTableProps {
  users?: UserInfo[];
}

const UserTable: React.FC<UserTableProps> = props => {
  const {users = []} = props;
  const headers = [
    i18n.t('headers.user'),
    i18n.t('headers.commission'),
    i18n.t('headers.type'),
    i18n.t('headers.date'),
  ];
  const typeList = [
    i18n.t('headers.recharge'),
    i18n.t('headers.bet'),
    i18n.t('headers.invite'),
  ];
  return (
    <View>
      <TableHeader header={[...headers]} />
      {users.map((item, index) => {
        return (
          <View key={index} style={styles.rowItem}>
            <Text style={styles.itemStyle}>{item.userPhone}</Text>
            <Text style={styles.itemStyle}>{item.commission.toFixed(3)}</Text>
            <Text style={styles.itemStyle}>
              {item.type ? typeList[item.type - 1] : 'Bet'}
            </Text>
            <Text style={styles.itemStyle}>
              {formatDate(item.createTime || 0, 'dd/MM/yyyy')}
            </Text>
          </View>
        );
      })}
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
    lineHeight: 13 * 2.5,
    flex: 1,
    textAlign: 'center',
  },
});
export default UserTable;
