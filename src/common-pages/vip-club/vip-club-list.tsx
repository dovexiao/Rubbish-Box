import React from 'react';
import {ScrollView, View, Image, ImageSourcePropType} from 'react-native';
import Text from '@basicComponents/text';
import theme from '@/style';
import {goToWithLogin} from '@utils';
import Button from '@/components/basic/button';
import {IVipConfigItem} from '@/services/global.service';
import {vipOptionsMap} from '@/components/business/vip';

export interface VipTableListProps {
  vipConfigList: IVipConfigItem[];
}

const VipClubList: React.FC<VipTableListProps> = ({vipConfigList}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[
        {
          height: 306,
          marginTop: 30,
        },
      ]}
      contentContainerStyle={{paddingHorizontal: 6}}>
      {vipConfigList.map((item, index) => (
        <View
          key={`${item?.level}${index}`}
          style={[
            theme.flex.flex,
            theme.flex.col,
            theme.flex.centerByCol,
            {
              width: 163,
              height: 306,
              backgroundColor: theme.basicColor.primary20,
              borderRadius: 10,
              marginLeft: 10,
              paddingRight: 10,
              paddingLeft: 10,
            },
          ]}>
          <Image
            source={vipOptionsMap[item?.level].small as ImageSourcePropType}
            style={[
              {
                width: 95,
                height: 95,
                zIndex: 2,
                marginTop: 10,
              },
            ]}
          />
          <Text
            fontSize={16}
            fontWeight="700"
            style={[
              {
                color: '#FFFFFF',
                marginTop: 10,
              },
            ]}>
            V{index}
          </Text>
          <View
            style={[
              theme.flex.flex,
              theme.flex.row,
              theme.flex.between,
              theme.flex.centerByCol,
              theme.padding.lrxxl,
              {
                width: '100%',
                height: 24,
                border: '1px solid rgba(255,255,255,0.1',
                background: theme.basicColor.primary50,
                borderRadius: 5,
                marginTop: 10,
              },
            ]}>
            <Text
              fontSize={12}
              fontWeight="400"
              style={[
                {
                  color: theme.basicColor.white,
                },
              ]}>
              Bouns
            </Text>
            <Text
              fontSize={12}
              fontWeight="400"
              style={[
                {
                  color: '#FFFFFF',
                },
              ]}>
              {item?.amount}
            </Text>
          </View>
          <View
            style={[
              theme.flex.flex,
              theme.flex.row,
              theme.flex.between,
              theme.flex.centerByCol,
              theme.padding.lrxxl,
              {
                width: '100%',
                height: 24,
                border: '1px solid rgba(255,255,255,0.1',
                background: theme.basicColor.primary50,
                borderRadius: 5,
                marginTop: 10,
              },
            ]}>
            <Text
              fontSize={12}
              fontWeight="400"
              style={[
                {
                  color: theme.basicColor.white,
                },
              ]}>
              Spin
            </Text>
            <Text
              fontSize={12}
              fontWeight="400"
              style={[
                {
                  color: '#FFFFFF',
                },
              ]}>
              {item?.spin}
            </Text>
          </View>
          <View
            style={[
              theme.flex.flex,
              theme.flex.row,
              theme.flex.between,
              theme.flex.centerByCol,
              theme.padding.lrxxl,
              {
                width: '100%',
                height: 24,
                border: '1px solid rgba(255,255,255,0.1',
                background: theme.basicColor.primary50,
                borderRadius: 5,
                marginTop: 10,
              },
            ]}>
            <Text
              fontSize={12}
              fontWeight="400"
              style={[
                {
                  color: theme.basicColor.yellow,
                },
              ]}>
              recharge
            </Text>
            <Text
              fontSize={12}
              fontWeight="400"
              style={[
                {
                  color: '#0BD064',
                },
              ]}>
              {item?.recharge}
            </Text>
          </View>
          <Button
            style={[
              theme.padding.lrxxl,
              {width: 160, height: 44, marginTop: 10},
            ]}
            radius={22}
            type="linear-primary"
            onPress={() => {
              goToWithLogin('Recharge');
            }}>
            <Text
              fontSize={theme.fontSize.l}
              fontWeight="700"
              style={[
                {
                  color: '#FFFFFF',
                },
              ]}>
              RECHARGE
            </Text>
          </Button>
        </View>
      ))}
    </ScrollView>
  );
};

export default VipClubList;
