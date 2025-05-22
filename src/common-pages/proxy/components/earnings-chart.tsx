import React from 'react';
import theme from '@style';
import i18n from '@i18n';
import {View} from 'react-native';
import {ProxyTitle, EarnItem} from '../basic-components';
import NoData from '@/components/basic/error-pages/no-data';
import {ImageUrlType} from '@/components/basic/image';
import {TodayEarningsChartItemRes} from '../proxy.type';
import {defaultHeaderImg} from '../proxy.variable';
import {useInnerStyle} from '../proxy.hooks';
// import {getTodayEarningsChart} from '../proxy.service';

export interface EarnMeItem {
  rank?: string;
  exceed?: string;
  commissionAmount?: string;
  headImg?: ImageUrlType;
}

interface EarningChartProps {
  user: TodayEarningsChartItemRes[];
  me?: EarnMeItem;
}
const EarningsChart: React.FC<EarningChartProps> = props => {
  const {user, me} = props;
  const {homeEarningStyle} = useInnerStyle();

  const gapHeight = 2;

  return (
    <View
      style={[
        theme.background.mainDark,
        theme.margin.l,
        theme.padding.l,
        theme.borderRadius.m,
      ]}>
      <View style={[theme.margin.btml]}>
        <ProxyTitle title={i18n.t('proxy.home.commission-ranking')} />
      </View>
      {user.map((item, index) => {
        return (
          <EarnItem
            key={index}
            {...item}
            headImg={item.headImg || defaultHeaderImg}
          />
        );
      })}
      {user.length === 0 && <NoData style={homeEarningStyle.error} />}
      <View
        style={[
          theme.fill.fillW,
          theme.background.lightGrey,
          {
            height: gapHeight,
          },
        ]}
      />
      <EarnItem
        type="me"
        height={62}
        {...(me || {})}
        headImg={me?.headImg || defaultHeaderImg}
      />
    </View>
  );
};

export default EarningsChart;
