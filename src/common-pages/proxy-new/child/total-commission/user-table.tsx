import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import TableHeader from '@/common-pages/proxy-new/basic-components/table-header';

const UserTable = () => {
  const headers = ['User', 'Commission', 'Invitation Time'];
  const list = [
    {
      user: '999****222',
      commissionAmount: '90.19',
      date: '09/10/2024',
    },
    {
      user: '999****222',
      commissionAmount: '90.19',
      date: '09/10/2024',
    },
    {
      user: '999****222',
      commissionAmount: '90.19',
      date: '09/10/2024',
    },
  ];
  return (
    <View>
      <TableHeader header={[...headers]} />
      {list.map((item, index) => {
        return (
          <View key={index} style={styles.rowItem}>
            <Text style={styles.itemStyle}>{item.user}</Text>
            <Text style={styles.itemStyle}>{item.commissionAmount}</Text>
            <Text style={styles.itemStyle}>{item.date}</Text>
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
    lineHeight: 13 * 2,
    // flex: 1
  },
});
export default UserTable;
