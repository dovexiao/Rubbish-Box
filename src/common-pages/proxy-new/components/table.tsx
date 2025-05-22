import React from 'react';
import theme from '@style';
import i18n from '@i18n';
import {View, Text, StyleSheet} from 'react-native';
// import {ProxyTitle} from '../basic-components';
import NoData from '@/components/basic/error-pages/no-data';
import {ImageUrlType} from '@/components/basic/image';
import {TodayEarningsChartItemRes} from '../types';
// import {useInnerStyle} from '../proxy.hooks';
import TableHeader from '@/common-pages/proxy-new/basic-components/table-header';
import TableItem from '@/common-pages/proxy-new/basic-components/table-item';

export interface EarnMeItem {
  rank?: string;
  exceed?: string;
  commissionAmount?: string;
  headImg?: ImageUrlType;
}

interface EarningChartProps {
  user: TodayEarningsChartItemRes[];
  me?: EarnMeItem;
  bet?: number;
  invite?: number;
  recharge?: number;
}
const EarningsChart: React.FC<EarningChartProps> = props => {
  const {user} = props;
  // const {homeEarningStyle} = useInnerStyle();

  const headers = [
    i18n.t('headers.user'),
    i18n.t('headers.commission'),
    i18n.t('headers.type'),
    i18n.t('headers.level'),
  ];
  return (
    <View
      style={[
        theme.margin.l,
        theme.borderRadius.m,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          backgroundColor: theme.basicColor.primary10,
          paddingBottom: 15,
        },
      ]}>
      <View
        style={[
          theme.margin.btml,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            backgroundColor: theme.basicColor.primary60,
            height: 33,
            paddingLeft: 15,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            marginBottom: 0.5,
          },
        ]}>
        <Text
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            lineHeight: 25,
            fontSize: 15,
            color: '#fff',
            fontWeight: 'bold',
          }}>
          {i18n.t('newProxy.home.commission-ranking')}
        </Text>
      </View>
      <View
        style={[
          styles.herderStyle,
          theme.flex.flex,
          theme.flex.row,
          theme.flex.centerByCol,
          styles.viewMg,
        ]}>
        <TableHeader header={[...headers]} />
      </View>
      <View style={[styles.viewMg]}>
        {user.map((item, index) => {
          return (
            <View
              key={index}
              style={[index % 2 === 0 ? styles.th1 : styles.th2]}>
              <TableItem key={index} {...(item as any)} />
            </View>
          );
        })}
      </View>
      {user.length === 0 && (
        <View style={styles.noData}>
          <NoData />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  noData: {
    paddingBottom: 80,
  },
  textStyle: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  labelStyle: {
    color: 'rgba(255,255,255,.3)',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewStyle: {
    flex: 1,
    marginBottom: 10,
  },
  herderStyle: {
    backgroundColor: theme.basicColor.primary50,
    height: 30,
    // lineHeight: 10,
  },
  th1: {
    backgroundColor: theme.basicColor.primary30,
  },
  th2: {
    backgroundColor: theme.basicColor.primary15,
  },
  viewMg: {
    // marginLeft: 12,
    // marginRight: 12,
  },
});

export default EarningsChart;
