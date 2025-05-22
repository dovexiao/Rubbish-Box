/* eslint-disable prettier/prettier */
import theme from '@style';
import {ToastType, useToast} from '@basicComponents/modal';
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  Image,
  ImageRequireSource,
} from 'react-native';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import LazyImage, {
  LazyImageBackground,
  LazyImageLGBackground,
} from '@basicComponents/image';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';
import Text from '@basicComponents/text';
import {goBack, goTo, toPriceStr} from '@utils';
import LinearGradient from '@basicComponents/linear-gradient';
import {Tab} from '@rneui/themed';
import globalStore from '@services/global.state';
import {
  postRankingList,
  postSpinOrderCreate,
  postSpinOrderList,
} from './luckyspin.service';
import {SafeAny} from '@/types';
import {
  RankingItem,
  RankingList,
  SpinOrderItem,
  SpinOrderList,
} from './luckyspin.service';
import Sound from '@basicComponents/sound';
import {
  ITEM_HEIGHT,
  buttonGoldenIcon,
  buttonGreenIcon,
  copperIcon,
  footerIcon,
  pillarIcon,
  moneyIcon,
  needleHeight,
  turntableIcon,
  needleIcon,
  needleWidth,
  openAudio,
  resultIcon,
  rotateAudio,
  spinWrapIcon,
  styles,
  titleIcon,
} from './luckyspin.style';
import BottomInfo from './components/bottom-info';
import {useTranslation} from 'react-i18next';
import {useLuckySpinActions, useLuckySpinConfig} from '@/store/luckySpinStore';
import {useGetModal} from './getmodal.hooks';
import DetailNavTitle from '@/components/business/detail-nav-title';
import useNotificationStore from '@/store/useNotificationStore';
import {useToken} from '@/store/useUserStore';

