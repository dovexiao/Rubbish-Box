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
  type?: 'invite' | 'bet' | 'recharge';
}

const RatioCard: React.FC<RatioCardProps> = props => {
  const {type, inviteBonusRule, betBonusRule, rechargeBonusRule} = props;

  const setArr = (item: betBonusRule): string[] => {
    return [
      item.tier1 || '',
      item.tier2 || '',
      item.tier3 || '',
      item.tier4 || '',
    ];
  };

  const setData = (level: number) => {
    let params = {
      title: `Lv.${level}`,
      type: 2,
      list: [] as string[],
    };

    let arr: string[] = [];
    const rules =
      type === 'bet'
        ? betBonusRule
        : type === 'invite'
        ? inviteBonusRule
        : rechargeBonusRule;

    rules?.forEach(item => {
      if (item.level === level) {
        arr = setArr(item);
      }
    });

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

  return (
    <View style={styles.cardStyle}>
      <CardHeader {...level} />
      {list?.map((item, index) => (
        <CardHeader
          key={item.level ?? index} // ✅ 添加唯一 key
          {...setData(index + 1)}
        />
      ))}
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
