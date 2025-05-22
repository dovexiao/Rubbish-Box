import React from 'react';
import {View, StyleSheet} from 'react-native';
import CardHeader from './card-header1';

interface RatioCardProps {
  currentBonusRule?: Array<any>;
  originalBonusRule?: Array<any>;
  deadline?: number;
}

const RatioCard: React.FC<RatioCardProps> = props => {
  const {currentBonusRule, originalBonusRule} = props;
  const setData = (type: string) => {
    let params = {
      title: type,
      type: 2,
      list: [],
    };
    let arr: Array<string> = [],
      arr1: Array<string> = [];
    currentBonusRule?.map(item => {
      if (item.type == type) {
        arr.push(item.tier1);
        arr.push(item.tier2);
        arr.push(item.tier3);
        arr.push(item.tier4);
      }
    });
    originalBonusRule?.map(item => {
      if (item.type == type) {
        arr1.push(item.tier1);
        arr1.push(item.tier2);
        arr1.push(item.tier3);
        arr1.push(item.tier4);
      }
    });
    return {
      ...params,
      list: arr,
      originalList: arr1,
    };
  };
  const level = {
    title: 'type',
    total: 4,
    type: 1,
    list: ['Tier1', 'Tier2', 'Tier3', 'Tier4'],
  };
  // const invite = setData('Invite');
  const bet = setData('Bet');
  const recharge = setData('Recharge');
  return (
    <View style={styles.cardStyle}>
      <View>
        <CardHeader {...level} />
      </View>
      {/* <View>
        <CardHeader {...invite} />
      </View> */}
      <View>
        <CardHeader {...bet} />
      </View>
      <View>
        <CardHeader {...recharge} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    borderLeftColor: '#eee',
    borderLeftWidth: 0.5,
    borderBottomColor: '#eee',
    borderBottomWidth: 0.5,
  },
});

export default RatioCard;
