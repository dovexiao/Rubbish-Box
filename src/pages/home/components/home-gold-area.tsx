import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import styles from '../home.style';
import React, {useEffect, useRef} from 'react';
import {View, Image} from 'react-native';
import Text from '@basicComponents/text';
import Tag from '@basicComponents/tag';
import {NoticeMap} from '../home.type';
import {useLotteryModal} from '../lottery.hooks';
import globalStore from '@/services/global.state';
import {useTranslation} from 'react-i18next';
import {postGetFreeLottery} from '../home.service';
import {goTo} from '@/utils'; //toAgentApply
import theme from '@style';
import BreatheImage from '@/components/basic/animations/breatheImage';
import {useShowDailyRewards} from './daily-rewards/daily-rewards.store';

const getNavTag = (num?: number) =>
  num && num !== 0 ? (
    <Tag
      style={styles.vipNavsItemTag}
      content={num < 0 ? '!' : num > 0 ? num : ''}
    />
  ) : null;

const HomeGoldArea = ({
  noticeMap,
  onNotice,
  spinShow,
}: {
  noticeMap: NoticeMap;
  onNotice?: () => void;
  spinShow: () => void;
}) => {
  const {i18n} = useTranslation();

  const doNotice = () => {
    onNotice?.();
  };

  const {renderModal: renderLottery, show: lotteryShow} = useLotteryModal(
    () => {
      globalStore.globalTotal.next({
        type: 'success',
        message: i18n.t('home.tip.copied'),
      });
    },
  );
  const login = useRef<boolean>(false);
  useEffect(() => {
    const sub = globalStore.tokenSubject.subscribe(token => {
      login.current = !!token;
      if (token) {
        postGetFreeLottery().then(lotteryInfo =>
          Image.prefetch(lotteryInfo.imgUrl),
        );
      }
    });
    const sub2 = globalStore.doNotices.subscribe(() => {
      doNotice();
    });
    return () => {
      sub.unsubscribe();
      sub2.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLotteryClick = async () => {
    if (!login.current) {
      goTo('Login');
      return;
    }
    const lotteryInfo = await postGetFreeLottery();
    lotteryShow({
      current: lotteryInfo.num,
      total: lotteryInfo.maxNum,
      backgroundUrl: lotteryInfo.imgUrl,
      shareUrl: lotteryInfo.shareUrl,
      toolTipContent: lotteryInfo.contentStr,
    });
  };

  return (
    <View
      style={[
        theme.flex.row,
        {width: globalStore.screenWidth},
        theme.padding.btml,
        theme.flex.around,
        theme.padding.lrl,
      ]}>
      <NativeTouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          // goTo('Promotion');
          if (!login.current) {
            goTo('Login');
            return;
          }
          useShowDailyRewards();
        }}>
        <View style={[styles.vipNavsItem, theme.flex.col, theme.flex.center]}>
          <BreatheImage />
          <View style={[theme.flex.flex1]}>
            <Image
              style={styles.vipNavsItemImg}
              source={require('@assets/gif/daily-rewards.gif')}
            />
          </View>
          <Text fontFamily="fontInter" fontSize={12} second style={styles.text}>
            {i18n.t('home.label.dailyRewards')}
          </Text>
        </View>
      </NativeTouchableOpacity>

      <NativeTouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          goTo('Invitation');
        }}>
        <View style={[styles.vipNavsItem, theme.flex.col, theme.flex.center]}>
          <View style={[theme.flex.flex1]}>
            <Image
              style={styles.vipNavsItemImg}
              source={require('@assets/gif/earn-money.gif')}
            />
          </View>
          <Text fontFamily="fontInter" fontSize={12} second style={styles.text}>
            {i18n.t('home.label.earnMoney')}
          </Text>
        </View>
      </NativeTouchableOpacity>

      <NativeTouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          spinShow();
        }}>
        <View
          style={[
            styles.vipNavsItem,
            theme.flex.col,
            theme.flex.center,
            theme.position.rel,
          ]}>
          <View style={[theme.flex.flex1]}>
            <Image
              style={styles.vipNavsItemImg}
              source={require('@assets/gif/lucky.gif')}
              resizeMode={'contain'}
            />
          </View>
          <Text fontFamily="fontInter" fontSize={12} second style={styles.text}>
            {i18n.t('home.label.lucky-spin')}
          </Text>
        </View>
      </NativeTouchableOpacity>

      <NativeTouchableOpacity activeOpacity={0.8} onPress={handleLotteryClick}>
        <View style={[styles.vipNavsItem, theme.flex.col, theme.flex.center]}>
          <View style={[theme.flex.flex1]}>
            <Image
              style={styles.vipNavsItemImg}
              source={require('@assets/gif/lottery.gif')}
            />
          </View>
          <Text second style={styles.text} fontSize={12} fontFamily="fontInter">
            {i18n.t('home.label.free-lottery')}
          </Text>
          {getNavTag(noticeMap.FREE_LOTTERY)}
        </View>
      </NativeTouchableOpacity>
      {renderLottery}
    </View>
  );
};

export default HomeGoldArea;
