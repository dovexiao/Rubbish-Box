import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface TableHeaderProps {
  header: Array<string>;
}

const TableHeader: React.FC<TableHeaderProps> = props => {
  const {header} = props;
  return (
    <View style={[styles.headers]}>
      {header.map((item, index) => (
        <View key={index} style={[styles.headerItem]}>
          <Text style={styles.itemStyle}>{item}</Text>
        </View>
      ))}
    </View>
  );
};
const styles = StyleSheet.create({
  headers: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  headerItem: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  itemStyle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 70,
  },
});
export default TableHeader;
