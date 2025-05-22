import {View, Text, StyleSheet} from 'react-native';
import theme from '@/style';
import React, {useRef} from 'react';
import LinearGradient from '@/components/basic/linear-gradient';
import i18n from '@/i18n';
import {goTo} from '@/utils';
import {AgentInfo} from '@/common-pages/proxy-new/types';
import CommissionRateModal from './commission-rate-Modal';
import {SafeAny} from '@/types';
import {LazyImageBackground} from '@/components/basic/image';
import {rightIcon} from '@/common-pages/proxy/proxy.variable';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';

export interface HomeUserInfoProps {
  info?: AgentInfo;
}

const HomeUserInfo: React.FC<HomeUserInfoProps> = ({info}) => {
  const tTotalCommission = () => {
    goTo('NewProxyTotalCommission', {userCount: info?.todayNewUserCount || 0});
  };
  const toTotalUser = () => {
    goTo('NewProxyTotalUser', {userCount: info?.todayNewUserCount || 0});
  };
  const CommissionRateModalRef: SafeAny = useRef(null);
  const styles = StyleSheet.create({
    userView: {
      marginLeft: 12,
      marginRight: 12,
    },
    rechargeUser: {
      flex: 0,
      flexBasis: 'auto',
      flexGrow: 0,
      flexShrink: 0,
      height: 70,
      borderRadius: 12,
    },
    user1Style: {
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      paddingLeft: 12,
      paddingRight: 12,
    },
    textStyle: {
      color: '#fff',
    },
    topTitle: {
      fontSize: 13,
    },
    bottomContent: {
      fontSize: 22,
      fontWeight: 'bold',
    },
  });
  return (
    <View
      style={[
        theme.flex.row,
        theme.flex.centerByRow,
        theme.flex.between,
        styles.userView,
      ]}>
      <NativeTouchableOpacity
        style={[
          theme.flex.col,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            width: '48%',
          },
        ]}
        onPress={toTotalUser}>
        <LinearGradient
          colors={['#04CC9B1A', '#04CC9B99']}
          style={[
            theme.flex.row,
            theme.fill.fillW,
            theme.flex.centerByRow,
            styles.rechargeUser,
            styles.user1Style,
            theme.flex.between,
          ]}>
          <View style={[theme.flex.centerByRow]}>
            <Text numberOfLines={1} style={[styles.textStyle, styles.topTitle]}>
              {i18n.t('newProxy.user.total-user')}
            </Text>
            <Text style={[styles.textStyle, styles.bottomContent]}>
              {(info?.totalUsers || 0) + ''}
            </Text>
          </View>
          <View style={[theme.flex.flex, theme.flex.centerByRow]}>
            <LazyImageBackground
              occupancy="#0000"
              width={theme.paddingSize.xl}
              height={theme.paddingSize.xl}
              imageUrl={rightIcon}
              style={[theme.margin.lefts]}
            />
          </View>
        </LinearGradient>
      </NativeTouchableOpacity>
      <NativeTouchableOpacity
        style={[
          theme.flex.col,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            width: '48%',
          },
        ]}
        onPress={tTotalCommission}>
        <LinearGradient
          colors={['#04CC9B1A', '#04CC9B99']}
          style={[
            theme.flex.row,
            theme.fill.fillW,
            theme.flex.centerByRow,
            styles.rechargeUser,
            styles.user1Style,
            theme.flex.between,
          ]}>
          <View style={[theme.flex.centerByRow]}>
            <Text numberOfLines={1} style={[styles.textStyle, styles.topTitle]}>
              {i18n.t('newProxy.user.total-commission')}
            </Text>
            <Text style={[styles.textStyle, styles.bottomContent]}>
              {(info?.totalCommission || 0) + ''}
            </Text>
          </View>
          <View style={[theme.flex.flex, theme.flex.centerByRow]}>
            <LazyImageBackground
              occupancy="#0000"
              width={theme.paddingSize.xl}
              height={theme.paddingSize.xl}
              imageUrl={rightIcon}
              style={[theme.margin.lefts]}
            />
          </View>
        </LinearGradient>
      </NativeTouchableOpacity>
      <CommissionRateModal ref={CommissionRateModalRef} />
    </View>
  );
};

export default HomeUserInfo;
