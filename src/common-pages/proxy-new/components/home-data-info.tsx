import {View, StyleSheet} from 'react-native';
import ProxyUserInfo from '../basic-components/proxy-user-info';
import {defaultHeaderImg} from '@/common-pages/proxy/proxy.variable';
import theme from '@/style';
import Text from '@/components/basic/text';
import React, {useRef} from 'react';
import i18n from '@/i18n';

import HomeUserDataItem from './home-user-data-item';
import {goTo} from '@/utils';
import {AgentInfo} from '../types';
import dayjs from 'dayjs';
import {SafeAny} from '@/types';

export interface HomeUserInfoProps {
  info?: AgentInfo;
}

const HomeUserInfo: React.FC<HomeUserInfoProps> = ({info}) => {
  const handleToTeamReport = () => {
    goTo('ProxyTeamReport');
  };

  const CommissionRateModalRef: SafeAny = useRef(null);
  const toRebate = () => {
    CommissionRateModalRef.current.showModal(info?.agentLevel || 1);
  };
  const styles = StyleSheet.create({
    rechargeUser: {
      width: 120,
      flex: 0,
      flexBasis: 'auto',
      flexGrow: 0,
      flexShrink: 0,
    },
  });
  return (
    <View>
      <ProxyUserInfo
        style={[theme.borderRadius.m, theme.margin.lrl]}
        userAvatar={info?.userAvatar || defaultHeaderImg}
        agentLv={info?.agentLevel || 1}
        userName={info?.userPhone || '-'}
        totalUser={info?.totalUserCount}
        totalCommission={
          info?.totalCommissionAmount ? +info.totalCommissionAmount : undefined
        }
        userHeaderTip={
          <View style={[theme.flex.row]}>
            <Text fontSize={theme.fontSize.s} white>
              {i18n.t('newProxy.user.register-date')}
            </Text>
            <Text
              fontSize={theme.fontSize.s}
              style={[theme.margin.leftxxs]}
              white>
              {info?.registerDate
                ? dayjs(info.registerDate, 'YYYY-MM-DD').format('DD/MM YYYY')
                : '-'}
            </Text>
          </View>
        }
        onRebate={toRebate}
        onTeamReport={handleToTeamReport}
        userDataTopContent={
          <View style={[theme.flex.col]}>
            <Text numberOfLines={1} blod white style={[theme.padding.btms]}>
              {i18n.t('newProxy.user.today')}
            </Text>
            <View style={[theme.flex.row, theme.margin.btms]}>
              <HomeUserDataItem
                title={i18n.t('newProxy.user.active')}
                result={(info?.todayUsers || 0) + ''}
                style={[theme.flex.alignStart]}
                type={2}
              />
              <HomeUserDataItem
                title={i18n.t('newProxy.user.recharge-user')}
                result={(info?.todayRecharge || 0) + ''}
                style={[theme.flex.centerByCol, styles.rechargeUser]}
                type={2}
              />
              <HomeUserDataItem
                title={i18n.t('newProxy.user.commission')}
                result={(info?.todayCommission || 0) + ''}
                style={[theme.flex.alignEnd]}
                type={2}
                // onClick={toNewUser}
              />
            </View>
          </View>
        }
        userDataBottomContent={
          <View style={[theme.flex.col]}>
            <Text numberOfLines={1} blod white style={[theme.padding.tbs]}>
              {i18n.t('newProxy.user.yesterday')}
            </Text>
            <View style={[theme.flex.row, theme.margin.btms]}>
              <HomeUserDataItem
                title={i18n.t('newProxy.user.active')}
                result={(info?.yesterdayUsers || 0) + ''}
                style={[theme.flex.alignStart]}
                type={2}
              />
              <HomeUserDataItem
                title={i18n.t('newProxy.user.recharge-user')}
                result={(info?.yesterdayRecharge || 0) + ''}
                style={[theme.flex.centerByCol, styles.rechargeUser]}
                type={2}
              />
              <HomeUserDataItem
                title={i18n.t('newProxy.user.commission')}
                result={(info?.yesterdayCommission || 0) + ''}
                style={[theme.flex.alignEnd]}
                type={2}
                // onClick={toNewUser}
              />
            </View>
          </View>
        }
      />
    </View>
  );
};

export default HomeUserInfo;
