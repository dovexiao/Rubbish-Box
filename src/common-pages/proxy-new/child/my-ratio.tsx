import React, {useState, useCallback} from 'react';
import theme from '@style';
import i18n from '@i18n';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
// import { TodayEarningsChartItemRes } from '../types';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import Card from './my-ratio/card';
import Card1 from './my-ratio/card1';
import RatioBottomCard from './my-ratio/ratio-bottom-card';
import {LazyImageLGBackground} from '@basicComponents/image';
import {goBack, formatDate} from '@utils';
import Level from '@/common-pages/proxy/basic-components/level';
import globalStore from '@/services/global.state';
import {AgentInfo} from '../types';
import {getMyRatio} from '../api';

const LineView = () => {
  return <View style={styles.lineStyle} />;
};

const TotalUser = () => {
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute();
  const handleRefresh = () => {
    setRefreshing(true);
  };
  const [ratioInfo, setRatioInfo] = useState<AgentInfo>();
  const [_, setInited] = useState(false);
  const init = (loading: boolean = false) => {
    loading && globalStore.globalLoading.next(true);
    return Promise.allSettled([getMyRatio()])
      .then(([ratio]) => {
        setInited(true);
        if (ratio.status === 'fulfilled') {
          if (!ratio.value) {
            return;
          }
          if (Object.keys(ratio.value).length === 0) {
            return;
          }
          setRatioInfo(ratio.value);
        }
      })
      .finally(() => loading && globalStore.globalLoading.next(false));
  };
  const isFrist = React.useRef(false);
  const doInit = useCallback(() => {
    init(!isFrist);
    isFrist.current = true;
  }, []);
  useFocusEffect(doInit);
  const nextLevelAmount = (info: any) => {
    const curr = info?.currentLevel || 0;
    const rules = info?.levelUpRule || [];
    let val: number = 0;
    rules?.map(
      (item: {
        level: any;
        rechargeAmount: {toFixed: (arg0: number) => number};
      }) => {
        if (item.level == curr + 1) {
          val = item.rechargeAmount?.toFixed(3);
        }
      },
    );

    // let val = rules?.length ? rules[curr] : 0;
    return val;
  };
  const d = ratioInfo?.deadline || 0;
  const nowTime = Date.now();
  const flag =
    (ratioInfo?.inviteBonusRule && ratioInfo?.inviteBonusRule.length > 0) ||
    (ratioInfo?.betBonusRule && ratioInfo?.betBonusRule.length > 0) ||
    (ratioInfo?.rechargeBonusRule && ratioInfo?.rechargeBonusRule.length > 0);
  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        hideServer
        hideAmount
        onBack={(route.path || '').indexOf('index') > -1 ? undefined : goBack}
        title={i18n.t('newProxy.child.leftText')}
        iconColor="white"
        titleColor={theme.fontColor.white}
      />
      <ScrollView
        style={[theme.flex.col]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View
          style={[
            theme.background.mainDark,
            styles.mgS,
            theme.padding.l,
            theme.borderRadius.m,
          ]}>
          <View>
            <View>
              <Text
                style={[
                  styles.textStyle,
                  theme.flex.flex,
                  theme.flex.row,
                  theme.flex.centerByCol,
                ]}>
                {i18n.t('newProxy.child.ratio-level')}：
                <Level
                  level={ratioInfo?.currentLevel || 1}
                  style={[theme.margin.rights]}
                />
              </Text>
            </View>
            <View>
              <Text style={[styles.textStyle]}>
                {i18n.t('newProxy.child.ratio-recharge')}：
                {ratioInfo?.teamRecharge?.toFixed(3) || 0}
              </Text>
            </View>
            <View>
              <Text style={[styles.textStyle]}>
                {i18n.t('newProxy.child.ratio-level-amount')}：
                {nextLevelAmount(ratioInfo)}
              </Text>
            </View>
          </View>
        </View>
        {ratioInfo?.currentBonusRule &&
          ratioInfo?.currentBonusRule.length > 0 && (
            <View
              style={[
                theme.background.mainDark,
                styles.mgS,
                theme.padding.l,
                theme.borderRadius.m,
              ]}>
              <View style={[theme.margin.btmxss]}>
                <View
                  style={[
                    theme.flex.row,
                    theme.flex.centerByCol,
                    {marginBottom: 8},
                  ]}>
                  <Text style={[theme.margin.leftxxs, styles.textStyle]}>
                    {i18n.t('newProxy.child.current-rate')}
                  </Text>
                </View>
                {d < nowTime ? (
                  <Card1 {...ratioInfo} />
                ) : (
                  <Card {...ratioInfo} />
                )}
                <View style={[styles.deadlineStyle]}>
                  <Text style={styles.deadlineTextStyle}>
                    Deadline：
                    {formatDate(
                      ratioInfo?.deadline || 0,
                      'dd/MM/yyyy hh:mm:ss',
                    )}
                  </Text>
                </View>
                <View style={[styles.deadlineStyle, {marginTop: 0}]}>
                  <Text style={styles.deadlineTextStyle}>
                    {
                      'Daily invitation commission is only valid for the first three people'
                    }
                  </Text>
                  <Text style={styles.deadlineTextStyle}>
                    If you want to get a higher commission, please contact our
                    customer service
                  </Text>
                </View>
              </View>
            </View>
          )}
        {flag && (
          <View
            style={[
              theme.background.mainDark,
              styles.mgS,
              theme.padding.l,
              theme.borderRadius.m,
            ]}>
            <View style={[theme.margin.btml]}>
              {/* {ratioInfo?.inviteBonusRule && ratioInfo?.inviteBonusRule.length > 0 && (
              <View>
                <View style={[theme.flex.row, theme.flex.centerByCol, styles.btm1]}>
                  <Text style={[theme.margin.leftxxs, styles.textStyle]}>
                    {i18n.t('newProxy.child.invite-bonus')}
                  </Text>
                </View>
                <RatioBottomCard type="invite" {...ratioInfo} />
                <LineView />
              </View>
            )} */}
              {ratioInfo?.betBonusRule &&
                ratioInfo?.betBonusRule.length > 0 && (
                  <View>
                    <View
                      style={[
                        theme.flex.row,
                        theme.flex.centerByCol,
                        styles.btm1,
                      ]}>
                      <Text style={[theme.margin.leftxxs, styles.textStyle]}>
                        {i18n.t('newProxy.child.bet-rate')}
                      </Text>
                    </View>
                    <RatioBottomCard type="bet" {...ratioInfo} />
                    <LineView />
                  </View>
                )}
              {ratioInfo?.rechargeBonusRule &&
                ratioInfo?.rechargeBonusRule.length > 0 && (
                  <View>
                    <View
                      style={[
                        theme.flex.row,
                        theme.flex.centerByCol,
                        styles.btm1,
                      ]}>
                      <Text style={[theme.margin.leftxxs, styles.textStyle]}>
                        {i18n.t('newProxy.child.recharge-rate')}
                      </Text>
                    </View>
                    <RatioBottomCard type="recharge" {...ratioInfo} />
                  </View>
                )}
            </View>
          </View>
        )}
        <View style={styles.bottom} />
      </ScrollView>
    </LazyImageLGBackground>
  );
};

const styles = StyleSheet.create({
  textStyle: {
    color: '#fff',
    lineHeight: 13 * 2,
  },
  mgS: {
    marginLeft: 12,
    marginRight: 12,
    marginTop: 12,
  },
  bottom: {
    height: 76,
  },
  lineStyle: {
    height: 2,
    backgroundColor: 'rgb(245, 245, 245)',
    marginTop: 16,
    marginBottom: 6,
  },
  btm1: {
    marginBottom: 8,
  },
  deadlineStyle: {
    marginTop: 8,
  },
  deadlineTextStyle: {
    fontSize: 13,
    color: '#fff',
  },
});

export default TotalUser;
