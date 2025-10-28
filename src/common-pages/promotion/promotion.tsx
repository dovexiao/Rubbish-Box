import DetailNavTitle from '@businessComponents/detail-nav-title';
import React, {useRef, useState, useEffect, useCallback, useMemo} from 'react';
import {useInnerStyle} from './promotion.hooks';
import {useFocusEffect} from '@react-navigation/native';
import theme from '@style';
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  View,
  Animated,
  Easing,
} from 'react-native';
import {NoMoreData} from '@/components/basic/default-page';
import {
  PromotionListItem,
  getPromotionList,
  getListRecharge,
  getSevenDayRewards,
  getReceiveSevenDayReward,
  getActivityPromotionImage,
  getActivityRechargeList,
  getActivityWeekSignInList,
  getActivityReceiveReward,
} from './promotion.service';
import globalStore from '@/services/global.state';
import NoData from '@/components/basic/error-pages/no-data';
import {useTranslation} from 'react-i18next';
import {goToUrl} from '@/common-pages/game-navigate';
import {LazyImageLGBackground} from '@/components/basic/image';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import {goTo, goToWithLogin} from '@/utils';
import DeviceInfo from 'react-native-device-info';
import {appPromotionImage} from '@/services/global.service';
import {
  RechargeBonusCard,
  SevenDayBonusCard,
  PromotionInfoModal,
  renderPromotionListItem,
} from './components';
import GetBonusModal from '@/common-pages/promotion/components/get-bonus-modal';