const LuckySpinPage = () => {
  const {i18n} = useTranslation();
  const {
    freeCount,
    spinBatchCount: batchCount,
    spinBasePrice: singleAmount,
  } = useLuckySpinConfig();
  const {isLogin} = useToken();
  const getNoticeMap = useNotificationStore(state => state.getNoticeMap);
  const {setSpinConfig} = useLuckySpinActions();

  useEffect(() => {
    if (isLogin) {
      setSpinConfig(true);
    } else {
      setSpinConfig(false);
    }
  }, [isLogin, setSpinConfig]);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [rankingList, setRankingList] = useState<RankingList>([]);
  const [spinOrderList, setSpinOrderList] = useState<SpinOrderList>([]);
  const animateTiming = useRef<Animated.CompositeAnimation>();
  const [animating, setAnimating] = useState<boolean>(false);
  const [canClick, setCanClick] = useState<boolean>(true);
  const rotateSound = useRef<Sound>();
  const openSound = useRef<Sound>();
  const canclickTimeout = useRef<NodeJS.Timeout>();
  const refresh = () => {
    globalStore.updateAmount.next();
  };
  const {renderModal: renderGetModal, show: getModalShow} =
    useGetModal(refresh);
  const {renderModal: renderToast, show: toastShow} = useToast();
  const rankIndex = useRef<number>(0);
  const rankTiming = useRef<NodeJS.Timeout>();
  const rankRef = useRef<FlatList>(null);

  const degreeAnim = useRef<Animated.Value>(new Animated.Value(0)).current;
  const degreeResult = degreeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  useEffect(() => {
    rotateSound.current = new Sound(rotateAudio);
    openSound.current = new Sound(openAudio);
    refresh();
    return () => {
      rankIndex.current = 0;
      if (animateTiming.current) {
        animateTiming.current.stop();
        animateTiming.current = undefined;
      }

      if (rotateSound.current) {
        rotateSound.current.release();
        rotateSound.current = undefined;
      }

      if (openSound.current) {
        openSound.current.release();
        openSound.current = undefined;
      }

      if (canclickTimeout.current) {
        clearTimeout(canclickTimeout.current);
        canclickTimeout.current = undefined;
      }

      setAnimating(false);
      setCanClick(true);
    };
  }, []);
  const updateRankIndex = useCallback(() => {
    rankTiming.current = setTimeout(() => {
      if (
        rankRef.current &&
        rankingList?.length > 4 &&
        rankIndex.current < rankingList?.length - 1
      ) {
        rankIndex.current++;
        rankRef.current.scrollToIndex({
          index: rankIndex.current,
          animated: true,
        });
        updateRankIndex();
      }
    }, 2000);
  }, [rankingList?.length]);

  useEffect(() => {
    if (
      tabIndex === 0 &&
      rankingList?.length > 4 &&
      rankIndex.current < rankingList?.length
    ) {
      updateRankIndex();
    } else {
      if (rankTiming.current) {
        clearTimeout(rankTiming.current);
      }
    }

    return () => {
      if (rankTiming.current) {
        clearTimeout(rankTiming.current);
      }
    };
  }, [rankingList?.length, tabIndex, updateRankIndex]);

  const handleRankingScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const nowIndex = Math.floor(y / ITEM_HEIGHT);
    rankIndex.current = nowIndex;
  };
  const handleChange = (value: number) => {
    setTabIndex(value);
  };

  const updateSpinOrderList = () => {
    postSpinOrderList({pageNo: 1, pageSize: 1000}).then(list =>
      setSpinOrderList(list),
    );
  };

  const onNotice = () => {
    getNoticeMap();
    if (isLogin) {
      setSpinConfig(true);
    }
  };

  const handlePrize = async (count: number) => {
    if (animating) {
      // 如果在动画中，创建失效
      return;
    }
    //不许点击的情况
    if (!canClick) {
      return;
    }
    if (!isLogin) {
      goTo('Login');
      return;
    }
    setCanClick(false);
    canclickTimeout.current = setTimeout(() => {
      setCanClick(true);
    }, 1000);
    if (count > 1 && freeCount > 0) {
      globalStore.globalWaringTotal(i18n.t('luckyspin.usefreefirst'));
      return;
    }
    try {
      globalStore.globalLoading.next(true);
      const result = await postSpinOrderCreate(count, singleAmount);
      onNotice();
      if (count === 1) {
        let rotate = (result.prizeIndex + 0.5) / 8 + 10;
        animateTiming.current = Animated.timing(degreeAnim, {
          duration: 5000,
          toValue: rotate,
          useNativeDriver: true,
        });
        setAnimating(true);
        rotateSound.current?.play();
        requestAnimationFrame(() => {
          animateTiming.current?.start(() => {
            rotateSound.current?.stop();
            openSound.current?.play();
            globalStore.updateAmount.next();
            setAnimating(false);
            getModalShow(+result.prizeAmount);
            degreeAnim.setValue(rotate - Math.floor(rotate));
            tabIndex === 1 && updateSpinOrderList();
          });
        });
      } else {
        getModalShow(+result.prizeAmount);
        openSound.current?.play();
        globalStore.updateAmount.next();
        tabIndex === 1 && updateSpinOrderList();
      }
    } catch (e) {
      if ((e as SafeAny).data.code === -1) {
        return;
      }
      toastShow({
        type: ToastType.warning,
        message: (e as SafeAny).data.msg,
      });
    } finally {
      globalStore.globalLoading.next(false);
    }
  };
  useEffect(() => {
    if (isLogin && tabIndex === 1) {
      updateSpinOrderList();
    } else {
      postRankingList().then(list => setRankingList(list));
    }
  }, [isLogin, tabIndex]);

  const renderSpinBtn = ({
    bgImageSource,
    freeCountTitle,
    freeCountSubTitle,
    onPressBtn,
  }: {
    bgImageSource: ImageRequireSource;
    freeCountTitle: number;
    freeCountSubTitle: string;
    onPressBtn: () => void;
  }) => {
    return (
      <NativeTouchableOpacity
        activeOpacity={animating ? 1 : 0.8}
        onPress={onPressBtn}>
        <LazyImageBackground
          occupancy={'transparent'}
          imageUrl={bgImageSource}
          width={125}
          height={46}
          style={[theme.flex.col, theme.flex.center]}>
          <View style={[theme.flex.row, theme.flex.center]}>
            <LazyImage
              occupancy={'transparent'}
              imageUrl={moneyIcon}
              width={16}
              height={16}
            />
            <Text
              fontSize={theme.fontSize.l}
              style={[theme.font.bold, theme.font.brown]}>
              x{freeCountTitle}
            </Text>
          </View>
          <Text
            fontSize={theme.fontSize.xs}
            style={[theme.font.bold, theme.font.main, styles.desc]}>
            {freeCountSubTitle}
          </Text>
        </LazyImageBackground>
      </NativeTouchableOpacity>
    );
  };

  const renderItem = ({
    item,
  }: ListRenderItemInfo<RankingItem | SpinOrderItem>) => {
    return (
      <View
        style={[
          theme.flex.row,
          theme.flex.centerByCol,
          theme.flex.between,
          styles.resultItem,
          theme.padding.lrxl,
        ]}>
        <View style={[theme.flex.row, theme.flex.centerByCol]}>
          {isRankItem(item) ? (
            <Text style={[theme.font.s, theme.font.white]}>
              {item.userPhone}
            </Text>
          ) : (
            <>
              <Text
                color={theme.fontColor.brown}
                style={[theme.font.s, styles.buy, theme.margin.rightxxs]}>
                buy
              </Text>
              <Text color={theme.fontColor.brown} style={[theme.font.s]}>
                {toPriceStr(+item.betAmount, {thousands: true})}
              </Text>
            </>
          )}
        </View>
        <View style={[theme.flex.row, theme.flex.centerByCol]}>
          <Text
            color={theme.fontColor.brown}
            style={[theme.font.s, theme.margin.rightxxs]}>
            {i18n.t('luckyspin.won')}
          </Text>
          <Text style={[theme.font.s, styles.won]}>
            {toPriceStr(+item.prizeAmount, {thousands: true})}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <LazyImageLGBackground style={[theme.flex.centerByCol]}>
      <DetailNavTitle
        title={i18n.t('homeMenu.title.luckyspin')}
        hideServer
        onBack={goBack}
      />
      <LazyImage
        occupancy={'transparent'}
        imageUrl={titleIcon}
        width={234}
        height={67}
        style={{zIndex: 11}}
      />
      <LazyImageBackground
        occupancy={'transparent'}
        imageUrl={spinWrapIcon}
        width={219}
        height={230}
        style={[styles.drawImageWrap]}>
        <Animated.Image
          source={turntableIcon}
          style={[styles.drawImage, {transform: [{rotate: degreeResult}]}]}
          resizeMode={'stretch'}
        />
        <View style={[theme.position.abs, styles.needle]}>
          <LazyImage
            occupancy={'transparent'}
            width={needleWidth}
            height={needleHeight}
            imageUrl={needleIcon}
          />
        </View>
        <View style={[theme.position.abs, styles.copper]}>
          <LazyImageBackground
            occupancy={'transparent'}
            imageUrl={copperIcon}
            width={135}
            height={32}
            style={[theme.flex.center, theme.flex.row]}>
            <Text
              fontSize={theme.fontSize.s}
              fontFamily="fontDin"
              style={[theme.font.bold, theme.margin.rightm]}>
              {toPriceStr(globalStore.userAmount, {
                currency: globalStore.currency,
              })}
            </Text>
            <NativeTouchableOpacity
              onPress={() => {
                if (animating) {
                  return;
                }
                if (!isLogin) {
                  goTo('Login');
                  return;
                }
                goTo('Recharge');
              }}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}
                colors={['#FFC653FF', '#EAA400FF', '#FFEFCAFF']}
                style={[
                  theme.borderRadius.xs,
                  theme.padding.tbxxxs,
                  theme.padding.lrxxs,
                ]}>
                <Text fontSize={theme.fontSize.xs} style={[theme.font.white]}>
                  {i18n.t('luckyspin.add')}
                </Text>
              </LinearGradient>
            </NativeTouchableOpacity>
          </LazyImageBackground>
        </View>
        <Image
          style={[theme.position.abs, styles.pillar]}
          resizeMode={'stretch'}
          source={pillarIcon}
        />
      </LazyImageBackground>
      <LazyImageBackground
        occupancy={'transparent'}
        style={[styles.footer]}
        imageUrl={footerIcon}
        width={301}
        height={287}>
        <View style={[theme.flex.row, theme.flex.centerByRow]}>
          {renderSpinBtn({
            bgImageSource: buttonGoldenIcon,
            freeCountTitle: singleAmount,
            freeCountSubTitle: freeCount
              ? `${i18n.t('luckyspin.free')}(${freeCount})`
              : i18n.t('luckyspin.spin'),
            onPressBtn: () => handlePrize(1),
          })}
          {renderSpinBtn({
            bgImageSource: buttonGreenIcon,
            freeCountTitle: singleAmount * batchCount,
            freeCountSubTitle:
              freeCount && freeCount >= batchCount
                ? `${i18n.t('luckyspin.free')}x${batchCount}`
                : `${i18n.t('luckyspin.spin')}x${batchCount}`,
            onPressBtn: () => handlePrize(30),
          })}
        </View>
        <LazyImageBackground
          occupancy={'transparent'}
          style={[styles.result, theme.flex.col]}
          imageUrl={resultIcon}
          width={260}
          height={166}>
          <Tab
            style={[styles.tabWrap, theme.margin.lrl]}
            buttonStyle={[styles.nonepadding]}
            containerStyle={active => (active ? [styles.tabActive] : [])}
            titleStyle={active => [
              ...(active ? [styles.tabActiveText] : [styles.tabNotActiveText]),
              theme.font.s,
              theme.font.bold,
            ]}
            indicatorStyle={{
              backgroundColor: theme.basicColor.primary,
            }}
            value={tabIndex}
            onChange={handleChange}>
            <Tab.Item>{i18n.t('luckyspin.winner')}</Tab.Item>
            <Tab.Item>{i18n.t('luckyspin.mySpin')}</Tab.Item>
          </Tab>
          {tabIndex === 0 && (
            <FlatList
              style={[styles.resultList]}
              data={rankingList}
              initialNumToRender={4}
              ref={rankRef}
              renderItem={renderItem}
              onScroll={handleRankingScroll}
              getItemLayout={(data, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
            />
          )}
          {tabIndex === 1 && (
            <FlatList
              style={[styles.resultList]}
              initialNumToRender={4}
              data={spinOrderList}
              renderItem={renderItem}
            />
          )}
        </LazyImageBackground>
        <BottomInfo freeCount={freeCount} onClose={() => {}} />
      </LazyImageBackground>
      {renderGetModal}
      {renderToast}
    </LazyImageLGBackground>
  );
};

export default LuckySpinPage;

function isRankItem(item: RankingItem | SpinOrderItem): item is RankingItem {
  if ((item as RankingItem).userPhone != null) {
    return true;
  }
  return false;
}
