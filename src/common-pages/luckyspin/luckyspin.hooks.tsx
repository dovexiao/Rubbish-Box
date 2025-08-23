import theme from '@style';
import {ToastType, useModal, useToast} from '@basicComponents/modal';
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  Image,
} from 'react-native';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import LazyImage, {LazyImageBackground} from '@basicComponents/image';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';
import Text from '@basicComponents/text';
import {goTo, toPriceStr, goToWithLogin} from '@utils';
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
import {useGetModal} from './getmodal.hooks';
// import {useLuckySpinActions} from '@/store/luckySpinStore';
import {
  ITEM_HEIGHT,
  buttonGoldenIcon,
  buttonGreenIcon,
  closeIcon,
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

interface LuckySpinModalProps {
  singleAmount?: number;
  batchCount?: number;
  freeCount?: number;
  // drawImage?: string;
  onNotice?: () => void;
}

export function useLuckySpinModal({
  singleAmount = 10,
  batchCount = 30,
  // drawImage,
  onNotice,
  freeCount = 0,
}: LuckySpinModalProps) {
  // const {setSpinConfig} = useLuckySpinActions();
  const {i18n} = useTranslation();
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
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
    if (!showModal) {
      return;
    }
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
  }, [showModal]);
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
      showModal &&
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
  }, [rankingList?.length, showModal, tabIndex, updateRankIndex]);
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
  const handlePrize = async (count: number) => {
    if (animating) {
      // 如果在动画中，创建失效
      return;
    }
    //不许点击的情况
    if (!canClick) {
      return;
    }
    if (!globalStore.token) {
      handleHide();
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
      onNotice?.();
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
            degreeAnim.setValue(rotate - Math.floor(rotate));
            getModalShow(+result.prizeAmount);
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
        handleHide();
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
    if (!showModal) {
      return;
    }
    if (globalStore.token && tabIndex === 1) {
      updateSpinOrderList();
    } else {
      postRankingList().then(list => setRankingList(list));
    }
  }, [tabIndex, showModal]);

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
                color={'#4B1D1D'}
                style={[
                  styles.buy,
                  theme.margin.rightxxs,
                  {fontSize: theme.fontSize.xs},
                ]}>
                buy
              </Text>
              <Text color={'#4B1D1D'} style={[{fontSize: theme.fontSize.xs}]}>
                {toPriceStr(+item.betAmount, {thousands: true})}
              </Text>
            </>
          )}
        </View>
        <View style={[theme.flex.row, theme.flex.centerByCol]}>
          <Text color={'#4B1D1D'} style={[theme.font.s, theme.margin.rightxxs]}>
            {i18n.t('luckyspin.won')}
          </Text>
          <Text style={[theme.font.s, styles.won]}>
            {toPriceStr(+item.prizeAmount, {thousands: true})}
          </Text>
        </View>
      </View>
    );
  };
  const {renderModal, show, hide} = useModal(
    <View style={[theme.position.rel, theme.flex.col, theme.flex.centerByCol]}>
      <NativeTouchableOpacity
        style={[theme.position.abs, styles.closeButton]}
        onPress={() => handleHide()}>
        <LazyImage
          occupancy={'transparent'}
          imageUrl={closeIcon}
          width={40}
          height={40}
        />
      </NativeTouchableOpacity>
      <LazyImage
        occupancy={'transparent'}
        imageUrl={titleIcon}
        width={234}
        height={67}
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
            <LazyImage
              occupancy={'transparent'}
              imageUrl={moneyIcon}
              width={18}
              height={18}
            />
            <Text
              fontSize={theme.fontSize.m}
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
                if (!globalStore.token) {
                  handleHide();
                  goTo('Login');
                  return;
                }
                goToWithLogin(i18n.t('home.tab.deposit'));
                handleHide();
              }}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}
                colors={['#f83600', '#fcc065']}
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
          <NativeTouchableOpacity
            activeOpacity={animating ? 1 : 0.8}
            onPress={() => handlePrize(1)}>
            <LazyImageBackground
              occupancy={'transparent'}
              imageUrl={buttonGoldenIcon}
              width={125}
              height={46}
              style={[theme.flex.col, theme.flex.center]}>
              <View style={[theme.flex.row, theme.flex.center]}>
                <LazyImage
                  occupancy={'transparent'}
                  imageUrl={moneyIcon}
                  width={20}
                  height={20}
                />
                <Text
                  fontSize={theme.fontSize.xl}
                  style={[theme.font.bold, theme.font.brown]}>
                  x{singleAmount}
                </Text>
              </View>
              <Text
                fontSize={theme.fontSize.s}
                style={[theme.font.bold, theme.font.brown]}>
                {freeCount
                  ? `${i18n.t('luckyspin.free')}(${freeCount})`
                  : i18n.t('luckyspin.spin')}
              </Text>
            </LazyImageBackground>
          </NativeTouchableOpacity>
          <NativeTouchableOpacity
            style={[theme.margin.leftxl]}
            activeOpacity={animating ? 1 : 0.8}
            onPress={() => handlePrize(30)}>
            <LazyImageBackground
              occupancy={'transparent'}
              imageUrl={buttonGreenIcon}
              width={125}
              height={46}
              style={[theme.flex.col, theme.flex.center]}>
              <View style={[theme.flex.row, theme.flex.center]}>
                <LazyImage
                  occupancy={'transparent'}
                  imageUrl={moneyIcon}
                  width={20}
                  height={20}
                />
                <Text
                  fontSize={theme.fontSize.xl}
                  style={[theme.font.bold, theme.font.second]}>
                  x{singleAmount * batchCount}
                </Text>
              </View>
              <Text
                fontSize={theme.fontSize.s}
                style={[theme.font.bold, theme.font.second]}>
                {freeCount && freeCount >= batchCount
                  ? `${i18n.t('luckyspin.free')}x${batchCount}`
                  : `${i18n.t('luckyspin.spin')}x${batchCount}`}
              </Text>
            </LazyImageBackground>
          </NativeTouchableOpacity>
        </View>
        <LazyImageBackground
          occupancy={'transparent'}
          style={[styles.result, theme.flex.col]}
          imageUrl={resultIcon}
          width={260}
          height={166}>
          <Tab
            disableIndicator
            style={[styles.tabWrap, theme.margin.lrl, theme.margin.topl]}
            buttonStyle={[styles.nonepadding]}
            containerStyle={active => (active ? [styles.tabActive] : [])}
            titleStyle={active => [
              ...(active ? [styles.tabActiveText] : [styles.tabNotActiveText]),
              // theme.font.fs,
              {
                fontSize: theme.fontSize.xs,
              },
              theme.font.bold,
            ]}
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
        <BottomInfo freeCount={freeCount} onClose={() => handleHide()} />
      </LazyImageBackground>
      {renderGetModal}
      {renderToast}
    </View>,
    {
      backDropClose: false,
      onBackDropClose() {
        handleHide();
      },
      overlayStyle: {
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
      },
    },
  );
  const handleShow = () => {
    setShowModal(true);
    if (globalStore.token) {
      // setSpinConfig(true);
    }
    show();
  };
  const handleHide = () => {
    if (animating) {
      return;
    }
    setShowModal(false);
    hide();
  };
  return {
    renderModal,
    show: handleShow,
  };
}

function isRankItem(item: RankingItem | SpinOrderItem): item is RankingItem {
  if ((item as RankingItem).userPhone != null) {
    return true;
  }
  return false;
}
