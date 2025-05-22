import {View, StyleSheet} from 'react-native';
import ProxyUserInfo from '../basic-components/proxy-user-info';
import {defaultHeaderImg} from '../proxy.variable';
import theme from '@/style';
import Text from '@/components/basic/text';
import React, {useRef} from 'react';
import i18n from '@/i18n';
import {
  HomeActiveIcon,
  HomeBetUserIcon,
  HomeBettingIcon,
  HomeCommissionIcon,
  HomeNewUserIcon,
  HomeRechargeIcon,
} from '../svg.variable';
import HomeUserDataItem from './home-user-data-item';
import {goTo, toPriceStr} from '@/utils';
import {AgentInfo} from '../proxy.type';
import dayjs from 'dayjs';
import CommissionRateModal from './commission-rate-Modal';
import {SafeAny} from '@/types';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import globalStore from '@/services/global.state';

export interface HomeUserInfoProps {
  info?: AgentInfo;
}

const HomeUserInfo: React.FC<HomeUserInfoProps> = ({info}) => {
  const handleToTeamReport = () => {
    goTo('ProxyTeamReport');
  };
  const toNewUser = () => {
    goTo('ProxyNewUser', {userCount: info?.todayNewUserCount || 0});
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
              {i18n.t('proxy.user.register-date')}
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
        onRebate={globalStore.packageId !== 2 ? toRebate : undefined}
        onTeamReport={handleToTeamReport}
        userDataTopContent={
          <View style={[theme.flex.col]}>
            <Text blod white style={[theme.padding.btms]}>
              {i18n.t('proxy.user.today')}
            </Text>
            <View style={[theme.flex.row, theme.margin.btms]}>
              <HomeUserDataItem
                icon={
                  <HomeActiveIcon
                    width={14}
                    height={14}
                    stroke={theme.basicColor.primary}
                  />
                }
                title={i18n.t('proxy.user.active')}
                result={(info?.todayActiveUserCount || 0) + ''}
                style={[theme.flex.alignStart]}
              />
              <HomeUserDataItem
                icon={
                  <HomeBetUserIcon
                    width={14}
                    height={14}
                    stroke={theme.basicColor.primary}
                  />
                }
                title={i18n.t('proxy.user.recharge-user')}
                result={(info?.todayRechargeUserCount || 0) + ''}
                style={[theme.flex.centerByCol, styles.rechargeUser]}
              />
              <HomeUserDataItem
                icon={
                  <HomeNewUserIcon
                    width={14}
                    height={14}
                    stroke={theme.basicColor.primary}
                  />
                }
                title={i18n.t('proxy.user.new-user')}
                result={(info?.todayNewUserCount || 0) + ''}
                style={[theme.flex.alignEnd]}
                onClick={toNewUser}
              />
            </View>
          </View>
        }
        userDataBottomContent={
          <NativeTouchableOpacity
            style={[theme.flex.col]}
            onPress={handleToTeamReport}>
            <Text blod white style={[theme.padding.tbs]}>
              {i18n.t('proxy.user.total')}
            </Text>
            <View style={[theme.flex.row]}>
              <HomeUserDataItem
                icon={
                  <HomeRechargeIcon
                    width={14}
                    height={14}
                    stroke={theme.basicColor.primary}
                  />
                }
                title={i18n.t('proxy.user.recharge')}
                result={toPriceStr(
                  info?.totalRechargeAmount ? +info.totalRechargeAmount : 0,
                  {
                    suffixUnit: 'K',
                  },
                )}
                style={[theme.flex.alignStart]}
                rateMoney={+(info?.todayRechargeAmount || 0)}
              />
              <HomeUserDataItem
                icon={
                  <HomeBettingIcon
                    stroke={theme.basicColor.primary}
                    width={14}
                    height={14}
                  />
                }
                title={i18n.t('proxy.user.betting')}
                result={toPriceStr(
                  info?.totalBetAmount ? +info.totalBetAmount : 0,
                  {
                    suffixUnit: 'K',
                  },
                )}
                style={[theme.flex.centerByCol]}
                rateMoney={+(info?.todayBetAmount || 0)}
              />
              <HomeUserDataItem
                icon={
                  <HomeCommissionIcon
                    width={14}
                    height={14}
                    stroke={theme.basicColor.primary}
                  />
                }
                title={i18n.t('proxy.user.commission')}
                result={toPriceStr(
                  info?.totalCommissionAmount ? +info.totalCommissionAmount : 0,
                  {
                    suffixUnit: 'K',
                  },
                )}
                style={[theme.flex.alignEnd]}
                rateMoney={+(info?.todayCommissionAmount || 0)}
              />
            </View>
          </NativeTouchableOpacity>
        }
      />
      <CommissionRateModal ref={CommissionRateModalRef} />
    </View>
  );
};

export default HomeUserInfo;
