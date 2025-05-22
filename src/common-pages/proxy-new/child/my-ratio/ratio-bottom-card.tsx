import React from 'react';
import {View, StyleSheet} from 'react-native';
import CardHeader from './card-header';
interface betBonusRule {
  commissionLevel?: number;
  level?: number;
  tier1?: string;
  tier2?: string;
  tier3?: string;
  tier4?: string;
}
interface RatioCardProps {
  inviteBonusRule?: betBonusRule[];
  betBonusRule?: betBonusRule[];
  rechargeBonusRule?: betBonusRule[];
  type?: string;
}
// interface RatioCardProps {
//   inviteBonusRule?: Array<any>;
//   betBonusRule?: Array<any>;
//   rechargeBonusRule?: Array<any>;
//   type?: string;
// }

const RatioCard: React.FC<RatioCardProps> = props => {
  const {type, inviteBonusRule, betBonusRule, rechargeBonusRule} = props;
  const setArr = (item: any) => {
    let arr: Array<any> = [];
    arr.push(item.tier1 || '');
    arr.push(item.tier2 || '');
    arr.push(item.tier3 || '');
    arr.push(item.tier4 || '');
    return arr;
  };
  const setData = (level: number) => {
    let params = {
      title: `Lv.${level}`,
      type: 2,
      list: [],
    };
    let arr: void[] = [];
    if (type == 'bet') {
      betBonusRule?.map(item => {
        if (item.level == level) {
          arr = setArr(item);
        }
      });
    }
    if (type == 'invite') {
      inviteBonusRule?.map(item => {
        if (item.level == level) {
          arr = setArr(item);
        }
      });
    }
    if (type == 'recharge') {
      rechargeBonusRule?.map(item => {
        if (item.level == level) {
          arr = setArr(item);
        }
      });
    }
    return {
      ...params,
      list: arr,
    };
  };
  const level = {
    title: 'level',
    total: 4,
    type: 1,
    list: ['Tier1', 'Tier2', 'Tier3', 'Tier4'],
  };
  const list =
    type === 'bet'
      ? betBonusRule
      : type === 'invite'
      ? inviteBonusRule
      : rechargeBonusRule;
  // const lv1 = setData(1);
  // const lv2 = setData(2);
  // const lv3 = setData(3);
  // const lv4 = setData(4);
  return (
    <View style={styles.cardStyle}>
      <CardHeader {...level} />
      {list?.map((item, index) => {
        return <CardHeader {...setData(index + 1)} />;
      })}
      {/* <CardHeader {...lv1} />
      <CardHeader {...lv2} />
      <CardHeader {...lv3} />
      <CardHeader {...lv4} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    // marginLeft: 15,
    borderLeftColor: '#eee',
    borderLeftWidth: 0.5,
    borderBottomColor: '#eee',
    borderBottomWidth: 0.5,
  },
});

export default RatioCard;
