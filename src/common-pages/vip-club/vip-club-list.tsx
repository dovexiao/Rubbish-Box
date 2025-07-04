import React from 'react';
import {ScrollView, View, Image, ImageSourcePropType} from 'react-native';
import Text from '@basicComponents/text';
import theme from '@/style';
import {IVipConfigItem} from '@/services/global.service';
import {vipOptionsMap} from '@/components/business/vip';

export interface VipTableListProps {
  vipConfigList: IVipConfigItem[];
}

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);
};

const VipClubList: React.FC<VipTableListProps> = ({vipConfigList}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{marginTop: 30}}
      contentContainerStyle={{paddingHorizontal: 6}}>
      {vipConfigList.map((item, index) => (
        <View
          key={`${item?.level}${index}`}
          style={{
            width: 198,
            height: 363,
            backgroundColor: theme.basicColor.transparentP60,
            borderRadius: 10,
            marginLeft: 10,
            paddingHorizontal: 10,
            alignItems: 'center',
          }}>
          <Image
            source={vipOptionsMap[item?.level].small as ImageSourcePropType}
            style={{
              width: 95,
              height: 95,
              marginTop: 10,
              resizeMode: 'contain',
            }}
          />
          <Text
            fontSize={18}
            fontWeight="700"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: '#FFFFFF',
              marginTop: 10,
              maxWidth: '100%',
            }}>
            V{index}
          </Text>

          {/* 信息块抽象成方法 */}
          {renderInfoRow(
            'Level Bonus',
            formatINR(item?.amount),
            '#0BD064',
            theme.basicColor.yellow,
          )}
          {renderInfoRow(
            'Withdrawal Count',
            item?.withdrawCount,
            '#0BD064',
            theme.basicColor.yellow,
          )}
          {renderInfoRow(
            'Withdrawal Amount',
            formatINR(item?.withdrawAmount),
            '#0BD064',
            theme.basicColor.yellow,
          )}
          {renderInfoRow(
            'Spin Count',
            item?.spin,
            '#0BD064',
            theme.basicColor.yellow,
          )}
          {renderInfoRow(
            'Daily Bonus',
            formatINR(item?.dailyBonus),
            '#0BD064',
            theme.basicColor.yellow,
          )}
          {renderInfoRow(
            'Deposit',
            formatINR(item?.recharge),
            '#0BD064',
            theme.basicColor.yellow,
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const renderInfoRow = (
  label: string,
  value: string | number,
  valueColor: string,
  labelColor: string = theme.basicColor.white,
) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: 24,
        borderRadius: 5,
        marginTop: 10,
        backgroundColor: theme.basicColor.primary50,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
      }}>
      <Text
        fontSize={12}
        fontWeight="400"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{color: labelColor}}>
        {label}
      </Text>
      <Text
        fontSize={12}
        fontWeight="400"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{color: valueColor}}>
        {value}
      </Text>
    </View>
  );
};

export default VipClubList;
