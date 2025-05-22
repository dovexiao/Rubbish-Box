import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {useInnerStyle} from '../invitation.style.hooks';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {errorLog, goBack, goTo, setDataForSettled, toAgentApply} from '@/utils';
import NormalNav from './normal-nav';
import {useTranslation} from 'react-i18next';
import globalStore from '@/services/global.state';
import InvitationCode from './invitation-code';
import InvitationInfo from './invitation-info';
import InvitationBouns, {InvitationBounsProps} from './invitation-bouns';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {RecordIcon} from '../svg.variables';
import Text from '@/components/basic/text';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {getUserList, getUserTotal} from '../invitation.service';
import {UserListItem, UserTotal} from '../invitation.type';
import {IUserInfo} from '@/services/global.service';
import {useShare} from '@/common-pages/hooks/share.hooks';
import InvitationRecordModal, {
  InvitationModalShowOption,
  InvitationRecordModalRef,
} from '../invitation-record-modal';
import {LazyImageLGBackground} from '@basicComponents/image';

const Invitation = () => {
  const {
    size: {screenHeight, screenWidth, designWidth},
    homeStyle,
    whiteSpaceStyle,
  } = useInnerStyle();
  const {t} = useTranslation();
  const normalOpacity = useSharedValue(1);
  const scrollTop = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollTop.value = event.contentOffset.y;
  });
  const transformHeight = (screenWidth / designWidth) * 40;
  const [userInfo, setUserInfo] = useState<IUserInfo>();
  const [userList, setUserList] = useState<UserListItem[]>();
  const [userTotal, setUserTotal] = useState<UserTotal>();
  const recordModalRef = useRef<InvitationRecordModalRef>(null);
  const {code, refreshCode, doShare, initShare} = useShare();
  const route = useRoute();
  /** Invite的时候不要返回按钮 */
  const [hideBack] = useState(route.name === 'Invite');
  useFocusEffect(
    useCallback(() => {
      try {
        globalStore
          .asyncGetItem('user')
          .then(res => res && setUserInfo(JSON.parse(res) as IUserInfo));
      } catch (e) {
        errorLog('error', e);
      }
      if (!globalStore.token) {
        return;
      }
      globalStore.globalLoading.next(true);
      Promise.allSettled([getUserList(), getUserTotal(), initShare()])
        .then(([list, total]) => {
          setDataForSettled(setUserList, list);
          if (list.status === 'fulfilled') {
            globalStore.asyncSetItem(
              'invitationBonusList',
              JSON.stringify(list.value),
            );
          }
          setDataForSettled(setUserTotal, total);
        })
        .finally(() => globalStore.globalLoading.next(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  const completeCount = useMemo(() => {
    const len = userList?.filter(
      item => item.completedNumber >= item.inviteNumber,
    ).length;
    return len || 0;
  }, [userList]);
  const bounsList = useMemo<InvitationBounsProps[]>(() => {
    return (
      userList?.map(item => ({
        inviteTaskUserId: item.inviteTaskUserId,
        bouns: item.level,
        reward: item.bonusAmount,
        needInvites: item.inviteNumber,
        needRecharge: item.depositAmount,
        rechargedCount: item.completedNumber,
        invitedCount: item.invitedNumber,
      })) || []
    );
  }, [userList]);
  const normalNavStyle = useAnimatedStyle(() => {
    return {
      display: normalOpacity.value <= 0 ? 'none' : 'flex',
      opacity: normalOpacity.value,
    };
  }, [normalOpacity]);
  const detailNavStyle = useAnimatedStyle(() => {
    return {
      display: normalOpacity.value >= 1 ? 'none' : 'flex',
      opacity: interpolate(
        normalOpacity.value,
        [0, 1],
        [1, 0],
        Extrapolation.CLAMP,
      ),
    };
  }, [normalOpacity]);
  useAnimatedReaction(
    () => scrollTop.value,
    (result, prev) => {
      const _prev = prev || 0;
      if (result > _prev && result > transformHeight) {
        normalOpacity.value = withTiming(0, {duration: 500});
      }
      if (result < _prev && result < transformHeight) {
        normalOpacity.value = withTiming(1, {duration: 500});
      }
    },
    [scrollTop, normalOpacity, transformHeight],
  );

  const toRules = () => {
    goTo('InvitationRule');
  };
  const toRecord = () => {
    if (!globalStore.token) {
      goTo('Login');
      return;
    }
    goTo('InvitationRecord');
  };
  const handleGoComplete = () => {
    doShare(t('invitation.home.copy-text'));
  };

  const handleShare = () => {
    doShare(t('invitation.home.copy-text'));
  };

  const handleUserRecordModal = (options?: InvitationModalShowOption) => {
    recordModalRef.current?.show(options);
  };

  const handleRefresh = () => {
    if (!globalStore.token) {
      goTo('Login');
      return;
    }
    globalStore.globalLoading.next(true);
    refreshCode().finally(() => globalStore.globalLoading.next(false));
  };
  return (
    <LazyImageLGBackground
      style={[
        theme.position.rel,
        {height: screenHeight},
        theme.overflow.hidden,
      ]}>
      <Animated.ScrollView
        style={[homeStyle.scrollView, theme.position.rel, theme.flex.col]}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        stickyHeaderIndices={[0]}>
        <View style={[theme.position.rel, theme.flex.col, homeStyle.nav]}>
          <Animated.View
            style={[theme.position.abs, theme.fill.fill, normalNavStyle]}>
            <NormalNav
              hideBack={hideBack}
              title={t('invitation.home.title')}
              onRules={toRules}
            />
          </Animated.View>
          <Animated.View
            style={[theme.position.abs, theme.fill.fill, detailNavStyle]}>
            <DetailNavTitle
              onBack={hideBack ? undefined : goBack}
              hideAmount
              hideServer
              title={t('invitation.home.title')}
              rightNode={
                <NativeTouchableOpacity
                  style={[theme.flex.row, theme.flex.centerByCol]}
                  onPress={toRules}>
                  <RecordIcon
                    width={[theme.iconSize.l]}
                    height={[theme.iconSize.l]}
                    fill={theme.fontColor.white}
                  />
                  <Text white style={theme.margin.lefts}>
                    {t('invitation.home.rules')}
                  </Text>
                </NativeTouchableOpacity>
              }
            />
          </Animated.View>
        </View>
        <View style={[homeStyle.contentContainer, theme.padding.lrl]}>
          <InvitationCode
            code={code}
            onCopy={() => doShare()}
            onRefreshCode={handleRefresh}
          />
          <InvitationInfo
            onRule={toRules}
            onRecord={toRecord}
            onAgency={toAgentApply}
            userTotal={userTotal}
            agent={userInfo?.isAgent === 1}
            completeCount={completeCount}
          />
        </View>
        <View
          style={[theme.padding.lrl, theme.flex.col, whiteSpaceStyle.bottom]}>
          {bounsList.map((bonus, index) => (
            <InvitationBouns
              key={index}
              {...bonus}
              onGoComplete={handleGoComplete}
              onShowRecord={handleUserRecordModal}
            />
          ))}
        </View>
      </Animated.ScrollView>
      <InvitationRecordModal ref={recordModalRef} onShare={handleShare} />
    </LazyImageLGBackground>
  );
};

export default Invitation;