const Promotion = () => {
  const {i18n} = useTranslation();

  const {
    size: {itemImgWidth, signImgHeight}, //itemImgHeight,
    listStyle,
  } = useInnerStyle();

  const {screenHeight} = useSettingWindowDimensions();

  const [visible, setVisible] = useState(false);
  const [sevenInfo, setSevenInfo] = useState<any>([]);
  const [canGetNum, setCanGetNum] = useState(0); //可领取数量
  const [rechargeInfo, setRechargeInfo] = useState<any>({});
  const [currentTime, setCurrentTime] = useState(0);
  const [modalType, setModalType] = useState(0);
  const [isCountdownExpired, setIsCountdownExpired] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);
  // 七日连冲
  const [canGetAmount, setCanGetAmount] = useState(0); //可领取数量
  const bounceAnim = useRef(new Animated.Value(2)).current;

  // 滑动列表项相关
  const [refreshing, setRefreshing] = useState(false);
  const pageNo = useRef(1);
  const totalPage = useRef(1);
  const [promotionList, setPromotionList] = useState<PromotionListItem[]>([]);
  const tagIndex: number = 0;

  // 动画相关
  const countHideAnim = useRef(new Animated.Value(1)).current;
  const [_countdown, setCountdown] = useState(36); // 初始倒计时秒数
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 获取首充-每日充值图片配置
  const [proAmountImages, setProAmountImages] = useState([]);
  const [proAmountSevenImages, setProAmountSevenImages] = useState([]);
  useEffect(() => {
    const getDeviceBrand = async () => {
      // const data: any = await appPromotionImage();
      const data: any = await getActivityPromotionImage();
      setProAmountImages(data?.first_recharge.images || []);
      setProAmountSevenImages(data?.daily_recharge.images || []);
    };
    getDeviceBrand();
  }, []);

  // 获取设备品牌和登录状态
  const [isXiaomi, setIsXiaomi] = useState(false);
  const [login, setLogin] = useState(false);
  useEffect(() => {
    const getDeviceBrand = async () => {
      const manufacturer = await DeviceInfo.getManufacturer();
      setIsXiaomi(manufacturer.toLowerCase().includes('xiaomi'));
    };
    getDeviceBrand();

    globalStore.tokenSubject.subscribe(token => {
      setLogin(!!token);
    });
  }, []);

  // 滑动列表项相关
  const fetchPageData = useCallback(
    async (isMore = false) => {
      try {
        const pageInfo = await getPromotionList(pageNo.current, tagIndex);
        if (pageInfo?.content) {
          setPromotionList(prev =>
            isMore ? [...prev, ...pageInfo.content] : [...pageInfo.content],
          );
          totalPage.current = pageInfo.totalPages;
        }
      } catch (e) {
        console.error('Error fetching promotions PageData:', e);
      }
    },
    [tagIndex],
  );
  const refreshPage = useCallback(async () => {
    globalStore.globalLoading.next(true);
    pageNo.current = 1;
    await fetchPageData(false);
    globalStore.globalLoading.next(false);
    setRefreshing(false);
  }, [fetchPageData]);
  const loadNextPage = useCallback(async () => {
    if (pageNo.current < totalPage.current) {
      pageNo.current++;
      globalStore.globalLoading.next(true);
      await fetchPageData(true);
      globalStore.globalLoading.next(false);
    }
  }, [fetchPageData]);
  useEffect(() => {
    refreshPage();
  }, [refreshPage]);
  const onPressItemTo = (item: PromotionListItem) => {
    if (!item?.activityUrl) {
      goTo('PromotionDetail', {id: item?.id});
    } else {
      goToUrl(item.activityUrl, item.activityTitle);
    }
  };

  // 动画相关
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  });
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  });
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (currentTime <= 0 && currentTime !== 0) {
      // 倒计时结束，触发隐藏动画
      setIsCountdownExpired(true);

      // 根据用户偏好，使用动画驱动的实时效果
      Animated.timing(countHideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // 动画完成后，可以执行其他隐藏逻辑
        console.log('倒计时功能已隐藏');
      });
    }
  }, [currentTime, countHideAnim]);
  useFocusEffect(
    useCallback(() => {
      const createBounceAnimation = () => {
        return Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 2.3,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1.7,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]);
      };

      const startBounceLoop = () => {
        Animated.loop(createBounceAnimation(), {
          iterations: -1, // 无限循环
        }).start();
      };

      // 延迟开始跳动动画，让页面先完成淡入
      const timer = setTimeout(() => {
        startBounceLoop();
      }, 1500);

      return () => {
        clearTimeout(timer);
        bounceAnim.stopAnimation();
      };
    }, [bounceAnim]),
  );
  const btnAnim = useRef(new Animated.Value(1)).current;
  useFocusEffect(
    useCallback(() => {
      const createBounceAnimation = () => {
        return Animated.sequence([
          Animated.timing(btnAnim, {
            toValue: 1.1,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(btnAnim, {
            toValue: 0.9,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]);
      };

      const startBounceLoop = () => {
        Animated.loop(createBounceAnimation(), {
          iterations: -1, // 无限循环
        }).start();
      };

      // 延迟开始跳动动画，让页面先完成淡入
      const timer = setTimeout(() => {
        startBounceLoop();
      }, 1500);

      return () => {
        clearTimeout(timer);
        btnAnim.stopAnimation();
      };
    }, [btnAnim]),
  );

  // 获取7天活动信息
  const fetchSevenInfo = useCallback(async () => {
    try {
      // const sevenRes = await getSevenDayRewards();
      const sevenRes = await getActivityWeekSignInList();
      if (sevenRes?.length) {
        setSevenInfo(sevenRes);
        setCanGetNum(
          sevenRes.filter((item: any) => item?.finished && !item?.received)
            .length,
        );
      }
    } catch (e) {
      console.error('Error fetching Seven Day:', e);
    }
  }, []);

  // 获取复充信息
  const fetchRechargeInfo = useCallback(async () => {
    //查看复充列表
    try {
      // const rechargeData = await getListRecharge();
      const rechargeRes = await getActivityRechargeList();
      console.log('复充列表', rechargeRes);
      // if (rechargeData?.countdownTimestamp) {
      //   const futureTimestamp = rechargeData?.countdownTimestamp; // 目标时间戳（毫秒）
      //   const currentTimestamp = Date.now();
      //   const remainingTimeInMillis = futureTimestamp - currentTimestamp;
      //   setCurrentTime(remainingTimeInMillis);
      //
      //   // 检查是否已经过期
      //   if (remainingTimeInMillis <= 0) {
      //     setIsCountdownExpired(true);
      //     countHideAnim.setValue(0);
      //   }
      // }
      setRechargeInfo(rechargeRes);
    } catch (e) {
      console.error('Error fetching promotions Recharge:', e);
    }
  }, []);

  // 跳转充值页面
  const onPressGoDeposit = useCallback(() => {
    goToWithLogin(i18n.t('home.tab.deposit'));
  }, [i18n]);

  // 领取7天活动当天奖励
  const getSevenContinuousBonus = useCallback(
    (item: any) => {
      if (item?.status === 0) {
        let arr = [];
        arr.push(item?.id);
        getActivityReceiveReward(arr)
          .then(() => {
            console.log('当天领取成功');
            fetchSevenInfo();
            setCanGetAmount(item?.rewardAmount || 0);
            setIsImageVisible(true);
          })
          .catch((e: unknown) => {
            console.error('Error fetching ContinuousBonus:', e);
          });
      }
    },
    [fetchSevenInfo],
  );

  // 7天活动领取金额
  const onPressGetBonus = useCallback(() => {
    const arr = sevenInfo.filter(
      (item: any) => item?.finished && !item?.received,
    );
    if (arr.length <= 0) {
      onPressGoDeposit();
      return;
    }
    let amt = 0;
    arr.forEach((item: any) => {
      amt += item?.amount || 0;
    });
    const idList = arr.map((item: any) => item.id);
    if (idList.length > 0) {
      getReceiveSevenDayReward(idList)
        .then(() => {
          console.log('领取成功');
          fetchSevenInfo();
          setCanGetAmount(amt);
          setIsImageVisible(true);
        })
        .catch(() => {});
    }
  }, [onPressGoDeposit, fetchSevenInfo, sevenInfo]);

  useFocusEffect(
    useCallback(() => {
      // 启动动画效果
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      // 调用接口获取数据
      fetchSevenInfo();
      fetchRechargeInfo();
    }, [fetchSevenInfo, fetchRechargeInfo, fadeAnim]),
  );

  const renderRedBonusCard = useMemo(() => {
    return (
      <RechargeBonusCard
        login={login}
        currentTime={currentTime}
        isXiaomi={isXiaomi}
        proAmountImages={proAmountImages}
        rechargeInfo={rechargeInfo}
        onPressGoDeposit={onPressGoDeposit}
        onPressWhy={() => {
          setModalType(0);
          setVisible(true);
        }}
        i18n={i18n}
      />
    );
  }, [
    login,
    currentTime,
    isXiaomi,
    proAmountImages,
    rechargeInfo,
    onPressGoDeposit,
    i18n,
  ]);

  const renderSevenContinuousBonusCard = useMemo(() => {
    return (
      <SevenDayBonusCard
        proAmountSevenImages={proAmountSevenImages}
        sevenInfo={sevenInfo}
        canGetNum={canGetNum}
        bounceAnim={bounceAnim}
        btnAnim={btnAnim}
        onPressWhy={() => {
          setModalType(1);
          setVisible(true);
        }}
        onPressGetAll={onPressGetBonus}
        onPressGetSingle={getSevenContinuousBonus}
      />
    );
  }, [
    proAmountSevenImages,
    sevenInfo,
    canGetNum,
    bounceAnim,
    btnAnim,
    onPressGetBonus,
    getSevenContinuousBonus,
  ]);

  // 列表项
  const renderItem = ({item}: ListRenderItemInfo<PromotionListItem>) => {
    return renderPromotionListItem({item} as any, {
      itemImgWidth,
      signImgHeight,
      onPressItemTo,
    });
  };

  // 列表头
  const renderListHeader = useCallback(() => {
    return (
      <View>
        {renderSevenContinuousBonusCard}
        {rechargeInfo?.flagShow && renderRedBonusCard}
      </View>
    );
  }, [rechargeInfo, renderRedBonusCard, renderSevenContinuousBonusCard]);

  const currentReacgarge: any = proAmountImages[0] || {};
  const currentReacgarge1: any = proAmountImages[1] || {};
  const currentReacgarge2: any = proAmountImages[2] || {};
  const currentReacgarge3: any = proAmountImages[3] || {};

  return (
    <LazyImageLGBackground style={{height: screenHeight}}>
      <DetailNavTitle title={i18n.t('promotion.title')} hideServer />
      <FlatList
        data={promotionList}
        renderItem={renderItem}
        keyExtractor={item => String(item.id)}
        ListHeaderComponent={renderListHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              refreshPage();
            }}
          />
        }
        ListEmptyComponent={
          <View style={theme.padding.xxl}>
            <NoData />
          </View>
        }
        onEndReached={loadNextPage}
        contentContainerStyle={[theme.padding.lrl, listStyle.list]}
        ListFooterComponent={
          promotionList.length > 0 && pageNo.current >= totalPage.current ? (
            <NoMoreData />
          ) : null
        }
      />

      <GetBonusModal
        isImageVisible={isImageVisible}
        amount={canGetAmount || 0}
        setIsImageVisible={setIsImageVisible}
      />
      <PromotionInfoModal
        visible={visible}
        onClose={() => setVisible(false)}
        type={modalType as 0 | 1}
        i18n={i18n}
        currentReacgarge={currentReacgarge}
        currentReacgarge1={currentReacgarge1}
        currentReacgarge2={currentReacgarge2}
        currentReacgarge3={currentReacgarge3}
      />
    </LazyImageLGBackground>
  );
};

export default Promotion;
