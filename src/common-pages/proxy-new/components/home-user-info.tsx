import {View, StyleSheet} from 'react-native';
import ProxyUserInfo from '@/common-pages/proxy-new/basic-components/proxy-user-info';
import {defaultHeaderImg} from '@/common-pages/proxy/proxy.variable';
import theme from '@/style';
import React, {useRef} from 'react';
import i18n from '@/i18n';

import HomeUserDataItem from './home-user-data-item';
import {goTo} from '@/utils';
import {AgentInfo} from '@/common-pages/proxy-new/types';
import CommissionRateModal from './commission-rate-Modal';
import {SafeAny} from '@/types';
import globalStore from '@/services/global.state';

export interface HomeUserInfoProps {
  info?: AgentInfo;
}

const HomeUserInfo: React.FC<HomeUserInfoProps> = ({info}) => {
  const handleToTeamReport = () => {
    goTo('ProxyTeamReport');
  };
  const tTotalCommission = () => {
    goTo('NewProxyTotalCommission', {userCount: info?.todayNewUserCount || 0});
  };
  const toTotalUser = () => {
    goTo('NewProxyTotalUser', {userCount: info?.todayNewUserCount || 0});
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
        onRebate={globalStore.packageId !== 2 ? toRebate : undefined}
        onTeamReport={handleToTeamReport}
        userDataTopContent={
          <View style={[theme.flex.col]}>
            <View
              style={[
                theme.flex.row,
                theme.flex.centerByRow,
                theme.margin.btms,
              ]}>
              <HomeUserDataItem
                title={i18n.t('newProxy.user.total-user')}
                result={(info?.totalUsers || 0) + ''}
                style={[theme.flex.centerByCol, styles.rechargeUser]}
                onClick={toTotalUser}
                type={1}
              />
              <HomeUserDataItem
                title={i18n.t('newProxy.user.total-commission')}
                result={(info?.totalCommission || 0) + ''}
                style={[theme.flex.centerByCol, styles.rechargeUser]}
                onClick={tTotalCommission}
                type={1}
              />
            </View>
          </View>
        }
      />
      <CommissionRateModal ref={CommissionRateModalRef} />
    </View>
  );
};

export default HomeUserInfo;
